import { supabase } from '../lib/supabase';
import type { AppSettings, Candidate, ClassItem, ElectionStats, Student } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'eosis_settings',
  CLASSES: 'eosis_classes',
  STUDENTS: 'eosis_students',
  CANDIDATES: 'eosis_candidates',
  VOTES: 'eosis_votes',
  DB_MODE: 'eosis_db_mode', // 'supabase' | 'local'
};

// Data Awal Bawaan (Default Seed Data)
const DEFAULT_SETTINGS: AppSettings = {
  id: 1,
  school_name: 'SMA Negeri 1 Harapan Bangsa',
  school_logo: 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=200&h=200&fit=crop&q=80',
  election_period: '2026/2027',
  is_election_active: true,
  show_trial_accounts: false,
  admin_username: 'admin',
  // SHA-256 hash untuk "admin123"
  admin_password_hash: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
};

const DEFAULT_CLASSES: ClassItem[] = [
  { id: 'c1', name: 'X MIPA 1' },
  { id: 'c2', name: 'X MIPA 2' },
  { id: 'c3', name: 'XI MIPA 1' },
  { id: 'c4', name: 'XI IPS 1' },
  { id: 'c5', name: 'XII MIPA 1' },
  { id: 'c6', name: 'XII IPS 1' },
];

const DEFAULT_CANDIDATES: Candidate[] = [
  {
    id: 'k1',
    candidate_number: 1,
    leader_name: 'Muhammad Fathir Alvaro',
    vice_leader_name: 'Alya Nabila Putri',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop&q=80',
    slogan: 'BERSINERGI: Berprestasi, Inovatif, dan Saling Peduli',
    vision: 'Mewujudkan OSIS yang aspiratif, berkarakter mulia, serta pelopor inovasi digital dan kepemimpinan berwawasan global di lingkungan sekolah.',
    mission: [
      'Mengoptimalkan wadah aspirasi siswa berbasis digital yang transparan dan tanggap.',
      'Meningkatkan kompetensi riset, teknologi informasi, dan kewirausahaan siswa.',
      'Menggalakkan aksi kepedulian lingkungan dan program kebersihan sekolah berkelanjutan.',
      'Memperkuat kolaborasi antarekstrakurikuler dalam penyelenggaraan acara tahunan berprestasi.'
    ]
  },
  {
    id: 'k2',
    candidate_number: 2,
    leader_name: 'Raditya Danendra',
    vice_leader_name: 'Syakira Humaira',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=500&fit=crop&q=80',
    slogan: 'AKSI NYATA: Aktif, Kreatif, Solutif, Inklusif',
    vision: 'Menjadikan OSIS sebagai motor penggerak kebhinekaan, kreativitas seni budaya, serta kenyamanan belajar yang ramah bagi seluruh siswa.',
    mission: [
      'Mewujudkan iklim sekolah yang aman, toleran, dan bebas perundungan (anti-bullying).',
      'Menyediakan festival bakat dan ruang ekspresi kreatif seni, musik, dan sastra secara berkala.',
      'Menjalin kemitraan dengan alumni dan lembaga edukasi untuk bimbingan karier masa depan.',
      'Menyederhanakan birokrasi kegiatan ekstrakurikuler demi efektivitas program kerja.'
    ]
  },
  {
    id: 'k3',
    candidate_number: 3,
    leader_name: 'Zidane Arkananta',
    vice_leader_name: 'Kirana Citra Dewi',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&h=500&fit=crop&q=80',
    slogan: 'TRANSFORMATIF: Tangguh, Santun, Adaptif, dan Mandiri',
    vision: 'Membangun budaya sekolah yang disiplin, berintegritas tinggi, dan berdaya saing dalam bidang akademik maupun non-akademik tingkat nasional.',
    mission: [
      'Mengadakan program pelatihan kepemimpinan dan public speaking bagi seluruh perwakilan kelas.',
      'Mendorong literasi sekolah melalui pojok baca interaktif dan lomba karya tulis ilmiah.',
      'Mempererat persaudaraan antar angkatan melalui kompetisi olahraga antar kelas yang sportif.',
      'Transparansi pengelolaan kas dan pertanggungjawaban program OSIS kepada seluruh warga sekolah.'
    ]
  }
];

