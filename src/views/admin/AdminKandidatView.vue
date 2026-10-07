<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Calon Pasangan Kandidat OSIS</h4>
        <p class="text-secondary small mb-0">
          Kelola nomor urut, foto resmi, nama ketua & wakil, visi, misi, serta slogan kampanye.
        </p>
      </div>

      <button class="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-xs" @click="openCreateModal">
        <i class="bi bi-person-plus-fill"></i>
        <span>Tambah Paslon Baru</span>
      </button>
    </div>

    <!-- Alert Feedback -->
    <div v-if="alertMessage" class="alert py-2 px-3 small d-flex align-items-center justify-content-between mb-3" :class="alertType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ alertMessage }}</span>
      <button type="button" class="btn-close btn-sm" @click="alertMessage = ''"></button>
    </div>

    <!-- Grid List Pasangan Calon -->
    <div v-if="isLoading" class="text-center py-5 text-muted">
      <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
      Memuat daftar pasangan calon...
    </div>

    <div v-else-if="candidates.length === 0" class="card card-clean p-5 text-center text-muted border-0 shadow-sm">
      <i class="bi bi-person-vcard text-secondary fs-1 d-block mb-2"></i>
      <h6 class="fw-bold text-dark">Belum Ada Pasangan Calon Terdaftar</h6>
      <p class="small text-secondary mb-3">Klik tombol di bawah untuk mendaftarkan kandidat nomor urut pertama.</p>
      <button class="btn btn-primary btn-sm mx-auto" @click="openCreateModal">
        <i class="bi bi-plus-lg me-1"></i> Tambah Kandidat Sekarang
      </button>
    </div>

    <div v-else class="row g-4">
      <div
        v-for="candidate in candidates"
        :key="candidate.id"
        class="col-12 col-md-6 col-lg-4"
      >
        <div class="card card-clean h-100 border-0 shadow-sm overflow-hidden d-flex flex-column">
          <!-- Card Header & Badge -->
          <div class="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <div class="candidate-number-badge fs-5" style="width: 40px; height: 40px;">
                {{ candidate.candidate_number }}
              </div>
              <div>
                <small class="text-secondary text-uppercase fw-semibold" style="font-size: 0.7rem;">Nomor Urut</small>
                <div class="fw-bold text-dark">Paslon 0{{ candidate.candidate_number }}</div>
              </div>
            </div>

            <!-- Action Dropdown / Buttons -->
            <div class="btn-group btn-group-sm">
              <button
                class="btn btn-outline-secondary"
                title="Edit Paslon"
                @click="openEditModal(candidate)"
              >
                <i class="bi bi-pencil"></i>
              </button>
              <button
                class="btn btn-outline-danger"
                title="Hapus Paslon"
                @click="openDeleteModal(candidate)"
              >
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <!-- Photo Container -->
          <div class="position-relative bg-dark" style="height: 220px; overflow: hidden;">
            <img
              v-if="candidate.photo_url"
              :src="candidate.photo_url"
              :alt="candidate.leader_name"
              class="w-100 h-100 object-fit-cover"
              @error="candidate.photo_url = ''"
            />
            <div
              v-else
              class="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white-50 bg-secondary"
            >
              <i class="bi bi-person-bounding-box display-4 mb-2"></i>
              <small>Foto Belum Diunggah</small>
            </div>

            <div
              v-if="candidate.slogan"
              class="position-absolute bottom-0 start-0 w-100 p-2 text-white text-center small fw-semibold"
              style="background: linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.4), transparent);"
            >
              "{{ candidate.slogan }}"
            </div>
          </div>

          <!-- Body Content -->
          <div class="p-3 p-xl-4 flex-grow-1 d-flex flex-column justify-content-between">
            <div>
              <div class="mb-3">
                <div class="text-secondary small" style="font-size: 0.75rem;">KETUA OSIS</div>
                <h5 class="fw-bold text-dark mb-0">{{ candidate.leader_name }}</h5>
              </div>

              <div class="mb-3">
                <div class="text-secondary small" style="font-size: 0.75rem;">WAKIL KETUA OSIS</div>
                <h6 class="fw-semibold text-dark mb-0">{{ candidate.vice_leader_name }}</h6>
              </div>

              <div class="mb-3">
                <strong class="text-dark small d-block mb-1">Visi:</strong>
                <p class="text-secondary small bg-light p-2 rounded-2 border mb-0 text-truncate-2" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  {{ candidate.vision }}
                </p>
              </div>

              <div>
                <strong class="text-dark small d-block mb-1">Misi ({{ candidate.mission.length }} Butir):</strong>
                <ul class="text-secondary small ps-3 mb-0" style="max-height: 80px; overflow-y: auto;">
                  <li v-for="(m, mIdx) in candidate.mission" :key="mIdx" class="mb-1">
                    {{ m }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="mt-3 pt-3 border-top text-end">
              <button class="btn btn-sm btn-outline-primary w-100" @click="openEditModal(candidate)">
                <i class="bi bi-pencil me-1"></i> Edit Lengkap Kandidat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Tambah / Edit Paslon -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(2px);"
    >
      <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" style="max-height: 94vh;">
        <div class="modal-content border-0 shadow-lg rounded-3 overflow-hidden d-flex flex-column" style="max-height: 92vh;">
          <!-- Modal Header (Sticky di atas) -->
          <div class="modal-header bg-light border-bottom px-4 py-3 d-flex align-items-center justify-content-between flex-shrink-0">
            <div class="d-flex align-items-center gap-2">
              <div class="candidate-number-badge fs-6" style="width: 36px; height: 36px;">
                {{ formData.candidate_number || '?' }}
              </div>
              <div>
                <h6 class="modal-title fw-bold text-dark mb-0">
                  {{ isEditing ? 'Edit Data Pasangan Calon' : 'Tambah Pasangan Calon Baru' }}
                </h6>
                <small class="text-secondary" style="font-size: 0.75rem;">
                  {{ isEditing ? 'Perbarui informasi dan visi-misi paslon' : 'Daftarkan paslon baru ke sistem pemilu OSIS' }}
                </small>
              </div>
            </div>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Tutup"></button>
          </div>

          <!-- Form Wrapping Body and Sticky Footer -->
          <form @submit.prevent="saveCandidate" class="d-flex flex-column flex-grow-1 overflow-hidden m-0">
            <!-- Modal Body (Scrollable dengan batasan tinggi layar) -->
            <div class="modal-body p-3 p-md-4 overflow-y-auto" style="max-height: calc(90vh - 145px);">
              <div class="row g-4">
                <!-- KOLOM KIRI: IDENTITAS, FOTO & SLOGAN -->
                <div class="col-12 col-lg-6 border-end-lg pe-lg-4">
                  <h6 class="fw-bold text-primary mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <i class="bi bi-person-badge"></i>
                    Identitas & Foto Pasangan Calon
                  </h6>

                  <!-- Nomor Urut & Slogan -->
                  <div class="row g-2 mb-3">
                    <div class="col-4">
                      <label for="candNumber" class="form-label small fw-semibold text-secondary mb-1">
                        No. Urut <span class="text-danger">*</span>
                      </label>
                      <input
                        id="candNumber"
                        v-model.number="formData.candidate_number"
                        type="number"
                        min="1"
                        class="form-control form-control-sm fw-bold text-center"
                        placeholder="1, 2, 3..."
                        required
                      />
                    </div>
                    <div class="col-8">
                      <label for="candSlogan" class="form-label small fw-semibold text-secondary mb-1">
                        Slogan / Tagline Paslon
                      </label>
                      <input
                        id="candSlogan"
                        v-model="formData.slogan"
                        type="text"
                        class="form-control form-control-sm"
                        placeholder="Contoh: Maju, Berprestasi, dan Peduli"
                      />
                    </div>
                  </div>

                  <!-- Upload Foto Paslon (Responsive Box) -->
                  <div class="mb-3 p-3 bg-light rounded-3 border">
                    <label class="form-label small fw-semibold text-dark mb-2 d-block">
                      Foto Pasangan Calon (Format Gambar / URL)
                    </label>

                    <div class="d-flex align-items-center gap-3">
                      <!-- Photo Preview Box -->
                      <div class="position-relative flex-shrink-0">
                        <img
                          v-if="formData.photo_url"
                          :src="formData.photo_url"
                          alt="Preview Foto"
                          class="rounded-3 border shadow-xs object-fit-cover bg-white"
                          style="width: 88px; height: 88px;"
                          @error="formData.photo_url = ''"
                        />
                        <div
                          v-else
                          class="rounded-3 border border-2 border-dashed bg-white text-muted d-flex flex-column align-items-center justify-content-center text-center p-2"
                          style="width: 88px; height: 88px; font-size: 0.7rem;"
                        >
                          <i class="bi bi-camera text-secondary fs-4"></i>
                          <span>Belum ada foto</span>
                        </div>

                        <!-- Spinner saat upload -->
                        <div
                          v-if="isUploadingPhoto"
                          class="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 rounded-3 d-flex align-items-center justify-content-center text-white"
                        >
                          <span class="spinner-border spinner-border-sm" role="status"></span>
                        </div>
                      </div>

                      <!-- Upload Controls -->
                      <div class="flex-grow-1">
                        <div class="d-flex flex-wrap gap-2 mb-2">
                          <label class="btn btn-sm btn-primary d-inline-flex align-items-center gap-1 shadow-xs cursor-pointer mb-0">
                            <i class="bi bi-upload"></i>
                            <span>{{ isUploadingPhoto ? 'Memproses...' : 'Pilih File Foto' }}</span>
                            <input
                              ref="photoFileInputRef"
                              type="file"
                              accept="image/*"
                              class="d-none"
                              :disabled="isUploadingPhoto"
                              @change="handlePhotoUpload"
                            />
                          </label>

                          <button
                            v-if="formData.photo_url"
                            type="button"
                            class="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                            @click="removePhoto"
                          >
                            <i class="bi bi-x-circle"></i>
                            <span>Hapus</span>
                          </button>
                        </div>
                        <div class="text-muted small" style="font-size: 0.72rem;">
                          Foto otomatis dioptimasi & dikompresi agar ringan dan tidak memberatkan sistem.
                        </div>
                      </div>
                    </div>

                    <!-- Input URL Alternatif -->
                    <div class="mt-2 pt-2 border-top">
                      <div class="input-group input-group-sm">
                        <span class="input-group-text bg-white small" style="font-size: 0.72rem;">URL Gambar:</span>
                        <input
                          v-model="formData.photo_url"
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Atau tempel URL gambar web langsung (https://...)"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Nama Calon Ketua & Wakil -->
                  <div class="mb-3">
                    <label for="candLeader" class="form-label small fw-semibold text-secondary mb-1">
                      Nama Calon Ketua OSIS <span class="text-danger">*</span>
                    </label>
                    <input
                      id="candLeader"
                      v-model="formData.leader_name"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Nama lengkap calon ketua"
                      required
                    />
                  </div>

                  <div class="mb-2">
                    <label for="candVice" class="form-label small fw-semibold text-secondary mb-1">
                      Nama Calon Wakil Ketua OSIS <span class="text-danger">*</span>
                    </label>
                    <input
                      id="candVice"
                      v-model="formData.vice_leader_name"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Nama lengkap calon wakil ketua"
                      required
                    />
                  </div>
                </div>

                <!-- KOLOM KANAN: VISI & MISI -->
                <div class="col-12 col-lg-6 ps-lg-4">
                  <h6 class="fw-bold text-primary mb-3 d-flex align-items-center gap-2 border-bottom pb-2">
                    <i class="bi bi-card-checklist"></i>
                    Visi & Misi Pasangan Calon
                  </h6>

                  <!-- Visi -->
                  <div class="mb-3">
                    <label for="candVision" class="form-label small fw-semibold text-secondary mb-1">
                      Visi Paslon <span class="text-danger">*</span>
                    </label>
                    <textarea
                      id="candVision"
                      v-model="formData.vision"
                      class="form-control form-control-sm"
                      rows="3"
                      placeholder="Tuliskan visi jangka panjang paslon..."
                      required
                    ></textarea>
                  </div>

                  <!-- Misi Dinamis -->
                  <div class="mb-2">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <label class="form-label small fw-semibold text-secondary mb-0">
                        Poin-Poin Misi & Program Kerja <span class="text-danger">*</span>
                      </label>
                      <button
                        type="button"
                        class="btn btn-outline-primary btn-sm py-0 px-2"
                        style="font-size: 0.75rem;"
                        @click="addMissionRow"
                      >
                        <i class="bi bi-plus"></i> Tambah Misi
                      </button>
                    </div>

                    <div class="pe-1" style="max-height: 230px; overflow-y: auto;">
                      <div
                        v-for="(mission, mIdx) in formData.mission"
                        :key="mIdx"
                        class="input-group input-group-sm mb-2"
                      >
                        <span class="input-group-text bg-light font-monospace">{{ mIdx + 1 }}</span>
                        <input
                          v-model="formData.mission[mIdx]"
                          type="text"
                          class="form-control"
                          placeholder="Isi poin misi paslon..."
                          required
                        />
                        <button
                          v-if="formData.mission.length > 1"
                          type="button"
                          class="btn btn-outline-danger"
                          title="Hapus baris misi"
                          @click="removeMissionRow(mIdx)"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div class="form-text small text-muted" style="font-size: 0.72rem;">
                      Klik <strong>Tambah Misi</strong> untuk menambahkan butir program kerja paslon.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal Footer (Selalu Terlihat / Sticky di Bawah) -->
            <div class="modal-footer bg-white border-top px-4 py-3 d-flex flex-column flex-sm-row justify-content-between align-items-center gap-2 flex-shrink-0 shadow-xs">
              <div class="small text-secondary">
                <span class="text-danger">*</span> Pastikan seluruh kolom bertanda bintang terisi
              </div>

              <div class="d-flex align-items-center gap-2">
                <button type="button" class="btn btn-secondary btn-sm px-3" @click="closeModal">
                  Batal
                </button>
                <button
                  type="submit"
                  class="btn btn-primary btn-sm px-4 fw-semibold shadow-xs d-flex align-items-center gap-2"
                  :disabled="isSaving || isUploadingPhoto"
                >
                  <span v-if="isSaving || isUploadingPhoto" class="spinner-border spinner-border-sm" role="status"></span>
                  <i v-else class="bi bi-check2-circle"></i>
                  <span>{{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Simpan Pasangan Calon') }}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus Paslon -->
    <div
      v-if="candidateToDelete"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(15, 23, 42, 0.6);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow text-center p-3">
          <div class="modal-body p-4">
            <div class="rounded-circle bg-danger-subtle text-danger d-inline-flex p-3 mb-3">
              <i class="bi bi-trash-fill fs-2"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Hapus Pasangan Calon?</h5>
            <p class="text-secondary small mb-4">
              Apakah Anda yakin ingin menghapus <strong>Paslon 0{{ candidateToDelete.candidate_number }}: {{ candidateToDelete.leader_name }} & {{ candidateToDelete.vice_leader_name }}</strong>? Data suara yang terkait dengan kandidat ini juga akan terhapus.
            </p>
            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-secondary btn-sm px-4" @click="candidateToDelete = null">Batal</button>
              <button type="button" class="btn btn-danger btn-sm px-4 fw-semibold" @click="confirmDelete">
                Ya, Hapus Paslon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useEosis } from '../../composables/useEosis';
import type { Candidate } from '../../types';

const {
  candidates,
  isLoading,
  fetchCandidates,
  addCandidate,
  updateCandidate,
  deleteCandidate,
  uploadFile,
} = useEosis();

const isSaving = ref(false);
const isUploadingPhoto = ref(false);
const photoFileInputRef = ref<HTMLInputElement | null>(null);
const alertMessage = ref('');
const alertType = ref<'success' | 'danger'>('success');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const candidateToDelete = ref<Candidate | null>(null);

const formData = ref({
  candidate_number: 1,
  leader_name: '',
  vice_leader_name: '',
  photo_url: '',
  slogan: '',
  vision: '',
  mission: [''],
});

async function loadData() {
  try {
    await fetchCandidates();
  } catch (err: any) {
    showAlert(err.message || 'Gagal memuat kandidat.', 'danger');
  }
}

function openCreateModal() {
  isEditing.value = false;
  editingId.value = '';
  const nextNum = candidates.value.length > 0
    ? Math.max(...candidates.value.map(c => c.candidate_number)) + 1
    : 1;

  formData.value = {
    candidate_number: nextNum,
    leader_name: '',
    vice_leader_name: '',
    photo_url: '',
    slogan: '',
    vision: '',
    mission: ['Mengoptimalkan program kerja OSIS yang transparan, aktif, dan adaptif.'],
  };
  showModal.value = true;
}

function openEditModal(c: Candidate) {
  isEditing.value = true;
  editingId.value = c.id;
  formData.value = {
    candidate_number: c.candidate_number,
    leader_name: c.leader_name,
    vice_leader_name: c.vice_leader_name,
    photo_url: c.photo_url || '',
    slogan: c.slogan || '',
    vision: c.vision,
    mission: [...c.mission],
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = '';
  isUploadingPhoto.value = false;
}

function addMissionRow() {
  formData.value.mission.push('');
}

function removeMissionRow(index: number) {
  formData.value.mission.splice(index, 1);
}

function removePhoto() {
  formData.value.photo_url = '';
  if (photoFileInputRef.value) {
    photoFileInputRef.value.value = '';
  }
}

async function handlePhotoUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];

  isUploadingPhoto.value = true;
  try {
    showAlert('Sedang memproses & mengompres foto paslon...', 'success');
    const url = await uploadFile(file, 'candidates');
    if (url) {
      formData.value.photo_url = url;
      showAlert('Foto kandidat berhasil diunggah dan dioptimasi!', 'success');
    }
  } catch (err: any) {
    console.error('Upload foto paslon error:', err);
    showAlert('Gagal memproses foto paslon: ' + (err.message || 'Format tidak didukung'), 'danger');
  } finally {
    isUploadingPhoto.value = false;
    if (target) target.value = '';
  }
}

async function saveCandidate() {
  const f = formData.value;
  if (!f.leader_name.trim() || !f.vice_leader_name.trim() || !f.vision.trim()) {
    showAlert('Harap lengkapi nama ketua, nama wakil, dan visi paslon.', 'danger');
    return;
  }

  const cleanMissions = f.mission.map(m => m.trim()).filter(m => m.length > 0);
  if (cleanMissions.length === 0) {
    showAlert('Mohon isi minimal 1 butir poin misi pasangan calon.', 'danger');
    return;
  }

  isSaving.value = true;
  try {
    const payload = {
      candidate_number: Number(f.candidate_number),
      leader_name: f.leader_name.trim(),
      vice_leader_name: f.vice_leader_name.trim(),
      photo_url: f.photo_url ? f.photo_url.trim() : '',
      slogan: f.slogan ? f.slogan.trim() : '',
      vision: f.vision.trim(),
      mission: cleanMissions,
    };

    if (isEditing.value) {
      await updateCandidate(editingId.value, payload);
      showAlert(`Data Paslon 0${payload.candidate_number} berhasil diperbarui.`, 'success');
    } else {
      await addCandidate(payload);
      showAlert(`Paslon 0${payload.candidate_number} berhasil ditambahkan.`, 'success');
    }
    closeModal();
    await loadData();
  } catch (err: any) {
    showAlert(err.message || 'Gagal menyimpan calon kandidat.', 'danger');
  } finally {
    isSaving.value = false;
  }
}

function openDeleteModal(c: Candidate) {
  candidateToDelete.value = c;
}

async function confirmDelete() {
  if (!candidateToDelete.value) return;
  const num = candidateToDelete.value.candidate_number;

  try {
    await deleteCandidate(candidateToDelete.value.id);
    showAlert(`Paslon 0${num} berhasil dihapus.`, 'success');
    candidateToDelete.value = null;
    await loadData();
  } catch (err: any) {
    showAlert(err.message || 'Gagal menghapus kandidat.', 'danger');
  }
}

function showAlert(msg: string, type: 'success' | 'danger') {
  alertMessage.value = msg;
  alertType.value = type;
  setTimeout(() => {
    if (alertMessage.value === msg) {
      alertMessage.value = '';
    }
  }, 4000);
}

onMounted(() => {
  loadData();
});
</script>
