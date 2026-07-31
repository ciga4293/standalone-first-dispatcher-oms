# Panduan Menjalankan dbt CLI

Project ini menggunakan **dbt (data build tool)** untuk mentransformasi data transaksi OLTP dari PostgreSQL menjadi Data Marts analitik.

---

## 🛠️ Persyaratan
1. Python 3.9+
2. Paket `dbt-postgres`

```bash
pip install dbt-postgres
```

---

## 🚀 Cara Menjalankan dbt CLI (Lokal Dev)

Pindah ke folder `dbt/`:

```bash
cd dbt
```

### 1. Test Koneksi Database
```bash
dbt debug --profiles-dir .
```

### 2. Kompilasi & Jalankan Transformasi Data Model
```bash
dbt run --profiles-dir .
```
> Command ini akan otomatis membuat `view` untuk Staging (`stg_orders`, `stg_order_status_logs`), Intermediate (`int_order_stage_durations`), dan tabel Marts (`fct_order_bottlenecks`) di database PostgreSQL Anda.

### 3. Uji Coba Integrasi & Validasi Data (Data Quality Tests)
```bash
dbt test --profiles-dir .
```

### 4. Generate Dokumentasi Data Catalog & Lineage Graph
```bash
dbt docs generate --profiles-dir .
dbt docs serve --profiles-dir .
```
> Dokumentasi interaktif (DAG Lineage Graph) akan otomatis terbuka di browser pada port `http://localhost:8080`.

---

## 📐 Arsitektur Model dbt Project

```
oltp_postgres (public schema)
 ├── orders
 └── order_status_logs
       │
       ▼
 1. Staging Layer (staging schema)
 ├── stg_orders.sql
 └── stg_order_status_logs.sql
       │
       ▼
 2. Intermediate Layer (intermediate schema)
 └── int_order_stage_durations.sql (Menghitung durasi per sub-status via Window Function)
       │
       ▼
 3. Marts Layer (analytics schema)
 └── fct_order_bottlenecks.sql (Tabel Fact untuk dashboard: Dwell time antrean, ETA delay, Konsumsi BBM)
```