const DEFAULT_STUDENTS: Student[] = [
  { id: 's1', nisn: '0081234501', name: 'Ahmad Fauzan', birth_date: '2008-04-12', class_id: 'c1', has_voted: true, voted_at: '2026-10-04T08:15:00Z' },
  { id: 's2', nisn: '0081234502', name: 'Annisa Rahmadani', birth_date: '2008-08-20', class_id: 'c1', has_voted: true, voted_at: '2026-10-04T08:22:00Z' },
  { id: 's3', nisn: '0081234503', name: 'Budi Santoso', birth_date: '2008-01-15', class_id: 'c2', has_voted: false, voted_at: null },
  { id: 's4', nisn: '0081234504', name: 'Dewi Lestari', birth_date: '2008-11-03', class_id: 'c2', has_voted: false, voted_at: null },
  { id: 's5', nisn: '0071234505', name: 'Dimas Anggoro', birth_date: '2007-06-18', class_id: 'c3', has_voted: true, voted_at: '2026-10-04T09:05:00Z' },
  { id: 's6', nisn: '0071234506', name: 'Fitri Handayani', birth_date: '2007-09-25', class_id: 'c3', has_voted: false, voted_at: null },
  { id: 's7', nisn: '0071234507', name: 'Galih Pratama', birth_date: '2007-03-30', class_id: 'c4', has_voted: true, voted_at: '2026-10-04T09:40:00Z' },
  { id: 's8', nisn: '0071234508', name: 'Indah Permatasari', birth_date: '2007-12-14', class_id: 'c4', has_voted: false, voted_at: null },
  { id: 's9', nisn: '0061234509', name: 'Kevin Arya Wijaya', birth_date: '2006-05-08', class_id: 'c5', has_voted: false, voted_at: null },
  { id: 's10', nisn: '0061234510', name: 'Larasati Putri', birth_date: '2006-07-22', class_id: 'c5', has_voted: false, voted_at: null },
  { id: 's11', nisn: '0061234511', name: 'Muhammad Rizky', birth_date: '2006-10-10', class_id: 'c6', has_voted: false, voted_at: null },
  { id: 's12', nisn: '0061234512', name: 'Nabila Zahra', birth_date: '2006-02-19', class_id: 'c6', has_voted: false, voted_at: null },
];

const DEFAULT_VOTES = [
  { id: 'v1', candidate_id: 'k1', created_at: '2026-10-04T08:15:00Z' },
  { id: 'v2', candidate_id: 'k1', created_at: '2026-10-04T08:22:00Z' },
  { id: 'v3', candidate_id: 'k2', created_at: '2026-10-04T09:05:00Z' },
  { id: 'v4', candidate_id: 'k3', created_at: '2026-10-04T09:40:00Z' },
];

// Helper LocalStorage
function getLocalItem<T>(key: string, defaultValue: T): T {
  const data = localStorage.getItem(key);
  if (!data) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(data) as T;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// Inisialisasi awal localStorage jika kosong
export function initLocalStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(DEFAULT_CLASSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(DEFAULT_CANDIDATES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(DEFAULT_STUDENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.VOTES)) {
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(DEFAULT_VOTES));
  }
}

let isSupabaseOnline: boolean | null = null;

export async function checkSupabaseStatus(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('settings').select('id').limit(1);
    if (error) {
      isSupabaseOnline = false;
      return false;
    }
    isSupabaseOnline = true;
    return true;
  } catch {
    isSupabaseOnline = false;
    return false;
  }
}

