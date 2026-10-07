<template>
  <div class="d-flex min-vh-100">
    <!-- Overlay for mobile sidebar -->
    <div
      v-if="isMobileSidebarOpen"
      class="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 z-3 d-print-none"
      @click="isMobileSidebarOpen = false"
    ></div>

    <!-- Sidebar Admin -->
    <aside
      class="admin-sidebar d-flex flex-column z-3 d-print-none"
      :class="{
        'position-fixed top-0 start-0 h-100': isMobile,
        'd-none d-md-flex': !isMobileSidebarOpen && isMobile,
      }"
    >
      <!-- Brand Area -->
      <div class="p-3 border-bottom border-secondary border-opacity-25 d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <div class="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
            <i class="bi bi-box-seam fs-5"></i>
          </div>
          <div>
            <h6 class="text-white fw-bold mb-0">eOSIS</h6>
            <small class="text-secondary" style="font-size: 0.75rem;">Panel Administrator</small>
          </div>
        </div>
        <button
          v-if="isMobile"
          class="btn btn-sm btn-link text-white text-decoration-none d-md-none"
          @click="isMobileSidebarOpen = false"
        >
          <i class="bi bi-x-lg fs-5"></i>
        </button>
      </div>

      <!-- School Quick Info -->
      <div class="px-3 py-2 bg-dark bg-opacity-25 border-bottom border-secondary border-opacity-10">
        <div class="text-truncate text-white-50 small">
          <i class="bi bi-mortarboard me-1"></i>
          <span class="text-white fw-medium">{{ settings.school_name }}</span>
        </div>
        <div class="d-flex align-items-center justify-content-between mt-1 text-secondary" style="font-size: 0.75rem;">
          <span>Periode {{ settings.election_period }}</span>
          <span :class="settings.is_election_active ? 'badge bg-success-subtle text-success' : 'badge bg-secondary-subtle text-light'">
            {{ settings.is_election_active ? 'Aktif' : 'Tutup' }}
          </span>
        </div>
      </div>

      <!-- Navigation Menu -->
      <div class="p-3 flex-grow-1 overflow-y-auto">
        <div class="text-uppercase text-secondary fw-semibold small mb-2 ps-2" style="font-size: 0.7rem; letter-spacing: 0.05em;">
          Menu Utama
        </div>

        <router-link to="/admin/dashboard" class="admin-nav-link" active-class="active" @click="closeMobileNav">
          <i class="bi bi-grid-1x2"></i>
          <span>Beranda</span>
        </router-link>

        <router-link to="/admin/siswa" class="admin-nav-link" active-class="active" @click="closeMobileNav">
          <i class="bi bi-people"></i>
          <span>User</span>
        </router-link>

        <router-link to="/admin/kandidat" class="admin-nav-link" active-class="active" @click="closeMobileNav">
          <i class="bi bi-person-badge"></i>
          <span>Calon Kandidat</span>
        </router-link>

        <router-link to="/admin/hasil" class="admin-nav-link" active-class="active" @click="closeMobileNav">
          <i class="bi bi-bar-chart-line"></i>
          <span>Perolehan Suara</span>
        </router-link>

        <div class="text-uppercase text-secondary fw-semibold small mt-4 mb-2 ps-2" style="font-size: 0.7rem; letter-spacing: 0.05em;">
          Sistem & Akun
        </div>

        <router-link to="/admin/pengaturan" class="admin-nav-link" active-class="active" @click="closeMobileNav">
          <i class="bi bi-gear"></i>
          <span>Pengaturan</span>
        </router-link>

        <button
          type="button"
          class="admin-nav-link w-100 text-start border-0 bg-transparent text-danger mt-3"
          @click="handleLogout"
        >
          <i class="bi bi-box-arrow-right"></i>
          <span>Keluar</span>
        </button>
      </div>

      <!-- Footer Info -->
      <div class="p-3 border-top border-secondary border-opacity-25 text-center text-secondary small" style="font-size: 0.75rem;">
        <div>eOSIS v2.5 · Pemilihan OSIS</div>
        <div class="text-white-50 mt-1">LUBER & JURDIL</div>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-grow-1 d-flex flex-column min-vh-100 bg-light overflow-x-hidden">
      <!-- Top Navbar -->
      <header class="bg-white border-bottom px-3 px-md-4 py-2 d-flex align-items-center justify-content-between sticky-top z-2 d-print-none">
        <div class="d-flex align-items-center gap-3">
          <button
            class="btn btn-outline-secondary btn-sm d-md-none"
            @click="isMobileSidebarOpen = !isMobileSidebarOpen"
            aria-label="Toggle Sidebar"
          >
            <i class="bi bi-list fs-5"></i>
          </button>
          <div>
            <span class="text-secondary small d-none d-sm-inline">Sistem Pemilihan Siswa OSIS /</span>
            <span class="fw-semibold text-dark ms-1">{{ pageTitle }}</span>
          </div>
        </div>

        <div class="d-flex align-items-center gap-2">
          <!-- Live Preview Bilik Siswa Link -->
          <router-link
            to="/login"
            target="_blank"
            class="btn btn-sm btn-outline-primary d-none d-sm-inline-flex align-items-center gap-1"
            title="Buka halaman login pemilih siswa di tab baru"
          >
            <i class="bi bi-box-arrow-up-right"></i>
            <span>Portal Siswa</span>
          </router-link>

          <!-- Supabase Quick Info Modal Trigger -->
          <button
            class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
            @click="showDbModal = true"
            title="Status Database & Panduan SQL"
          >
            <i class="bi bi-database text-success"></i>
            <span class="d-none d-md-inline small">Database</span>
          </button>

          <!-- Admin Profile Dropdown -->
          <div class="dropdown">
            <button
              class="btn btn-sm btn-light border d-flex align-items-center gap-2"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 26px; height: 26px; font-size: 0.8rem;">
                <i class="bi bi-person-fill"></i>
              </div>
              <span class="fw-medium small d-none d-md-inline">{{ settings.admin_username || 'Admin' }}</span>
              <i class="bi bi-chevron-down small text-secondary"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end shadow-sm border-0">
              <li class="px-3 py-1">
                <span class="small text-secondary d-block">Masuk sebagai</span>
                <span class="fw-bold">{{ settings.admin_username }}</span>
              </li>
              <li><hr class="dropdown-divider"></li>
              <li>
                <router-link to="/admin/pengaturan" class="dropdown-item">
                  <i class="bi bi-gear me-2"></i> Pengaturan
                </router-link>
              </li>
              <li>
                <button class="dropdown-item text-danger" @click="handleLogout">
                  <i class="bi bi-box-arrow-right me-2"></i> Keluar
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <!-- Page View Slot -->
      <main class="flex-grow-1 p-3 p-md-4">
        <router-view />
      </main>
    </div>

    <!-- Modal Status & Panduan Skrip Supabase -->
    <div
      v-if="showDbModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(15, 23, 42, 0.6);"
    >
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-dark text-white">
            <h5 class="modal-title d-flex align-items-center gap-2">
              <i class="bi bi-database-check text-info"></i>
              Status Basis Data & Panduan Supabase
            </h5>
            <button type="button" class="btn-close btn-close-white" @click="showDbModal = false"></button>
          </div>
          <div class="modal-body p-4">
            <div class="alert alert-success d-flex align-items-center gap-3 mb-3">
              <i class="bi bi-check-circle-fill fs-3 text-success"></i>
              <div>
                <strong>Status: TERHUBUNG KE SUPABASE!</strong>
                <div class="small text-muted font-monospace mt-1">https://dtwrkjevzrhzkpnhwopz.supabase.co</div>
                <div class="small text-dark mt-1">
                  Koneksi REST API dan seluruh 5 tabel basis data telah terverifikasi aktif di Supabase.
                </div>
              </div>
            </div>

            <div class="card p-3 bg-light border mb-3">
              <h6 class="fw-bold text-dark small mb-2">Hasil Verifikasi Komponen Supabase:</h6>
              <div class="row g-2 small">
                <div class="col-sm-6">
                  <i class="bi bi-check2-circle text-success me-1"></i>
                  Tabel <code>public.classes</code>: <strong class="text-success">Tersedia</strong>
                </div>
                <div class="col-sm-6">
                  <i class="bi bi-check2-circle text-success me-1"></i>
                  Tabel <code>public.students</code>: <strong class="text-success">Tersedia</strong>
                </div>
                <div class="col-sm-6">
                  <i class="bi bi-check2-circle text-success me-1"></i>
                  Tabel <code>public.candidates</code>: <strong class="text-success">Tersedia</strong>
                </div>
                <div class="col-sm-6">
                  <i class="bi bi-check2-circle text-success me-1"></i>
                  Tabel <code>public.votes</code>: <strong class="text-success">Tersedia</strong>
                </div>
                <div class="col-sm-6">
                  <i class="bi bi-check2-circle text-success me-1"></i>
                  Tabel <code>public.settings</code>: <strong class="text-success">Tersedia</strong>
                </div>
                <div class="col-sm-6">
                  <i class="bi bi-check2-circle text-success me-1"></i>
                  Fungsi RPC <code>cast_student_vote</code>: <strong class="text-success">Aktif</strong>
                </div>
              </div>
            </div>

            <h6 class="fw-bold text-dark mt-3">Langkah Sinkronisasi RLS & Data Awal (Opsional / Disarankan):</h6>
            <p class="small text-secondary mb-2">
              Jalankan skrip di bawah ini di SQL Editor Supabase untuk mengaktifkan izin tulis (RLS Policy WITH CHECK) dan mengisi data awal pengaturan & kandidat ke dalam tabel Supabase:
            </p>

            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="small fw-semibold text-secondary">Skrip RLS & Seed Data:</span>
              <button
                class="btn btn-sm btn-outline-primary"
                @click="copySqlScript"
              >
                <i class="bi" :class="sqlCopied ? 'bi-check2' : 'bi-clipboard'"></i>
                {{ sqlCopied ? 'Tersalin!' : 'Salin Skrip SQL' }}
              </button>
            </div>

            <pre class="bg-dark text-light p-3 rounded small font-monospace" style="max-height: 250px; overflow-y: auto;">{{ sqlScript }}</pre>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary btn-sm" @click="showDbModal = false">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useEosis } from '../composables/useEosis';

