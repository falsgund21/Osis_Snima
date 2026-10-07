import { ref } from 'vue';
import { eosisService } from '../services/eosisService';
import { uploadAsset } from '../lib/supabase';
import type { AppSettings, Candidate, ClassItem, ElectionStats, Student } from '../types';

export function useEosis() {
  const settings = ref<AppSettings>({
    id: 1,
    school_name: 'SMA Negeri 1 Harapan Bangsa',
    school_logo: '',
    election_period: '2026/2027',
    is_election_active: true,
    admin_username: 'admin',
    admin_password_hash: '',
  });

  const classes = ref<ClassItem[]>([]);
  const students = ref<Student[]>([]);
  const candidates = ref<Candidate[]>([]);
  const stats = ref<ElectionStats>({
    totalStudents: 0,
    totalClasses: 0,
    totalCandidates: 0,
    totalVoted: 0,
    totalNotVoted: 0,
    participationPercentage: 0,
    candidateResults: [],
  });

  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // SETTINGS
  async function fetchSettings(): Promise<AppSettings> {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await eosisService.getSettings();
      settings.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat pengaturan.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await eosisService.updateSettings(partial);
      settings.value = updated;
      return updated;
    } catch (err: any) {
      error.value = err.message || 'Gagal memperbarui pengaturan.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateAdminCredentials(username: string, passwordHash: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await eosisService.updateAdminCredentials(username, passwordHash);
      settings.value.admin_username = username;
      settings.value.admin_password_hash = passwordHash;
    } catch (err: any) {
      error.value = err.message || 'Gagal memperbarui kredensial admin.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // KELAS
  async function fetchClasses(): Promise<ClassItem[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await eosisService.getClasses();
      classes.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat data kelas.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function addClass(name: string): Promise<ClassItem> {
    isLoading.value = true;
    error.value = null;
    try {
      const created = await eosisService.createClass(name);
      await fetchClasses();
      return created;
    } catch (err: any) {
      error.value = err.message || 'Gagal menambah kelas.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateClass(id: string, name: string): Promise<ClassItem> {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await eosisService.updateClass(id, name);
      await fetchClasses();
      return updated;
    } catch (err: any) {
      error.value = err.message || 'Gagal mengubah kelas.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteClass(id: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await eosisService.deleteClass(id);
      await fetchClasses();
    } catch (err: any) {
      error.value = err.message || 'Gagal menghapus kelas.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // SISWA
  async function fetchStudents(filters?: { classId?: string; hasVoted?: boolean; search?: string }): Promise<Student[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await eosisService.getStudents(filters);
      students.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat data siswa.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function addStudent(studentData: Omit<Student, 'id' | 'has_voted' | 'voted_at' | 'created_at'>): Promise<Student> {
    isLoading.value = true;
    error.value = null;
    try {
      const created = await eosisService.createStudent(studentData);
      await fetchStudents();
      return created;
    } catch (err: any) {
      error.value = err.message || 'Gagal menambah siswa.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function addStudentsBulk(studentsData: Array<Omit<Student, 'id' | 'has_voted' | 'voted_at' | 'created_at'>>) {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await eosisService.createStudentsBulk(studentsData);
      await fetchStudents();
      return result;
    } catch (err: any) {
      error.value = err.message || 'Gagal mengimpor siswa.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await eosisService.updateStudent(id, studentData);
      await fetchStudents();
      return updated;
    } catch (err: any) {
      error.value = err.message || 'Gagal mengubah siswa.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteStudent(id: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await eosisService.deleteStudent(id);
      await fetchStudents();
    } catch (err: any) {
      error.value = err.message || 'Gagal menghapus siswa.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function resetStudentVote(id: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await eosisService.resetStudentVote(id);
      await fetchStudents();
    } catch (err: any) {
      error.value = err.message || 'Gagal mereset hak suara siswa.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // KANDIDAT
  async function fetchCandidates(): Promise<Candidate[]> {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await eosisService.getCandidates();
      candidates.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat kandidat.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function addCandidate(candidateData: Omit<Candidate, 'id' | 'created_at'>): Promise<Candidate> {
    isLoading.value = true;
    error.value = null;
    try {
      const created = await eosisService.createCandidate(candidateData);
      await fetchCandidates();
      return created;
    } catch (err: any) {
      error.value = err.message || 'Gagal menambah calon kandidat.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCandidate(id: string, candidateData: Partial<Candidate>): Promise<Candidate> {
    isLoading.value = true;
    error.value = null;
    try {
      const updated = await eosisService.updateCandidate(id, candidateData);
      await fetchCandidates();
      return updated;
    } catch (err: any) {
      error.value = err.message || 'Gagal mengubah calon kandidat.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteCandidate(id: string): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await eosisService.deleteCandidate(id);
      await fetchCandidates();
    } catch (err: any) {
      error.value = err.message || 'Gagal menghapus kandidat.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // VOTING & STATISTIK
  async function fetchStats(): Promise<ElectionStats> {
    isLoading.value = true;
    error.value = null;
    try {
      const data = await eosisService.getElectionStats();
      stats.value = data;
      return data;
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat statistik pemilihan.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function castVote(studentId: string, candidateId: string): Promise<{ success: boolean; message: string }> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await eosisService.castVote(studentId, candidateId);
      return res;
    } catch (err: any) {
      error.value = err.message || 'Gagal memberikan suara.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function resetAllVotes(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      await eosisService.resetAllVotes();
      await fetchStats();
    } catch (err: any) {
      error.value = err.message || 'Gagal mereset semua suara.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // STORAGE UPLOAD
  async function uploadFile(file: File, folder = 'uploads'): Promise<string> {
    isLoading.value = true;
    error.value = null;
    try {
      const url = await uploadAsset(file, folder);
      return url;
    } catch (err: any) {
      error.value = err.message || 'Gagal mengunggah berkas.';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    settings,
    classes,
    students,
    candidates,
    stats,
    isLoading,
    error,
    fetchSettings,
    updateSettings,
    updateAdminCredentials,
    fetchClasses,
    addClass,
    updateClass,
    deleteClass,
    fetchStudents,
    addStudent,
    addStudentsBulk,
    updateStudent,
    deleteStudent,
    resetStudentVote,
    fetchCandidates,
    addCandidate,
    updateCandidate,
    deleteCandidate,
    fetchStats,
    castVote,
    resetAllVotes,
    uploadFile,
  };
}
