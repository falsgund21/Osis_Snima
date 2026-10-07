import { createRouter, createWebHistory } from 'vue-router';
import { authService } from '../services/auth';

// Views Siswa
import SiswaLoginView from '../views/siswa/SiswaLoginView.vue';
import SiswaDashboardView from '../views/siswa/SiswaDashboardView.vue';
import SiswaVotingView from '../views/siswa/SiswaVotingView.vue';

// Views Admin
import AdminLoginView from '../views/admin/AdminLoginView.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import AdminDashboardView from '../views/admin/AdminDashboardView.vue';
import AdminKelasView from '../views/admin/AdminKelasView.vue';
import AdminSiswaView from '../views/admin/AdminSiswaView.vue';
import AdminKandidatView from '../views/admin/AdminKandidatView.vue';
import AdminHasilView from '../views/admin/AdminHasilView.vue';
import AdminPengaturanView from '../views/admin/AdminPengaturanView.vue';

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: '/login',
    name: 'SiswaLogin',
    component: SiswaLoginView,
    meta: { title: 'Login Pemilih' },
  },
  {
    path: '/siswa/dashboard',
    name: 'SiswaDashboard',
    component: SiswaDashboardView,
    meta: { requiresStudent: true, title: 'Dashboard Pemilih' },
  },
  {
    path: '/siswa/voting',
    name: 'SiswaVoting',
    component: SiswaVotingView,
    meta: { requiresStudent: true, mustNotHaveVoted: true, title: 'Bilik Suara Pemilihan OSIS' },
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLoginView,
    meta: { title: 'Login Administrator eOSIS' },
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: '/admin/dashboard',
      },
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboardView,
        meta: { title: 'Beranda Admin - eOSIS' },
      },
      {
        path: 'kelas',
        name: 'AdminKelas',
        component: AdminKelasView,
        meta: { title: 'Kelola Kelas - eOSIS' },
      },
      {
        path: 'siswa',
        name: 'AdminSiswa',
        component: AdminSiswaView,
        meta: { title: 'Kelola User - eOSIS' },
      },
      {
        path: 'kandidat',
        name: 'AdminKandidat',
        component: AdminKandidatView,
        meta: { title: 'Calon Kandidat - eOSIS' },
      },
      {
        path: 'hasil',
        name: 'AdminHasil',
        component: AdminHasilView,
        meta: { title: 'Perolehan Suara - eOSIS' },
      },
      {
        path: 'pengaturan',
        name: 'AdminPengaturan',
        component: AdminPengaturanView,
        meta: { title: 'Pengaturan Sistem - eOSIS' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to, _from, next) => {
  // Update document title
  if (to.meta.title) {
    document.title = `${to.meta.title} - eOSIS`;
  }

  // Admin Guard
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    if (!authService.isAdminLoggedIn()) {
      return next({ name: 'AdminLogin', query: { redirect: to.fullPath } });
    }
  }

  // Siswa Guard
  if (to.matched.some(record => record.meta.requiresStudent)) {
    const student = await authService.refreshStudentSession();
    if (!student) {
      return next({ name: 'SiswaLogin' });
    }

    if (to.matched.some(record => record.meta.mustNotHaveVoted)) {
      if (student.has_voted) {
        return next({ name: 'SiswaDashboard' });
      }
    }
  }

  next();
});

export default router;
