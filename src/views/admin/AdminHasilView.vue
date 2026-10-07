<template>
  <div>
    <!-- Page Header (Non-print) -->
    <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 no-print d-print-none">
      <div>
        <h4 class="fw-bold text-dark mb-1">Perolehan Suara & Berita Acara Pemilihan</h4>
        <p class="text-secondary small mb-0">
          Hasil penghitungan suara (Quick Count) & cetak Berita Acara resmi Periode {{ settings.election_period }}.
        </p>
      </div>

      <div class="d-flex flex-wrap align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1 shadow-xs" @click="loadData">
          <i class="bi bi-arrow-clockwise"></i>
          <span>Perbarui Data</span>
        </button>

        <button class="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-xs fw-semibold" @click="handlePrint">
          <i class="bi bi-printer-fill"></i>
          <span>Cetak Laporan Resmi</span>
        </button>

        <button
          class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 shadow-xs"
          @click="activeSubTab = 'report_settings'"
        >
          <i class="bi bi-gear-fill"></i>
          <span>Ubah Kop & TTD</span>
        </button>

        <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1 shadow-xs" @click="showResetModal = true">
          <i class="bi bi-trash"></i>
          <span>Reset Suara</span>
        </button>
      </div>
    </div>

    <!-- Sub-menu Nav Tabs (Non-print) -->
    <div class="card card-clean border-0 shadow-sm mb-4 no-print d-print-none">
      <div class="card-body p-2">
        <ul class="nav nav-pills nav-fill gap-2" role="tablist">
          <li class="nav-item">
            <button
              class="nav-link text-start text-sm-center py-2 px-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
              :class="{ 'active': activeSubTab === 'quick_count' }"
              @click="activeSubTab = 'quick_count'"
            >
              <i class="bi bi-bar-chart-line-fill"></i>
              <span>1. Perolehan Suara & Grafik</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link text-start text-sm-center py-2 px-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
              :class="{ 'active': activeSubTab === 'report_preview' }"
              @click="activeSubTab = 'report_preview'"
            >
              <i class="bi bi-file-earmark-text-fill"></i>
              <span>2. Pratinjau Dokumen Berita Acara</span>
            </button>
          </li>
          <li class="nav-item">
            <button
              class="nav-link text-start text-sm-center py-2 px-3 fw-semibold d-flex align-items-center justify-content-center gap-2"
              :class="{ 'active': activeSubTab === 'report_settings' }"
              @click="activeSubTab = 'report_settings'"
            >
              <i class="bi bi-pen-fill"></i>
              <span>3. Pengaturan Kop Surat & Penandatangan</span>
            </button>
          </li>
        </ul>
      </div>
    </div>

    <!-- Alert Feedback -->
    <div v-if="alertMessage" class="alert py-2 px-3 small d-flex align-items-center justify-content-between mb-3 no-print d-print-none" :class="alertType === 'success' ? 'alert-success' : 'alert-danger'">
      <span>{{ alertMessage }}</span>
      <button type="button" class="btn-close btn-sm" @click="alertMessage = ''"></button>
    </div>

    <!-- ========================================================================= -->
    <!-- SUB-MENU 1: QUICK COUNT & GRAFIK -->
    <!-- ========================================================================= -->
    <div v-show="activeSubTab === 'quick_count'" class="no-print d-print-none">
      <!-- Alert / Guarantee Notice -->
      <div class="alert alert-info py-2 px-3 small d-flex align-items-center gap-2 mb-4 border-0">
        <i class="bi bi-shield-check fs-5 text-primary flex-shrink-0"></i>
        <div>
          <strong>Jaminan Kerahasiaan Suara (LUBER):</strong> Sistem dirancang sesuai regulasi pemilihan. Suara disimpan terpisah tanpa menyimpan ID siswa di tabel suara kandidat. Identitas pilihan tetap 100% rahasia.
        </div>
      </div>

      <!-- Summary Metrics Cards -->
      <div class="row g-3 mb-4">
        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card card-clean p-3 h-100">
            <div class="text-secondary small fw-semibold mb-1">Daftar Pemilih Tetap (DPT)</div>
            <h3 class="fw-bold text-dark tabular-nums mb-0">{{ stats.totalStudents }}</h3>
            <small class="text-muted">Total siswa terdaftar</small>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card card-clean p-3 h-100 border-success-subtle">
            <div class="text-secondary small fw-semibold mb-1">Total Suara Masuk (Sah)</div>
            <h3 class="fw-bold text-success tabular-nums mb-0">{{ stats.totalVoted }}</h3>
            <small class="text-muted">Siswa yang telah memilih</small>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card card-clean p-3 h-100 border-warning-subtle">
            <div class="text-secondary small fw-semibold mb-1">Suara Belum Masuk</div>
            <h3 class="fw-bold text-warning-emphasis tabular-nums mb-0">{{ stats.totalNotVoted }}</h3>
            <small class="text-muted">Siswa belum menggunakan hak suara</small>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-lg-3">
          <div class="card card-clean p-3 h-100 bg-primary text-white border-0 shadow-xs">
            <div class="text-white-50 small fw-semibold mb-1">Partisipasi Pemilih</div>
            <h3 class="fw-bold text-white tabular-nums mb-0">{{ stats.participationPercentage }}%</h3>
            <small class="text-white-50">Tingkat kehadiran pemilih</small>
          </div>
        </div>
      </div>

      <!-- Charts Row (Chart.js Interactive) -->
      <div class="row g-4 mb-4">
        <!-- Bar Chart -->
        <div class="col-12 col-lg-8">
          <div class="card card-clean p-4 h-100">
            <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-bar-chart-fill text-primary"></i>
              Grafik Perolehan Suara Per Paslon (Batang)
            </h6>
            <div style="position: relative; height: 280px; width: 100%;">
              <canvas ref="barChartCanvas"></canvas>
            </div>
          </div>
        </div>

        <!-- Doughnut Chart -->
        <div class="col-12 col-lg-4">
          <div class="card card-clean p-4 h-100">
            <h6 class="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i class="bi bi-pie-chart-fill text-primary"></i>
              Proporsi Suara (%)
            </h6>
            <div style="position: relative; height: 280px; width: 100%;">
              <canvas ref="doughnutChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Table of Results -->
      <div class="card card-clean border-0 shadow-sm overflow-hidden mb-4">
        <div class="p-3 bg-light border-bottom d-flex align-items-center justify-content-between">
          <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
            <i class="bi bi-table text-primary"></i>
            Tabel Hasil Perolehan Suara Kandidat
          </h6>
          <span class="badge bg-secondary-subtle text-secondary small">
            Terakhir diperbarui: {{ lastUpdatedTime }}
          </span>
        </div>

        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-secondary small text-uppercase">
              <tr>
                <th scope="col" style="width: 80px;" class="ps-4">No. Urut</th>
                <th scope="col" style="width: 70px;">Foto</th>
                <th scope="col">Pasangan Calon (Ketua & Wakil)</th>
                <th scope="col" style="width: 140px;" class="text-end">Jumlah Suara</th>
                <th scope="col" style="width: 140px;" class="text-end">Persentase</th>
                <th scope="col" style="width: 180px;">Visualisasi Progres</th>
                <th scope="col" style="width: 130px;" class="text-center pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="stats.candidateResults.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  Belum ada data calon kandidat.
                </td>
              </tr>

              <tr v-for="res in sortedResults" :key="res.candidate_id">
                <td class="ps-4">
                  <div class="candidate-number-badge fs-6" style="width: 34px; height: 34px;">
                    {{ res.candidate_number }}
                  </div>
                </td>
                <td>
                  <img
                    v-if="res.photo_url"
                    :src="res.photo_url"
                    :alt="res.leader_name"
                    class="rounded-circle border"
                    style="width: 42px; height: 42px; object-fit: cover;"
                    @error="res.photo_url = ''"
                  />
                  <div
                    v-else
                    class="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
                    style="width: 42px; height: 42px;"
                  >
                    <i class="bi bi-person-fill"></i>
                  </div>
                </td>
                <td>
                  <div class="fw-bold text-dark">{{ res.leader_name }}</div>
                  <div class="text-secondary small">& {{ res.vice_leader_name }}</div>
                </td>
                <td class="text-end">
                  <span class="fw-bold text-dark tabular-nums fs-6">{{ res.votes }}</span>
                  <span class="text-muted small ms-1">suara</span>
                </td>
                <td class="text-end">
                  <span class="fw-bold text-primary tabular-nums fs-6">{{ res.percentage }}%</span>
                </td>
                <td>
                  <div class="progress" style="height: 10px;">
                    <div
                      class="progress-bar bg-primary"
                      role="progressbar"
                      :style="{ width: res.percentage + '%' }"
                      :aria-valuenow="res.percentage"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    ></div>
                  </div>
                </td>
                <td class="text-center pe-4">
                  <span
                    v-if="isHighest(res)"
                    class="badge bg-warning-subtle text-warning-emphasis border border-warning px-2 py-1"
                  >
                    <i class="bi bi-trophy-fill me-1"></i> Unggul
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>
              </tr>
            </tbody>
            <tfoot class="table-light fw-bold">
              <tr>
                <td colspan="3" class="ps-4">TOTAL SUARA SAH MASUK</td>
                <td class="text-end text-dark tabular-nums">{{ stats.totalVoted }} suara</td>
                <td class="text-end text-dark tabular-nums">{{ stats.totalVoted > 0 ? '100%' : '0%' }}</td>
                <td colspan="2"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- SUB-MENU 2: PRATINJAU DOKUMEN CETAK BERITA ACARA -->
    <!-- ========================================================================= -->
    <div v-show="activeSubTab === 'report_preview'" class="no-print d-print-none mb-4">
      <div class="card card-clean border-0 shadow-sm p-3 mb-3 bg-white">
        <div class="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-3">
          <div>
            <h6 class="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
              <i class="bi bi-file-earmark-check-fill text-success"></i>
              Pratinjau Lembar Berita Acara (Siap Cetak A4)
            </h6>
            <span class="text-secondary small">Dokumen ini akan dicetak persis dengan format resmi standar dinas/sekolah.</span>
          </div>

          <div class="d-flex align-items-center gap-2">
            <button class="btn btn-primary btn-sm d-flex align-items-center gap-2 shadow-xs px-3" @click="handlePrint">
              <i class="bi bi-printer-fill"></i>
              <span>Cetak Sekarang (Print / PDF)</span>
            </button>
            <button class="btn btn-outline-secondary btn-sm" @click="activeSubTab = 'report_settings'">
              <i class="bi bi-pencil-square me-1"></i> Ubah Kop & TTD
            </button>
          </div>
        </div>
      </div>

      <!-- Preview Sheet A4 Simulation -->
      <div class="report-paper-container mx-auto p-4 p-md-5 bg-white border shadow-sm rounded-2" style="max-width: 820px;">
        <div id="printable-official-report-preview">
          <!-- Live Preview Included -->
          <div v-html="renderedReportHtml"></div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- SUB-MENU 3: PENGATURAN KOP SURAT & PENANDATANGAN -->
    <!-- ========================================================================= -->
    <div v-show="activeSubTab === 'report_settings'" class="no-print d-print-none mb-4">
      <div class="row g-4">
        <!-- Kolom Form Pengaturan -->
        <div class="col-12 col-xl-8">
          <div class="card card-clean border-0 shadow-sm p-4 bg-white mb-4">
            <div class="d-flex align-items-center justify-content-between border-bottom pb-3 mb-4">
              <h5 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i class="bi bi-pencil-square text-primary"></i>
                Pengaturan Kop Surat & Orang yang Menandatangani
              </h5>
              <button class="btn btn-outline-secondary btn-sm" @click="resetReportConfigToDefault">
                <i class="bi bi-arrow-counterclockwise me-1"></i> Reset Default
              </button>
            </div>

            <form @submit.prevent="saveReportConfig">
              <!-- BAGIAN 1: KOP SURAT LEMBAGA -->
              <div class="mb-4">
                <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                  <i class="bi bi-building me-1"></i> 1. Identitas Lembaga & Kop Surat
                </h6>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">
                      Instansi Tingkat 1 (Pemerintah/Yayasan)
                    </label>
                    <input
                      v-model="reportConfig.instansiTingkat1"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="PEMERINTAH DAERAH PROVINSI ..."
                      required
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">
                      Instansi Tingkat 2 (Dinas / Cabang Dinas)
                    </label>
                    <input
                      v-model="reportConfig.instansiTingkat2"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="DINAS PENDIDIKAN DAN KEBUDAYAAN"
                      required
                    />
                  </div>

                  <div class="col-md-8">
                    <label class="form-label small fw-semibold text-secondary">
                      Nama Sekolah
                    </label>
                    <input
                      v-model="reportConfig.namaSekolah"
                      type="text"
                      class="form-control form-control-sm fw-bold"
                      placeholder="SMA NEGERI 1 HARAPAN BANGSA"
                      required
                    />
                  </div>

                  <div class="col-md-4">
                    <label class="form-label small fw-semibold text-secondary">
                      Unit Kerja / Penyelenggara
                    </label>
                    <input
                      v-model="reportConfig.unitPelaksana"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="ORGANISASI SISWA INTRA SEKOLAH (OSIS)"
                      required
                    />
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">
                      Alamat Lengkap Sekolah
                    </label>
                    <input
                      v-model="reportConfig.alamatSekolah"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Jl. Pendidikan No. 45, Kompleks Pelajar, Telp. (021) 555-1234"
                      required
                    />
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">
                      Kontak, Email & Website Resmi
                    </label>
                    <input
                      v-model="reportConfig.kontakSekolah"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Website: www.sekolah.sch.id | Email: osis@sekolah.sch.id"
                      required
                    />
                  </div>

                  <div class="col-12">
                    <label class="form-label small fw-semibold text-secondary">
                      URL Logo Sekolah (Opsional)
                    </label>
                    <input
                      v-model="reportConfig.logoUrl"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>

              <!-- BAGIAN 2: NOMOR SURAT & PENETAPAN -->
              <div class="mb-4">
                <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                  <i class="bi bi-file-earmark-ruled me-1"></i> 2. Judul Laporan & Nomor Berita Acara
                </h6>

                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">
                      Judul Laporan
                    </label>
                    <input
                      v-model="reportConfig.judulLaporan"
                      type="text"
                      class="form-control form-control-sm fw-bold"
                      placeholder="BERITA ACARA & LAPORAN RESMI HASIL PEMILIHAN"
                      required
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">
                      Nomor Surat / Berita Acara
                    </label>
                    <input
                      v-model="reportConfig.nomorSurat"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Nomor: 028/OSIS-PILKETOS/BA/X/2026"
                      required
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">
                      Tempat Penetapan Berita Acara
                    </label>
                    <input
                      v-model="reportConfig.tempatPenetapan"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Jakarta"
                      required
                    />
                  </div>

                  <div class="col-md-6">
                    <label class="form-label small fw-semibold text-secondary">
                      Tanggal Penetapan
                    </label>
                    <input
                      v-model="reportConfig.tanggalPenetapan"
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Contoh: 7 Oktober 2026"
                      required
                    />
                  </div>
                </div>
              </div>

              <!-- BAGIAN 3: ORANG YANG MENANDATANGANI -->
              <div class="mb-4">
                <h6 class="fw-bold text-primary border-bottom pb-2 mb-3">
                  <i class="bi bi-people me-1"></i> 3. Orang yang Menandatangani (Penandatangan)
                </h6>

                <div class="row g-3">
                  <!-- Pihak 1 -->
                  <div class="col-md-6">
                    <div class="card p-3 bg-light border-0 rounded-3 h-100">
                      <div class="fw-bold text-dark small mb-2 text-uppercase">Pihak 1 (Mengetahui)</div>

                      <div class="mb-2">
                        <label class="form-label small fw-semibold text-secondary mb-1">Jabatan Pihak 1</label>
                        <input
                          v-model="reportConfig.jabatan1"
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Kepala Sekolah / Pembina OSIS"
                          required
                        />
                      </div>

                      <div class="mb-2">
                        <label class="form-label small fw-semibold text-secondary mb-1">Nama Lengkap & Gelar</label>
                        <input
                          v-model="reportConfig.nama1"
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Drs. H. Hendra Wijaya, M.Pd."
                          required
                        />
                      </div>

                      <div>
                        <label class="form-label small fw-semibold text-secondary mb-1">NIP / NUPTK</label>
                        <input
                          v-model="reportConfig.identitas1"
                          type="text"
                          class="form-control form-control-sm font-monospace"
                          placeholder="NIP. 19740510 199903 1 004"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Pihak 2 -->
                  <div class="col-md-6">
                    <div class="card p-3 bg-light border-0 rounded-3 h-100">
                      <div class="fw-bold text-dark small mb-2 text-uppercase">Pihak 2 (Disahkan)</div>

                      <div class="mb-2">
                        <label class="form-label small fw-semibold text-secondary mb-1">Jabatan Pihak 2</label>
                        <input
                          v-model="reportConfig.jabatan2"
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Ketua Panitia Pemilihan OSIS"
                          required
                        />
                      </div>

                      <div class="mb-2">
                        <label class="form-label small fw-semibold text-secondary mb-1">Nama Lengkap Siswa</label>
                        <input
                          v-model="reportConfig.nama2"
                          type="text"
                          class="form-control form-control-sm"
                          placeholder="Rizky Aditya Pratama"
                          required
                        />
                      </div>

                      <div>
                        <label class="form-label small fw-semibold text-secondary mb-1">NISN / NIS</label>
                        <input
                          v-model="reportConfig.identitas2"
                          type="text"
                          class="form-control form-control-sm font-monospace"
                          placeholder="NISN. 0082736419"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <!-- Pihak 3 (Opsional) -->
                  <div class="col-12 mt-3">
                    <div class="form-check form-switch mb-2">
                      <input
                        id="checkSigner3"
                        v-model="reportConfig.aktifkanPenandatangan3"
                        class="form-check-input"
                        type="checkbox"
                      />
                      <label class="form-check-label fw-semibold text-dark small" for="checkSigner3">
                        Tambahkan Penandatangan Ketiga (Contoh: Pembina OSIS / Sekretaris Panitia / Saksi)
                      </label>
                    </div>

                    <div v-if="reportConfig.aktifkanPenandatangan3" class="card p-3 bg-light border-0 rounded-3">
                      <div class="row g-2">
                        <div class="col-md-4">
                          <label class="form-label small fw-semibold text-secondary mb-1">Jabatan Pihak 3</label>
                          <input
                            v-model="reportConfig.jabatan3"
                            type="text"
                            class="form-control form-control-sm"
                            placeholder="Pembina OSIS / Sekretaris"
                          />
                        </div>
                        <div class="col-md-4">
                          <label class="form-label small fw-semibold text-secondary mb-1">Nama Lengkap</label>
                          <input
                            v-model="reportConfig.nama3"
                            type="text"
                            class="form-control form-control-sm"
                            placeholder="Siti Nurhaliza, S.Pd."
                          />
                        </div>
                        <div class="col-md-4">
                          <label class="form-label small fw-semibold text-secondary mb-1">NIP / NISN</label>
                          <input
                            v-model="reportConfig.identitas3"
                            type="text"
                            class="form-control form-control-sm"
                            placeholder="NIP. 19850214 201001 2 018"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tombol Aksi Simpan -->
              <div class="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
                <button type="button" class="btn btn-outline-secondary btn-sm" @click="activeSubTab = 'report_preview'">
                  Batal / Lihat Pratinjau
                </button>
                <button type="submit" class="btn btn-primary btn-sm px-4 fw-semibold shadow-xs">
                  <i class="bi bi-save me-1"></i> Simpan Format Kop & TTD
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- Kolom Petunjuk & Pintasan Cepat -->
        <div class="col-12 col-xl-4">
          <div class="card card-clean border-0 shadow-sm p-4 bg-white mb-3">
            <h6 class="fw-bold text-dark mb-2 d-flex align-items-center gap-2">
              <i class="bi bi-info-circle-fill text-primary"></i>
              Panduan Format Laporan
            </h6>
            <p class="small text-secondary mb-3">
              Perubahan pada formulir ini akan otomatis tersimpan di memori sistem dan langsung diterapkan saat mencetak Berita Acara maupun dokumen laporan hasil pemilihan.
            </p>

            <ul class="list-unstyled small text-secondary mb-4 ps-2 border-start border-2 border-primary">
              <li class="mb-2">
                <strong>Logo Sekolah:</strong> Bila dikosongkan, kop surat akan menggunakan logo dari menu Pengaturan Umum Sekolah.
              </li>
              <li class="mb-2">
                <strong>Tanggal Penetapan:</strong> Dapat disesuaikan dengan tanggal pleno penetapan hasil pemungutan suara resmi.
              </li>
              <li>
                <strong>Standar Dinas:</strong> Dilengkapi garis ganda (kop surat resmi), tabel perolehan suara sah, serta kolom legalitas bermaterai/tanda tangan.
              </li>
            </ul>

            <div class="d-grid gap-2">
              <button class="btn btn-outline-primary btn-sm" @click="activeSubTab = 'report_preview'">
                <i class="bi bi-eye me-1"></i> Lihat Hasil Pratinjau
              </button>
              <button class="btn btn-success btn-sm fw-semibold" @click="handlePrint">
                <i class="bi bi-printer me-1"></i> Cetak Laporan Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- ELEMEN KHUSUS DOKUMEN CETAK RESMI (HANYA DITAMPILKAN KETIKA WINDOW.PRINT / IFRAME) -->
    <!-- ========================================================================= -->
    <div id="printable-official-report" class="d-none d-print-block">
      <div v-html="renderedReportHtml"></div>
    </div>

    <!-- Modal Konfirmasi Reset Suara -->
    <div
      v-if="showResetModal"
      class="modal fade show d-block no-print d-print-none"
      tabindex="-1"
      style="background: rgba(15, 23, 42, 0.6);"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow text-center p-3">
          <div class="modal-body p-4">
            <div class="rounded-circle bg-danger-subtle text-danger d-inline-flex p-3 mb-3">
              <i class="bi bi-exclamation-octagon-fill fs-2"></i>
            </div>
            <h5 class="fw-bold text-dark mb-2">Reset Seluruh Suara Pemilihan?</h5>
            <p class="text-secondary small mb-4">
              Tindakan ini akan mengosongkan seluruh perolehan suara yang masuk dan mengembalikan status seluruh siswa menjadi <strong>Belum Memilih</strong>. Tindakan ini hanya boleh dilakukan untuk simulasi atau memulai pemungutan suara resmi baru.
            </p>
            <div class="d-flex justify-content-center gap-2">
              <button type="button" class="btn btn-secondary btn-sm px-4" @click="showResetModal = false">Batal</button>
              <button type="button" class="btn btn-danger btn-sm px-4 fw-semibold" @click="executeResetVotes">
                Ya, Reset Seluruh Suara
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { Chart, registerables } from 'chart.js';
import { useEosis } from '../../composables/useEosis';
import type { CandidateResult } from '../../types';

