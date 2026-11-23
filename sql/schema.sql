-- ==============================================================================
-- SGCourt Pickleball DUPR Leaderboard Database Schema (Supabase)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Players Table with DUPR Rating & Paddle Gear
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT DEFAULT '',
    gender VARCHAR(10) DEFAULT 'M',
    dupr_rating NUMERIC(3,2) DEFAULT 3.50,          -- e.g. 4.85, 3.75
    skill_level VARCHAR(50) DEFAULT 'Intermediate',  -- 'Club Player', 'Intermediate', 'Advanced', 'Pro'
    paddle_model VARCHAR(100) DEFAULT 'Selkirk Vanguard Power Air',
    play_style VARCHAR(100) DEFAULT 'Dink & Reset Specialist',
    initial_rating INT NOT NULL DEFAULT 1400,
    current_rating INT NOT NULL DEFAULT 1400,
    peak_rating INT NOT NULL DEFAULT 1400,
    total_matches INT DEFAULT 0,
    total_wins INT DEFAULT 0,
    total_losses INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tournaments Table
CREATE TABLE IF NOT EXISTS tournaments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    tournament_date DATE NOT NULL DEFAULT CURRENT_DATE,
    location VARCHAR(200) DEFAULT 'Bishan / Jurong Court Complex (Singapore)',
    status VARCHAR(50) DEFAULT 'completed',
    format VARCHAR(100) DEFAULT 'Pool Play (Round Robin) + Medal Elimination',
    rules_notes TEXT DEFAULT '11-point games, win by 2 points',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tournament Participants
CREATE TABLE IF NOT EXISTS tournament_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    starting_rating INT NOT NULL,
    ending_rating INT,
    rating_change INT DEFAULT 0,
    final_rank INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tournament_id, player_id)
);

-- 4. Matches Table
CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    stage VARCHAR(50) NOT NULL,               -- 'group' or 'knockout'
    group_name VARCHAR(50) DEFAULT '',        -- 'Pool Court 1', 'Pool Court 2'
    round_name VARCHAR(100) NOT NULL,
    player1_id UUID REFERENCES players(id) ON DELETE RESTRICT,
    player2_id UUID REFERENCES players(id) ON DELETE RESTRICT,
    player1_score INT DEFAULT 0,
    player2_score INT DEFAULT 0,
    set_scores TEXT DEFAULT '',               -- e.g. '11-8, 11-9'
    winner_id UUID REFERENCES players(id),
    p1_rating_before INT,
    p2_rating_before INT,
    p1_rating_change INT DEFAULT 0,
    p2_rating_change INT DEFAULT 0,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Court Chat Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    author_name VARCHAR(100) NOT NULL DEFAULT 'Anonymous Baller',
    avatar_seed VARCHAR(100) DEFAULT 'court',
    content TEXT NOT NULL,
    parent_id UUID REFERENCES messages(id) ON DELETE CASCADE,
    likes INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Public Access
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Grant table privileges to anon and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE ON public.messages TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Policies for Row Level Security
CREATE POLICY "Public read players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read participants" ON tournament_participants FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Public post messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Public like messages" ON messages FOR UPDATE USING (true);
