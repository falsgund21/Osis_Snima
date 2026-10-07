<template>
  <div class="min-vh-100 d-flex flex-column bg-light">
    <!-- Header Bilik Suara -->
    <header class="bg-white border-bottom shadow-xs py-3 px-4 sticky-top z-2">
      <div class="container d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center gap-3">
          <div class="bg-primary text-white rounded-3 p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
            <i class="bi bi-box-seam-fill fs-5"></i>
          </div>
          <div>
            <h6 class="fw-bold text-dark mb-0">Bilik Suara Elektronik (e-Voting)</h6>
            <div class="text-secondary small">{{ settings.school_name }} · Periode {{ settings.election_period }}</div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3">
          <div class="text-end d-none d-sm-block">
            <span class="text-secondary small d-block">Pemilih:</span>
            <span class="fw-semibold text-dark">{{ currentStudent?.name }}</span>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            @click="handleCancelVoting"
            :disabled="isSubmitting || showSuccessScreen"
          >
            <i class="bi bi-arrow-left me-1"></i>
            <span>Kembali</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Voting Area -->
    <main class="container py-4 flex-grow-1">
      <!-- Title & Guidance Banner -->
      <div class="text-center mb-4">
        <span class="badge bg-primary-subtle text-primary px-3 py-1 mb-2 fw-semibold">
          SURAT SUARA ELEKTRONIK OSIS
        </span>
        <h3 class="fw-bold text-dark">Pilihlah Satu Pasangan Calon</h3>
        <p class="text-secondary small col-md-8 mx-auto">
          Tentukan pilihan Anda dengan teliti. Setiap pemilih hanya berhak memberikan 1 (satu) suara. Pilihan Anda dijamin kerahasiaannya.
        </p>
      </div>

      <!-- Candidate Cards Grid -->
      <div class="row g-4 justify-content-center">
        <div
          v-for="candidate in candidates"
          :key="candidate.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <div class="candidate-card h-100 d-flex flex-column shadow-sm position-relative">
            <!-- Nomor Urut Badge Header -->
            <div class="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
              <div class="d-flex align-items-center gap-2">
                <div class="candidate-number-badge shadow-xs">
                  {{ candidate.candidate_number }}
                </div>
                <div>
                  <small class="text-secondary text-uppercase fw-semibold" style="font-size: 0.7rem;">Nomor Urut</small>
                  <div class="fw-bold text-dark">Paslon 0{{ candidate.candidate_number }}</div>
                </div>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1"
                style="font-size: 0.8rem;"
                @click="openVisiMisi(candidate)"
              >
                <i class="bi bi-info-circle me-1"></i>
                Visi & Misi
              </button>
            </div>

            <!-- Candidate Photo -->
            <div class="position-relative bg-dark" style="height: 240px; overflow: hidden;">
              <img
                v-if="candidate.photo_url"
                :src="candidate.photo_url"
                :alt="candidate.leader_name"
                class="w-100 h-100 object-fit-cover"
                @error="onPhotoError($event, candidate)"
              />
              <div
                v-else
                class="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white-50 bg-secondary"
              >
                <i class="bi bi-people-fill display-4 mb-2"></i>
                <small>Foto Pasangan Calon</small>
              </div>

              <!-- Slogan Strip Overlay -->
              <div
                v-if="candidate.slogan"
                class="position-absolute bottom-0 start-0 w-100 p-2 text-white text-center small fw-semibold"
                style="background: linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.4), transparent);"
              >
                "{{ candidate.slogan }}"
              </div>
            </div>

            <!-- Candidate Details -->
            <div class="p-3 p-xl-4 flex-grow-1 d-flex flex-column justify-content-between">
              <div>
                <div class="mb-3">
                  <div class="text-secondary small" style="font-size: 0.75rem;">CALON KETUA OSIS</div>
                  <h5 class="fw-bold text-dark mb-0">{{ candidate.leader_name }}</h5>
                </div>

                <div class="mb-3">
                  <div class="text-secondary small" style="font-size: 0.75rem;">CALON WAKIL KETUA OSIS</div>
                  <h6 class="fw-semibold text-dark mb-0">{{ candidate.vice_leader_name }}</h6>
                </div>

                <div class="p-2 bg-light rounded-3 small text-secondary border">
                  <strong class="text-dark d-block mb-1">Visi Utama:</strong>
                  <div class="text-truncate-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    {{ candidate.vision }}
                  </div>
                </div>
              </div>

              <!-- Action Button -->
              <div class="mt-4 pt-2">
                <button
                  type="button"
                  class="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-xs"
                  @click="openConfirmVote(candidate)"
                  :disabled="isSubmitting || showSuccessScreen"
                >
                  <i class="bi bi-check2-circle fs-5"></i>
                  <span>Pilih Paslon 0{{ candidate.candidate_number }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Detail Visi & Misi -->
    <div
      v-if="selectedCandidateForModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(15, 23, 42, 0.6);"
    >
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <div class="d-flex align-items-center gap-2">
              <div class="candidate-number-badge fs-6" style="width: 32px; height: 32px;">
                {{ selectedCandidateForModal.candidate_number }}
              </div>
              <h5 class="modal-title fw-bold text-dark mb-0">
                Visi & Misi Paslon 0{{ selectedCandidateForModal.candidate_number }}
              </h5>
            </div>
            <button type="button" class="btn-close" @click="selectedCandidateForModal = null"></button>
          </div>
          <div class="modal-body p-4">
            <div class="row align-items-center mb-4">
              <div class="col-sm-4 text-center mb-3 mb-sm-0">
                <img
                  v-if="selectedCandidateForModal.photo_url"
                  :src="selectedCandidateForModal.photo_url"
                  :alt="selectedCandidateForModal.leader_name"
                  class="img-fluid rounded-3 shadow-xs"
                  style="max-height: 180px; object-fit: cover;"
                />
              </div>
              <div class="col-sm-8">
                <h5 class="fw-bold text-dark mb-1">{{ selectedCandidateForModal.leader_name }}</h5>
                <div class="text-secondary small mb-2">& {{ selectedCandidateForModal.vice_leader_name }}</div>
                <div class="alert alert-secondary py-2 px-3 small fst-italic mb-0">
                  "{{ selectedCandidateForModal.slogan || 'Maju Bersama OSIS' }}"
                </div>
              </div>
            </div>

            <div class="mb-4">
              <h6 class="fw-bold text-primary d-flex align-items-center gap-2">
                <i class="bi bi-eye"></i> VISI
              </h6>
              <p class="text-secondary p-3 bg-light rounded-3 border mb-0">
                {{ selectedCandidateForModal.vision }}
              </p>
            </div>

            <div>
              <h6 class="fw-bold text-primary d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-list-check"></i> MISI & PROGRAM UNGGULAN
              </h6>
              <ol class="list-group list-group-numbered border-0">
                <li
                  v-for="(item, idx) in selectedCandidateForModal.mission"
                  :key="idx"
                  class="list-group-item border-0 px-2 py-1 text-secondary"
                >
                  {{ item }}
                </li>
              </ol>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary btn-sm" @click="selectedCandidateForModal = null">
              Tutup
            </button>
            <button
              type="button"
              class="btn btn-primary btn-sm fw-semibold"
              @click="confirmFromModal(selectedCandidateForModal)"
            >
              <i class="bi bi-check2-circle me-1"></i> Pilih Paslon Ini
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Pilihan Suara -->
    <div
      v-if="candidateToVote"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(15, 23, 42, 0.7);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg text-center p-3">
          <div class="modal-body p-4">
            <div class="rounded-circle bg-primary-subtle text-primary d-inline-flex p-3 mb-3">
              <i class="bi bi-question-diamond-fill fs-1"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">Konfirmasi Pilihan Suara</h4>
            <p class="text-secondary small mb-4">
              Apakah Anda yakin ingin memberikan suara kepada pasangan calon ini?
            </p>

            <div class="card p-3 bg-light border mb-4 text-start">
              <div class="d-flex align-items-center gap-3">
                <div class="candidate-number-badge fs-5" style="width: 44px; height: 44px;">
                  {{ candidateToVote.candidate_number }}
                </div>
                <div>
                  <small class="text-secondary text-uppercase fw-semibold" style="font-size: 0.7rem;">Paslon No. 0{{ candidateToVote.candidate_number }}</small>
                  <h6 class="fw-bold text-dark mb-0">{{ candidateToVote.leader_name }}</h6>
                  <div class="text-secondary small">& {{ candidateToVote.vice_leader_name }}</div>
                </div>
              </div>
            </div>

            <div class="alert alert-warning py-2 px-3 small text-start d-flex align-items-center gap-2 mb-4">
              <i class="bi bi-exclamation-triangle-fill fs-5 text-warning flex-shrink-0"></i>
              <div>
                <strong>Perhatian:</strong> Pilihan bersifat <strong>FINAL</strong> dan tidak dapat diubah setelah disimpan ke dalam sistem.
              </div>
            </div>

            <div v-if="voteError" class="alert alert-danger py-2 px-3 small mb-3">
              {{ voteError }}
            </div>

            <div class="d-flex gap-2 justify-content-center">
              <button
                type="button"
                class="btn btn-outline-secondary px-4 py-2"
                @click="candidateToVote = null"
                :disabled="isSubmitting"
              >
                Batal / Periksa Kembali
              </button>
              <button
                type="button"
                class="btn btn-primary px-4 py-2 fw-bold d-flex align-items-center gap-2 shadow-xs"
                @click="executeVote"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <i v-else class="bi bi-check-circle-fill"></i>
                <span>{{ isSubmitting ? 'Menyimpan...' : 'Ya, Masukkan Suara' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Fullscreen Success Screen (Persis 4 Detik Sesuai Ketentuan User Prompt) -->
    <div
      v-if="showSuccessScreen"
      class="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center z-3"
      style="background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(8px);"
    >
      <div class="card card-clean p-4 p-md-5 text-center shadow-lg border-0 bg-white" style="max-width: 520px; width: 90%;">
        <div class="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center p-3 mx-auto mb-3 shadow" style="width: 76px; height: 76px;">
          <i class="bi bi-check-lg fs-1"></i>
        </div>

        <h4 class="fw-bold text-success mb-2">Suara Berhasil Dicatat</h4>
        <p class="text-dark fw-semibold fs-5 mb-3">
          "Suara Anda berhasil dicatat, terima kasih telah berpartisipasi"
        </p>
        <p class="text-secondary small mb-4">
          Session pemilih Anda akan otomatis dibersihkan untuk menjaga kerahasiaan suara dan keamanan sistem.
        </p>

        <!-- Countdown Timer -->
        <div class="mb-3">
          <div class="small text-secondary mb-1">
            Mengalihkan ke halaman login dalam
            <span class="fw-bold text-primary font-monospace fs-6">{{ countdownSeconds }}</span> detik...
          </div>
          <div class="progress" style="height: 6px;">
            <div
              class="progress-bar bg-success progress-bar-striped progress-bar-animated"
              role="progressbar"
              :style="{ width: progressPercentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { useEosis } from '../../composables/useEosis';
import type { Candidate } from '../../types';

const router = useRouter();
const { currentStudent, logoutStudent, refreshStudent } = useAuth();
const { candidates, settings, fetchCandidates, fetchSettings, castVote } = useEosis();

const selectedCandidateForModal = ref<Candidate | null>(null);
const candidateToVote = ref<Candidate | null>(null);
const isSubmitting = ref(false);
const voteError = ref('');

const showSuccessScreen = ref(false);
const countdownSeconds = ref(4);
const progressPercentage = ref(100);
let countdownTimer: any = null;

function onPhotoError(event: Event, candidate: Candidate) {
  candidate.photo_url = '';
}

function openVisiMisi(candidate: Candidate) {
  selectedCandidateForModal.value = candidate;
}

function confirmFromModal(candidate: Candidate) {
  selectedCandidateForModal.value = null;
  candidateToVote.value = candidate;
}

function openConfirmVote(candidate: Candidate) {
  candidateToVote.value = candidate;
  voteError.value = '';
}

function handleCancelVoting() {
  router.push('/siswa/dashboard');
}

async function executeVote() {
  if (!currentStudent.value || !candidateToVote.value) return;

  isSubmitting.value = true;
  voteError.value = '';

  try {
    const result = await castVote(
      currentStudent.value.id,
      candidateToVote.value.id
    );

    if (result.success) {
      candidateToVote.value = null;
      startSuccessCountdown();
    } else {
      voteError.value = result.message || 'Gagal menyimpan suara.';
    }
  } catch (err: any) {
    voteError.value = err.message || 'Terjadi kesalahan sistem saat menyimpan suara.';
  } finally {
    isSubmitting.value = false;
  }
}

function startSuccessCountdown() {
  showSuccessScreen.value = true;
  countdownSeconds.value = 4;
  progressPercentage.value = 100;

  const totalDuration = 4000;
  const intervalMs = 100;
  const decrement = (intervalMs / totalDuration) * 100;

  countdownTimer = setInterval(() => {
    progressPercentage.value = Math.max(0, progressPercentage.value - decrement);
    countdownSeconds.value = Math.ceil((progressPercentage.value / 100) * 4);

    if (progressPercentage.value <= 0) {
      clearInterval(countdownTimer);
      // Hapus session pemilih dan kembali ke login siswa sesuai ketentuan prompt
      logoutStudent();
      router.push('/login');
    }
  }, intervalMs);
}

onMounted(async () => {
  const student = await refreshStudent();
  if (!student) {
    router.push('/login');
    return;
  }

  // Jika siswa sudah memilih, tolak akses bilik suara
  if (student.has_voted) {
    router.push('/siswa/dashboard');
    return;
  }

  try {
    await Promise.all([
      fetchCandidates(),
      fetchSettings(),
    ]);
  } catch (err) {
    console.warn('Voting view mount error', err);
  }
});

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>
