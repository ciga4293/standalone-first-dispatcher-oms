# Dispatcher & Order Management System (OMS) Standalone

Aplikasi manajemen logistik, pergerakan armada (*fleet movement*), penanganan piket dispatcher, dan analisis *bottleneck* pengiriman barang. Proyek ini dibangun dari versi prototype hingga siap produksi untuk dijalankan di **Homelab (Self-Hosted)** dan siap dipindahkan ke **VPS**.

---

## 📌 Ringkasan Arsitektur Sistem

Aplikasi menggunakan arsitektur **Decoupled Full-Stack + Data Engineering Layer**:

```text
[ Next.js Frontend ] ──(HTTP REST API)──> [ FastAPI Backend (Python) ] ──(Pure SQL)──> [ PostgreSQL OLTP ]
     (Port 3000)                                (Port 8000)                                (Port 5432)
                                                                                               │
                                                                                       (Data Transformation)
                                                                                               ▼
                                                                                      [ dbt Analytics Layer ]
```

- **Frontend**: Next.js 16 (App Router, TailwindCSS v4, Lucide Icons, Modular React Components).
- **Backend API**: FastAPI (Python 3.11) + Asyncpg + Pydantic validation schemas.
- **Database OLTP**: PostgreSQL 15 dengan DDL Pure SQL + Trigger otomatis + Indexing.
- **Data Engineering & Analytics**: dbt (data build tool) dengan model Staging, Intermediate, dan Marts (analisis dwell time antrean gudang & estimasi BBM).
- **Containerization**: Multi-container Docker Compose (`Dockerfile.frontend`, `Dockerfile.backend`, `docker-compose.yml`).

---

## 🏆 Pencapaian & Fitur Utama

1. **Refactoring Kode & Modularisasi Frontend**:
   - Memecah file monolithic menjadi komponen terpisah (`OrderTable`, `FleetStatusGrid`, `OnCallScheduleView`, `BreakdownLogModal`).
   - Ekstrak TypeScript Interfaces terpusat di `src/types/index.ts`.
2. **PostgreSQL Pure SQL Database (`db/migrations/001_initial_schema.sql`)**:
   - Standardisasi 8 tahapan sub-status order (`order_sub_status_enum`) untuk analisis *bottleneck* antrean muat/bongkar.
   - Tabel `orders`, `waypoints`, `order_status_logs`, `vehicles`, `drivers`, `breakdown_logs`, `oncall_shifts`, `call_logs`, dan `order_attachments`.
3. **dbt Data Transformation Layer (`dbt/`)**:
   - **Staging (`stg_orders`, `stg_order_status_logs`)**: Clean & type casting.
   - **Intermediate (`int_order_stage_durations`)**: Window function `LEAD()` untuk kalkulasi durasi menit/jam tiap tahapan sub-status.
   - **Marts (`fct_order_bottlenecks`)**: Aggregation Fact Table waktu tunggu antrean gudang, delay ETA, & konsumsi BBM (TWB vs CDDL).
4. **FastAPI Python Backend (`backend/`)**:
   - Asynchronous Connection Pool ke PostgreSQL via `asyncpg`.
   - REST API Endpoints untuk `/orders`, `/fleet`, `/breakdown`.
   - Dokumentasi Swagger UI otomatis di `/docs`.
5. **Homelab Containerization Ready**:
   - Menyiapkan multi-container `docker-compose.yml` untuk deployment sekali klik.

---

## 🚀 Panduan Deployment & Cara Menjalankan

### Option A: Deployment Full-Stack via Docker Compose (Rekomendasi Utama)

Metode paling cepat untuk Homelab atau VPS:

1. Pastikan Docker & Docker Compose sudah terpasang.
2. Clone repository dan jalankan:

```bash
# Clone repository
git clone https://github.com/ciga4293/standalone-first-dispatcher-oms.git
cd standalone-first-dispatcher-oms

# Jalankan seluruh service (PostgreSQL + FastAPI + Next.js)
docker-compose up -d --build
```

Access Points:
- 🌐 **Next.js Web UI**: `http://localhost:3000` (atau IP Homelab Anda: `http://192.168.x.x:3000`)
- ⚙️ **FastAPI Swagger API Docs**: `http://localhost:8000/docs`
- 🗄️ **PostgreSQL Database**: `localhost:5432`

---

### Option B: Setup Manual (Development Mode)

#### 1. Persiapan Environment Python
```bash
# Buat virtual environment & install dependensi Python
python -m venv venv

# Di Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Di Linux / macOS:
source venv/bin/activate

# Install dependensi backend & dbt
pip install -r requirements.txt
```

#### 2. Jalankan Frontend (Next.js)
```bash
npm install
npm run dev
# Buka http://localhost:3000
```

#### 3. Jalankan Backend (FastAPI Python)
```bash
cd backend
uvicorn app.main:app --port 8000 --reload
```

#### 4. Jalankan Transformasi Data (dbt CLI)
```bash
cd dbt
dbt debug --profiles-dir .
dbt run --profiles-dir .
```

---

## 📄 Dokumen Terkait & Panduan Lengkap
- [todo.md](todo.md): Detail roadmap pengerjaan dari Phase 1 hingga Phase 6.
- [HOMELAB_DEPLOYMENT.md](HOMELAB_DEPLOYMENT.md): Panduan teknis deployment Homelab, pengoperasian dbt, dan backup/restore `pg_dump` ke VPS.
