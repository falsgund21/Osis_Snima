<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Manajemen User</h4>
        <p class="text-secondary small mb-0">
          Kelola data user terdaftar, periksa nomor pemilih, tanggal lahir, dan status hak suara.
        </p>
      </div>

      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-success btn-sm d-flex align-items-center gap-1 shadow-xs" @click="openImportModal">
          <i class="bi bi-file-earmark-excel"></i>
          <span>Import File Excel</span>
        </button>
        <button class="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-xs" @click="openCreateModal">
          <i class="bi bi-person-plus"></i>
          <span>Tambah User</span>
        </button>
      </div>
    </div>

    <!-- Alert Feedback -->
    <div v-if="alertMessage" class="alert py-2 px-3 small d-flex align-items-center justify-content-between mb-3" :class="alertType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ alertMessage }}</span>
      <button type="button" class="btn-close btn-sm" @click="alertMessage = ''"></button>
    </div>

    <!-- Filter & Toolbar Card -->
    <div class="card card-clean p-3 mb-3 border-0 shadow-sm">
      <div class="row g-2 align-items-center">
        <!-- Search Input -->
        <div class="col-12 col-md-4">
          <div class="input-group">
            <span class="input-group-text bg-white border-end-0">
              <i class="bi bi-search text-secondary"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control border-start-0 ps-1 small"
              placeholder="Cari nama atau nomor pemilih..."
            />
          </div>
        </div>

        <!-- Filter Kelas -->
        <div class="col-6 col-md-3">
          <select v-model="selectedClassFilter" class="form-select form-select-sm">
            <option value="">Semua Kelas / Kelompok</option>
            <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <!-- Filter Status Hak Suara -->
        <div class="col-6 col-md-3">
          <select v-model="selectedStatusFilter" class="form-select form-select-sm">
            <option value="">Semua Status Suara</option>
            <option value="voted">Sudah Memilih</option>
            <option value="not_voted">Belum Memilih</option>
          </select>
        </div>

        <!-- Quick Summary Count -->
        <div class="col-12 col-md-2 text-md-end small text-secondary">
          <span>Total: <strong class="text-dark">{{ filteredStudents.length }}</strong> user</span>
        </div>
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="card card-clean border-0 shadow-sm overflow-hidden">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light text-secondary small text-uppercase">
            <tr>
              <th scope="col" style="width: 60px;" class="ps-3">No</th>
              <th scope="col" style="width: 150px;">Nomor Pemilih</th>
              <th scope="col">Nama Lengkap</th>
              <th scope="col" style="width: 140px;">Kelas / Kelompok</th>
              <th scope="col" style="width: 130px;">Tanggal Lahir</th>
              <th scope="col" style="width: 150px;">Status Suara</th>
              <th scope="col" style="width: 130px;" class="text-end pe-3">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="7" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                Memuat data user...
              </td>
            </tr>

            <tr v-else-if="filteredStudents.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                <i class="bi bi-people text-secondary fs-2 d-block mb-2"></i>
                Tidak ada data user yang sesuai dengan filter atau kata kunci.
              </td>
            </tr>

            <tr v-for="(student, idx) in filteredStudents" :key="student.id">
              <td class="ps-3 text-secondary small font-monospace">{{ idx + 1 }}</td>
              <td>
                <span class="font-monospace fw-semibold text-dark">{{ student.nisn }}</span>
              </td>
              <td>
                <span class="fw-medium text-dark">{{ student.name }}</span>
              </td>
              <td>
                <span class="badge bg-light text-dark border px-2 py-1">{{ student.class_name }}</span>
              </td>
              <td>
                <span class="text-secondary small">{{ student.birth_date }}</span>
              </td>
              <td>
                <span
                  class="badge rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1"
                  :class="student.has_voted ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'"
                >
                  <i :class="student.has_voted ? 'bi bi-check-circle-fill' : 'bi bi-clock-history'"></i>
                  {{ student.has_voted ? 'Sudah Memilih' : 'Belum Memilih' }}
                </span>
              </td>
              <td class="text-end pe-3">
                <div class="btn-group btn-group-sm">
                  <button
                    v-if="student.has_voted"
                    class="btn btn-outline-warning"
                    title="Reset Status Suara User"
                    @click="resetVote(student)"
                  >
                    <i class="bi bi-arrow-counterclockwise"></i>
                  </button>
                  <button
                    class="btn btn-outline-secondary"
                    title="Edit Data User"
                    @click="openEditModal(student)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-outline-danger"
                    title="Hapus User"
                    @click="openDeleteModal(student)"
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

    <!-- Modal Form Tambah / Edit User -->
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
              {{ isEditing ? 'Edit Data User' : 'Tambah User Baru' }}
            </h6>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <form @submit.prevent="saveStudent">
            <div class="modal-body p-4">
              <div class="mb-3">
                <label for="formNisn" class="form-label small fw-semibold text-secondary">
                  Nomor Pemilih <span class="text-danger">*</span>
                </label>
                <input
                  id="formNisn"
                  v-model="formData.nisn"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: 0081234567 atau ID Pemilih"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="formName" class="form-label small fw-semibold text-secondary">
                  Nama Lengkap Pemilih <span class="text-danger">*</span>
                </label>
                <input
                  id="formName"
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  placeholder="Nama lengkap pemilih"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="formDob" class="form-label small fw-semibold text-secondary">
                  Tanggal Lahir (Untuk Login Pemilih) <span class="text-danger">*</span>
                </label>
                <input
                  id="formDob"
                  v-model="formData.birth_date"
                  type="date"
                  class="form-control"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="formClass" class="form-label small fw-semibold text-secondary">
                  Kelas / Kelompok <span class="text-danger">*</span>
                </label>
                <select id="formClass" v-model="formData.class_id" class="form-select" required>
                  <option value="" disabled>-- Pilih Kelas / Kelompok --</option>
                  <option v-for="c in classes" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
            </div>
            <div class="modal-footer bg-light">
              <button type="button" class="btn btn-secondary btn-sm" @click="closeModal">Batal</button>
              <button type="submit" class="btn btn-primary btn-sm fw-semibold" :disabled="isSaving">
                {{ isSaving ? 'Menyimpan...' : (isEditing ? 'Simpan Perubahan' : 'Tambah User') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal Konfirmasi Hapus User -->
    <div
      v-if="studentToDelete"
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
            <h5 class="fw-bold text-dark mb-2">Hapus Data User?</h5>
            <p class="text-secondary small mb-4">
              Apakah Anda yakin ingin menghapus data user <strong>{{ studentToDelete.name }}</strong> (Nomor Pemilih: {{ studentToDelete.nisn }})?
            </p>
            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-secondary btn-sm px-4" @click="studentToDelete = null">Batal</button>
              <button type="button" class="btn btn-danger btn-sm px-4 fw-semibold" @click="confirmDelete">
                Ya, Hapus User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Import File Excel -->
    <div
      v-if="showImportModal"
      class="modal fade show d-block"
      tabindex="-1"
      style="background: rgba(15, 23, 42, 0.6);"
    >
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-light">
            <h6 class="modal-title fw-bold text-dark d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-excel-fill text-success fs-5"></i>
              Import Data User dari File Excel
            </h6>
            <button type="button" class="btn-close" @click="closeImportModal"></button>
          </div>
          <div class="modal-body p-4">
            <!-- Langkah 1: Download Format Template -->
            <div class="card p-3 bg-light border-0 mb-4 rounded-3">
              <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
                <div>
                  <span class="badge bg-success-subtle text-success mb-1">Langkah 1</span>
                  <h6 class="fw-bold text-dark mb-1">Unduh Format Template Excel</h6>
                  <div class="small text-secondary">
                    Gunakan file template dengan kolom resmi: <code>Nomor Pemilih</code>, <code>Nama Lengkap</code>, <code>Tanggal Lahir</code>, dan <code>Kelas</code>.
                  </div>
                </div>
                <button
                  type="button"
                  class="btn btn-outline-success btn-sm d-flex align-items-center gap-2 flex-shrink-0"
                  @click="downloadExcelTemplate"
                >
                  <i class="bi bi-download"></i>
                  <span>Unduh Template .xlsx</span>
                </button>
              </div>
            </div>

            <!-- Langkah 2: Upload File -->
            <div class="mb-4">
              <label class="form-label small fw-semibold text-secondary">
                <span class="badge bg-primary-subtle text-primary me-1">Langkah 2</span>
                Pilih Berkas Excel (.xlsx, .xls, .csv)
              </label>
              <input
                ref="fileInputRef"
                type="file"
                accept=".xlsx, .xls, .csv"
                class="form-control"
                @change="handleFileUpload"
              />
              <div class="form-text small text-muted">
                Pilih file excel yang berisi data pemilih/user yang ingin diimpor.
              </div>
            </div>

            <!-- Langkah 3: Pratinjau & Validasi -->
            <div v-if="parsedRows.length > 0">
              <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div>
                  <h6 class="fw-bold text-dark mb-0">Hasil Analisis Berkas ({{ parsedRows.length }} Baris)</h6>
                  <small class="text-secondary">
                    <strong class="text-success">{{ validRowsCount }} Data Siap Diimpor</strong>
                    <span v-if="invalidRowsCount > 0" class="text-danger ms-2">({{ invalidRowsCount }} Tidak Valid / Duplikat)</span>
                  </small>
                </div>
                <div class="form-check form-switch small">
                  <input
                    id="autoCreateClass"
                    v-model="autoCreateMissingClasses"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label text-secondary" for="autoCreateClass">
                    Otomatis buat kelas jika belum terdaftar
                  </label>
                </div>
              </div>

              <!-- Preview Table -->
              <div class="table-responsive border rounded-3 mb-2" style="max-height: 240px; overflow-y: auto;">
                <table class="table table-sm table-hover align-middle mb-0" style="font-size: 0.85rem;">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th style="width: 45px;">No</th>
                      <th style="width: 130px;">Status</th>
                      <th style="width: 130px;">Nomor Pemilih</th>
                      <th>Nama Lengkap</th>
                      <th style="width: 110px;">Tgl Lahir</th>
                      <th style="width: 120px;">Kelas / Kelompok</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, idx) in parsedRows" :key="idx" :class="{ 'table-danger-subtle': !row.isValid }">
                      <td class="font-monospace text-secondary">{{ idx + 1 }}</td>
                      <td>
                        <span v-if="row.isValid" class="badge bg-success-subtle text-success">
                          <i class="bi bi-check2"></i> Valid
                        </span>
                        <span v-else class="badge bg-danger-subtle text-danger" :title="row.errorReason">
                          <i class="bi bi-exclamation-triangle"></i> {{ row.errorReason }}
                        </span>
                      </td>
                      <td class="font-monospace fw-semibold">{{ row.nisn || '-' }}</td>
                      <td>{{ row.name || '-' }}</td>
                      <td class="font-monospace text-secondary">{{ row.birth_date || '-' }}</td>
                      <td>
                        <span class="badge bg-light text-dark border">{{ row.class_name || '-' }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="text-muted small" style="font-size: 0.75rem;">
                * Hanya baris dengan status "Valid" yang akan disimpan ke database.
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary btn-sm" @click="closeImportModal">Batal</button>
            <button
              type="button"
              class="btn btn-success btn-sm fw-semibold d-flex align-items-center gap-1"
              :disabled="validRowsCount === 0 || isImporting"
              @click="executeImport"
            >
              <span v-if="isImporting" class="spinner-border spinner-border-sm" role="status"></span>
              <i v-else class="bi bi-cloud-arrow-up-fill"></i>
              <span>{{ isImporting ? 'Mengimpor Data...' : ('Impor ' + validRowsCount + ' User') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import * as XLSX from 'xlsx';
import { useEosis } from '../../composables/useEosis';
import type { Student } from '../../types';

const {
  students,
  classes,
  isLoading,
  fetchStudents,
  fetchClasses,
  addClass,
  addStudent,
  addStudentsBulk,
  updateStudent,
  deleteStudent,
  resetStudentVote,
} = useEosis();

const searchQuery = ref('');
const selectedClassFilter = ref('');
const selectedStatusFilter = ref('');
const isSaving = ref(false);

const alertMessage = ref('');
const alertType = ref<'success' | 'danger'>('success');

const showModal = ref(false);
const isEditing = ref(false);
const editingId = ref('');
const studentToDelete = ref<Student | null>(null);

// State Import Excel
const showImportModal = ref(false);
const isImporting = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);
const autoCreateMissingClasses = ref(true);

interface ParsedStudentRow {
  nisn: string;
  name: string;
  birth_date: string;
  class_name: string;
  class_id?: string;
  isValid: boolean;
  errorReason?: string;
}

const parsedRows = ref<ParsedStudentRow[]>([]);

const validRowsCount = computed(() => parsedRows.value.filter(r => r.isValid).length);
const invalidRowsCount = computed(() => parsedRows.value.filter(r => !r.isValid).length);

const formData = ref({
  nisn: '',
  name: '',
  birth_date: '',
  class_id: '',
});

const filteredStudents = computed(() => {
  return students.value.filter(s => {
    // Search
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchNisn = s.nisn.includes(q);
      if (!matchName && !matchNisn) return false;
    }
    // Filter Class
    if (selectedClassFilter.value && s.class_id !== selectedClassFilter.value) {
      return false;
    }
    // Filter Status
    if (selectedStatusFilter.value === 'voted' && !s.has_voted) {
      return false;
    }
    if (selectedStatusFilter.value === 'not_voted' && s.has_voted) {
      return false;
    }
    return true;
  });
});

async function loadData() {
  try {
    await Promise.all([
      fetchStudents(),
      fetchClasses(),
    ]);
  } catch (err: any) {
    showAlert(err.message || 'Gagal memuat data siswa.', 'danger');
  }
}

function openCreateModal() {
  isEditing.value = false;
  editingId.value = '';
  formData.value = {
    nisn: '',
    name: '',
    birth_date: '2008-01-01',
    class_id: classes.value[0]?.id || '',
  };
  showModal.value = true;
}

function openEditModal(student: Student) {
  isEditing.value = true;
  editingId.value = student.id;
  formData.value = {
    nisn: student.nisn,
    name: student.name,
    birth_date: student.birth_date,
    class_id: student.class_id,
  };
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editingId.value = '';
}

async function saveStudent() {
  if (!formData.value.nisn || !formData.value.name || !formData.value.birth_date || !formData.value.class_id) {
    showAlert('Semua bidang isian wajib dilengkapi.', 'danger');
    return;
  }

  isSaving.value = true;
  try {
    if (isEditing.value) {
      await updateStudent(editingId.value, {
        nisn: formData.value.nisn.trim(),
        name: formData.value.name.trim(),
        birth_date: formData.value.birth_date,
        class_id: formData.value.class_id,
      });
      showAlert(`Data user ${formData.value.name} berhasil diperbarui.`, 'success');
    } else {
      await addStudent({
        nisn: formData.value.nisn.trim(),
        name: formData.value.name.trim(),
        birth_date: formData.value.birth_date,
        class_id: formData.value.class_id,
      });
      showAlert(`User baru ${formData.value.name} berhasil ditambahkan.`, 'success');
    }
    closeModal();
    await loadData();
  } catch (err: any) {
    showAlert(err.message || 'Gagal menyimpan data user.', 'danger');
  } finally {
    isSaving.value = false;
  }
}

function openDeleteModal(student: Student) {
  studentToDelete.value = student;
}

async function confirmDelete() {
  if (!studentToDelete.value) return;
  const name = studentToDelete.value.name;

  try {
    await deleteStudent(studentToDelete.value.id);
    showAlert(`Data user ${name} berhasil dihapus.`, 'success');
    studentToDelete.value = null;
    await loadData();
  } catch (err: any) {
    showAlert(err.message || 'Gagal menghapus user.', 'danger');
  }
}

async function resetVote(student: Student) {
  if (!confirm(`Reset status hak suara untuk "${student.name}" agar dapat memilih kembali?`)) return;

  try {
    await resetStudentVote(student.id);
    showAlert(`Status hak suara user ${student.name} berhasil direset.`, 'success');
    await loadData();
  } catch (err: any) {
    showAlert(err.message || 'Gagal mereset status suara.', 'danger');
  }
}

// METODE IMPORT EXCEL
function openImportModal() {
  parsedRows.value = [];
  if (fileInputRef.value) fileInputRef.value.value = '';
  showImportModal.value = true;
}

function closeImportModal() {
  showImportModal.value = false;
  parsedRows.value = [];
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function downloadExcelTemplate() {
  const templateData = [
    {
      'Nomor Pemilih': '0081234521',
      'Nama Lengkap': 'Bayu Setiawan',
      'Tanggal Lahir': '2008-03-25',
      'Kelas': 'X MIPA 1'
    },
    {
      'Nomor Pemilih': '0081234522',
      'Nama Lengkap': 'Citra Kirana',
      'Tanggal Lahir': '2008-07-14',
      'Kelas': 'X MIPA 2'
    },
    {
      'Nomor Pemilih': '0071234523',
      'Nama Lengkap': 'Daffa Pratama',
      'Tanggal Lahir': '2007-11-09',
      'Kelas': 'XI IPS 1'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  worksheet['!cols'] = [
    { wch: 18 }, // Nomor Pemilih
    { wch: 28 }, // Nama Lengkap
    { wch: 18 }, // Tanggal Lahir
    { wch: 16 }  // Kelas
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data User');
  XLSX.writeFile(workbook, 'Template_Import_User_eOSIS.xlsx');
}

function parseDateValue(val: any): string {
  if (!val) return '';
  if (typeof val === 'number') {
    // Tangani format serial date Excel
    const date = new Date((val - 25569) * 86400 * 1000);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  const str = String(val).trim();
  // Format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  // Format DD/MM/YYYY
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const parts = str.split('/');
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }
  // Format DD-MM-YYYY
  if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(str)) {
    const parts = str.split('-');
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2];
    return `${y}-${m}-${d}`;
  }

  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return str;
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const buffer = e.target?.result;
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      processParsedJson(rawJson);
    } catch (err: any) {
      showAlert('Gagal membaca file Excel: ' + (err.message || 'Format tidak valid'), 'danger');
    }
  };
  reader.readAsArrayBuffer(file);
}

function processParsedJson(rawJson: any[]) {
  if (rawJson.length === 0) {
    showAlert('File Excel kosong atau tidak memiliki baris data.', 'danger');
    parsedRows.value = [];
    return;
  }

  const existingNisns = new Set(students.value.map(s => s.nisn.trim()));
  const seenFileNisns = new Set<string>();
  const classMap = new Map(classes.value.map(c => [c.name.toLowerCase().trim(), c.id]));

  const rows: ParsedStudentRow[] = [];

  for (const item of rawJson) {
    // Ambil data dengan toleransi penamaan header fleksibel
    const rawNisn = String(item['Nomor Pemilih'] || item['No Pemilih'] || item['No. Pemilih'] || item['ID Pemilih'] || item['NISN'] || item['nisn'] || item['No Induk'] || item['NIS'] || item['Username'] || '').trim();
    const rawName = String(item['Nama Lengkap'] || item['Nama'] || item['nama'] || item['name'] || '').trim();
    const rawDob = parseDateValue(item['Tanggal Lahir'] || item['Tgl Lahir'] || item['birth_date'] || item['Tanggal_Lahir'] || '');
    const rawClass = String(item['Kelas'] || item['Nama Kelas'] || item['Kelas / Kelompok'] || item['Kelompok'] || item['kelas'] || item['class'] || 'Umum').trim();

    let isValid = true;
    let errorReason = '';

    if (!rawNisn) {
      isValid = false;
      errorReason = 'Nomor Pemilih kosong';
    } else if (existingNisns.has(rawNisn)) {
      isValid = false;
      errorReason = 'Nomor Pemilih sudah terdaftar di sistem';
    } else if (seenFileNisns.has(rawNisn)) {
      isValid = false;
      errorReason = 'Nomor Pemilih ganda dalam file';
    } else if (!rawName) {
      isValid = false;
      errorReason = 'Nama user kosong';
    } else if (!rawDob || !/^\d{4}-\d{2}-\d{2}$/.test(rawDob)) {
      isValid = false;
      errorReason = 'Format tanggal lahir tidak valid (gunakan YYYY-MM-DD)';
    }

    if (rawNisn) {
      seenFileNisns.add(rawNisn);
    }

    const matchedClassId = classMap.get(rawClass.toLowerCase());

    rows.push({
      nisn: rawNisn,
      name: rawName,
      birth_date: rawDob,
      class_name: rawClass,
      class_id: matchedClassId,
      isValid,
      errorReason,
    });
  }

  parsedRows.value = rows;
}

async function executeImport() {
  const validItems = parsedRows.value.filter(r => r.isValid);
  if (validItems.length === 0) {
    showAlert('Tidak ada baris data valid yang dapat diimpor.', 'danger');
    return;
  }

  isImporting.value = true;
  try {
    // 1. Cek jika ada nama kelas baru yang perlu didaftarkan otomatis
    const currentClassMap = new Map(classes.value.map(c => [c.name.toLowerCase().trim(), c.id]));

    if (autoCreateMissingClasses.value) {
      const missingClassNames = new Set<string>();
      for (const item of validItems) {
        if (!item.class_id && item.class_name) {
          const lower = item.class_name.toLowerCase().trim();
          if (!currentClassMap.has(lower)) {
            missingClassNames.add(item.class_name.trim());
          }
        }
      }

      for (const newClassName of missingClassNames) {
        try {
          const created = await addClass(newClassName);
          currentClassMap.set(newClassName.toLowerCase().trim(), created.id);
        } catch {
          // Abaikan jika sudah ada
        }
      }
    }

    // Default class ID jika kelas tidak ditemukan
    const fallbackClassId = classes.value[0]?.id || 'c_default';

    // 2. Siapkan payload data siswa/user
    const payload = validItems.map(item => {
      const mappedId = currentClassMap.get(item.class_name.toLowerCase().trim()) || fallbackClassId;
      return {
        nisn: item.nisn,
        name: item.name,
        birth_date: item.birth_date,
        class_id: mappedId,
      };
    });

    // 3. Simpan secara bulk
    const result = await addStudentsBulk(payload);

    showAlert(`Berhasil mengimpor ${result.insertedCount} data user baru!`, 'success');
    closeImportModal();
    await loadData();
  } catch (err: any) {
    showAlert(err.message || 'Gagal memproses impor data user.', 'danger');
  } finally {
    isImporting.value = false;
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