Chart.register(...registerables);

const { settings, stats, fetchSettings, fetchStats, resetAllVotes } = useEosis();

// Sub-menu navigasi
type SubTabType = 'quick_count' | 'report_preview' | 'report_settings';
const activeSubTab = ref<SubTabType>('quick_count');

const lastUpdatedTime = ref('');
const showResetModal = ref(false);
const alertMessage = ref('');
const alertType = ref<'success' | 'danger'>('success');

const barChartCanvas = ref<HTMLCanvasElement | null>(null);
const doughnutChartCanvas = ref<HTMLCanvasElement | null>(null);

let barChartInstance: Chart | null = null;
let doughnutChartInstance: Chart | null = null;

// Konfigurasi Kop Surat & Penandatangan
export interface OfficialReportConfig {
  instansiTingkat1: string;
  instansiTingkat2: string;
  namaSekolah: string;
  unitPelaksana: string;
  alamatSekolah: string;
  kontakSekolah: string;
  logoUrl: string;
  nomorSurat: string;
  judulLaporan: string;
  tempatPenetapan: string;
  tanggalPenetapan: string;
  jabatan1: string;
  nama1: string;
  identitas1: string;
  jabatan2: string;
  nama2: string;
  identitas2: string;
  aktifkanPenandatangan3: boolean;
  jabatan3: string;
  nama3: string;
  identitas3: string;
}

