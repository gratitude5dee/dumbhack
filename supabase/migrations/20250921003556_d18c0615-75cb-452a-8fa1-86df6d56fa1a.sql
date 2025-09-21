-- Create user_submissions table for contact information
CREATE TABLE public.user_submissions (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name text,
    phone_number text,
    client_fingerprint text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_submissions
CREATE POLICY "Anyone can create submissions" 
ON public.user_submissions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can view their own submissions" 
ON public.user_submissions 
FOR SELECT 
USING (true);

-- Migrate existing data from fish table to user_submissions
INSERT INTO public.user_submissions (user_name, phone_number, client_fingerprint, created_at)
SELECT DISTINCT user_name, phone_number, client_fingerprint, created_at
FROM public.fish 
WHERE user_name IS NOT NULL OR phone_number IS NOT NULL;

-- Add submission_id column to fish table
ALTER TABLE public.fish ADD COLUMN submission_id uuid REFERENCES public.user_submissions(id);

-- Update fish records to link with user_submissions
UPDATE public.fish 
SET submission_id = us.id
FROM public.user_submissions us
WHERE (fish.user_name = us.user_name OR (fish.user_name IS NULL AND us.user_name IS NULL))
  AND (fish.phone_number = us.phone_number OR (fish.phone_number IS NULL AND us.phone_number IS NULL))
  AND (fish.client_fingerprint = us.client_fingerprint OR (fish.client_fingerprint IS NULL AND us.client_fingerprint IS NULL));

-- Remove user_name and phone_number columns from fish table
ALTER TABLE public.fish DROP COLUMN user_name;
ALTER TABLE public.fish DROP COLUMN phone_number;

-- Add trigger for updated_at on user_submissions
CREATE TRIGGER update_user_submissions_updated_at
    BEFORE UPDATE ON public.user_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();