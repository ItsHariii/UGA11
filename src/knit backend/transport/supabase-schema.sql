-- NeighborYield Supabase schema (run in SQL Editor if not already created)
-- Tables: share_posts, interests. Enable Realtime on both.

-- Share posts (city feed)
CREATE TABLE IF NOT EXISTS share_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  author_id UUID NOT NULL,
  author_identifier TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  risk_tier TEXT CHECK (risk_tier IN ('high', 'medium', 'low')) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  is_active BOOLEAN DEFAULT true
);

-- Interests (claim/interest flow)
CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES share_posts(id) ON DELETE CASCADE,
  interested_user_id UUID NOT NULL,
  interested_user_identifier TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime (required for subscribeToPostsChannel, etc.)
ALTER PUBLICATION supabase_realtime ADD TABLE share_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE interests;

-- RLS (simplified for hackathon: allow anon read/insert; tighten for production)
ALTER TABLE share_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;

-- Use TO anon so the anon key (app + verify-supabase.js) can access
CREATE POLICY "Allow anon read share_posts" ON share_posts FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert share_posts" ON share_posts FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon read interests" ON interests FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anon insert interests" ON interests FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anon update interests" ON interests FOR UPDATE TO anon USING (true);
