# Panduan Self-Hosting Homelab & Migrasi VPS

Dokumen ini berisi panduan teknis untuk meng-host aplikasi **Dispatcher & OMS (Next.js + FastAPI + PostgreSQL + dbt)** di server lokal (**Homelab**) maupun memindahkannya ke **VPS (Virtual Private Server)**.

---

## 🏗️ Arsitektur Containerization (`docker-compose`)

Sistem menggunakan 3 container terisolasi yang saling terhubung:
1. **`postgres_db` (Port 5432)**: PostgreSQL 15 Database. Otomatis mengeksekusi DDL `001_initial_schema.sql` dan `001_seed_data.sql` saat pertama kali dinyalakan.
2. **`fastapi_backend` (Port 8000)**: FastAPI Python REST Service terhubung ke `postgres_db`.
3. **`nextjs_frontend` (Port 3000)**: Next.js Production Build Web UI.

---

## 🚀 Cara Deployment di Server Homelab

### 1. Prasyarat
- Docker Engine v20.10+
- Docker Compose v2.0+

### 2. Jalankan Seluruh Stack dengan Satu Perintah
Dari root folder proyek, jalankan:

```bash
docker-compose up -d --build
```

### 3. Verifikasi Container Running
```bash
docker-compose ps
```

- **Next.js Web UI**: `http://localhost:3000` (atau IP Homelab Anda: `http://192.168.x.x:3000`)
- **FastAPI API & Docs**: `http://localhost:8000/docs`
- **PostgreSQL Database**: `localhost:5432`

---

## 🗄️ Menjalankan Transformasi Data dbt di Homelab

Setelah PostgreSQL container aktif di Homelab:

```bash
# Masuk ke virtual environment & folder dbt
.\venv\Scripts\Activate.ps1
cd dbt

# Jalankan dbt transformation
dbt run --profiles-dir .
```

---

## ✈️ Panduan Migrasi dari Homelab ke VPS

Apabila Anda sudah siap pindah ke VPS (misal: DigitalOcean, Linode, Hetzner, AWS):

### Step 1: Export Database Dump dari Homelab
```bash
docker exec -t dispatcher_postgres_db pg_dump -U postgres dispatcher_oncall_db > homelab_backup.sql
```

### Step 2: Transfer Kode & Backup File ke VPS
```bash
rsync -avz --exclude 'node_modules' --exclude 'venv' --exclude '.next' . user@vps-ip:/opt/dispatcher-oms/
```

### Step 3: Deploy di VPS
Masuk ke terminal VPS Anda:

```bash
cd /opt/dispatcher-oms
docker-compose up -d --build
```

### Step 4: Restore Data Dump (Jika Perlu)
```bash
cat homelab_backup.sql | docker exec -i dispatcher_postgres_db psql -U postgres -d dispatcher_oncall_db
```