const STORAGE_KEY_REPORT = 'eosis_kop_dan_ttd_config';

function getDefaultReportConfig(): OfficialReportConfig {
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    instansiTingkat1: 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA',
    instansiTingkat2: 'DINAS PENDIDIKAN DAN KEBUDAYAAN',
    namaSekolah: settings.value?.school_name || 'SMA NEGERI 1 HARAPAN BANGSA',
    unitPelaksana: 'ORGANISASI SISWA INTRA SEKOLAH (OSIS)',
    alamatSekolah: 'Jl. Pendidikan No. 45, Kebayoran Baru, Jakarta Selatan',
    kontakSekolah: 'Telp: (021) 7891011 | Email: osis@sman1harapan.sch.id | Website: www.sman1harapan.sch.id',
    logoUrl: settings.value?.school_logo || '',
    nomorSurat: 'Nomor: 028/OSIS-PILKETOS/BA/X/2026',
    judulLaporan: 'BERITA ACARA & LAPORAN RESMI HASIL PEMILIHAN KETUA DAN WAKIL KETUA OSIS',
    tempatPenetapan: 'Jakarta',
    tanggalPenetapan: todayStr,
    jabatan1: 'Kepala Sekolah',
    nama1: 'Drs. H. Hendra Wijaya, M.Pd.',
    identitas1: 'NIP. 19740510 199903 1 004',
    jabatan2: 'Ketua Panitia Pemilihan OSIS',
    nama2: 'Rizky Aditya Pratama',
    identitas2: 'NISN. 0082736419',
    aktifkanPenandatangan3: false,
    jabatan3: 'Pembina OSIS',
    nama3: 'Siti Nurhaliza, S.Pd.',
    identitas3: 'NIP. 19850214 201001 2 018',
  };
}

