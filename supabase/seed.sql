-- ============================================================
-- Boshaaye Finance App — Seed Data
-- ============================================================
-- Run this AFTER 001_schema.sql


-- ============================================================
-- 1. WALLETS
-- ============================================================

INSERT INTO wallets (name, currency) VALUES
  ('Cash USD',    'USD'),
  ('Cash IQD',    'IQD'),
  ('FIB IQD',     'IQD'),
  ('QI Card IQD', 'IQD');


-- ============================================================
-- 2. CATEGORIES
-- ============================================================

INSERT INTO categories (name, type) VALUES
  -- Income
  ('Client Project',     'income'),
  ('Freelance',          'income'),
  ('Other Income',       'income'),

  -- Expense
  ('Rent',               'expense'),
  ('Utilities',          'expense'),
  ('Software & Tools',   'expense'),
  ('Marketing',          'expense'),
  ('Salaries',           'expense'),
  ('Miscellaneous Ops',  'expense'),

  -- Investment (capital coming in)
  ('Capital Injection',  'investment'),
  ('Later Investment',   'investment'),

  -- Adjustment
  ('Balance Adjustment', 'adjustment');


-- ============================================================
-- 3. DEFAULT ALLOCATION SETTINGS
-- 10% Savings | 10% Ops | 40% Harmand | 40% Bako = 100%
-- effective_from set to epoch so it applies to any date.
-- ============================================================

INSERT INTO allocation_settings (savings_pct, ops_pct, harmand_pct, bako_pct, effective_from)
VALUES (10.00, 10.00, 40.00, 40.00, '2000-01-01');
