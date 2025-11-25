-- Migration: Insert default settings
-- Created: 2025-11-15
-- Description: Add default settings for logo_kabupaten and nomor_laporan_format

-- Insert default settings if not exists
INSERT INTO settings (key, value, description, created_at, updated_at)
VALUES 
  ('logo_kabupaten', '/uploads/logo/default-logo.png', 'Logo Kabupaten untuk PDF', NOW(), NOW()),
  ('nomor_laporan_format', 'LR/{KODE_OPD}/{BULAN}/{TAHUN}/{NOMOR}', 'Format nomor laporan retribusi', NOW(), NOW())
ON CONFLICT (key) DO NOTHING;
