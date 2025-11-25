-- Migration: Add kategori and deskripsi columns to laporan_retribusi table
-- Date: 2025-11-15

-- Add kategori column
ALTER TABLE laporan_retribusi 
ADD COLUMN IF NOT EXISTS kategori VARCHAR(100);

-- Add deskripsi column  
ALTER TABLE laporan_retribusi
ADD COLUMN IF NOT EXISTS deskripsi TEXT;

-- Populate existing records with kategori and deskripsi from jenis_retribusi
UPDATE laporan_retribusi lr
SET 
  kategori = jr.kategori,
  deskripsi = jr.deskripsi,
  updated_at = NOW()
FROM jenis_retribusi jr
WHERE lr.jenis_retribusi_id = jr.id
  AND (lr.kategori IS NULL OR lr.deskripsi IS NULL);

-- Verify the update
SELECT 
  COUNT(*) as total_records,
  COUNT(kategori) as records_with_kategori,
  COUNT(deskripsi) as records_with_deskripsi
FROM laporan_retribusi;
