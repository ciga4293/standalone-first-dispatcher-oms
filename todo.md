# TODO Roadmap: Production-Ready Dispatcher & OMS System

Dokumen ini berisi daftar tugas (*roadmap*) untuk membawa **Dispatcher & OMS (Order Management System)** dari prototype menjadi aplikasi siap produksi (*production-ready*) yang dapat dijalankan di lingkungan **Homelab (Self-Hosted)** terlebih dahulu, dan dapat di-migrate dengan mudah ke **VPS** di kemudian hari.

---

## 🚀 Target Environment Setup (Homelab & VPS Ready)
- [ ] **Dockerization**: Menyiapkan `Dockerfile` & `docker-compose.yml` untuk Next.js + PostgreSQL + Cloudflare Tunnel/Nginx Proxy.
- [ ] **Homelab Deployment**: Deploy awal di server lokal (Docker Container / Ubuntu Server).
- [ ] **VPS Migration Readiness**: Penggunaan Environment Variables & Volume Storage yang terisolasi agar mudah di-backup dan dipindahkan ke VPS.

---

## 📋 Phase 1: Code Base Refactoring & Architecture Setup
> *Tujuan: Merapikan struktur kode prototype agar mudah dikembangkan dan di-maintain.*

- [x] **1.1 Modularisasi Frontend Components**
  - [x] Ekstrak *types/interfaces* ke file terpisah (`src/types/index.ts`).
  - [x] Pecah file monolithic `DispatcherOncallClient.tsx` (~3000 baris) menjadi sub-komponen:
    - [x] `components/orders/OrderTable.tsx`
    - [x] `components/fleet/FleetStatusGrid.tsx`
    - [x] `components/oncall/OnCallScheduleView.tsx`
    - [x] `components/breakdown/BreakdownLogModal.tsx`
    - [x] Integrasikan komponen modular ke file utama `DispatcherOncallClient.tsx`.

---

## 🗄️ Phase 2: Database Schema & Data Engineering (Pure SQL + PostgreSQL + dbt)
> *Tujuan: Merancang OLTP schema dengan Pure SQL Migration & menyiapkan data model/transformation layer dengan dbt untuk analitik/laporan.*

- [x] **2.1 Raw OLTP Database Design (Pure SQL / DDL Scripts)**
  - [x] Buat DDL SQL Scripts (`db/migrations/001_initial_schema.sql`):
    - [x] Model `users` & `user_role`
    - [x] Model `drivers` & `vehicles`
    - [x] Model `orders`, `waypoints`, & `order_sub_status_enum` (8 Tahapan Sub-status)
    - [x] Model `order_status_logs` (Event/Audit log substatus & Odometer)
    - [x] Model `breakdown_logs` (Timestamps downtime & Odometer)
    - [x] Model `oncall_shifts` & `call_logs`
    - [x] Model `order_attachments`
  - [ ] Gunakan PostgreSQL client driver (`postgres.js`) di Next.js API Routes tanpa ORM.

- [x] **2.2 Analytics & Data Modeling Layer (dbt)**
  - [x] Inisialisasi dbt project (`dbt/`):
    - [x] **Staging Layer (`stg_orders`, `stg_order_status_logs`)**: Clean & cast data mentah OLTP.
    - [x] **Intermediate Layer (`int_order_stage_durations`)**: Window function kalkulasi durasi bottleneck tiap tahapan & selisih KM.
    - [x] **Marts Layer (`fct_order_bottlenecks`)**: Fact Table analitik waktu tunggu antrean gudang, delay ETA, & konsumsi BBM.

- [x] **2.3 Seed Data & Environment Setup**
  - [x] SQL seed scripts (`db/seeds/001_seed_data.sql`) untuk data master awal (Drivers, Fleet Units, Orders, Waypoints).
  - [x] Virtual Environment Python (`venv`) & instalasi paket `dbt-postgres`.

---

