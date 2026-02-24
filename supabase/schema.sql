-- =====================================================
-- SQL SCHEMA FOR SUPABASE - FERMI TESTS TFM
-- =====================================================
-- Run this script in Supabase SQL Editor
-- =====================================================

-- -----------------------------------------------------
-- 1. TABLE: logs_download
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS logs_download (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- -----------------------------------------------------
-- 2. TABLE: users_online
-- Online test participants
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users_online (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    age INTEGER NOT NULL CHECK (age >= 4 AND age <= 120),
    sex VARCHAR(20) CHECK (sex IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
    pi_vs_e VARCHAR(10) NOT NULL CHECK (pi_vs_e IN ('pi', 'e', 'no_se')),
    which_tests_before VARCHAR(10) NOT NULL DEFAULT '',
    user_alias VARCHAR(100),
    test_model CHAR(1) NOT NULL CHECK (test_model IN ('A', 'B', 'C', 'D')),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_online_test_model ON users_online(test_model);

-- -----------------------------------------------------
-- 3. TABLE: responses_online
-- One row per question per user (tidy format)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS responses_online (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users_online(id) ON DELETE CASCADE,
    test_model CHAR(1) NOT NULL CHECK (test_model IN ('A', 'B', 'C', 'D')),
    question_n INTEGER NOT NULL,
    response NUMERIC,
    time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_response_online UNIQUE (user_id, question_n)
);

CREATE INDEX idx_responses_online_user ON responses_online(user_id);
CREATE INDEX idx_responses_online_model ON responses_online(test_model);

-- -----------------------------------------------------
-- 4. TABLE: users_paper
-- Paper test students (entered by admin)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users_paper (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    age INTEGER NOT NULL CHECK (age >= 4 AND age <= 120),
    sex VARCHAR(20) NOT NULL CHECK (sex IN ('masculino', 'femenino', 'otro', 'prefiero_no_decir')),
    time_of_day VARCHAR(20),
    favorite_subject VARCHAR(100),
    math_mark_last_period NUMERIC,
    is_physics_chemistry_student BOOLEAN DEFAULT FALSE,
    school_type VARCHAR(20) CHECK (school_type IN ('publico', 'privado', 'concertado')),
    mood VARCHAR(20) CHECK (mood IN ('mal', 'regular', 'bien', 'muy_bien')),
    test_model CHAR(1) NOT NULL CHECK (test_model IN ('A', 'B', 'C', 'D')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_paper_model ON users_paper(test_model);

-- -----------------------------------------------------
-- 5. TABLE: responses_paper
-- One row per question per paper student (tidy format)
-- Format: a × 10^b per response
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS responses_paper (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users_paper(id) ON DELETE CASCADE,
    test_model CHAR(1) NOT NULL CHECK (test_model IN ('A', 'B', 'C', 'D')),
    question_n INTEGER NOT NULL,
    base_a NUMERIC(10, 2) NOT NULL,
    exp_b INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_response_paper UNIQUE (user_id, question_n)
);

CREATE INDEX idx_responses_paper_user ON responses_paper(user_id);
CREATE INDEX idx_responses_paper_model ON responses_paper(test_model);

-- -----------------------------------------------------
-- 6. TABLE: responses_play_unique
-- Responses from the "Pregunta Aleatoria" (/random) section of the web app.
-- Each row is one answer to a single random question (no user registration).
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS responses_play_unique (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_play_question INTEGER NOT NULL,
    response NUMERIC,
    time INTEGER,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE logs_download ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_online ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses_online ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_paper ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses_paper ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses_play_unique ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------
-- PUBLIC POLICIES (anonymous forms)
-- -----------------------------------------------------

CREATE POLICY "Allow download log inserts" ON logs_download
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow user registration" ON users_online
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow online response inserts" ON responses_online
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow play response inserts" ON responses_play_unique
    FOR INSERT TO anon WITH CHECK (true);

-- -----------------------------------------------------
-- ADMIN POLICIES (anon — auth is client-side only)
-- -----------------------------------------------------

CREATE POLICY "Allow read download logs" ON logs_download
    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow delete download logs" ON logs_download
    FOR DELETE TO anon USING (true);

CREATE POLICY "Allow read online users" ON users_online
    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow delete online users" ON users_online
    FOR DELETE TO anon USING (true);

CREATE POLICY "Allow read online responses" ON responses_online
    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow delete online responses" ON responses_online
    FOR DELETE TO anon USING (true);

CREATE POLICY "Allow read play responses" ON responses_play_unique
    FOR SELECT TO anon USING (true);
CREATE POLICY "Allow delete play responses" ON responses_play_unique
    FOR DELETE TO anon USING (true);

CREATE POLICY "Allow insert paper users" ON users_paper
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow read paper users" ON users_paper
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow update paper users" ON users_paper
    FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow delete paper users" ON users_paper
    FOR DELETE TO anon USING (true);

CREATE POLICY "Allow insert paper responses" ON responses_paper
    FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow read paper responses" ON responses_paper
    FOR SELECT TO anon USING (true);

CREATE POLICY "Allow update paper responses" ON responses_paper
    FOR UPDATE TO anon USING (true);

CREATE POLICY "Allow delete paper responses" ON responses_paper
    FOR DELETE TO anon USING (true);

-- =====================================================
-- VIEWS (security_invoker = true → RLS of underlying tables applies)
-- =====================================================

CREATE OR REPLACE VIEW view_responses_online
WITH (security_invoker = true) AS
SELECT
    r.id,
    r.user_id,
    u.age,
    u.sex,
    u.pi_vs_e,
    u.which_tests_before,
    u.user_alias,
    r.test_model,
    r.question_n,
    r.response,
    r.time,
    r.created_at
FROM responses_online r
JOIN users_online u ON r.user_id = u.id
ORDER BY r.user_id, r.question_n;

CREATE OR REPLACE VIEW view_responses_paper
WITH (security_invoker = true) AS
SELECT
    r.id,
    r.user_id,
    u.age,
    u.sex,
    u.time_of_day,
    u.favorite_subject,
    u.math_mark_last_period,
    u.is_physics_chemistry_student,
    u.school_type,
    u.mood,
    r.test_model,
    r.question_n,
    r.base_a,
    r.exp_b,
    (r.base_a * POWER(10, r.exp_b)) AS computed_value,
    r.created_at
FROM responses_paper r
JOIN users_paper u ON r.user_id = u.id
ORDER BY r.user_id, r.question_n;

-- =====================================================
-- AUTHENTICATION
-- =====================================================
-- Admin access uses Supabase Auth (built-in).
-- Create the admin user from the Supabase dashboard:
--   Authentication → Users → Add User
-- The authenticated policies on users_paper / responses_paper
-- already grant full CRUD to any authenticated user.
-- =====================================================

-- =====================================================
-- STORAGE: scribbles bucket
-- =====================================================
-- Create bucket "scribbles" from Supabase dashboard (Storage → New bucket)
-- Set it as a non-public bucket.
--
-- Storage policies (run in SQL Editor):
--
-- Allow anonymous uploads:
-- CREATE POLICY "Allow anon scribble uploads"
-- ON storage.objects FOR INSERT TO anon
-- WITH CHECK (bucket_id = 'scribbles');
--
-- Allow authenticated reads:
-- CREATE POLICY "Allow auth scribble reads"
-- ON storage.objects FOR SELECT TO authenticated
-- USING (bucket_id = 'scribbles');

-- =====================================================
-- END SCHEMA
-- =====================================================
