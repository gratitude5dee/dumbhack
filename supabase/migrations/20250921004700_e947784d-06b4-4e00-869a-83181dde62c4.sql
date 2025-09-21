-- Update user_submissions table to support CSV export with calling numbers and assistant overrides
ALTER TABLE public.user_submissions 
  ADD COLUMN IF NOT EXISTS call_number text,
  ADD COLUMN IF NOT EXISTS assistant_overrides jsonb DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS priority integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS notes text;

-- Update the table to make phone_number the primary number field for calling
-- and user_name as optional name field
COMMENT ON COLUMN public.user_submissions.phone_number IS 'Primary number to call (required for CSV export)';
COMMENT ON COLUMN public.user_submissions.user_name IS 'Optional name column';
COMMENT ON COLUMN public.user_submissions.call_number IS 'Alternative number to call if different from phone_number';
COMMENT ON COLUMN public.user_submissions.assistant_overrides IS 'JSON object containing assistant configuration overrides';
COMMENT ON COLUMN public.user_submissions.priority IS 'Call priority (1-5, where 1 is highest priority)';
COMMENT ON COLUMN public.user_submissions.status IS 'Submission status: pending, called, completed, failed';
COMMENT ON COLUMN public.user_submissions.notes IS 'Additional notes or comments';