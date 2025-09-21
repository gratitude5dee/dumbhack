-- Add DELETE and UPDATE policies for user_submissions table
CREATE POLICY "Anyone can delete user submissions" ON public.user_submissions
FOR DELETE USING (true);

CREATE POLICY "Anyone can update user submissions" ON public.user_submissions  
FOR UPDATE USING (true);

-- Create function to delete all user submissions
CREATE OR REPLACE FUNCTION public.delete_all_user_submissions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.user_submissions;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;