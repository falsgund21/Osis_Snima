<template>
  <div class="min-vh-100 d-flex flex-column bg-light">
    <!-- Top Header -->
    <header class="bg-white border-bottom shadow-xs py-3 px-4">
      <div class="container d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <img
            v-if="settings.school_logo"
            :src="settings.school_logo"
            :alt="settings.school_name"
            class="rounded-circle border"
            style="width: 42px; height: 42px; object-fit: cover;"
          />
          <div v-else class="bg-primary text-white rounded-circle p-2 d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;">
            <i class="bi bi-mortarboard fs-5"></i>
          </div>
          <div>
            <h6 class="fw-bold text-dark mb-0">{{ settings.school_name }}</h6>
            <div class="text-secondary small">Pemilihan OSIS Periode {{ settings.election_period }}</div>
          </div>
        </div>

        <button
          type="button"
          class="btn btn-outline-danger btn-sm d-flex align-items-center gap-2"
          @click="handleLogout"
        >
          <i class="bi bi-box-arrow-right"></i>
          <span class="d-none d-sm-inline">Keluar</span>
        </button>
      </div>
    </header>

    <!-- Main Container -->
    <main class="container py-4 py-md-5 flex-grow-1">
      <div class="row justify-content-center">
        <div class="col-12 col-md-10 col-lg-8">
          <!-- Welcome Alert Banner -->
          <div class="card card-clean p-4 mb-4 border-0 shadow-sm">
            <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
              <div>
                <span class="text-secondary small text-uppercase fw-bold tracking-wide">Selamat Datang Pemilih</span>
                <h4 class="fw-bold text-dark mb-1">{{ student?.name }}</h4>
                <p class="text-muted small mb-0">Gunakan hak suara Anda secara bijak, mandiri, dan bertanggung jawab.</p>
              </div>

              <!-- Status Badge -->
              <div class="text-sm-end">
                <span
                  class="badge px-3 py-2 fs-6 rounded-pill d-inline-flex align-items-center gap-2"
                  :class="student?.has_voted ? 'bg-success text-white' : 'bg-warning-subtle text-warning-emphasis border border-warning'"
                >
                  <i :class="student?.has_voted ? 'bi bi-check-circle-fill' : 'bi bi-clock-history'"></i>
                  {{ student?.has_voted ? 'Sudah Memilih' : 'Belum Memilih' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Student Biodata Card -->
          <div class="card card-clean p-4 mb-4 border-0 shadow-sm">
            <h6 class="fw-bold text-dark border-bottom pb-3 mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-person-lines-fill text-primary"></i>
              Biodata Pemilih
            </h6>

            <div class="row g-3">
              <div class="col-12 col-sm-6">
                <div class="text-secondary small">Nama Lengkap</div>
                <div class="fw-semibold text-dark fs-6">{{ student?.name }}</div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-secondary small">Nomor Pemilih</div>
                <div class="fw-semibold text-dark fs-6 font-monospace">{{ student?.nisn }}</div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-secondary small">Kelas / Kelompok</div>
                <div class="fw-semibold text-dark fs-6">
                  <span class="badge bg-light text-dark border px-2 py-1">{{ student?.class_name || 'Terdaftar' }}</span>
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div class="text-secondary small">Tanggal Lahir</div>
                <div class="fw-semibold text-dark fs-6">{{ formatDate(student?.birth_date) }}</div>
              </div>
            </div>
          </div>

          <!-- Hak Suara & Action Area -->
          <!-- Kasus 1: BELUM MEMILIH -->
          <div v-if="!student?.has_voted" class="card card-clean p-4 border-primary border-opacity-25 bg-white shadow-sm text-center">
            <div class="my-3">
              <div class="rounded-circle bg-primary-subtle text-primary d-inline-flex p-3 mb-3">
                <i class="bi bi-envelope-paper-heart fs-1"></i>
              </div>
              <h5 class="fw-bold text-dark">Hak Suara Anda Tersedia!</h5>
              <p class="text-secondary col-md-8 mx-auto small">
                Silakan masuk ke bilik suara untuk mempelajari visi, misi, dan program kerja masing-masing pasangan calon sebelum menentukan pilihan terbaik Anda.
              </p>

              <div class="alert alert-info d-inline-block small text-start py-2 px-3 mb-4">
                <i class="bi bi-shield-lock-fill me-1"></i>
                <strong>Penting:</strong> Setiap pemilih hanya berhak memberikan 1 (satu) kali suara. Pilihan yang sudah disimpan tidak dapat dibatalkan.
              </div>

              <div>
                <router-link
                  to="/siswa/voting"
                  class="btn btn-primary btn-lg px-5 py-3 fw-bold shadow d-inline-flex align-items-center gap-2"
                >
                  <i class="bi bi-box-seam-fill fs-5"></i>
                  <span>Berikan Suara</span>
                </router-link>
              </div>
            </div>
          </div>

          <!-- Kasus 2: SUDAH MEMILIH -->
          <div v-else class="card card-clean p-4 border-success border-opacity-25 bg-white shadow-sm text-center">
            <div class="my-3">
              <div class="rounded-circle bg-success-subtle text-success d-inline-flex p-3 mb-3">
                <i class="bi bi-check-circle-fill fs-1"></i>
              </div>
              <h5 class="fw-bold text-success">Anda sudah menggunakan hak suara</h5>
              <p class="text-secondary col-md-8 mx-auto small mb-2">
                Terima kasih telah berpartisipasi aktif dalam menyukseskan Pemilihan Ketua dan Wakil Ketua OSIS Periode {{ settings.election_period }}.
              </p>
              <div v-if="student?.voted_at" class="text-muted small">
                <i class="bi bi-clock me-1"></i> Waktu pencatatan partisipasi: {{ formatDateTime(student.voted_at) }}
              </div>

              <div class="mt-4 pt-3 border-top d-flex justify-content-center gap-2">
                <button class="btn btn-outline-secondary btn-sm" @click="handleLogout">
                  <i class="bi bi-box-arrow-right me-1"></i> Keluar dari Sesi
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="py-3 text-center text-secondary small bg-white border-top mt-auto">
      <div class="container">
        <span>eOSIS · Asas Pemilihan Langsung, Umum, Bebas, Rahasia, Jujur dan Adil</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { useEosis } from '../../composables/useEosis';

const router = useRouter();
const { currentStudent: student, logoutStudent, refreshStudent } = useAuth();
const { settings, fetchSettings } = useEosis();

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr?: string | null) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function handleLogout() {
  logoutStudent();
  router.push('/login');
}

onMounted(async () => {
  const current = await refreshStudent();
  if (!current) {
    router.push('/login');
    return;
  }

  try {
    await fetchSettings();
  } catch (err) {
    console.warn('Settings load error', err);
  }
});
</script>
