# Suelto Retail POS — Enterprise MERN Point-of-Sale System

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-v4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20ReplicaSet-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-v5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/Tests-19%2F19%20Passing-brightgreen)]()

A high-reliability, transactionally sound Point-of-Sale (POS) and inventory management platform built with the MERN stack (MongoDB, Express, React, Node.js). Designed specifically for retail grocery and convenience store environments, Suelto POS emphasizes financial correctness, multi-document atomic inventory locking, sub-millisecond barcode scanning, and shift reconciliation.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Key Engineering Highlights](#key-engineering-highlights)
3. [Feature Overview](#feature-overview)
4. [Tech Stack](#tech-stack)
5. [Prerequisites](#prerequisites)
6. [Simple Local Setup (No Docker)](#simple-local-setup-no-docker)
7. [Environment Variables](#environment-variables)
8. [Safe Demo Environment & Seeder](#safe-demo-environment--seeder)
9. [Recruiter & Evaluator Guided Tour](#recruiter--evaluator-guided-tour)
10. [Automated Testing](#automated-testing)
11. [Production Deployment Guide (No Docker)](#production-deployment-guide-no-docker)
12. [Security Architecture](#security-architecture)
13. [Folder Structure](#folder-structure)

---

## System Architecture

The application adopts a decoupled client-server architecture deployed on serverless and managed cloud infrastructure without container virtualization overhead.

```mermaid
flowchart TD
    subgraph Client["Frontend (Vercel SPA)"]
        UI["React 18 + Vite + Tailwind CSS"]
        Scanner["Barcode Scanner / Hotkey Listener (F2, F9, /)"]
        State["Client Cashier & Cart State"]
    end

    subgraph Backend["API Server (Render / Railway / Node.js)"]
        Router["Express Router (REST Endpoints)"]
        Auth["JWT & Role Authorization Guard (Owner/Manager/Cashier)"]
        Calc["Server Financial Engine (Integer Cents Math)"]
        Idem["Idempotency Gate (Duplicate Sale Prevention)"]
        Audit["Audit Logger & Movement Ledger"]
    end

    subgraph Database["Database (MongoDB Atlas Replica Set)"]
        Tx["Multi-Document Transaction (session.withTransaction)"]
        Products[("Products Collection ($gte stock lock)")]
        Transactions[("Transactions Collection")]
        Movements[("Stock Movements Ledger")]
        Shifts[("Cashier Shifts & Floats")]
    end

    UI -->|HTTPS / JSON with Idempotency-Key| Router
    Router --> Auth
    Auth --> Idem
    Idem --> Calc
    Calc --> Tx
    Tx -->|Atomic Increment -qty| Products
    Tx -->|Persist Order| Transactions
    Tx -->|Audit Log| Movements
    Tx -->|Register Reconciliation| Shifts
```

---

## Key Engineering Highlights

### 1. Atomic Multi-Document Checkout (`session.withTransaction`)
Checkout transactions write to the sales ledger, update inventory, deduct coupon limits, and record stock movements inside an atomic MongoDB transaction. 
- Stock deduction enforces `{ _id: productId, stock: { $gte: quantity } }`. If concurrent checkout attempts exceed available inventory, the transaction aborts and returns an `HTTP 409 Conflict`, completely preventing negative stock.
- Requires MongoDB Replica Set (standard on MongoDB Atlas M0+ free clusters).

### 2. Client-Tamper Proof Financial Calculations
All subtotals, VAT calculations, line-item percentage discounts, fixed-amount promotional vouchers, and customer cash change calculations are recomputed strictly on the server:
- Prices in the client request are ignored; pricing is fetched directly from the database within the transaction.
- Currency is processed using integer cents precision (`toCents` / `fromCents`) with single-point round-half-up boundaries, eliminating JavaScript IEEE-754 floating-point drift (e.g. `0.1 + 0.2 = 0.30000000000000004`).

### 3. Idempotent Order Dispatch
High-speed checkout registers generate unique idempotency keys per cart mutation:
- Prevents double-charging if a cashier double-taps the cash drawer button or network latency causes a retry.
- Repeated requests with the same key immediately return the already committed sale record without duplicate inventory deductions.

### 4. High-Performance Dashboard Aggregation (`$facet`)
Dashboard metrics (daily revenue, weekly sales, net returns, low stock alerts, cashier volume) are computed using single-pass MongoDB aggregation pipelines rather than loading thousands of unindexed documents into Node.js memory.

### 5. Cashier Workflow Optimizations
- **Dual Mode UI**: Cashiers can scan items via USB/Bluetooth barcode readers or browse the visual quick-select card grid with category pills.
- **Keyboard-First Controls**: `F2` or `/` focuses the barcode reader; `F9` navigates to tender checkout; `[Enter]` confirms cash tender and prints thermal receipts.
- **Auto-Refocus & Cart Persistence**: Scanner input fields automatically reclaim focus after closing dialogs, minimizing mouse interactions during retail rushes.

---

## Feature Overview

| Module | Features & Capabilities |
| :--- | :--- |
| **Point of Sale (POS)** | Barcode reader autofocus, quick-cash tender buttons (PHP ₱20, ₱50, ₱100, ₱500, ₱1000), split tender (Cash / GCash / Card), coupon validation, change calculator, thermal receipt generation. |
| **Inventory Control** | Stock tracking, low-stock threshold alerts, FIFO stock adjustment types (`receiving`, `adjustment`, `cycle_count`, `wastage`, `sale`), purchase order Excel exports. |
| **Product Management** | SKU / Barcode indexing, gross profit margin calculation, multi-image Cloudinary upload, category organization, supplier linking. |
| **Shift Reconciliation** | Cash drawer floats, starting balance, expected tender totals, actual counted drawer entry, automatic over/short variance logging. |
| **Returns & Refunds** | Full and partial item returns, condition inspection (`resellable` vs `damaged`), automatic restocking, revenue adjustment. |
| **Analytics & Reports** | Real-time gross and net revenue, average transaction value (ATV), top selling items, inventory movement audit trail, cashier performance. |
| **Security & RBAC** | JWT authentication, role guards (`owner`, `manager`, `cashier`, `supervisor`), Helmet HTTP security headers, CORS origin whitelisting, rate limiting. |

---

## Tech Stack

- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide / React Icons, Recharts, Material-UI & Ant Design components.
- **Backend**: Node.js 18+, Express 4.21, Mongoose 8.8, JWT, Helmet, Express Rate Limit, PDFKit.
- **Database**: MongoDB 6+ (Replica Set required for transactions; MongoDB Atlas recommended).
- **Deployment (No Docker)**: Vercel (Frontend SPA) + Render / Railway (Backend API).

---

## Prerequisites

Before running the project locally, ensure you have:
1. **Node.js**: `v18.0.0` or higher ([Download Node.js](https://nodejs.org/)).
2. **npm**: `v9.0.0` or higher (packaged with Node.js).
3. **MongoDB**: A running MongoDB instance with **Replica Set support**:
   - **Recommended**: Free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) M0 sandbox cluster (replica sets are enabled automatically).
   - **Alternative Local**: Local MongoDB running with replica set enabled (`mongod --replSet rs0`).

---

## Simple Local Setup (No Docker)

### Step 1: Clone the Repository
```bash
git clone https://github.com/your-username/mern-pos-system.git
cd mern-pos-system
```

### Step 2: Install Dependencies
Run the installation script from the root directory to install both server and client dependencies:
```bash
# Using root convenience script:
npm run install:all

# Or manually:
npm install --prefix server
npm install --prefix client
```

### Step 3: Configure Environment Variables
Copy the provided environment templates:

**Server Configuration:**
```bash
cp server/.env.example server/.env
```
Open `server/.env` and supply your database connection string and secrets:
```env
PORT=8001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/pos_dev?retryWrites=true&w=majority
JWT_SECRET_KEY=super_secure_random_dev_secret_key_32_characters_long
SESSION_SECRET=session_secret_key_32_chars_long
CLIENT_URL=http://localhost:3000,http://localhost:5173
NODE_ENV=development
ALLOW_DEMO_SEED=true
```

**Client Configuration:**
```bash
cp client/.env.example client/.env
```
Ensure `client/.env` points to the local backend port:
```env
VITE_API_URL=http://localhost:8001
VITE_CLOUDINARY_CLOUD_NAME=demo_store
VITE_CLOUDINARY_UPLOAD_PRESET=demo_uploads
```

### Step 4: Populate Synthetic Demo Data
Seed the database with realistic retail products, suppliers, coupons, and historical transactions:
```bash
# From project root:
npm run seed:demo

# Or targeting a specific MongoDB URI:
node server/scripts/seed-demo.js --demo --uri="mongodb://localhost:27017/pos_demo?replicaSet=rs0"
```

### Step 5: Start the Development Servers
In two separate terminals:

**Terminal 1 — Backend API:**
```bash
npm run dev:server
# Server starts on http://localhost:8001
```

**Terminal 2 — Frontend Application:**
```bash
npm run dev:client
# Vite client starts on http://localhost:3000 (or http://localhost:5173)
```

Visit **`http://localhost:3000`** in your browser.

---

## Environment Variables

### Backend (`server/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port for Express | `8001` |
| `MONGODB_URI` | MongoDB connection URI (**replica set required**) | `mongodb+srv://user:pass@cluster.mongodb.net/pos` |
| `JWT_SECRET_KEY` | Secret key for signing authorization tokens | Random 32+ character string |
| `SESSION_SECRET` | Express session / signature secret | Random 32+ character string |
| `CLIENT_URL` | Allowed CORS origins (comma-separated for multi-domain) | `http://localhost:3000,https://mypos.vercel.app` |
| `NODE_ENV` | Runtime environment (`development`, `production`, `test`) | `development` |
| `ALLOW_DEMO_SEED`| Guard protecting against unintended seed runs | `true` (dev) / `false` (prod) |

### Frontend (`client/.env`)
| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:8001` |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for product image CDN | `demo_cloud` |
| `VITE_CLOUDINARY_UPLOAD_PRESET`| Unsigned Cloudinary upload preset | `demo_preset` |

> [!WARNING]
> **Client Security Rule**: Vite exposes any variable prefixed with `VITE_` to the public browser bundle. Never put database credentials, email passwords, JWT secrets, or private Cloudinary API secrets in `client/.env`.

---

## Safe Demo Environment & Seeder

The demo seeder (`server/scripts/seed-demo.js`) is designed specifically for evaluator demonstrations and integration testing:
- **Production Guardrails**: Refuses execution if `NODE_ENV=production` unless explicit override flags are provided. Rejects databases containing `prod`, `production`, or `live` in their names.
- **Zero Sensitive Data**: All demo records use synthetic `@sueltopos.demo` email addresses and mock names.
- **Pre-populated Datasets**:
  - 4 Pre-configured RBAC roles (Owner, Manager, Supervisor, Cashier).
  - 11 Philippine retail grocery products with barcodes, cost prices, selling prices, and category tags.
  - Realistic stock levels: healthy stock, low stock alert item (*Kopiko Blanca*), and out-of-stock item (*Red Bull*).
  - Active coupons (`WELCOME10` for 10% off, `SAVE50` for ₱50 fixed discount).
  - 7 Days of realistic transaction history powering live dashboard sales curves.
  - An open cashier shift on `register-01`.

### Demo User Credentials

| Role | Email | PIN / Password | Permissions & Scope |
| :--- | :--- | :--- | :--- |
| **Store Owner** | `owner@sueltopos.demo` | `123456` | Full system access, audit logs, user management, financials. |
| **Store Manager**| `manager@sueltopos.demo`| `123456` | Inventory management, purchasing, returns, cashier shift audit. |
| **Cashier** | `cashier@sueltopos.demo`| `123456` | Scan & checkout register, shift opening/closing, receipt generation. |

---

## Recruiter & Evaluator Guided Tour

Follow this 10-step walkthrough to test the core operational and technical capabilities:

1. **Sign In**: Navigate to `http://localhost:3000/login`. Select the **Cashier** role and log in with PIN `123456`.
2. **Open Register**: If prompted, verify the shift status on `register-01` with an opening float of ₱1,000.00.
3. **Scan or Select Products**: On the Point of Sale screen, tap category pills (`Beverages`, `Snacks`) or type barcode `4800016644808` (Lucky Me Instant Pancit Canton). Observe immediate line-item calculation.
4. **Apply Promotion**: In the discount coupon input, enter `WELCOME10` and click Apply. Confirm 10% discount deduction.
5. **Fast Tender Checkout**: Press `F9` or click **Proceed to Payment**. Enter cash tender or click the ₱500 quick cash button.
6. **Receipt & Idempotency**: Confirm the transaction. Observe calculated change due and the thermal receipt preview. Press `[Enter]` to trigger a fresh sale.
7. **Inventory Deduction Verification**: Log out and sign in as **Store Manager** (`manager@sueltopos.demo` / `123456`). Go to **Inventory Control**; confirm that the purchased items had their stock decremented and a `sale` movement record logged.
8. **Low Stock Detection**: Inspect the low stock indicators. Observe that *Kopiko Blanca* is flagged for reorder. Click **Export Purchase Order** to generate an Excel restock manifest.
9. **Executive Analytics**: Log in as **Store Owner** (`owner@sueltopos.demo`). Visit the **Dashboard**; view net revenue, transaction count, average order value, and the 7-day revenue trend generated from persisted transaction aggregations.
10. **Shift Reconciliation**: Navigate to **Reports > Reconciliation**. Inspect cashier shift performance, cash tenders, GCash electronic collections, and drawer variance.

---

## Automated Testing

The backend test suite verifies financial math, stock boundaries, sanitization, role guards, and analytics calculations without requiring an active database connection:

```bash
# Run backend tests from root:
npm test

# Or run directly inside server directory:
npm test --prefix server
```

### Test Coverage Highlights
- `toCents` / `fromCents` floating-point edge cases and single-point rounding.
- Net revenue computation excluding voided, cancelled, and refunded transactions.
- Zero-transaction ATV fallback preventing `NaN` or `null` errors.
- Role authorization middleware validation (`requireRoles` matrix).
- Input validators: rejects negative prices, fractional retail units, and script injections.

---

## Production Deployment Guide (No Docker)

### Architecture
- **Frontend**: Hosted on [Vercel](https://vercel.com/) as a static Single Page Application (SPA).
- **Backend**: Hosted on [Render](https://render.com/) or [Railway](https://railway.app/) as a Node.js web service.
- **Database**: Hosted on [MongoDB Atlas](https://www.mongodb.com/atlas) (Free M0 replica set cluster).

---

### Step 1: Deploy MongoDB on Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://cloud.mongodb.com/).
2. Under **Network Access**, add `0.0.0.0/0` (or your backend provider's IP range).
3. Under **Database Access**, create a database user and record the credentials.
4. Retrieve the SRV connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/pos_production?retryWrites=true&w=majority
   ```

---

### Step 2: Deploy Backend to Render or Railway

#### On Render:
1. Click **New + > Web Service**.
2. Connect your Git repository.
3. Set the following build and start parameters:
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables**:
   - `PORT`: `10000` (Render will inject its own port)
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET_KEY`: High-entropy 32+ character random string
   - `SESSION_SECRET`: High-entropy 32+ character random string
   - `NODE_ENV`: `production`
   - `ALLOW_DEMO_SEED`: `false`
   - `CLIENT_URL`: Your Vercel frontend URL (e.g. `https://my-pos-store.vercel.app`)
5. Click **Create Web Service** and note your service URL (e.g. `https://my-pos-api.onrender.com`).

---

### Step 3: Deploy Frontend to Vercel
1. In the [Vercel Dashboard](https://vercel.com/), click **Add New > Project**.
2. Import your Git repository.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_URL`: Your live backend URL from Step 2 (e.g. `https://my-pos-api.onrender.com`)
   - `VITE_CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `VITE_CLOUDINARY_UPLOAD_PRESET`: Your Cloudinary unsigned upload preset
5. Deploy! Vercel will automatically read `client/vercel.json` for SPA rewrites (`/(.*) -> /index.html`) and cache static assets.

---

## Security Architecture

- **Zero Client Secrets**: All sensitive credentials (`JWT_SECRET_KEY`, `EMAIL_PASS`, `MONGODB_URI`, private API keys) remain exclusively on the server.
- **Role-Based Access Control (RBAC)**: Backend endpoints verify JWT claims against an explicit permission matrix; cashier tokens cannot execute inventory deletions, price modifications, or user escalations.
- **Rate Limiting**: Express rate limiters protect authentication endpoints against brute-force password and PIN guessing.
- **Graceful Shutdown**: The Node.js HTTP server traps `SIGTERM` and `SIGINT` signals, draining in-flight checkout transactions and closing database sockets before terminating.
- **HTTP Security Headers**: Powered by `helmet`, enforcing `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, and strict referrer policies.

---

## Folder Structure

```
mern-pos-system/
├── package.json             # Root repository convenience scripts
├── README.md                # Comprehensive system documentation
├── .gitignore               # Multi-tier secret and build artifact exclusion
│
├── client/                  # Vite + React 18 Frontend
│   ├── .env.example         # Client public environment template
│   ├── vercel.json          # Vercel SPA routing and cache headers
│   ├── vite.config.js       # Vite configuration
│   ├── package.json         # Frontend dependencies and scripts
│   └── src/
│       ├── components/      # UI components (ScanPage, PaymentPage, Dashboard, etc.)
│       ├── context/         # Auth, Cart, and System state providers
│       └── utils/           # API fetch helpers and formatters
│
└── server/                  # Express + Node.js Backend API
    ├── .env.example         # Server private environment template
    ├── server.js            # Express server entry point, CORS & shutdown
    ├── db.js                # Mongoose connection manager
    ├── package.json         # Backend dependencies, scripts & test runner
    ├── Controller/          # Business logic (checkout, inventory, analytics)
    ├── Models/              # Mongoose schemas (Product, Transaction, Shift, etc.)
    ├── Routes/              # REST API endpoint definitions
    ├── Middleware/          # Auth guards, role checks, upload handlers
    ├── scripts/             # Safe demo seeder (seed-demo.js) & migrations
    └── tests/               # Automated unit tests (Node.js test runner)
```

---

## License

This project is licensed under the ISC License. Designed for commercial retail operations and technical portfolio demonstrations.

