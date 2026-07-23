-- Update transactions table to include stripe_session_id
ALTER TABLE public.transactions 
ADD COLUMN stripe_session_id TEXT;

-- Create index for faster lookups by session ID
CREATE INDEX idx_transactions_session_id ON public.transactions(stripe_session_id); 