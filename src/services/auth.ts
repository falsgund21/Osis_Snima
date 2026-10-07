import { eosisService } from './eosisService';
import { verifyPassword } from './crypto';
import type { Student } from '../types';

const ADMIN_SESSION_KEY = 'eosis_admin_session';
const STUDENT_SESSION_KEY = 'eosis_student_session';

export const authService = {
  // ADMIN AUTH
  isAdminLoggedIn(): boolean {
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) return false;
    try {
      const data = JSON.parse(session);
      return data && data.role === 'admin' && !!data.username;
    } catch {
      return false;
    }
  },

  async loginAdmin(username: string, passwordPlain: string): Promise<boolean> {
    const settings = await eosisService.getSettings();
    const cleanUser = username.trim();

    if (cleanUser !== settings.admin_username) {
      return false;
    }

    const isMatch = await verifyPassword(passwordPlain, settings.admin_password_hash);
    if (!isMatch) {
      return false;
    }

    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({
      role: 'admin',
      username: settings.admin_username,
      loggedInAt: new Date().toISOString(),
    }));

    return true;
  },

  logoutAdmin(): void {
    localStorage.removeItem(ADMIN_SESSION_KEY);
  },

  // SISWA AUTH
  getCurrentStudent(): Student | null {
    const session = localStorage.getItem(STUDENT_SESSION_KEY);
    if (!session) return null;
    try {
      return JSON.parse(session) as Student;
    } catch {
      return null;
    }
  },

  async loginStudent(nisn: string, birthDate: string): Promise<{ success: boolean; student?: Student; message?: string }> {
    const student = await eosisService.getStudentByNisnAndDob(nisn, birthDate);
    if (!student) {
      return {
        success: false,
        message: 'Nomor Pemilih atau tanggal lahir tidak cocok dengan data yang terdaftar.',
      };
    }

    localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(student));
    return {
      success: true,
      student,
    };
  },

  async refreshStudentSession(): Promise<Student | null> {
    const current = this.getCurrentStudent();
    if (!current) return null;
    const fresh = await eosisService.getStudentByNisnAndDob(current.nisn, current.birth_date);
    if (fresh) {
      localStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return current;
  },

  logoutStudent(): void {
    localStorage.removeItem(STUDENT_SESSION_KEY);
  },
};