## 🔌 Phase 3: FastAPI Backend API Layer (Python) & Odoo Integration
> *Tujuan: Mebangun REST API Service terpisah menggunakan FastAPI (Python) & Asyncpg/psycopg3 dengan Pydantic schemas.*

- [x] **3.1 FastAPI Application Setup (`backend/`)**
  - [x] Setup FastAPI project structure (`backend/app/main.py`)
  - [x] Tambahkan dependensi Python (`fastapi`, `uvicorn`, `asyncpg`, `pydantic`, `python-dotenv`) di virtual environment (`venv`).
  - [x] Konfigurasi Database Connection Pool & CORS middleware di `backend/app/core/database.py`.

- [x] **3.2 FastAPI Routers & Endpoints (`backend/app/routers/`)**
  - [x] `routers/orders.py`: Endpoint GET & POST Order & Waypoints.
  - [x] `routers/fleet.py`: Endpoint GET status kendaraan & update Odometer.
  - [x] `routers/breakdown.py`: Endpoint GET, POST, & PATCH log perbaikan unit kendala.

- [x] **3.3 Pydantic Data Schemas (`backend/app/schemas/`)**
  - [x] Buat Pydantic validation schemas (`order.py`, `fleet.py`) untuk Request/Response payload.

- [ ] **3.4 Odoo ERP Connector (Opsional/Tahap 2 API)**
  - [ ] Integration router untuk fetch Sales Order (`odooSo`) dari Odoo REST/JSON-RPC API.

---

## 🔐 Phase 4: Authentication & Role-Based Access Control (RBAC)
> *Tujuan: Mengamankan aplikasi dan membatasi hak akses sesuai peran user.*

- [ ] **4.1 Authentication Setup**
  - [ ] Integrasi NextAuth.js / Auth.js dengan provider Credentials (Email/Username + Password Hashing bcrypt).
- [ ] **4.2 RBAC Permission Guards**
  - [ ] Dispatcher: Akses penuh pembuatan/pengelolaan order.
  - [ ] Fleet Ops: Pengelolaan kendaraan & log breakdown.
  - [ ] Driver (Mobile-friendly view): Hanya update Odometer & upload Bukti Surat Jalan.
  - [ ] Manager/Admin: Akses laporan & audit log.

---

## 📂 Phase 5: Storage & Media Upload Management
> *Tujuan: Menyimpan dokumen penting (Surat Jalan, Kuitansi, Resi).*

- [ ] **5.1 Local Storage / S3-Compatible Setup**
  - [ ] Konfigurasi penyimpanan lokal di Docker Volume (Homelab) atau MinIO/Cloudflare R2.
  - [ ] Implementasi secure upload handler & file validator (MIME type & size limit).

---

## 🐳 Phase 6: Self-Hosting Homelab & VPS Deployment
> *Tujuan: Menjalankan aplikasi secara penuh di server lokal (Homelab) dan siap dipindahkan ke VPS.*

- [x] **6.1 Dockerization**
  - [x] Tulis multi-stage `Dockerfile.frontend` untuk Next.js Web App.
  - [x] Tulis `Dockerfile.backend` untuk FastAPI Python REST Service.
  - [x] Tulis `docker-compose.yml` menggabungkan: Next.js App, FastAPI Backend, PostgreSQL Database, & auto-execution DDL/Seed SQL.
- [x] **6.2 Production Build & Deployment di Homelab**
  - [x] Konfigurasi environment multi-container (`postgres_db`, `fastapi_backend`, `nextjs_frontend`).
- [x] **6.3 Dokumen Migrasi ke VPS**
  - [x] Buat panduan `HOMELAB_DEPLOYMENT.md` berisi instruksi `docker-compose up`, `pg_dump` backup, dan restore di VPS.

---

## 💬 Catatan Diskusi & Kesepakatan
- *Item yang sedang atau akan dibahas akan ditandai secara langsung.*
