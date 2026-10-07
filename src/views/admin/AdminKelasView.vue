<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Manajemen Data Kelas</h4>
        <p class="text-secondary small mb-0">
          Kelola daftar rombongan belajar (rombel) untuk pengelompokan pemilih siswa.
        </p>
      </div>

      <button class="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-xs" @click="openCreateModal">
        <i class="bi bi-plus-lg"></i>
        <span>Tambah Kelas Baru</span>
      </button>
    </div>

    <!-- Alert Feedback -->
    <div v-if="alertMessage" class="alert py-2 px-3 small d-flex align-items-center justify-content-between mb-3" :class="alertType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ alertMessage }}</span>
      <button type="button" class="btn-close btn-sm" @click="alertMessage = ''"></button>
    </div>

    <!-- Table Card -->
    <div class="card card-clean border-0 shadow-sm overflow-hidden">
      <!-- Toolbar Filter & Search -->
      <div class="p-3 border-bottom d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2 bg-light">
        <div class="input-group" style="max-width: 320px;">
          <span class="input-group-text bg-white border-end-0">
            <i class="bi bi-search text-secondary"></i>
          </span>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control border-start-0 ps-1 small"
            placeholder="Cari nama kelas..."
          />
        </div>

        <div class="small text-secondary">
          Menampilkan <strong class="text-dark">{{ filteredClasses.length }}</strong> dari {{ classes.length }} kelas
        </div>
      </div>

      <!-- Table Content -->
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-secondary small text-uppercase">
            <tr>
              <th scope="col" style="width: 70px;" class="ps-4">No</th>
              <th scope="col">Nama Kelas</th>
              <th scope="col" style="width: 180px;">Jumlah Siswa Terdaftar</th>
              <th scope="col" style="width: 140px;" class="text-end pe-4">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="4" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                Memuat data kelas...
              </td>
            </tr>

            <tr v-else-if="filteredClasses.length === 0">
              <td colspan="4" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-2 d-block text-secondary mb-2"></i>
                Tidak ada data kelas yang cocok.
              </td>
            </tr>

            <tr v-for="(cls, index) in filteredClasses" :key="cls.id">
              <td class="ps-4 text-secondary small font-monospace">{{ index + 1 }}</td>
              <td>
                <span class="fw-semibold text-dark">{{ cls.name }}</span>
              </td>
              <td>
                <span class="badge bg-light text-dark border px-2 py-1">
                  <i class="bi bi-people me-1 text-primary"></i>
                  {{ getStudentCountForClass(cls.id) }} Siswa
                </span>
              </td>
              <td class="text-end pe-4">
                <div class="btn-group btn-group-sm">
                  <button
                    class="btn btn-outline-secondary"
                    title="Edit Kelas"
                    @click="openEditModal(cls)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger"
                    title="Hapus Kelas"
                    @click="openDeleteModal(cls)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Form Tambah / Edit Kelas -->
    <div
      v-if="showModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(15, 23, 42, 0.6);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h6 class="modal-title fw-bold text-dark">
              {{ isEditing ? 'Edit Data Kelas' : 'Tambah Kelas Baru' }}
            </h6>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveClass">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label for="className" class="form-label small fw-semibold text-secondary">
                  Nama Kelas <span class="text-danger">*</span>
                </label>
                <input
                  id="className"
                  v-model="classNameInput"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: X MIPA 1, XI IPS 2, XII RPL 1"
                  required
                  autofocus
                />
                <div class="form-text small text-muted">Gunakan format nama kelas yang seragam di sekolah Anda.</div>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary btn-sm fw-semibold" :disabled="isSaving">
                {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah Kelas') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus -->
    <div
      v-if="classToDelete"
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
            <h5 class="fw-bold text-dark mb-2">Hapus Data Kelas?</h5>
            <p class="text-secondary small mb-4">
              Apakah Anda yakin ingin menghapus kelas <strong>"{{ classToDelete.name }}"</strong>? Siswa yang terhubung dengan kelas ini akan tetap ada namun status kelasnya tidak ditentukan.
            </p>
            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-secondary btn-sm px-4" @click="classToDelete = null">Batal</button>
              <button type="button" class="btn btn-danger btn-sm px-4 fw-semibold" @click="confirmDelete">
                Ya, Hapus Kelas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useEosis } from '../../composables/useEosis';
import type { ClassItem } from '../../types';

const { classes, students, isLoading, fetchClasses, fetchStudents, addClass, updateClass, deleteClass } = useEosis();

const searchQuery = ref('');
const isSaving = ref(false);

const alertMessage = ref('');
const alertType = ref<'success' | 'danger'>('success');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const classNameInput = ref('');
const classToDelete = ref<ClassItem | null>(null);

const filteredClasses = computed(() => {
  if (!searchQuery.value.trim()) return classes.value;
  const q = searchQuery.value.toLowerCase();
  return classes.value.filter(c => c.name.toLowerCase().includes(q));
});

function getStudentCountForClass(classId: string) {
  return students.value.filter(s => s.class_id === classId).length;
}

async function loadData() {
  try {
    await Promise.all([
      fetchClasses(),
      fetchStudents(),
    ]);
  } catch (err: any) {
    showAlert(err.message || 'Gagal memuat data kelas', 'danger');
  }
}

function openCreateModal() {
  isEditing.value = false;
  editingId.value = '';
  classNameInput.value = '';
  showModal.value = true;
}

function openEditModal(cls: ClassItem) {
  isEditing.value = true;
  editingId.value = cls.id;
  classNameInput.value = cls.name;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  classNameInput.value = '';
  editingId.value = '';
}

async function saveClass() {
  if (!classNameInput.value.trim()) return;
  isSaving.value = true;

  try {
    if (isEditing.value) {
      await updateClass(editingId.value, classNameInput.value);
      showAlert(`Kelas "${classNameInput.value}" berhasil diperbarui.`, 'success');
    } else {
      await addClass(classNameInput.value);
      showAlert(`Kelas "${classNameInput.value}" berhasil ditambahkan.`, 'success');
    }
    closeModal();
    await loadData();
  } catch (err: any) {
    showAlert(err.message || 'Gagal menyimpan kelas.', 'danger');
  } finally {
    isSaving.value = false;
  }
}

function openDeleteModal(cls: ClassItem) {
  classToDelete.value = cls;
}

async function confirmDelete() {
  if (!classToDelete.value) return;
  const name = classToDelete.value.name;

  try {
    await deleteClass(classToDelete.value.id);
    showAlert(`Kelas "${name}" berhasil dihapus.`, 'success');
    classToDelete.value = null;
    await loadData();
  } catch (err: any) {
    showAlert(err.message || 'Gagal menghapus kelas.', 'danger');
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
