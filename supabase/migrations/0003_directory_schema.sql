-- Migration: 0003_directory_schema
-- Description: Attorney directory profiles, subscriptions, and referrals with RLS.

CREATE TABLE IF NOT EXISTS directory_lawyer_profiles (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    firm_name TEXT NOT NULL,
    bar_number TEXT NOT NULL,
    bar_verified BOOLEAN DEFAULT FALSE NOT NULL,
    practice_areas TEXT[] NOT NULL,
    states TEXT[] NOT NULL,
    counties TEXT[],
    courts TEXT[],
    languages TEXT[],
    accessibility TEXT[],
    consultation_available BOOLEAN DEFAULT TRUE,
    payment_options TEXT[],
    remote_available BOOLEAN DEFAULT TRUE,
    listing_tier TEXT DEFAULT 'basic' NOT NULL,
    rating_avg REAL DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    calendly_url TEXT,
    phone TEXT,
    email TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS directory_subscriptions (
    id SERIAL PRIMARY KEY,
    lawyer_id INTEGER NOT NULL REFERENCES directory_lawyer_profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    tier TEXT NOT NULL,
    status TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS directory_agent_referrals (
    id SERIAL PRIMARY KEY,
    lawyer_id INTEGER NOT NULL REFERENCES directory_lawyer_profiles(id) ON DELETE CASCADE,
    user_id TEXT,
    referral_context TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Row Level Security (RLS)
ALTER TABLE directory_lawyer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_agent_referrals ENABLE ROW LEVEL SECURITY;

-- Lawyer profiles can be read by any authenticated or anonymous user
CREATE POLICY "Public read for lawyer profiles"
ON directory_lawyer_profiles FOR SELECT
USING (true);

-- Referrals can be submitted by users
CREATE POLICY "Users can create agent referrals"
ON directory_agent_referrals FOR INSERT
WITH CHECK (true);
