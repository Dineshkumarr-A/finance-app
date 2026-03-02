# Personal Financial Planner

An 11-tab Indian financial planning app built with Angular 21 + Node.js/Express + PostgreSQL.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (running locally or remote)
- npm

## Setup

### 1. Database

```bash
psql -U postgres
CREATE DATABASE finance_planner;
\q
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set DB_PASSWORD to your PostgreSQL password
npm install      # already done
npm run dev      # starts on http://localhost:3000
```

### 3. Frontend

```bash
cd frontend
npm install      # already done
npx ng serve     # starts on http://localhost:4200
```

Open **http://localhost:4200** in your browser.

---

## Features (11 Tabs)

| Tab | Purpose |
|-----|---------|
| Returns & Assumptions | Configure expected returns and time-horizon asset allocation |
| Cash Flows | Monthly income vs expense → investing surplus |
| Net Worth | Consolidated assets, liabilities, net worth |
| Real Estate | Home, other property, REITs |
| Domestic Equity | Direct stocks + mutual funds by market cap |
| US Equity | S&P 500 ETF, other ETFs, US mutual funds |
| Debt | Liquid, FDs, debt funds, govt investments + SIP allocator |
| Gold | Jewellery, SGB, Gold ETF |
| Crypto | Total crypto holdings |
| Miscellaneous | ULIPs, Small Case |
| Financial Goals | 15-goal SIP planner with inflation, step-up, blended returns |

## Data Flow

```
Tab 1 (Returns) ──► Tab 11 (Goals) — blended returns drive SIP calculation
Tab 2 (Cash Flows) ──► Tab 11 — investing surplus = SIP ceiling
Tabs 4–10 (Assets) ──► Tab 3 (Net Worth) — auto-aggregated
```

## Auto-save

All changes are automatically saved to PostgreSQL (debounced 800ms). The save status is shown in the top-right corner of the toolbar.
