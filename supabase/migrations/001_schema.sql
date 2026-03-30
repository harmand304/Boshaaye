-- ============================================================
-- Boshaaye Finance App — Database Schema
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ============================================================
-- 1. WALLETS
-- No balance column — balances are computed from transactions
-- and transfers at query time.
-- ============================================================

CREATE TABLE wallets (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  currency   text        NOT NULL CHECK (currency IN ('USD', 'IQD')),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 2. CATEGORIES
-- type must match one of the 4 transaction types.
-- 'transfer' is intentionally excluded — wallet-to-wallet
-- moves live in the transfers table, not transactions.
-- ============================================================

CREATE TABLE categories (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL UNIQUE,
  type       text        NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'adjustment')),
  created_at timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 3. ALLOCATION SETTINGS
-- Never UPDATE rows — always INSERT a new row when percentages
-- change. The row with the latest effective_from <= transaction
-- date is used when snapshotting a client income.
-- The four percentages must always sum to 100.
-- ============================================================

CREATE TABLE allocation_settings (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  savings_pct    numeric(5,2) NOT NULL CHECK (savings_pct  >= 0 AND savings_pct  <= 100),
  ops_pct        numeric(5,2) NOT NULL CHECK (ops_pct      >= 0 AND ops_pct      <= 100),
  harmand_pct    numeric(5,2) NOT NULL CHECK (harmand_pct  >= 0 AND harmand_pct  <= 100),
  bako_pct       numeric(5,2) NOT NULL CHECK (bako_pct     >= 0 AND bako_pct     <= 100),
  -- Ensure all four always add up to exactly 100
  CONSTRAINT allocation_sums_to_100
    CHECK (savings_pct + ops_pct + harmand_pct + bako_pct = 100),
  effective_from date         NOT NULL DEFAULT CURRENT_DATE,
  created_at     timestamptz  NOT NULL DEFAULT now()
);


-- ============================================================
-- 4. TRANSACTIONS
-- Core ledger table for income, expense, investment,
-- and adjustment entries.
--
-- Allocation snapshot columns (alloc_*) are only populated
-- when is_client_income = true. They freeze the percentages
-- and computed amounts at the time of entry so future
-- settings changes never alter historical records.
-- ============================================================

CREATE TABLE transactions (
  id                     uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  date                   date         NOT NULL,
  type                   text         NOT NULL CHECK (type IN ('income', 'expense', 'investment', 'adjustment')),
  title                  text         NOT NULL,
  amount                 numeric(18,2) NOT NULL CHECK (amount > 0),
  currency               text         NOT NULL CHECK (currency IN ('USD', 'IQD')),
  wallet_id              uuid         NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  category_id            uuid         REFERENCES categories(id) ON DELETE SET NULL,
  notes                  text,

  -- Client income flag
  is_client_income       boolean      NOT NULL DEFAULT false,

  -- Only relevant when type = 'expense'
  -- 'ops_box'     → reduces Ops Box AND Main Budget
  -- 'main_budget' → reduces Main Budget only
  expense_funding_source text         CHECK (expense_funding_source IN ('ops_box', 'main_budget')),

  -- Allocation snapshot — populated only when is_client_income = true
  alloc_savings_pct      numeric(5,2),
  alloc_ops_pct          numeric(5,2),
  alloc_harmand_pct      numeric(5,2),
  alloc_bako_pct         numeric(5,2),
  alloc_savings_amount   numeric(18,2),
  alloc_ops_amount       numeric(18,2),
  alloc_harmand_amount   numeric(18,2),
  alloc_bako_amount      numeric(18,2),

  created_at             timestamptz  NOT NULL DEFAULT now(),

  -- Expenses must declare their funding source
  CONSTRAINT expense_requires_funding_source
    CHECK (type != 'expense' OR expense_funding_source IS NOT NULL),

  -- Allocation snapshot must be fully present or fully absent
  CONSTRAINT alloc_snapshot_all_or_none
    CHECK (
      (is_client_income = false)
      OR (
        alloc_savings_pct    IS NOT NULL AND
        alloc_ops_pct        IS NOT NULL AND
        alloc_harmand_pct    IS NOT NULL AND
        alloc_bako_pct       IS NOT NULL AND
        alloc_savings_amount IS NOT NULL AND
        alloc_ops_amount     IS NOT NULL AND
        alloc_harmand_amount IS NOT NULL AND
        alloc_bako_amount    IS NOT NULL
      )
    ),

  -- is_client_income only makes sense on income transactions
  CONSTRAINT client_income_only_on_income
    CHECK (is_client_income = false OR type = 'income')
);

-- Indexes for common filter patterns
CREATE INDEX idx_transactions_date       ON transactions(date DESC);
CREATE INDEX idx_transactions_type       ON transactions(type);
CREATE INDEX idx_transactions_currency   ON transactions(currency);
CREATE INDEX idx_transactions_wallet_id  ON transactions(wallet_id);


-- ============================================================
-- 5. TRANSFERS
-- Wallet-to-wallet movements. Both wallets must share the
-- same currency — enforced by the CHECK constraint below
-- using a foreign-key join workaround via a check function.
--
-- Note: Postgres CHECK constraints cannot reference other
-- tables directly. Same-currency enforcement is done via
-- a trigger instead (see below).
-- ============================================================

CREATE TABLE transfers (
  id             uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  date           date         NOT NULL,
  from_wallet_id uuid         NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  to_wallet_id   uuid         NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
  amount         numeric(18,2) NOT NULL CHECK (amount > 0),
  currency       text         NOT NULL CHECK (currency IN ('USD', 'IQD')),
  notes          text,
  created_at     timestamptz  NOT NULL DEFAULT now(),

  -- Cannot transfer to the same wallet
  CONSTRAINT transfer_wallets_must_differ
    CHECK (from_wallet_id != to_wallet_id)
);

CREATE INDEX idx_transfers_date          ON transfers(date DESC);
CREATE INDEX idx_transfers_from_wallet   ON transfers(from_wallet_id);
CREATE INDEX idx_transfers_to_wallet     ON transfers(to_wallet_id);


-- ============================================================
-- TRIGGER: enforce same-currency transfers
-- Runs before INSERT (and UPDATE) on transfers.
-- Raises an exception if either wallet's currency differs
-- from the transfer's declared currency.
-- ============================================================

CREATE OR REPLACE FUNCTION check_transfer_currency()
RETURNS TRIGGER AS $$
DECLARE
  from_currency text;
  to_currency   text;
BEGIN
  SELECT currency INTO from_currency FROM wallets WHERE id = NEW.from_wallet_id;
  SELECT currency INTO to_currency   FROM wallets WHERE id = NEW.to_wallet_id;

  IF from_currency != NEW.currency THEN
    RAISE EXCEPTION 'Source wallet currency (%) does not match transfer currency (%)',
      from_currency, NEW.currency;
  END IF;

  IF to_currency != NEW.currency THEN
    RAISE EXCEPTION 'Destination wallet currency (%) does not match transfer currency (%)',
      to_currency, NEW.currency;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_transfer_currency_check
  BEFORE INSERT OR UPDATE ON transfers
  FOR EACH ROW EXECUTE FUNCTION check_transfer_currency();
