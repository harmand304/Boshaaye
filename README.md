# Boshaaye Finance App

A premium, server-side rendered financial management application built thoughtfully with Next.js 16 (App Router), Tailwind CSS v4, and Supabase.

## Features
- **Dashboard**: Real-time budget tracking and computed wallet balances.
- **Transactions & Transfers**: Track income, expenses, investments, and wallet transfers with historical immutability via Allocation Snapshotting.
- **Settings**: Automated rules to split incoming revenue into structured budgets. 
- **CSV Exports**: Export transactions, transfers, and historical allocation settings in one click.

---

## 🚀 Local Setup

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Rename `.env.example` to `.env.local` (or create one) and add your Supabase connection strings:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_ANON_KEY>
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase Setup

This app uses Supabase for a PostgreSQL database. 

1. Create a new project in [Supabase](https://supabase.com).
2. Go to the SQL Editor in your Supabase Dashboard.
3. Run the schema file included in the `/supabase` folder:
   - Copy the contents of `supabase/migrations/001_schema.sql` and run it. This will create the `wallets`, `categories`, `allocation_settings`, `transactions`, and `transfers` tables.
4. (Optional) Run `supabase/migrations/002_seed.sql` to populate the database with default categories, wallets, and dummy data.
5. Grab your **Project URL** and **anon public key** from the Project Settings > API page and place them in your `.env.local` file.

---

## 🌐 Deployment to Vercel

The application is fully production-ready and optimized for Vercel.

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Go to [Vercel](https://vercel.com) and click **Add New... > Project**.
3. Import your repository. Vercel will auto-detect the Next.js framework.
4. In the **Environment Variables** section, add your Supabase credentials EXACTLY as they appear in your local setup:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**. Vercel will build and publish your app.

---

## 📊 CSV Export feature
The application includes a built-in CSV export for all core entities:
* `/api/export/transactions`
* `/api/export/transfers`
* `/api/export/settings`

The "Export CSV" buttons found on the Transactions, Transfers, and Settings pages directly interface with these optimized API routes to download complete histories natively.