const reportConfig = ref<OfficialReportConfig>(getDefaultReportConfig());

function loadSavedReportConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_REPORT);
    if (raw) {
      const parsed = JSON.parse(raw);
      reportConfig.value = { ...getDefaultReportConfig(), ...parsed };
      return;
    }
  } catch (err) {
    console.warn('Failed to parse saved report config', err);
  }
  reportConfig.value = getDefaultReportConfig();
}

function saveReportConfig() {
  try {
    localStorage.setItem(STORAGE_KEY_REPORT, JSON.stringify(reportConfig.value));
    showAlert('Pengaturan Kop Surat & Penandatangan berhasil disimpan!', 'success');
  } catch (err) {
    showAlert('Gagal menyimpan pengaturan ke penyimpanan lokal.', 'danger');
  }
}

function resetReportConfigToDefault() {
  if (confirm('Kembalikan pengaturan kop surat dan penandatangan ke default standar?')) {
    reportConfig.value = getDefaultReportConfig();
    saveReportConfig();
  }
}

const sortedResults = computed(() => {
  return [...stats.value.candidateResults].sort((a, b) => a.candidate_number - b.candidate_number);
});

function isHighest(res: CandidateResult): boolean {
  if (res.votes === 0) return false;
  const max = Math.max(...stats.value.candidateResults.map(r => r.votes));
  return res.votes === max;
}