export const eosisService = {
  // PENGATURAN
  async getSettings(): Promise<AppSettings> {
    initLocalStorage();
    const local = getLocalItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (!error && data) {
        const merged: AppSettings = {
          ...local,
          ...data,
          show_trial_accounts: data.show_trial_accounts !== undefined
            ? data.show_trial_accounts
            : (local.show_trial_accounts ?? false),
        };
        setLocalItem(STORAGE_KEYS.SETTINGS, merged);
        return merged;
      }
    } catch {
      // fallback
    }
    return local;
  },

  async updateSettings(settingsData: Partial<AppSettings>): Promise<AppSettings> {
    initLocalStorage();
    const current = await this.getSettings();
    const updated: AppSettings = {
      ...current,
      ...settingsData,
      updated_at: new Date().toISOString(),
    };

    setLocalItem(STORAGE_KEYS.SETTINGS, updated);

    try {
      // Siapkan payload Supabase tanpa field yang belum ada di skema SQL cloud
      const { show_trial_accounts, ...supabasePayload } = updated;
      await supabase.from('settings').upsert(supabasePayload);
    } catch (e) {
      console.warn('Supabase updateSettings fallback:', e);
    }

    return updated;
  },

  async updateAdminCredentials(username: string, passwordHash: string): Promise<void> {
    await this.updateSettings({
      admin_username: username,
      admin_password_hash: passwordHash,
    });
  },

  // KELAS
  async getClasses(): Promise<ClassItem[]> {
    initLocalStorage();
    try {
      const { data, error } = await supabase.from('classes').select('*').order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocalItem(STORAGE_KEYS.CLASSES, data);
        return data as ClassItem[];
      }
    } catch {
      // fallback
    }
    return getLocalItem<ClassItem[]>(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
  },

  async createClass(name: string): Promise<ClassItem> {
    initLocalStorage();
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Nama kelas tidak boleh kosong.');

    const newClass: ClassItem = {
      id: 'c_' + Date.now().toString(36),
      name: trimmed,
      created_at: new Date().toISOString(),
    };

    // Supabase
    try {
      const { data, error } = await supabase.from('classes').insert({ name: trimmed }).select().single();
      if (!error && data) {
        const local = getLocalItem<ClassItem[]>(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
        setLocalItem(STORAGE_KEYS.CLASSES, [...local, data]);
        return data as ClassItem;
      }
    } catch (e) {
      console.warn('Supabase createClass fallback:', e);
    }

    const local = getLocalItem<ClassItem[]>(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
    if (local.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Kelas "${trimmed}" sudah ada.`);
    }
    const updated = [...local, newClass];
    setLocalItem(STORAGE_KEYS.CLASSES, updated);
    return newClass;
  },

  async updateClass(id: string, name: string): Promise<ClassItem> {
    initLocalStorage();
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Nama kelas tidak boleh kosong.');

    try {
      const { data, error } = await supabase.from('classes').update({ name: trimmed }).eq('id', id).select().single();
      if (!error && data) {
        const local = getLocalItem<ClassItem[]>(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
        setLocalItem(STORAGE_KEYS.CLASSES, local.map(c => c.id === id ? data : c));
        return data as ClassItem;
      }
    } catch (e) {
      console.warn('Supabase updateClass fallback:', e);
    }

    const local = getLocalItem<ClassItem[]>(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
    const index = local.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Kelas tidak ditemukan.');
    local[index].name = trimmed;
    setLocalItem(STORAGE_KEYS.CLASSES, local);
    return local[index];
  },

  async deleteClass(id: string): Promise<void> {
    initLocalStorage();
    try {
      await supabase.from('classes').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteClass fallback:', e);
    }

    const local = getLocalItem<ClassItem[]>(STORAGE_KEYS.CLASSES, DEFAULT_CLASSES);
    setLocalItem(STORAGE_KEYS.CLASSES, local.filter(c => c.id !== id));
  },

  // SISWA
  async getStudents(filters?: { classId?: string; hasVoted?: boolean; search?: string }): Promise<Student[]> {
    initLocalStorage();
    let students: Student[] = [];

    try {
      const { data, error } = await supabase.from('students').select('*').order('name', { ascending: true });
      if (!error && data && data.length > 0) {
        students = data as Student[];
        setLocalItem(STORAGE_KEYS.STUDENTS, students);
      } else {
        students = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
      }
    } catch {
      students = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    }

    const classes = await this.getClasses();
    const classMap = new Map(classes.map(c => [c.id, c.name]));

    students = students.map(s => ({
      ...s,
      class_name: classMap.get(s.class_id) || 'Tidak diketahui',
    }));

    if (filters) {
      if (filters.classId) {
        students = students.filter(s => s.class_id === filters.classId);
      }
      if (filters.hasVoted !== undefined) {
        students = students.filter(s => s.has_voted === filters.hasVoted);
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        students = students.filter(s => s.name.toLowerCase().includes(q) || s.nisn.includes(q));
      }
    }

    return students;
  },

  async getStudentByNisnAndDob(nisn: string, birthDate: string): Promise<Student | null> {
    initLocalStorage();
    const cleanNisn = nisn.trim();
    const cleanDob = birthDate.trim();

    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('nisn', cleanNisn)
        .eq('birth_date', cleanDob)
        .single();
      if (!error && data) {
        const classes = await this.getClasses();
        const foundClass = classes.find(c => c.id === data.class_id);
        return {
          ...data,
          class_name: foundClass?.name || 'Umum',
        } as Student;
      }
    } catch {
      // fallback
    }

    const localStudents = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    const student = localStudents.find(
      s => s.nisn.trim() === cleanNisn && s.birth_date === cleanDob
    );

    if (student) {
      const classes = await this.getClasses();
      const foundClass = classes.find(c => c.id === student.class_id);
      return {
        ...student,
        class_name: foundClass?.name || 'Umum',
      };
    }

    return null;
  },

  async createStudent(studentData: Omit<Student, 'id' | 'has_voted' | 'voted_at' | 'created_at'>): Promise<Student> {
    initLocalStorage();
    const local = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    if (local.some(s => s.nisn === studentData.nisn.trim())) {
      throw new Error(`NISN ${studentData.nisn} sudah terdaftar.`);
    }

    const newStudent: Student = {
      ...studentData,
      id: 's_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      nisn: studentData.nisn.trim(),
      name: studentData.name.trim(),
      has_voted: false,
      voted_at: null,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from('students')
        .insert({
          nisn: newStudent.nisn,
          name: newStudent.name,
          birth_date: newStudent.birth_date,
          class_id: newStudent.class_id,
        })
        .select()
        .single();
      if (!error && data) {
        setLocalItem(STORAGE_KEYS.STUDENTS, [...local, data]);
        return data as Student;
      }
    } catch (e) {
      console.warn('Supabase createStudent fallback:', e);
    }

    setLocalItem(STORAGE_KEYS.STUDENTS, [...local, newStudent]);
    return newStudent;
  },

  async createStudentsBulk(studentsData: Array<Omit<Student, 'id' | 'has_voted' | 'voted_at' | 'created_at'>>): Promise<{ insertedCount: number; duplicatesCount: number; insertedStudents: Student[] }> {
    initLocalStorage();
    const local = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    const existingNisns = new Set(local.map(s => s.nisn.trim()));

    const toInsert: Student[] = [];
    let duplicatesCount = 0;

    for (const item of studentsData) {
      const cleanNisn = item.nisn.trim();
      if (!cleanNisn || existingNisns.has(cleanNisn)) {
        duplicatesCount++;
        continue;
      }

      existingNisns.add(cleanNisn);
      toInsert.push({
        ...item,
        id: 's_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        nisn: cleanNisn,
        name: item.name.trim(),
        birth_date: item.birth_date.trim(),
        class_id: item.class_id,
        has_voted: false,
        voted_at: null,
        created_at: new Date().toISOString(),
      });
    }

    if (toInsert.length > 0) {
      try {
        const payload = toInsert.map(s => ({
          nisn: s.nisn,
          name: s.name,
          birth_date: s.birth_date,
          class_id: s.class_id,
        }));
        const { data, error } = await supabase.from('students').insert(payload).select();
        if (!error && data) {
          // Sinkronkan
        }
      } catch (e) {
        console.warn('Supabase bulk insert notice:', e);
      }

      setLocalItem(STORAGE_KEYS.STUDENTS, [...local, ...toInsert]);
    }

    return {
      insertedCount: toInsert.length,
      duplicatesCount,
      insertedStudents: toInsert,
    };
  },

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    initLocalStorage();
    try {
      const { data, error } = await supabase.from('students').update(studentData).eq('id', id).select().single();
      if (!error && data) {
        const local = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
        setLocalItem(STORAGE_KEYS.STUDENTS, local.map(s => s.id === id ? { ...s, ...data } : s));
        return data as Student;
      }
    } catch (e) {
      console.warn('Supabase updateStudent fallback:', e);
    }

    const local = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    const index = local.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Data siswa tidak ditemukan.');

    local[index] = { ...local[index], ...studentData };
    setLocalItem(STORAGE_KEYS.STUDENTS, local);
    return local[index];
  },

  async deleteStudent(id: string): Promise<void> {
    initLocalStorage();
    try {
      await supabase.from('students').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteStudent fallback:', e);
    }

    const local = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    setLocalItem(STORAGE_KEYS.STUDENTS, local.filter(s => s.id !== id));
  },

  async resetStudentVote(id: string): Promise<void> {
    initLocalStorage();
    try {
      await supabase.from('students').update({ has_voted: false, voted_at: null }).eq('id', id);
    } catch (e) {
      console.warn('Supabase resetStudentVote fallback:', e);
    }

    const local = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    const idx = local.findIndex(s => s.id === id);
    if (idx !== -1) {
      local[idx].has_voted = false;
      local[idx].voted_at = null;
      setLocalItem(STORAGE_KEYS.STUDENTS, local);
    }
  },

  // KANDIDAT
  async getCandidates(): Promise<Candidate[]> {
    initLocalStorage();
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order('candidate_number', { ascending: true });
      if (!error && data && data.length > 0) {
        setLocalItem(STORAGE_KEYS.CANDIDATES, data);
        return data as Candidate[];
      }
    } catch {
      // fallback
    }
    return getLocalItem<Candidate[]>(STORAGE_KEYS.CANDIDATES, DEFAULT_CANDIDATES);
  },

  async createCandidate(candidateData: Omit<Candidate, 'id' | 'created_at'>): Promise<Candidate> {
    initLocalStorage();
    const local = getLocalItem<Candidate[]>(STORAGE_KEYS.CANDIDATES, DEFAULT_CANDIDATES);
    if (local.some(c => c.candidate_number === candidateData.candidate_number)) {
      throw new Error(`Nomor urut ${candidateData.candidate_number} sudah digunakan.`);
    }

    const newCandidate: Candidate = {
      ...candidateData,
      id: 'k_' + Date.now().toString(36),
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from('candidates').insert({
        candidate_number: candidateData.candidate_number,
        leader_name: candidateData.leader_name,
        vice_leader_name: candidateData.vice_leader_name,
        photo_url: candidateData.photo_url,
        slogan: candidateData.slogan,
        vision: candidateData.vision,
        mission: candidateData.mission,
      }).select().single();

      if (!error && data) {
        setLocalItem(STORAGE_KEYS.CANDIDATES, [...local, data]);
        return data as Candidate;
      }
    } catch (e) {
      console.warn('Supabase createCandidate fallback:', e);
    }

    setLocalItem(STORAGE_KEYS.CANDIDATES, [...local, newCandidate].sort((a, b) => a.candidate_number - b.candidate_number));
    return newCandidate;
  },

  async updateCandidate(id: string, candidateData: Partial<Candidate>): Promise<Candidate> {
    initLocalStorage();
    try {
      const { data, error } = await supabase.from('candidates').update(candidateData).eq('id', id).select().single();
      if (!error && data) {
        const local = getLocalItem<Candidate[]>(STORAGE_KEYS.CANDIDATES, DEFAULT_CANDIDATES);
        setLocalItem(STORAGE_KEYS.CANDIDATES, local.map(c => c.id === id ? { ...c, ...data } : c));
        return data as Candidate;
      }
    } catch (e) {
      console.warn('Supabase updateCandidate fallback:', e);
    }

    const local = getLocalItem<Candidate[]>(STORAGE_KEYS.CANDIDATES, DEFAULT_CANDIDATES);
    const index = local.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Kandidat tidak ditemukan.');

    local[index] = { ...local[index], ...candidateData };
    setLocalItem(STORAGE_KEYS.CANDIDATES, local.sort((a, b) => a.candidate_number - b.candidate_number));
    return local[index];
  },

  async deleteCandidate(id: string): Promise<void> {
    initLocalStorage();
    try {
      await supabase.from('candidates').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteCandidate fallback:', e);
    }

    const local = getLocalItem<Candidate[]>(STORAGE_KEYS.CANDIDATES, DEFAULT_CANDIDATES);
    setLocalItem(STORAGE_KEYS.CANDIDATES, local.filter(c => c.id !== id));
  },

  // VOTING (MEKANISME 1 SISWA 1 SUARA & RAHASIA)
  async castVote(studentId: string, candidateId: string): Promise<{ success: boolean; message: string }> {
    initLocalStorage();

    // 1. Cek pengaturan status pemilihan
    const settings = await this.getSettings();
    if (!settings.is_election_active) {
      throw new Error('Periode pemilihan saat ini sedang dinonaktifkan atau ditutup.');
    }

    // 2. Coba eksekusi melalui Supabase RPC Function (Atomik di level database)
    try {
      const { data, error } = await supabase.rpc('cast_student_vote', {
        p_student_id: studentId,
        p_candidate_id: candidateId,
      });

      if (!error && data) {
        if (data.success) {
          // Sinkronkan state lokal
          const localStudents = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
          const sIdx = localStudents.findIndex(s => s.id === studentId);
          if (sIdx !== -1) {
            localStudents[sIdx].has_voted = true;
            localStudents[sIdx].voted_at = new Date().toISOString();
            setLocalItem(STORAGE_KEYS.STUDENTS, localStudents);
          }
          const localVotes = getLocalItem<any[]>(STORAGE_KEYS.VOTES, DEFAULT_VOTES);
          setLocalItem(STORAGE_KEYS.VOTES, [...localVotes, {
            id: 'v_' + Date.now().toString(36),
            candidate_id: candidateId,
            created_at: new Date().toISOString(),
          }]);
          return { success: true, message: data.message || 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi' };
        } else {
          throw new Error(data.message || 'Gagal menyimpan suara.');
        }
      }
    } catch (rpcErr: any) {
      // Jika RPC tidak ada di Supabase atau error, lanjut ke mekanisme validasi atomik
      if (rpcErr.message && rpcErr.message.includes('Anda sudah')) {
        throw rpcErr;
      }
    }

    // 3. Fallback Validasi Database/Lokal
    const students = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    const studentIndex = students.findIndex(s => s.id === studentId);

    if (studentIndex === -1) {
      throw new Error('Identitas siswa tidak ditemukan.');
    }

    if (students[studentIndex].has_voted) {
      throw new Error('Anda sudah menggunakan hak suara sebelumnya. Setiap siswa hanya dapat memilih 1 kali!');
    }

    const candidates = await this.getCandidates();
    const candidateExists = candidates.some(c => c.id === candidateId);
    if (!candidateExists) {
      throw new Error('Kandidat yang dipilih tidak valid.');
    }

    // Tandai siswa sudah memilih (Atomic state update)
    students[studentIndex].has_voted = true;
    students[studentIndex].voted_at = new Date().toISOString();
    setLocalItem(STORAGE_KEYS.STUDENTS, students);

    // Simpan suara ke bilik suara TANPA menyimpan identitas siswa (Rahasia & LUBERJURDIL)
    const votes = getLocalItem<any[]>(STORAGE_KEYS.VOTES, DEFAULT_VOTES);
    votes.push({
      id: 'v_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      candidate_id: candidateId,
      created_at: new Date().toISOString(),
    });
    setLocalItem(STORAGE_KEYS.VOTES, votes);

    // Coba simpan ke Supabase jika tabelnya ada
    try {
      await supabase.from('students').update({
        has_voted: true,
        voted_at: new Date().toISOString(),
      }).eq('id', studentId);

      await supabase.from('votes').insert({
        candidate_id: candidateId,
      });
    } catch (e) {
      console.warn('Supabase direct vote record fallback:', e);
    }

    return {
      success: true,
      message: 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi',
    };
  },

  // STATISTIK & PEROLEHAN SUARA
  async getElectionStats(): Promise<ElectionStats> {
    initLocalStorage();

    const [students, classes, candidates] = await Promise.all([
      this.getStudents(),
      this.getClasses(),
      this.getCandidates(),
    ]);

    // Ambil votes
    let votes: any[] = [];
    try {
      const { data, error } = await supabase.from('votes').select('*');
      if (!error && data && data.length > 0) {
        votes = data;
      } else {
        votes = getLocalItem<any[]>(STORAGE_KEYS.VOTES, DEFAULT_VOTES);
      }
    } catch {
      votes = getLocalItem<any[]>(STORAGE_KEYS.VOTES, DEFAULT_VOTES);
    }

    const totalStudents = students.length;
    const totalClasses = classes.length;
    const totalCandidates = candidates.length;
    const totalVoted = students.filter(s => s.has_voted).length;
    const totalNotVoted = Math.max(0, totalStudents - totalVoted);
    const participationPercentage = totalStudents > 0 ? Math.round((totalVoted / totalStudents) * 1000) / 10 : 0;

    // Hitung perolehan suara per kandidat
    const voteCountMap = new Map<string, number>();
    for (const v of votes) {
      voteCountMap.set(v.candidate_id, (voteCountMap.get(v.candidate_id) || 0) + 1);
    }

    const totalRecordedVotes = votes.length || totalVoted || 1;

    const candidateResults = candidates.map(c => {
      const count = voteCountMap.get(c.id) || 0;
      const pct = votes.length > 0 ? Math.round((count / votes.length) * 1000) / 10 : 0;
      return {
        candidate_id: c.id,
        candidate_number: c.candidate_number,
        leader_name: c.leader_name,
        vice_leader_name: c.vice_leader_name,
        photo_url: c.photo_url,
        votes: count,
        percentage: pct,
      };
    });

    return {
      totalStudents,
      totalClasses,
      totalCandidates,
      totalVoted,
      totalNotVoted,
      participationPercentage,
      candidateResults,
    };
  },

  async resetAllVotes(): Promise<void> {
    initLocalStorage();
    const students = getLocalItem<Student[]>(STORAGE_KEYS.STUDENTS, DEFAULT_STUDENTS);
    const resetStudents = students.map(s => ({ ...s, has_voted: false, voted_at: null }));
    setLocalItem(STORAGE_KEYS.STUDENTS, resetStudents);
    setLocalItem(STORAGE_KEYS.VOTES, []);

    try {
      await supabase.from('students').update({ has_voted: false, voted_at: null }).neq('id', 'placeholder');
      await supabase.from('votes').delete().neq('id', 'placeholder');
    } catch (e) {
      console.warn('Supabase reset all votes error:', e);
    }
  }
};
