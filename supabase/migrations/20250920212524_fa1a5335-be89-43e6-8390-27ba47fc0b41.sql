-- Fix security issues by properly dropping and recreating functions with dependencies

-- Drop trigger first, then function, then recreate with proper security settings
DROP TRIGGER IF EXISTS trigger_update_fish_vote_counts ON public.votes;
DROP FUNCTION IF EXISTS public.update_fish_vote_counts();

-- Recreate the vote count function with proper security settings
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

-- Recreate the trigger
CREATE TRIGGER trigger_update_fish_vote_counts
  AFTER INSERT OR DELETE ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.update_fish_vote_counts();

-- Drop the other trigger and function, then recreate
DROP TRIGGER IF EXISTS trigger_fish_updated_at ON public.fish;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the updated_at function with proper security settings
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

-- Recreate the updated_at trigger
CREATE TRIGGER trigger_fish_updated_at
  BEFORE UPDATE ON public.fish
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();