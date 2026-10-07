<template>
  <div>
    <!-- Top Welcome Header -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Beranda Administrator</h4>
        <p class="text-secondary small mb-0">
          Ringkasan data, pemilih terdaftar, dan progres partisipasi Pemilihan OSIS Periode {{ settings.election_period }}.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1" @click="loadData">
          <i class="bi bi-arrow-clockwise"></i>
          <span>Muat Ulang</span>
        </button>
        <router-link to="/admin/hasil" class="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-xs">
          <i class="bi bi-bar-chart-line"></i>
          <span>Lihat Quick Count</span>
        </router-link>
      </div>
    </div>

    <!-- Alert Status Pemilihan -->
    <div
      class="alert d-flex align-items-center justify-content-between p-3 mb-4 rounded-3 border-0 shadow-xs"
      :class="settings.is_election_active ? 'alert-success bg-success-subtle text-success-emphasis' : 'alert-warning bg-warning-subtle text-warning-emphasis'"
    >
      <div class="d-flex align-items-center gap-2">
        <i :class="settings.is_election_active ? 'bi bi-check-circle-fill fs-5' : 'bi bi-pause-circle-fill fs-5'"></i>
        <div>
          <strong>Status Pemilihan: {{ settings.is_election_active ? 'DIBUKA / AKTIF' : 'DITUTUP / PAUSED' }}</strong>
          <div class="small">
            {{ settings.is_election_active ? 'User / pemilih dapat login dan memberikan suara pada kandidat.' : 'Akses bilik suara dinonaktifkan sementara.' }}
          </div>
        </div>
      </div>
      <button
        class="btn btn-sm"
        :class="settings.is_election_active ? 'btn-outline-danger' : 'btn-success'"
        @click="toggleElectionStatus"
      >
        {{ settings.is_election_active ? 'Tutup Pemilihan' : 'Buka Pemilihan' }}
      </button>
    </div>

    <!-- 6 Primary Statistics Cards Sesuai Permintaan User Prompt -->
    <!-- (total siswa, kelas, kandidat, sudah memilih, belum memilih, persentase partisipasi) -->
    <div class="row g-3 mb-4">
      <!-- 1. Total User / Pemilih -->
      <div class="col-12 col-sm-6 col-xl-4 col-xxl-2">
        <div class="card card-clean p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Total User</span>
            <div class="bg-primary-subtle text-primary rounded-2 p-2">
              <i class="bi bi-people-fill"></i>
            </div>
          </div>
          <h3 class="fw-bold text-dark tabular-nums mb-1">{{ stats.totalStudents }}</h3>
          <span class="text-muted small">Pemilih Terdaftar</span>
        </div>
      </div>

      <!-- 2. Total Kelas -->
      <div class="col-12 col-sm-6 col-xl-4 col-xxl-2">
        <div class="card card-clean p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Total Kelas</span>
            <div class="bg-info-subtle text-info-emphasis rounded-2 p-2">
              <i class="bi bi-building"></i>
            </div>
          </div>
          <h3 class="fw-bold text-dark tabular-nums mb-1">{{ stats.totalClasses }}</h3>
          <span class="text-muted small">Rombongan Belajar</span>
        </div>
      </div>

      <!-- 3. Total Kandidat -->
      <div class="col-12 col-sm-6 col-xl-4 col-xxl-2">
        <div class="card card-clean p-3 h-100">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Total Kandidat</span>
            <div class="bg-purple-subtle text-primary rounded-2 p-2" style="background: #ede9fe; color: #6d28d9;">
              <i class="bi bi-person-badge-fill"></i>
            </div>
          </div>
          <h3 class="fw-bold text-dark tabular-nums mb-1">{{ stats.totalCandidates }}</h3>
          <span class="text-muted small">Pasangan Calon</span>
        </div>
      </div>

      <!-- 4. Sudah Memilih -->
      <div class="col-12 col-sm-6 col-xl-4 col-xxl-2">
        <div class="card card-clean p-3 h-100 border-success-subtle">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Sudah Memilih</span>
            <div class="bg-success-subtle text-success rounded-2 p-2">
              <i class="bi bi-check2-circle"></i>
            </div>
          </div>
          <h3 class="fw-bold text-success tabular-nums mb-1">{{ stats.totalVoted }}</h3>
          <span class="text-muted small">Suara Masuk</span>
        </div>
      </div>

      <!-- 5. Belum Memilih -->
      <div class="col-12 col-sm-6 col-xl-4 col-xxl-2">
        <div class="card card-clean p-3 h-100 border-warning-subtle">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-secondary small fw-semibold">Belum Memilih</span>
            <div class="bg-warning-subtle text-warning-emphasis rounded-2 p-2">
              <i class="bi bi-clock-history"></i>
            </div>
          </div>
          <h3 class="fw-bold text-warning-emphasis tabular-nums mb-1">{{ stats.totalNotVoted }}</h3>
          <span class="text-muted small">Belum Memberi Suara</span>
        </div>
      </div>

      <!-- 6. Persentase Partisipasi -->
      <div class="col-12 col-sm-6 col-xl-4 col-xxl-2">
        <div class="card card-clean p-3 h-100 bg-primary text-white border-0 shadow-xs">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <span class="text-white-50 small fw-semibold">Partisipasi</span>
            <div class="bg-white bg-opacity-20 text-white rounded-2 p-2">
              <i class="bi bi-pie-chart-fill"></i>
            </div>
          </div>
          <h3 class="fw-bold text-white tabular-nums mb-1">{{ stats.participationPercentage }}%</h3>
          <span class="text-white-50 small">Tingkat Kehadiran</span>
        </div>
      </div>
    </div>

    <!-- Partisipasi Progress Bar & Quick Count Preview -->
    <div class="row g-4 mb-4">
      <!-- Partisipasi Card -->
      <div class="col-12 col-lg-5">
        <div class="card card-clean p-4 h-100">
          <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
            <i class="bi bi-speedometer2 text-primary"></i>
            Tingkat Partisipasi Pemilih
          </h6>

          <div class="py-2">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <span class="small text-secondary">Progres Partisipasi</span>
              <span class="fw-bold text-dark font-monospace">{{ stats.participationPercentage }}%</span>
            </div>
            <div class="progress" style="height: 12px; border-radius: 6px;">
              <div
                class="progress-bar bg-primary"
                role="progressbar"
                :style="{ width: stats.participationPercentage + '%' }"
                :aria-valuenow="stats.participationPercentage"
                aria-valuemin="0"
                aria-valuemax="100"
              ></div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-top">
            <div class="row text-center">
              <div class="col-6 border-end">
                <span class="text-secondary small d-block">Suara Masuk</span>
                <span class="fw-bold text-success fs-5 tabular-nums">{{ stats.totalVoted }}</span>
              </div>
              <div class="col-6">
                <span class="text-secondary small d-block">Sisa Pemilih</span>
                <span class="fw-bold text-warning-emphasis fs-5 tabular-nums">{{ stats.totalNotVoted }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 p-3 bg-light rounded-3 text-secondary small border">
            <i class="bi bi-shield-lock-fill text-primary me-1"></i>
            <strong>Prinsip Kerahasiaan (LUBER):</strong> Sistem mencatat status pemilih sudah/belum memilih secara terpisah dari tabel suara. Pilihan kandidat masing-masing pemilih tidak dapat dilacak oleh siapa pun.
          </div>
        </div>
      </div>

      <!-- Ringkasan Perolehan Suara Sementara -->
      <div class="col-12 col-lg-7">
        <div class="card card-clean p-4 h-100">
          <div class="d-flex align-items-center justify-content-between mb-3">
            <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
              <i class="bi bi-trophy text-warning"></i>
              Perolehan Suara Sementara (Quick Count)
            </h6>
            <router-link to="/admin/hasil" class="btn btn-link btn-sm text-decoration-none p-0">
              Lihat Grafik Lengkap &rarr;
            </router-link>
          </div>

          <div v-if="stats.candidateResults.length === 0" class="text-center py-4 text-muted small">
            Belum ada pasangan calon yang didaftarkan.
          </div>

          <div v-else class="d-flex flex-column gap-3">
            <div
              v-for="res in stats.candidateResults"
              :key="res.candidate_id"
              class="p-3 bg-light rounded-3 border"
            >
              <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-dark px-2 py-1">No. 0{{ res.candidate_number }}</span>
                  <span class="fw-semibold text-dark">{{ res.leader_name }} & {{ res.vice_leader_name }}</span>
                </div>
                <div class="text-end">
                  <span class="fw-bold text-dark tabular-nums fs-6">{{ res.votes }} suara</span>
                  <span class="text-secondary small ms-2">({{ res.percentage }}%)</span>
                </div>
              </div>

              <div class="progress" style="height: 8px;">
                <div
                  class="progress-bar bg-primary"
                  role="progressbar"
                  :style="{ width: res.percentage + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Navigation Shortcuts -->
    <div class="row g-3">
      <div class="col-12 col-md-4">
        <div class="card card-clean p-3 d-flex flex-row align-items-center gap-3">
          <div class="bg-primary text-white p-3 rounded-3">
            <i class="bi bi-person-plus fs-4"></i>
          </div>
          <div>
            <h6 class="fw-bold text-dark mb-1">Kelola User</h6>
            <router-link to="/admin/siswa" class="small text-primary text-decoration-none">
              Tambah & impor data user &rarr;
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card card-clean p-3 d-flex flex-row align-items-center gap-3">
          <div class="bg-success text-white p-3 rounded-3">
            <i class="bi bi-person-badge fs-4"></i>
          </div>
          <div>
            <h6 class="fw-bold text-dark mb-1">Calon Kandidat</h6>
            <router-link to="/admin/kandidat" class="small text-success text-decoration-none">
              Kelola nomor urut & visi misi &rarr;
            </router-link>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4">
        <div class="card card-clean p-3 d-flex flex-row align-items-center gap-3">
          <div class="bg-secondary text-white p-3 rounded-3">
            <i class="bi bi-sliders fs-4"></i>
          </div>
          <div>
            <h6 class="fw-bold text-dark mb-1">Pengaturan Sekolah</h6>
            <router-link to="/admin/pengaturan" class="small text-secondary text-decoration-none">
              Ubah logo, periode & sandi &rarr;
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useEosis } from '../../composables/useEosis';

const { settings, stats, fetchSettings, fetchStats, updateSettings } = useEosis();

async function loadData() {
  try {
    await Promise.all([
      fetchSettings(),
      fetchStats(),
    ]);
  } catch (err) {
    console.error('Error loading dashboard data', err);
  }
}

async function toggleElectionStatus() {
  const newStatus = !settings.value.is_election_active;
  try {
    await updateSettings({ is_election_active: newStatus });
  } catch (err) {
    console.error('Failed to toggle status', err);
  }
}

onMounted(() => {
  loadData();
});
</script>
