-- Fix security issues by setting proper search_path for functions

-- Drop and recreate the vote count function with proper security settings
DROP FUNCTION IF EXISTS public.update_fish_vote_counts();

CREATE OR REPLACE FUNCTION public.update_fish_vote_counts()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Drop and recreate the updated_at function with proper security settings
DROP FUNCTION IF EXISTS public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;