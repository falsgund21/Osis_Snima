import { ref, computed } from 'vue';
import { authService } from '../services/auth';
import type { Student } from '../types';

// Global reactive states shared across all components invoking useAuth
const currentStudent = ref<Student | null>(authService.getCurrentStudent());
const currentAdmin = ref<{ role: string; username: string } | null>(
  authService.isAdminLoggedIn()
    ? { role: 'admin', username: JSON.parse(localStorage.getItem('eosis_admin_session') || '{}').username || 'admin' }
    : null
);

const isAuthLoading = ref(false);
const authError = ref<string | null>(null);

export function useAuth() {
  const isStudentAuthenticated = computed(() => !!currentStudent.value);
  const isAdminAuthenticated = computed(() => !!currentAdmin.value);
  const studentHasVoted = computed(() => currentStudent.value?.has_voted ?? false);

  async function loginStudent(nisn: string, birthDate: string) {
    isAuthLoading.value = true;
    authError.value = null;
    try {
      const result = await authService.loginStudent(nisn, birthDate);
      if (result.success && result.student) {
        currentStudent.value = result.student;
        return { success: true, student: result.student };
      } else {
        authError.value = result.message || 'Nomor Pemilih atau tanggal lahir tidak cocok.';
        return { success: false, message: authError.value };
      }
    } catch (err: any) {
      authError.value = err.message || 'Terjadi kesalahan sistem saat autentikasi siswa.';
      return { success: false, message: authError.value };
    } finally {
      isAuthLoading.value = false;
    }
  }

  function logoutStudent() {
    authService.logoutStudent();
    currentStudent.value = null;
    authError.value = null;
  }

  async function refreshStudent() {
    const refreshed = await authService.refreshStudentSession();
    currentStudent.value = refreshed;
    return refreshed;
  }

  async function loginAdmin(username: string, passwordPlain: string) {
    isAuthLoading.value = true;
    authError.value = null;
    try {
      const success = await authService.loginAdmin(username, passwordPlain);
      if (success) {
        currentAdmin.value = { role: 'admin', username: username.trim() };
        return { success: true };
      } else {
        authError.value = 'Username atau password administrator salah.';
        return { success: false, message: authError.value };
      }
    } catch (err: any) {
      authError.value = err.message || 'Gagal login administrator.';
      return { success: false, message: authError.value };
    } finally {
      isAuthLoading.value = false;
    }
  }

  function logoutAdmin() {
    authService.logoutAdmin();
    currentAdmin.value = null;
    authError.value = null;
  }

  return {
    currentStudent,
    currentAdmin,
    isStudentAuthenticated,
    isAdminAuthenticated,
    studentHasVoted,
    isAuthLoading,
    authError,
    loginStudent,
    logoutStudent,
    refreshStudent,
    loginAdmin,
    logoutAdmin,
  };
}