// Generate HTML Dokumen Resmi Berita Acara & Laporan
const renderedReportHtml = computed(() => {
  const cfg = reportConfig.value;
  const logo = cfg.logoUrl || settings.value.school_logo;
  const period = settings.value.election_period || '2026/2027';

  let tableRows = '';
  sortedResults.value.forEach((res) => {
    const isWinner = isHighest(res);
    tableRows += `
      <tr>
        <td style="text-align: center; font-weight: bold; padding: 7px;">${res.candidate_number}</td>
        <td style="padding: 7px;">
          <strong>${res.leader_name}</strong> & ${res.vice_leader_name}
        </td>
        <td style="text-align: right; font-weight: bold; padding: 7px;">${res.votes} suara</td>
        <td style="text-align: right; font-weight: bold; padding: 7px;">${res.percentage}%</td>
        <td style="text-align: center; padding: 7px;">
          ${isWinner ? '<span style="font-weight: bold; color: #047857;">TERPILIH / UNGGUL</span>' : '-'}
        </td>
      </tr>
    `;
  });

  const logoImgHtml = logo
    ? `<img src="${logo}" alt="Logo" style="width: 75px; height: 75px; object-fit: contain; margin-right: 18px;" />`
    : '';

  // Signature Block
  let signaturesHtml = '';
  if (cfg.aktifkanPenandatangan3) {
    signaturesHtml = `
      <div style="display: flex; justify-content: space-between; margin-top: 40px; text-align: center; font-size: 11pt;">
        <div style="width: 32%;">
          <div>Disahkan,</div>
          <div style="font-weight: bold;">${cfg.jabatan2}</div>
          <div style="height: 65px;"></div>
          <div style="text-decoration: underline; font-weight: bold;">( ${cfg.nama2} )</div>
          <div style="font-size: 10pt;">${cfg.identitas2}</div>
        </div>

        <div style="width: 32%;">
          <div>Saksi / Panitia,</div>
          <div style="font-weight: bold;">${cfg.jabatan3}</div>
          <div style="height: 65px;"></div>
          <div style="text-decoration: underline; font-weight: bold;">( ${cfg.nama3} )</div>
          <div style="font-size: 10pt;">${cfg.identitas3}</div>
        </div>

        <div style="width: 32%;">
          <div>Mengetahui,</div>
          <div style="font-weight: bold;">${cfg.jabatan1}</div>
          <div style="height: 65px;"></div>
          <div style="text-decoration: underline; font-weight: bold;">( ${cfg.nama1} )</div>
          <div style="font-size: 10pt;">${cfg.identitas1}</div>
        </div>
      </div>
    `;
  } else {
    signaturesHtml = `
      <div style="display: flex; justify-content: space-between; margin-top: 40px; text-align: center; font-size: 11pt;">
        <div style="width: 45%;">
          <div>Disahkan Oleh,</div>
          <div style="font-weight: bold;">${cfg.jabatan2}</div>
          <div style="height: 70px;"></div>
          <div style="text-decoration: underline; font-weight: bold;">( ${cfg.nama2} )</div>
          <div style="font-size: 10pt;">${cfg.identitas2}</div>
        </div>

        <div style="width: 45%;">
          <div>Mengetahui,</div>
          <div style="font-weight: bold;">${cfg.jabatan1}</div>
          <div style="height: 70px;"></div>
          <div style="text-decoration: underline; font-weight: bold;">( ${cfg.nama1} )</div>
          <div style="font-size: 10pt;">${cfg.identitas1}</div>
        </div>
      </div>
    `;
  }

  return `
    <div style="font-family: 'Times New Roman', Times, serif; color: #000; line-height: 1.35; padding: 10px;">
      <!-- KOP SURAT RESMI -->
      <div style="border-bottom: 3px double #000; padding-bottom: 8px; margin-bottom: 16px;">
        <div style="display: flex; align-items: center; justify-content: center;">
          ${logoImgHtml}
          <div style="text-align: center; flex: 1;">
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${cfg.instansiTingkat1}</div>
            <div style="font-size: 12pt; font-weight: bold; text-transform: uppercase;">${cfg.instansiTingkat2}</div>
            <div style="font-size: 15pt; font-weight: bold; text-transform: uppercase; margin: 2px 0;">${cfg.namaSekolah}</div>
            <div style="font-size: 11pt; font-weight: bold; text-transform: uppercase; color: #1e3a8a;">${cfg.unitPelaksana}</div>
            <div style="font-size: 9pt; margin-top: 3px;">${cfg.alamatSekolah}</div>
            <div style="font-size: 8.5pt; font-style: italic;">${cfg.kontakSekolah}</div>
          </div>
        </div>
      </div>

      <!-- JUDUL & NOMOR BERITA ACARA -->
      <div style="text-align: center; margin-bottom: 16px;">
        <div style="font-size: 12.5pt; font-weight: bold; text-transform: uppercase; text-decoration: underline;">${cfg.judulLaporan}</div>
        <div style="font-size: 11pt; font-weight: bold; margin-top: 2px;">PERIODE ${period}</div>
        <div style="font-size: 10pt; margin-top: 2px;">${cfg.nomorSurat}</div>
      </div>

      <!-- PARAGRAF PENGANTAR -->
      <p style="font-size: 10.5pt; text-align: justify; text-indent: 28px; margin-bottom: 12px;">
        Pada hari ini, dengan bertempat di lingkungan <strong>${cfg.namaSekolah}</strong>, telah selesai dilaksanakan pemungutan dan penghitungan suara dalam rangka Pemilihan Ketua dan Wakil Ketua OSIS Periode ${period} secara langsung, umum, bebas, rahasia, jujur, dan adil (LUBER & JURDIL) melalui sistem digital eOSIS dengan rekapitulasi data sebagai berikut:
      </p>

      <!-- TABEL REKAPITULASI RESMI -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 10.5pt;" border="1">
        <thead>
          <tr style="background-color: #f1f5f9;">
            <th style="width: 55px; padding: 7px; text-align: center;">No. Urut</th>
            <th style="padding: 7px; text-align: left;">Pasangan Calon Ketua & Wakil Ketua</th>
            <th style="width: 125px; padding: 7px; text-align: right;">Perolehan Suara</th>
            <th style="width: 100px; padding: 7px; text-align: right;">Persentase</th>
            <th style="width: 130px; padding: 7px; text-align: center;">Keterangan</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
        <tfoot>
          <tr style="font-weight: bold; background-color: #f8fafc;">
            <td colspan="2" style="padding: 7px; text-align: left;">TOTAL SUARA SAH MASUK</td>
            <td style="padding: 7px; text-align: right;">${stats.value.totalVoted} suara</td>
            <td style="padding: 7px; text-align: right;">${stats.value.totalVoted > 0 ? '100%' : '0%'}</td>
            <td style="padding: 7px; text-align: center;">SAH</td>
          </tr>
        </tfoot>
      </table>

      <!-- DATA PARTISIPASI PEMILIH -->
      <div style="font-size: 10pt; margin-bottom: 16px;">
        <table style="width: 100%; border-collapse: collapse; border: none;">
          <tr>
            <td style="width: 35%; border: none; padding: 2px 0;">1. Total Daftar Pemilih Tetap (DPT)</td>
            <td style="border: none; padding: 2px 0;">: <strong>${stats.value.totalStudents}</strong> siswa</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2px 0;">2. Total Pemilih Menggunakan Hak Suara</td>
            <td style="border: none; padding: 2px 0;">: <strong>${stats.value.totalVoted}</strong> suara</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2px 0;">3. Total Pemilih Tidak Menggunakan Hak Suara</td>
            <td style="border: none; padding: 2px 0;">: <strong>${stats.value.totalNotVoted}</strong> siswa</td>
          </tr>
          <tr>
            <td style="border: none; padding: 2px 0;">4. Tingkat Partisipasi Kehadiran</td>
            <td style="border: none; padding: 2px 0;">: <strong>${stats.value.participationPercentage}%</strong></td>
          </tr>
        </table>
      </div>

      <!-- PENUTUP -->
      <p style="font-size: 10.5pt; text-align: justify; text-indent: 28px; margin-bottom: 12px;">
        Demikian Berita Acara dan Laporan Hasil Rekapitulasi Pemilihan ini dibuat dan ditandatangani dengan sebenar-benarnya untuk dipergunakan sebagai dasar penetapan Kepengurusan OSIS Periode ${period}.
      </p>

      <!-- TEMPAT & TANGGAL PENETAPAN -->
      <div style="text-align: right; font-size: 11pt; margin-top: 20px; margin-right: 25px;">
        Ditetapkan di: <strong>${cfg.tempatPenetapan}</strong><br />
        Pada tanggal: <strong>${cfg.tanggalPenetapan}</strong>
      </div>

      <!-- BLOK TANDA TANGAN -->
      ${signaturesHtml}
    </div>
  `;
});

