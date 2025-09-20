-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Fish drawings table (core entity)
CREATE TABLE public.fish (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID, -- Optional for future auth integration
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  drawing_data JSONB, -- Store canvas drawing data
  
  -- AI classification results
  ai_score DECIMAL(4,3) CHECK (ai_score >= 0 AND ai_score <= 1),
  ai_confidence DECIMAL(4,3) CHECK (ai_confidence >= 0 AND ai_confidence <= 1),
  is_fish BOOLEAN DEFAULT false,
  
  -- Moderation and visibility
  is_visible BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT true, -- Auto-approve for now
  flagged_for_review BOOLEAN DEFAULT false,
  
  -- Engagement metrics
  vote_count INTEGER DEFAULT 0,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  
  -- Technical metadata
  client_fingerprint TEXT, -- For anonymous user tracking
  drawing_duration INTEGER, -- seconds spent drawing
  canvas_dimensions JSONB, -- {width, height}
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Votes table for fish rating
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fish_id UUID NOT NULL REFERENCES public.fish(id) ON DELETE CASCADE,
  user_id UUID, -- Optional for future auth
  client_fingerprint TEXT, -- For anonymous voting
  vote_type TEXT CHECK (vote_type IN ('up', 'down')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one vote per fish per user/fingerprint
  UNIQUE(fish_id, user_id),
  UNIQUE(fish_id, client_fingerprint)
);

-- Anonymous sessions for tracking anonymous users
CREATE TABLE public.anonymous_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint TEXT UNIQUE NOT NULL,
  fish_created INTEGER DEFAULT 0,
  votes_cast INTEGER DEFAULT 0,
  last_active TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_fish_created_at ON public.fish(created_at DESC);
CREATE INDEX idx_fish_vote_count ON public.fish(vote_count DESC);
CREATE INDEX idx_fish_visible ON public.fish(is_visible) WHERE is_visible = true;
CREATE INDEX idx_fish_is_fish ON public.fish(is_fish) WHERE is_fish = true;
CREATE INDEX idx_votes_fish_id ON public.votes(fish_id);
CREATE INDEX idx_anonymous_sessions_fingerprint ON public.anonymous_sessions(fingerprint);

-- Create storage buckets for fish images
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('fish-images', 'fish-images', true),
  ('fish-thumbnails', 'fish-thumbnails', true);

-- Enable Row Level Security
ALTER TABLE public.fish ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access (anonymous-first approach)
-- Fish policies - allow public read, authenticated/anonymous write
CREATE POLICY "Anyone can view visible fish" ON public.fish
  FOR SELECT USING (is_visible = true);

CREATE POLICY "Anyone can create fish" ON public.fish
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own fish" ON public.fish
  FOR UPDATE USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR 
    (user_id IS NULL AND client_fingerprint IS NOT NULL)
  );

-- Vote policies - allow public voting
CREATE POLICY "Anyone can view votes" ON public.votes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can vote" ON public.votes
  FOR INSERT WITH CHECK (true);

-- Anonymous sessions policies
CREATE POLICY "Anyone can view anonymous sessions" ON public.anonymous_sessions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create anonymous sessions" ON public.anonymous_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update anonymous sessions" ON public.anonymous_sessions
  FOR UPDATE USING (true);

-- Storage policies for fish images
CREATE POLICY "Anyone can view fish images" ON storage.objects
  FOR SELECT USING (bucket_id IN ('fish-images', 'fish-thumbnails'));

CREATE POLICY "Anyone can upload fish images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id IN ('fish-images', 'fish-thumbnails'));

-- Function to update fish vote counts
CREATE OR REPLACE FUNCTION public.update_fish_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.fish 
    SET 
      vote_count = vote_count + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE -1 END,
      upvotes = upvotes + CASE WHEN NEW.vote_type = 'up' THEN 1 ELSE 0 END,
      downvotes = downvotes + CASE WHEN NEW.vote_type = 'down' THEN 1 ELSE 0 END,
      updated_at = NOW()
    WHERE id = NEW.fish_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.fish 
    SET 
      vote_count = vote_count - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE -1 END,
      upvotes = upvotes - CASE WHEN OLD.vote_type = 'up' THEN 1 ELSE 0 END,
      downvotes = downvotes - CASE WHEN OLD.vote_type = 'down' THEN 1 ELSE 0 END,
      updated_at = NOW()
    WHERE id = OLD.fish_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update vote counts
CREATE TRIGGER trigger_update_fish_vote_counts
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_fish_vote_counts();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on fish table
CREATE TRIGGER trigger_fish_updated_at
  BEFORE UPDATE ON public.fish
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();