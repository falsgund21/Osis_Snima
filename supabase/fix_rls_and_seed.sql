-- ==============================================================================
-- eOSIS: Skrip Cepat Perbaikan RLS Policy & Inisialisasi Data Awal Supabase
-- Jalankan skrip ini di menu SQL Editor Supabase jika tabel sudah ada.
-- ==============================================================================

-- 1. Berikan hak akses penuh (SELECT, INSERT, UPDATE, DELETE) untuk peran anon & authenticated
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

-- 2. Inisialisasi Data Pengaturan Sekolah & Admin Awal
INSERT INTO public.settings (id, school_name, school_logo, election_period, is_election_active, admin_username, admin_password_hash)
VALUES (
    1,
    'SMA Negeri 1 Harapan Bangsa',
    'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=200&h=200&fit=crop&q=80',
    '2026/2027',
    true,
    'admin',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9' -- password: admin123
)
ON CONFLICT (id) DO UPDATE SET
    school_name = EXCLUDED.school_name,
    election_period = EXCLUDED.election_period,
    is_election_active = EXCLUDED.is_election_active;

-- 3. Inisialisasi Kelas Awal
INSERT INTO public.classes (name) VALUES 
('X MIPA 1'), ('X MIPA 2'), ('XI MIPA 1'), ('XI IPS 1'), ('XII MIPA 1'), ('XII IPS 1')
ON CONFLICT (name) DO NOTHING;

-- 4. Inisialisasi Pasangan Calon Awal
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
        'Mempererat persaudaraan antar angkatan melalui kompetisi olahraga antar kelas yang sportif.',
        'Transparansi pengelolaan kas dan pertanggungjawaban program OSIS kepada seluruh warga sekolah.'
    ]
)
ON CONFLICT (candidate_number) DO NOTHING;
