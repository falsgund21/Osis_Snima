-- ==============================================================================
-- eOSIS - Skrip Skema Basis Data PostgreSQL / Supabase
-- Sistem Pemilihan Ketua dan Wakil Ketua OSIS
-- ==============================================================================

-- 1. TABEL KELAS
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABEL SISWA / PEMILIH
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    has_voted BOOLEAN NOT NULL DEFAULT FALSE,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_students_nisn ON public.students(nisn);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);

-- 3. TABEL CALON KANDIDAT
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_number INT NOT NULL UNIQUE,
    leader_name VARCHAR(255) NOT NULL,
    vice_leader_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    slogan TEXT,
    vision TEXT NOT NULL,
    mission TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_candidates_number ON public.candidates(candidate_number);

-- 4. TABEL SUARA (VOTES)
-- Dirancang rahasia (tanpa menyimpan identitas siswa) untuk asas LUBERJURDIL
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_votes_candidate_id ON public.votes(candidate_id);

-- 5. TABEL PENGATURAN APLIKASI & ADMIN
CREATE TABLE IF NOT EXISTS public.settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    school_name VARCHAR(255) NOT NULL DEFAULT 'SMA Negeri 1 Indonesia',
    school_logo TEXT,
    election_period VARCHAR(50) NOT NULL DEFAULT '2026/2027',
    is_election_active BOOLEAN NOT NULL DEFAULT TRUE,
    admin_username VARCHAR(100) NOT NULL DEFAULT 'admin',
    admin_password_hash VARCHAR(255) NOT NULL DEFAULT '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', -- default: 'admin123' (SHA-256)
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Inisialisasi baris pengaturan tunggal jika belum ada
INSERT INTO public.settings (id, school_name, school_logo, election_period, is_election_active, admin_username, admin_password_hash)
VALUES (
    1,
    'SMA Negeri 1 Indonesia',
    'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=200&h=200&fit=crop&q=80',
    '2026/2027',
    true,
    'admin',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
)
ON CONFLICT (id) DO NOTHING;

