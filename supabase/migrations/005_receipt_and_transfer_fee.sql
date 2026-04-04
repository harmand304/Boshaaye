-- ============================================================
-- Boshaaye Finance — Migration 005
-- Add receipt upload fields to transactions
-- Add transfer fee fields to transfers
-- Add "Bank / Transfer Fees" default category
-- ============================================================

-- 1. Receipt metadata on transactions (all nullable — receipt is optional)
ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS receipt_url        TEXT,
  ADD COLUMN IF NOT EXISTS receipt_file_name  TEXT,
  ADD COLUMN IF NOT EXISTS receipt_mime_type  TEXT,
  ADD COLUMN IF NOT EXISTS receipt_uploaded_at TIMESTAMPTZ;

-- 2. Transfer fee fields on transfers
ALTER TABLE transfers
  ADD COLUMN IF NOT EXISTS fee_amount         NUMERIC(18,2) CHECK (fee_amount IS NULL OR fee_amount > 0),
  ADD COLUMN IF NOT EXISTS fee_category_id    UUID REFERENCES categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS fee_funding_source TEXT CHECK (fee_funding_source IN ('main_budget', 'ops_box')),
  ADD COLUMN IF NOT EXISTS fee_transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;

-- 3. Add default "Bank / Transfer Fees" expense category if it doesn't exist
INSERT INTO categories (name, type)
VALUES ('Bank / Transfer Fees', 'expense')
ON CONFLICT (name) DO NOTHING;
