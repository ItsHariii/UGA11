-- NeighborYield Supabase Schema
-- Run this in Supabase SQL Editor to create tables for the food sharing app

-- Enable PostGIS for location (if using geography)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Share posts table
CREATE TABLE share_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  author_identifier TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  risk_tier TEXT CHECK (risk_tier IN ('high', 'medium', 'low')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  location GEOGRAPHY(POINT),
  is_active BOOLEAN DEFAULT true
);

-- Interests table
CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES share_posts(id),
  interested_user_id UUID NOT NULL,
  interested_user_identifier TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE share_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE interests;

-- Row Level Security
ALTER TABLE share_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- Function to expire old posts (sets is_active = false)
CREATE OR REPLACE FUNCTION expire_old_posts()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE share_posts
  SET is_active = false
  WHERE expires_at < NOW() AND is_active = true;

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Optional: Schedule automatic expiration via pg_cron (enable extension first)
-- In Supabase: Database > Extensions > Enable pg_cron
-- Then run:
-- SELECT cron.schedule(
--   'expire-old-posts',
--   '*/5 * * * *',
--   'SELECT expire_old_posts()'
-- );