-- 6. RPC FUNCTION: CAST VOTE (Transaksi Atomik & Validasi 1 Suara)
-- Menjamin satu siswa hanya bisa memilih 1 kali dan suara disimpan secara rahasia
CREATE OR REPLACE FUNCTION public.cast_student_vote(
    p_student_id UUID,
    p_candidate_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_voted BOOLEAN;
    v_election_active BOOLEAN;
    v_candidate_exists BOOLEAN;
BEGIN
    -- Cek status periode pemilihan
    SELECT is_election_active INTO v_election_active FROM public.settings WHERE id = 1;
    IF v_election_active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Periode pemilihan sedang ditutup.');
    END IF;

    -- Cek keberadaan kandidat
    SELECT EXISTS(SELECT 1 FROM public.candidates WHERE id = p_candidate_id) INTO v_candidate_exists;
    IF NOT v_candidate_exists THEN
        RETURN jsonb_build_object('success', false, 'message', 'Kandidat yang dipilih tidak valid.');
    END IF;

    -- Kunci baris siswa untuk mencegah concurrent race condition (misal multi-tab/refresh)
    SELECT has_voted INTO v_has_voted
    FROM public.students
    WHERE id = p_student_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Data siswa tidak ditemukan.');
    END IF;

    IF v_has_voted THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda sudah menggunakan hak suara Anda sebelumnya.');
    END IF;

    -- Tandai siswa sudah memilih
    UPDATE public.students
    SET has_voted = TRUE,
        voted_at = timezone('utc'::text, now())
    WHERE id = p_student_id;

    -- Masukkan suara ke bilik suara (anonymized)
    INSERT INTO public.votes (candidate_id, created_at)
    VALUES (p_candidate_id, timezone('utc'::text, now()));

    RETURN jsonb_build_object('success', true, 'message', 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi.');
END;
$$;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Penuh untuk Anon & Authenticated (dengan USING dan WITH CHECK)
DROP POLICY IF EXISTS "Public Read Classes" ON public.classes;
DROP POLICY IF EXISTS "Public Manage Classes" ON public.classes;
CREATE POLICY "Public Read Classes" ON public.classes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Classes" ON public.classes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Candidates" ON public.candidates;
DROP POLICY IF EXISTS "Public Manage Candidates" ON public.candidates;
CREATE POLICY "Public Read Candidates" ON public.candidates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Candidates" ON public.candidates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Settings" ON public.settings;
DROP POLICY IF EXISTS "Public Update Settings" ON public.settings;
DROP POLICY IF EXISTS "Public Manage Settings" ON public.settings;
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Settings" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Students" ON public.students;
DROP POLICY IF EXISTS "Public Manage Students" ON public.students;
CREATE POLICY "Public Read Students" ON public.students FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Students" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Votes" ON public.votes;
DROP POLICY IF EXISTS "Public Insert Votes" ON public.votes;
DROP POLICY IF EXISTS "Public Manage Votes" ON public.votes;
CREATE POLICY "Public Read Votes" ON public.votes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public Manage Votes" ON public.votes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. DATA DUMMY / SEED DATA AWAL
-- Tambah contoh kelas
INSERT INTO public.classes (name) VALUES 
('X MIPA 1'), ('X MIPA 2'), ('XI MIPA 1'), ('XI IPS 1'), ('XII MIPA 1'), ('XII IPS 1')
ON CONFLICT (name) DO NOTHING;

-- Tambah contoh kandidat pasangan calon
INSERT INTO public.candidates (candidate_number, leader_name, vice_leader_name, photo_url, slogan, vision, mission)
VALUES 
(
    1,
    'Muhammad Fathir Alvaro',
    'Alya Nabila Putri',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop&q=80',
    'BERSINERGI: Berprestasi, Inovatif, dan Saling Peduli',
    'Mewujudkan OSIS yang aspiratif, berkarakter mulia, serta pelopor inovasi digital dan kepemimpinan berwawasan global di lingkungan sekolah.',
    ARRAY[
        'Mengoptimalkan wadah aspirasi siswa berbasis digital yang transparan dan tanggap.',
        'Meningkatkan kompetensi riset, teknologi informasi, dan kewirausahaan siswa.',
        'Menggalakkan aksi kepedulian lingkungan dan program kebersihan sekolah berkelanjutan.',
        'Memperkuat kolaborasi antarekstrakurikuler dalam penyelenggaraan acara tahunan berprestasi.'
    ]
),
(
    2,
    'Raditya Danendra',
    'Syakira Humaira',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&q=80',
    'AKSI NYATA: Aktif, Kreatif, Solutif, Inklusif',
    'Menjadikan OSIS sebagai motor penggerak kebhinekaan, kreativitas seni budaya, serta kenyamanan belajar yang ramah bagi seluruh siswa.',
    ARRAY[
        'Mewujudkan iklim sekolah yang aman, toleran, dan bebas perundungan (anti-bullying).',
        'Menyediakan festival bakat dan ruang ekspresi kreatif seni, musik, dan sastra secara berkala.',
        'Menjalin kemitraan dengan alumni dan lembaga edukasi untuk bimbingan karier masa depan.',
        'Menyederhanakan birokrasi kegiatan ekstrakurikuler demi efektivitas program kerja.'
    ]
),
(
    3,
    'Zidane Arkananta',
    'Kirana Citra Dewi',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop&q=80',
    'TRANSFORMATIF: Tangguh, Santun, Adaptif, dan Mandiri',
    'Membangun budaya sekolah yang disiplin, berintegritas tinggi, dan berdaya saing dalam bidang akademik maupun non-akademik tingkat nasional.',
    ARRAY[
        'Mengadakan program pelatihan kepemimpinan dan public speaking bagi seluruh perwakilan kelas.',
        'Mendorong literasi sekolah melalui pojok baca interaktif dan lomba karya tulis ilmiah.',
        'Mempererat persaudaraan antar angkatan melalui kompetisi olahraga antar kelas (class meeting) yang sportif.',
        'Transparansi pengelolaan kas dan pertanggungjawaban program OSIS kepada seluruh warga sekolah.'
    ]
)
ON CONFLICT (candidate_number) DO NOTHING;
