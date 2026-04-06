-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  dob DATE,
  gender TEXT,
  address TEXT,
  city TEXT,
  pincode TEXT,
  state TEXT,
  kyc_status TEXT DEFAULT 'pending',
  aadhar_name TEXT,
  face_match_score NUMERIC,
  wallet_balance NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect profiles with RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create transactions table
CREATE TYPE tx_type AS ENUM ('topup', 'remittance', 'withdrawal', 'defi_onramp');
CREATE TYPE tx_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  type tx_type NOT NULL,
  amount NUMERIC NOT NULL,
  status tx_status DEFAULT 'pending',
  tx_hash TEXT, -- Could be Razorpay payment ID or blockchain tx hash
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect transactions with RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
