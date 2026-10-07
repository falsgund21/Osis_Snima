<template>
  <div class="min-vh-100 d-flex flex-column justify-content-between bg-light">
    <!-- Top Minimal Bar -->
    <header class="py-3 px-4 bg-white border-bottom shadow-xs">
      <div class="container d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-2">
          <div class="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
            <i class="bi bi-box-seam fs-6"></i>
          </div>
          <div>
            <span class="fw-bold text-dark fs-5">eOSIS</span>
            <span class="text-secondary small ms-2 d-none d-sm-inline">Pemilihan Ketua & Wakil Ketua OSIS</span>
          </div>
        </div>

        <router-link to="/admin/login" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
          <i class="bi bi-shield-lock"></i>
          <span class="d-none d-sm-inline">Login Admin</span>
        </router-link>
      </div>
    </header>

    <!-- Main Content Container -->
    <div class="container py-4 flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-8 col-lg-5 col-xl-4">
          <!-- Card Login Siswa -->
          <div class="card card-clean p-4 p-sm-4 border-0 shadow-sm">
            <!-- School Identity Header -->
            <div class="text-center mb-4">
              <div class="mb-3 d-inline-block position-relative">
                <img
                  v-if="settings.school_logo"
                  :src="settings.school_logo"
                  :alt="settings.school_name"
                  class="rounded-circle border p-1 shadow-xs bg-white"
                  style="width: 76px; height: 76px; object-fit: cover;"
                  @error="onLogoError"
                />
                <div
                  v-else
                  class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center mx-auto"
                  style="width: 76px; height: 76px;"
                >
                  <i class="bi bi-mortarboard-fill fs-1"></i>
                </div>
              </div>
              <h5 class="fw-bold text-dark mb-1">{{ settings.school_name }}</h5>
              <div class="text-secondary small">
                Pemilihan Ketua & Wakil Ketua OSIS
              </div>
              <span class="badge bg-primary-subtle text-primary fw-semibold mt-1 px-3 py-1">
                Periode {{ settings.election_period }}
              </span>
            </div>

            <!-- Election Status Notice -->
            <div v-if="!settings.is_election_active" class="alert alert-warning py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-exclamation-triangle-fill fs-5"></i>
              <div>Pemilihan saat ini sedang ditutup atau belum dimulai.</div>
            </div>

            <!-- Error Feedback -->
            <div v-if="errorMessage" class="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-x-circle-fill fs-5 text-danger"></i>
              <div>{{ errorMessage }}</div>
            </div>

            <!-- Login Form -->
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="nisn" class="form-label small fw-semibold text-secondary">
                  Nomor Pemilih
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-secondary border-end-0">
                    <i class="bi bi-person-vcard"></i>
                  </span>
                  <input
                    id="nisn"
                    v-model="nisn"
                    type="text"
                    class="form-control border-start-0 ps-1"
                    placeholder="Masukkan Nomor Pemilih Anda"
                    required
                    autocomplete="username"
                  />
                </div>
                <div class="form-text small text-muted">Masukkan Nomor Pemilih terdaftar Anda</div>
              </div>

              <div class="mb-4">
                <label for="birthDate" class="form-label small fw-semibold text-secondary">
                  Tanggal Lahir
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-secondary border-end-0">
                    <i class="bi bi-calendar3"></i>
                  </span>
                  <input
                    id="birthDate"
                    v-model="birthDate"
                    type="date"
                    class="form-control border-start-0 ps-1"
                    required
                  />
                </div>
                <div class="form-text small text-muted">Digunakan sebagai autentikasi tanggal lahir</div>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs"
                :disabled="isAuthLoading"
              >
                <span v-if="isAuthLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-box-arrow-in-right fs-5"></i>
                <span>{{ isAuthLoading ? 'Memverifikasi...' : 'Masuk ke Bilik Suara' }}</span>
              </button>
            </form>

            <!-- Quick Demo Accounts for Easy Testing (Hanya tampil jika diaktifkan di Pengaturan Admin) -->
            <div v-if="settings.show_trial_accounts" class="mt-4 pt-3 border-top text-center">
              <span class="badge bg-warning-subtle text-warning-emphasis mb-2" style="font-size: 0.7rem;">Mode Simulasi / Uji Coba</span>
              <span class="small text-muted d-block mb-2">Akun Uji Coba Cepat (Klik untuk isi):</span>
              <div class="d-flex flex-wrap gap-2 justify-content-center">
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary py-1 px-2"
                  style="font-size: 0.75rem;"
                  @click="fillDemo('0081234503', '2008-01-15')"
                >
                  <i class="bi bi-check-circle text-primary me-1"></i>Budi (Belum Memilih)
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary py-1 px-2"
                  style="font-size: 0.75rem;"
                  @click="fillDemo('0081234504', '2008-11-03')"
                >
                  <i class="bi bi-check-circle text-primary me-1"></i>Dewi (Belum Memilih)
                </button>
                <button
                  type="button"
                  class="btn btn-sm btn-outline-secondary py-1 px-2"
                  style="font-size: 0.75rem;"
                  @click="fillDemo('0081234501', '2008-04-12')"
                >
                  <i class="bi bi-check2-all text-success me-1"></i>Fauzan (Sudah Memilih)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Minimal Footer -->
    <footer class="py-3 text-center text-secondary small bg-white border-top">
      <div class="container">
        <span>&copy; {{ new Date().getFullYear() }} eOSIS · Sistem Pemilihan OSIS Langsung, Umum, Bebas, Rahasia, Jujur & Adil</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { useEosis } from '../../composables/useEosis';

const router = useRouter();
const { loginStudent, isAuthLoading } = useAuth();
const { settings, fetchSettings } = useEosis();

const nisn = ref('');
const birthDate = ref('');
const errorMessage = ref('');

function onLogoError() {
  settings.value.school_logo = '';
}

function fillDemo(d_nisn: string, d_dob: string) {
  nisn.value = d_nisn;
  birthDate.value = d_dob;
  errorMessage.value = '';
}

async function handleLogin() {
  errorMessage.value = '';
  if (!nisn.value.trim() || !birthDate.value) {
    errorMessage.value = 'Mohon masukkan Nomor Pemilih dan tanggal lahir Anda dengan lengkap.';
    return;
  }

  const result = await loginStudent(nisn.value, birthDate.value);
  if (result.success && result.student) {
    router.push('/siswa/dashboard');
  } else {
    errorMessage.value = result.message || 'Data pemilih tidak ditemukan. Periksa Nomor Pemilih dan tanggal lahir Anda.';
  }
}

onMounted(async () => {
  try {
    await fetchSettings();
  } catch (err) {
    console.warn('Failed to load settings', err);
  }
});
</script>
