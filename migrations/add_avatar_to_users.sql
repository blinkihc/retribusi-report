-- Add avatar column to users table
-- Migration: Add avatar support for user profiles

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(50) DEFAULT 'avatar-1';

-- Update existing users to have default avatar
UPDATE users 
SET avatar = 'avatar-1' 
WHERE avatar IS NULL;

COMMENT ON COLUMN users.avatar IS 'Avatar ID for user profile (e.g., avatar-1, avatar-2)';