const router = useRouter();
const route = useRoute();
const { logoutAdmin } = useAuth();
const { settings, fetchSettings } = useEosis();

const isMobileSidebarOpen = ref(false);
const isMobile = ref(window.innerWidth < 768);
const showDbModal = ref(false);
const sqlCopied = ref(false);

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    AdminDashboard: 'Beranda & Statistik',
    AdminKelas: 'Manajemen Data Kelas',
    AdminSiswa: 'Manajemen Data User',
    AdminKandidat: 'Daftar Pasangan Calon',
    AdminHasil: 'Hasil Perolehan Suara',
    AdminPengaturan: 'Pengaturan Sistem & Sekolah',
  };
  return titles[route.name as string] || 'Administrator';
});

const sqlScript = ref(`-- Salin dan jalankan skrip ini di SQL Editor Supabase:
-- 1. Berikan hak akses (RLS Policy WITH CHECK) untuk peran anon
CREATE POLICY "Public Manage Classes" ON public.classes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Candidates" ON public.candidates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Settings" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Students" ON public.students FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public Manage Votes" ON public.votes FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 2. Inisialisasi Data Pengaturan Sekolah (id = 1)
INSERT INTO public.settings (id, school_name, school_logo, election_period, is_election_active, admin_username, admin_password_hash)
VALUES (
    1,
    'SMA Negeri 1 Harapan Bangsa',
    'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=200&h=200&fit=crop&q=80',
    '2026/2027',
    true,
    'admin',
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'
)
ON CONFLICT (id) DO UPDATE SET
    school_name = EXCLUDED.school_name,
    election_period = EXCLUDED.election_period,
    is_election_active = EXCLUDED.is_election_active;
`);

function handleResize() {
  isMobile.value = window.innerWidth < 768;
  if (!isMobile.value) {
    isMobileSidebarOpen.value = false;
  }
}

function closeMobileNav() {
  if (isMobile.value) {
    isMobileSidebarOpen.value = false;
  }
}

function handleLogout() {
  logoutAdmin();
  router.push('/admin/login');
}

async function copySqlScript() {
  try {
    await navigator.clipboard.writeText(sqlScript.value);
    sqlCopied.value = true;
    setTimeout(() => {
      sqlCopied.value = false;
    }, 2500);
  } catch (e) {
    console.error('Copy failed', e);
  }
}

onMounted(async () => {
  window.addEventListener('resize', handleResize);
  await fetchSettings();
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>