// FUNGSI CETAK DOKUMEN (ROBUST ISOLATED IFRAME PRINT)
function handlePrint() {
  showAlert('Menyiapkan dokumen cetak resmi...', 'success');

  // 1. Buat atau peroleh iframe tersembunyi khusus untuk mencetak dokumen
  let printIframe = document.getElementById('eosis-print-iframe') as HTMLIFrameElement;
  if (!printIframe) {
    printIframe = document.createElement('iframe');
    printIframe.id = 'eosis-print-iframe';
    printIframe.style.position = 'fixed';
    printIframe.style.right = '0';
    printIframe.style.bottom = '0';
    printIframe.style.width = '0';
    printIframe.style.height = '0';
    printIframe.style.border = '0';
    document.body.appendChild(printIframe);
  }

  const iframeDoc = printIframe.contentWindow?.document || printIframe.contentDocument;
  if (!iframeDoc) {
    // Fallback bila iframe tidak didukung
    window.print();
    return;
  }

  const fullPrintHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan_Hasil_Pemilihan_OSIS_${reportConfig.value.namaSekolah.replace(/\s+/g, '_')}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 15mm 20mm 15mm 20mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          color: #000;
          background: #fff;
          margin: 0;
          padding: 0;
          font-size: 11pt;
          line-height: 1.35;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          border: 1px solid #000;
          padding: 6px 9px;
        }
        th {
          background-color: #f1f5f9;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
        }
      </style>
    </head>
    <body>
      ${renderedReportHtml.value}
    </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(fullPrintHtml);
  iframeDoc.close();

  // Berikan jeda sejenak agar browser merender stylesheet & gambar
  setTimeout(() => {
    try {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
    } catch (err) {
      console.warn('Iframe print error fallback:', err);
      window.print();
    }
  }, 450);
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

