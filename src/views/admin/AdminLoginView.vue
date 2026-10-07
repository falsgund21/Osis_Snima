<template>
  <div class="min-vh-100 d-flex flex-column justify-content-between bg-light">
    <!-- Header -->
    <header class="py-3 px-4 bg-white border-bottom shadow-xs">
      <div class="container d-flex align-items-center justify-content-between">
        <router-link to="/login" class="text-decoration-none d-flex align-items-center gap-2 text-dark">
          <div class="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
            <i class="bi bi-box-seam fs-6"></i>
          </div>
          <div>
            <span class="fw-bold fs-5">eOSIS</span>
            <span class="text-secondary small ms-2 d-none d-sm-inline">Pemilihan Ketua & Wakil Ketua OSIS</span>
          </div>
        </router-link>

        <router-link to="/login" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1">
          <i class="bi bi-arrow-left"></i>
          <span>Portal Siswa</span>
        </router-link>
      </div>
    </header>

    <!-- Main Form Area -->
    <div class="container py-4 flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="row w-100 justify-content-center">
        <div class="col-12 col-md-8 col-lg-5 col-xl-4">
          <div class="card card-clean p-4 border-0 shadow-sm">
            <div class="text-center mb-4">
              <div class="rounded-circle bg-dark text-white p-3 d-inline-flex mb-3 shadow-xs">
                <i class="bi bi-shield-lock-fill fs-2"></i>
              </div>
              <h5 class="fw-bold text-dark mb-1">Login Administrator</h5>
              <div class="text-secondary small">{{ settings.school_name }}</div>
            </div>

            <!-- Error Message -->
            <div v-if="errorMessage" class="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-exclamation-circle-fill text-danger fs-5"></i>
              <div>{{ errorMessage }}</div>
            </div>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="adminUser" class="form-label small fw-semibold text-secondary">
                  Username Admin
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-secondary border-end-0">
                    <i class="bi bi-person"></i>
                  </span>
                  <input
                    id="adminUser"
                    v-model="username"
                    type="text"
                    class="form-control border-start-0 ps-1"
                    placeholder="Masukkan username"
                    required
                    autocomplete="username"
                  />
                </div>
              </div>

              <div class="mb-4">
                <label for="adminPass" class="form-label small fw-semibold text-secondary">
                  Password
                </label>
                <div class="input-group">
                  <span class="input-group-text bg-light text-secondary border-end-0">
                    <i class="bi bi-lock"></i>
                  </span>
                  <input
                    id="adminPass"
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    class="form-control border-start-0 border-end-0 ps-1"
                    placeholder="Masukkan password"
                    required
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    class="btn btn-outline-secondary border-start-0"
                    @click="showPassword = !showPassword"
                    aria-label="Toggle password visibility"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 shadow-xs"
                :disabled="isAuthLoading"
              >
                <span v-if="isAuthLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-box-arrow-in-right fs-5"></i>
                <span>{{ isAuthLoading ? 'Memverifikasi...' : 'Masuk ke Dashboard' }}</span>
              </button>
            </form>

            <!-- Default Credentials Tip -->
            <div class="mt-4 pt-3 border-top text-center">
              <div class="p-2 bg-light rounded-3 text-secondary small border">
                <span class="d-block text-muted" style="font-size: 0.75rem;">Akun Bawaan Administrator:</span>
                <div class="mt-1">
                  <code>admin</code> / <code>admin123</code>
                  <button
                    type="button"
                    class="btn btn-sm btn-link p-0 ms-2 text-decoration-none"
                    @click="fillDefault"
                  >
                    (Gunakan)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="py-3 text-center text-secondary small bg-white border-top">
      <div class="container">
        <span>eOSIS · Panel Pengelolaan Pemilihan OSIS</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { useEosis } from '../../composables/useEosis';

const router = useRouter();
const route = useRoute();
const { loginAdmin, isAuthLoading, isAdminAuthenticated } = useAuth();
const { settings, fetchSettings } = useEosis();

const username = ref('');
const password = ref('');
const showPassword = ref(false);
const errorMessage = ref('');

function fillDefault() {
  username.value = 'admin';
  password.value = 'admin123';
  errorMessage.value = '';
}

async function handleLogin() {
  errorMessage.value = '';
  if (!username.value.trim() || !password.value) {
    errorMessage.value = 'Username dan password wajib diisi.';
    return;
  }

  const result = await loginAdmin(username.value, password.value);
  if (result.success) {
    const redirect = (route.query.redirect as string) || '/admin/dashboard';
    router.push(redirect);
  } else {
    errorMessage.value = result.message || 'Username atau password yang Anda masukkan salah.';
  }
}

onMounted(async () => {
  if (isAdminAuthenticated.value) {
    router.push('/admin/dashboard');
    return;
  }
  try {
    await fetchSettings();
  } catch (err) {
    console.warn('Load settings err', err);
  }
});
</script>
