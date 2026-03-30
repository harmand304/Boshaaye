-- ============================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- CREATE POLICIES (MVP: Authenticated Base Access)
-- ============================================================

-- Since both users are trusted admins handling a single shared 
-- state for the finance app, we authorize ALL actions strictly 
-- to users who have a valid authenticated JWT from Supabase Auth.

-- 1. WALLETS
CREATE POLICY "Allow authenticated full access to wallets" 
ON wallets FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 2. CATEGORIES
CREATE POLICY "Allow authenticated full access to categories" 
ON categories FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 3. ALLOCATION SETTINGS
CREATE POLICY "Allow authenticated full access to allocation_settings" 
ON allocation_settings FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 4. TRANSACTIONS
CREATE POLICY "Allow authenticated full access to transactions" 
ON transactions FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 5. TRANSFERS
CREATE POLICY "Allow authenticated full access to transfers" 
ON transfers FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