async function loadData() {
  try {
    await Promise.all([
      fetchSettings(),
      fetchStats(),
    ]);
    lastUpdatedTime.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Sync school name and logo from settings if default
    if (!localStorage.getItem(STORAGE_KEY_REPORT)) {
      if (settings.value.school_name) {
        reportConfig.value.namaSekolah = settings.value.school_name;
      }
      if (settings.value.school_logo) {
        reportConfig.value.logoUrl = settings.value.school_logo;
      }
    }

    await nextTick();
    renderCharts();
  } catch (err) {
    console.error('Error loading hasil stats', err);
  }
}

function renderCharts() {
  const labels = stats.value.candidateResults.map(r => `Paslon 0${r.candidate_number} (${r.leader_name.split(' ')[0]})`);
  const votesData = stats.value.candidateResults.map(r => r.votes);
  const colors = [
    '#2563eb', // blue
    '#059669', // emerald
    '#d97706', // amber
    '#7c3aed', // purple
    '#db2777', // pink
  ];

  // 1. Bar Chart
  if (barChartCanvas.value) {
    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(barChartCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Jumlah Suara',
          data: votesData,
          backgroundColor: colors.slice(0, labels.length),
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.parsed.y} Suara (${stats.value.candidateResults[ctx.dataIndex]?.percentage || 0}%)`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: 'rgba(0, 0, 0, 0.05)' },
          },
          x: {
            grid: { display: false },
          }
        }
      }
    });
  }

  // 2. Doughnut Chart
  if (doughnutChartCanvas.value) {
    if (doughnutChartInstance) doughnutChartInstance.destroy();
    doughnutChartInstance = new Chart(doughnutChartCanvas.value, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: votesData.length > 0 && votesData.some(v => v > 0) ? votesData : [1],
          backgroundColor: votesData.some(v => v > 0) ? colors.slice(0, labels.length) : ['#e2e8f0'],
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 12, font: { size: 11 } }
          }
        },
        cutout: '65%',
      }
    });
  }
}

async function executeResetVotes() {
  try {
    await resetAllVotes();
    showResetModal.value = false;
    await loadData();
    showAlert('Seluruh perolehan suara berhasil direset.', 'success');
  } catch (err) {
    console.error('Reset votes error', err);
    showAlert('Gagal mereset perolehan suara.', 'danger');
  }
}

onMounted(() => {
  loadSavedReportConfig();
  loadData();
});
</script>

<style scoped>
.report-paper-container {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  min-height: 800px;
}
</style>
