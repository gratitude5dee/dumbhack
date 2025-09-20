-- Add user_name and phone_number fields to the fish table
ALTER TABLE public.fish 
ADD COLUMN user_name TEXT,
ADD COLUMN phone_number TEXT;