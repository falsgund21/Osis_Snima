<template>
  <div>
    <!-- Page Header -->
    <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3 mb-4">
      <div>
        <h4 class="fw-bold text-dark mb-1">Pengaturan Sistem & Sekolah</h4>
        <p class="text-secondary small mb-0">
          Sesuaikan identitas sekolah, periode pemilihan, status voting, dan kredensial administrator.
        </p>
      </div>
    </div>

    <!-- Alert Feedback -->
    <div v-if="alertMessage" class="alert py-2 px-3 small d-flex align-items-center justify-content-between mb-4" :class="alertType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ alertMessage }}</span>
      <button type="button" class="btn-close btn-sm" @click="alertMessage = ''"></button>
    </div>

    <!-- Tabs Nav -->
    <ul class="nav nav-pills mb-4 gap-2 border-bottom pb-3" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link btn-sm fw-semibold"
          :class="{ active: activeTab === 'school' }"
          @click="activeTab = 'school'"
        >
          <i class="bi bi-mortarboard me-1"></i> Identitas Sekolah & Pemilihan
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link btn-sm fw-semibold"
          :class="{ active: activeTab === 'account' }"
          @click="activeTab = 'account'"
        >
          <i class="bi bi-shield-lock me-1"></i> Akun Administrator (Sandi)
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link btn-sm fw-semibold"
          :class="{ active: activeTab === 'supabase' }"
          @click="activeTab = 'supabase'"
        >
          <i class="bi bi-database text-info me-1"></i> Skrip Skema Supabase
        </button>
      </li>
    </ul>

    <!-- Tab 1: Identitas Sekolah & Pemilihan -->
    <div v-if="activeTab === 'school'" class="row g-4">
      <div class="col-12 col-lg-8">
        <div class="card card-clean p-4 border-0 shadow-sm">
          <h6 class="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
            <i class="bi bi-sliders text-primary"></i>
            Konfigurasi Sekolah & Pelaksanaan
          </h6>

          <form @submit.prevent="saveSchoolSettings">
            <div class="mb-4">
              <label for="schoolName" class="form-label small fw-semibold text-secondary">
                Nama Sekolah <span class="text-danger">*</span>
              </label>
              <input
                id="schoolName"
                v-model="schoolForm.school_name"
                type="text"
                class="form-control"
                placeholder="Contoh: SMA Negeri 1 Harapan Bangsa"
                required
              />
              <div class="form-text small text-muted">
                Nama sekolah akan otomatis tampil pada halaman login siswa, dashboard, dan berita acara cetak.
              </div>
            </div>

            <div class="row g-3 mb-4">
              <div class="col-12 col-sm-6">
                <label for="electionPeriod" class="form-label small fw-semibold text-secondary">
                  Periode Pemilihan <span class="text-danger">*</span>
                </label>
                <input
                  id="electionPeriod"
                  v-model="schoolForm.election_period"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: 2026/2027"
                  required
                />
              </div>

              <div class="col-12 col-sm-6">
                <label class="form-label small fw-semibold text-secondary">
                  Status Pemilihan (Voting)
                </label>
                <div class="form-check form-switch mt-2">
                  <input
                    id="electionActive"
                    v-model="schoolForm.is_election_active"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                  />
                  <label class="form-check-label small fw-semibold" for="electionActive">
                    {{ schoolForm.is_election_active ? 'Pemilihan DIBUKA (Aktif)' : 'Pemilihan DITUTUP' }}
                  </label>
                </div>
              </div>
            </div>

            <!-- Pengaturan Akun Uji Coba Portal Siswa -->
            <div class="mb-4 p-3 bg-light rounded-3 border">
              <div class="d-flex align-items-center justify-content-between">
                <div>
                  <label class="form-label small fw-bold text-dark d-flex align-items-center gap-2 mb-1" for="trialAccountsToggle">
                    <i class="bi bi-person-badge text-primary fs-6"></i>
                    Menu Akun Uji Coba (Portal Siswa)
                  </label>
                  <p class="small text-secondary mb-0">
                    Tampilkan tombol akun uji coba cepat (Budi, Dewi, Fauzan) di bawah form login portal siswa.
                  </p>
                </div>
                <div class="form-check form-switch ms-3">
                  <input
                    id="trialAccountsToggle"
                    v-model="schoolForm.show_trial_accounts"
                    class="form-check-input"
                    type="checkbox"
                    role="switch"
                  />
                </div>
              </div>
              <div class="mt-2 pt-2 border-top d-flex align-items-center justify-content-between small">
                <span :class="schoolForm.show_trial_accounts ? 'text-success fw-semibold' : 'text-danger fw-semibold'">
                  <i class="bi" :class="schoolForm.show_trial_accounts ? 'bi-check-circle-fill' : 'bi-x-circle-fill'"></i>
                  {{ schoolForm.show_trial_accounts ? 'Akun Uji Coba Aktif (Tampil di Halaman Siswa)' : 'Akun Uji Coba Dinonaktifkan (Disembunyikan)' }}
                </span>
                <span class="text-muted" style="font-size: 0.75rem;">
                  * Nonaktifkan saat pemungutan suara resmi berlangsung
                </span>
              </div>
            </div>

            <!-- Logo Sekolah (Supabase Storage / URL) -->
            <div class="mb-4">
              <label class="form-label small fw-semibold text-secondary">
                Logo Sekolah (Supabase Storage / URL)
              </label>
              <div class="row g-3 align-items-center">
                <div class="col-sm-8">
                  <input
                    type="file"
                    accept="image/*"
                    class="form-control form-control-sm mb-2"
                    @change="handleLogoUpload"
                  />
                  <input
                    v-model="schoolForm.school_logo"
                    type="text"
                    class="form-control form-control-sm"
                    placeholder="Atau tempel URL gambar logo langsung..."
                  />
                  <div class="form-text small text-muted">File akan otomatis tersimpan ke storage dan ditampilkan di header.</div>
                </div>

                <div class="col-sm-4 text-center">
                  <img
                    v-if="schoolForm.school_logo"
                    :src="schoolForm.school_logo"
                    alt="Logo Sekolah"
                    class="rounded-circle border p-1 shadow-xs bg-white"
                    style="width: 76px; height: 76px; object-fit: cover;"
                    @error="schoolForm.school_logo = ''"
                  />
                  <div
                    v-else
                    class="rounded-circle bg-light border text-muted d-flex align-items-center justify-content-center mx-auto"
                    style="width: 76px; height: 76px; font-size: 0.75rem;"
                  >
                    Logo Kosong
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-3 border-top text-end">
              <button type="submit" class="btn btn-primary btn-sm px-4 fw-semibold" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="bi bi-check2 me-1"></i>
                <span>Simpan Pengaturan Sekolah</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Preview Live Card -->
      <div class="col-12 col-lg-4">
        <div class="card card-clean p-4 border-0 shadow-sm bg-light">
          <h6 class="fw-bold text-dark mb-3">Tampilan Pratinjau</h6>
          <div class="card p-3 bg-white border text-center shadow-xs">
            <img
              v-if="schoolForm.school_logo"
              :src="schoolForm.school_logo"
              alt="Logo"
              class="rounded-circle border mx-auto mb-2"
              style="width: 60px; height: 60px; object-fit: cover;"
            />
            <div v-else class="rounded-circle bg-primary-subtle text-primary p-2 mx-auto mb-2 d-flex align-items-center justify-content-center" style="width: 60px; height: 60px;">
              <i class="bi bi-mortarboard fs-3"></i>
            </div>
            <h6 class="fw-bold text-dark mb-1">{{ schoolForm.school_name || 'Nama Sekolah' }}</h6>
            <div class="small text-secondary mb-2">Pemilihan Ketua OSIS {{ schoolForm.election_period || '2026/2027' }}</div>
            <span class="badge mx-auto" :class="schoolForm.is_election_active ? 'bg-success' : 'bg-secondary'">
              {{ schoolForm.is_election_active ? 'Pemilihan Berlangsung' : 'Pemilihan Ditutup' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Akun Administrator (Ganti Username & Password Hash) -->
    <div v-if="activeTab === 'account'" class="row g-4">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card card-clean p-4 border-0 shadow-sm">
          <h6 class="fw-bold text-dark border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
            <i class="bi bi-key text-primary"></i>
            Ganti Kredensial Administrator
          </h6>

          <div class="alert alert-secondary py-2 px-3 small mb-4">
            <i class="bi bi-info-circle me-1 text-primary"></i>
            Sesuai standar keamanan, password disimpan dalam bentuk <strong>SHA-256 Hash</strong> dan tidak pernah tersimpan dalam bentuk plain text.
          </div>

          <form @submit.prevent="saveAdminCredentials">
            <div class="mb-3">
              <label for="adminUsername" class="form-label small fw-semibold text-secondary">
                Username Admin Baru / Tetap <span class="text-danger">*</span>
              </label>
              <input
                id="adminUsername"
                v-model="accountForm.username"
                type="text"
                class="form-control"
                required
              />
            </div>

            <div class="mb-3">
              <label for="oldPassword" class="form-label small fw-semibold text-secondary">
                Password Saat Ini <span class="text-danger">*</span>
              </label>
              <input
                id="oldPassword"
                v-model="accountForm.oldPassword"
                type="password"
                class="form-control"
                placeholder="Masukkan password saat ini"
                required
              />
            </div>

            <div class="mb-3">
              <label for="newPassword" class="form-label small fw-semibold text-secondary">
                Password Baru <span class="text-danger">*</span>
              </label>
              <input
                id="newPassword"
                v-model="accountForm.newPassword"
                type="password"
                class="form-control"
                placeholder="Minimal 6 karakter"
                required
              />
            </div>

            <div class="mb-4">
              <label for="confirmPassword" class="form-label small fw-semibold text-secondary">
                Konfirmasi Password Baru <span class="text-danger">*</span>
              </label>
              <input
                id="confirmPassword"
                v-model="accountForm.confirmPassword"
                type="password"
                class="form-control"
                placeholder="Ulangi password baru"
                required
              />
            </div>

            <div class="pt-3 border-top text-end">
              <button type="submit" class="btn btn-primary btn-sm px-4 fw-semibold" :disabled="isSaving">
                <span v-if="isSaving" class="spinner-border spinner-border-sm me-1" role="status"></span>
                <i v-else class="bi bi-shield-check me-1"></i>
                <span>Perbarui Password</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Tab 3: Skrip Skema Supabase -->
    <div v-if="activeTab === 'supabase'" class="row g-4">
      <div class="col-12 col-xl-10">
        <div class="card card-clean p-4 border-0 shadow-sm">
          <div class="d-flex align-items-center justify-content-between border-bottom pb-3 mb-3">
            <div>
              <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-database-gear text-info"></i>
                Skrip SQL Schema & RPC Supabase
              </h6>
              <span class="small text-secondary">File lengkap tersedia pada: <code>/supabase/schema.sql</code></span>
            </div>

            <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1" @click="copySql">
              <i class="bi" :class="sqlCopied ? 'bi-check2' : 'bi-clipboard'"></i>
              <span>{{ sqlCopied ? 'Tersalin ke Clipboard!' : 'Salin Seluruh SQL' }}</span>
            </button>
          </div>

          <p class="small text-secondary mb-3">
            Untuk mengaktifkan penyimpanan di cloud Supabase secara permanen, Anda dapat menyalin skrip SQL di bawah ini dan menjalankannya satu kali di menu <strong>SQL Editor</strong> dashboard Supabase Anda.
          </p>

          <pre class="bg-dark text-light p-3 rounded-3 small font-monospace" style="max-height: 400px; overflow-y: auto;">{{ fullSqlSchema }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { hashPassword, verifyPassword } from '../../services/crypto';
import { useEosis } from '../../composables/useEosis';

const {
  settings,
  fetchSettings,
  updateSettings,
  updateAdminCredentials,
  uploadFile,
} = useEosis();

const activeTab = ref<'school' | 'account' | 'supabase'>('school');
const isSaving = ref(false);
const alertMessage = ref('');
const alertType = ref<'success' | 'danger'>('success');
const sqlCopied = ref(false);

const schoolForm = ref({
  school_name: '',
  school_logo: '',
  election_period: '',
  is_election_active: true,
  show_trial_accounts: false,
});

const accountForm = ref({
  username: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const fullSqlSchema = ref(`-- ==============================================================================
-- eOSIS - Skrip Skema Basis Data PostgreSQL / Supabase
-- Sistem Pemilihan Ketua dan Wakil Ketua OSIS
-- ==============================================================================

-- 1. TABEL KELAS
CREATE TABLE IF NOT EXISTS public.classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABEL SISWA / PEMILIH
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nisn VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    birth_date DATE NOT NULL,
    class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL,
    has_voted BOOLEAN NOT NULL DEFAULT FALSE,
    voted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABEL CALON KANDIDAT
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_number INT NOT NULL UNIQUE,
    leader_name VARCHAR(255) NOT NULL,
    vice_leader_name VARCHAR(255) NOT NULL,
    photo_url TEXT,
    slogan TEXT,
    vision TEXT NOT NULL,
    mission TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABEL SUARA (VOTES - RAHASIA ASAS LUBER)
CREATE TABLE IF NOT EXISTS public.votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABEL PENGATURAN
CREATE TABLE IF NOT EXISTS public.settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    school_name VARCHAR(255) NOT NULL DEFAULT 'SMA Negeri 1 Indonesia',
    school_logo TEXT,
    election_period VARCHAR(50) NOT NULL DEFAULT '2026/2027',
    is_election_active BOOLEAN NOT NULL DEFAULT TRUE,
    admin_username VARCHAR(100) NOT NULL DEFAULT 'admin',
    admin_password_hash VARCHAR(255) NOT NULL DEFAULT '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. RPC FUNCTION: CAST VOTE (Transaksi Atomik 1 Suara)
CREATE OR REPLACE FUNCTION public.cast_student_vote(
    p_student_id UUID,
    p_candidate_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_has_voted BOOLEAN;
    v_election_active BOOLEAN;
BEGIN
    SELECT is_election_active INTO v_election_active FROM public.settings WHERE id = 1;
    IF v_election_active IS NOT TRUE THEN
        RETURN jsonb_build_object('success', false, 'message', 'Periode pemilihan sedang ditutup.');
    END IF;

    SELECT has_voted INTO v_has_voted FROM public.students WHERE id = p_student_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Data siswa tidak ditemukan.');
    END IF;
    IF v_has_voted THEN
        RETURN jsonb_build_object('success', false, 'message', 'Anda sudah menggunakan hak suara Anda sebelumnya.');
    END IF;

    UPDATE public.students SET has_voted = TRUE, voted_at = now() WHERE id = p_student_id;
    INSERT INTO public.votes (candidate_id) VALUES (p_candidate_id);

    RETURN jsonb_build_object('success', true, 'message', 'Suara Anda berhasil dicatat, terima kasih telah berpartisipasi.');
END;
$$;
`);

async function loadSettings() {
  try {
    const data = await fetchSettings();
    schoolForm.value = {
      school_name: data.school_name,
      school_logo: data.school_logo,
      election_period: data.election_period,
      is_election_active: data.is_election_active,
      show_trial_accounts: data.show_trial_accounts ?? false,
    };
    accountForm.value.username = data.admin_username;
  } catch (err) {
    console.error('Settings load err', err);
  }
}

async function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];

  try {
    showAlert('Mengunggah logo sekolah...', 'success');
    const url = await uploadFile(file, 'logos');
    schoolForm.value.school_logo = url;
    showAlert('Logo sekolah berhasil diunggah.', 'success');
  } catch (err) {
    showAlert('Gagal mengunggah logo.', 'danger');
  }
}

async function saveSchoolSettings() {
  isSaving.value = true;
  try {
    await updateSettings({
      school_name: schoolForm.value.school_name.trim(),
      school_logo: schoolForm.value.school_logo.trim(),
      election_period: schoolForm.value.election_period.trim(),
      is_election_active: schoolForm.value.is_election_active,
      show_trial_accounts: schoolForm.value.show_trial_accounts,
    });
    showAlert('Pengaturan sekolah berhasil diperbarui.', 'success');
    await loadSettings();
  } catch (err: any) {
    showAlert(err.message || 'Gagal menyimpan pengaturan sekolah.', 'danger');
  } finally {
    isSaving.value = false;
  }
}

async function saveAdminCredentials() {
  const f = accountForm.value;
  if (!f.username.trim() || !f.oldPassword || !f.newPassword) {
    showAlert('Mohon lengkapi seluruh kolom password.', 'danger');
    return;
  }

  if (f.newPassword.length < 6) {
    showAlert('Password baru minimal 6 karakter.', 'danger');
    return;
  }

  if (f.newPassword !== f.confirmPassword) {
    showAlert('Konfirmasi password baru tidak cocok.', 'danger');
    return;
  }

  isSaving.value = true;
  try {
    const isOldMatch = await verifyPassword(f.oldPassword, settings.value.admin_password_hash);
    if (!isOldMatch) {
      showAlert('Password saat ini salah.', 'danger');
      isSaving.value = false;
      return;
    }

    const newHash = await hashPassword(f.newPassword);
    await updateAdminCredentials(f.username.trim(), newHash);

    showAlert('Kredensial admin (username & password) berhasil diperbarui!', 'success');
    f.oldPassword = '';
    f.newPassword = '';
    f.confirmPassword = '';
    await loadSettings();
  } catch (err: any) {
    showAlert(err.message || 'Gagal memperbarui sandi.', 'danger');
  } finally {
    isSaving.value = false;
  }
}

async function copySql() {
  try {
    await navigator.clipboard.writeText(fullSqlSchema.value);
    sqlCopied.value = true;
    setTimeout(() => {
      sqlCopied.value = false;
    }, 2500);
  } catch (err) {
    console.error('Copy sql error', err);
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
  loadSettings();
});
</script>
