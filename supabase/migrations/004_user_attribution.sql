-- ============================================================
-- ADD USER ATTRIBUTION FIELDS TO CORE TABLES
-- ============================================================

-- 1. TRANSACTIONS
ALTER TABLE transactions 
  ADD COLUMN created_by_user_id UUID,
  ADD COLUMN created_by_email TEXT,
  ADD COLUMN updated_by_user_id UUID,
  ADD COLUMN updated_by_email TEXT;

-- 2. TRANSFERS
ALTER TABLE transfers 
  ADD COLUMN created_by_user_id UUID,
  ADD COLUMN created_by_email TEXT,
  ADD COLUMN updated_by_user_id UUID,
  ADD COLUMN updated_by_email TEXT;

-- 3. ALLOCATION SETTINGS
ALTER TABLE allocation_settings 
  ADD COLUMN created_by_user_id UUID,
  ADD COLUMN created_by_email TEXT,
  ADD COLUMN updated_by_user_id UUID,
  ADD COLUMN updated_by_email TEXT;
