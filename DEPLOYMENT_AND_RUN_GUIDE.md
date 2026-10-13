# 🦁 LEO PAINTS — Run & Deployment Guide

> **E-Commerce Web Application (React + Spring Boot + PostgreSQL)**  
> **GitHub Repository:** [github.com/Budidayaswanth/eCommerce-website](https://github.com/Budidayaswanth/eCommerce-website)

---

## 📋 Table of Contents
1. [Default Seed Credentials](#default-seed-credentials)
2. [Local Development Setup](#local-development-setup)
3. [Cashfree Payment Gateway Sandbox Testing](#cashfree-payment-gateway-sandbox-testing)
4. [Backend Deployment on Render (Step-by-Step)](#backend-deployment-on-render-step-by-step)
5. [Frontend Deployment on Firebase (Step-by-Step)](#frontend-deployment-on-firebase-step-by-step)
6. [Audit Logs, Rate Limiting & Edge Case Checklist](#audit-logs-rate-limiting--edge-case-checklist)

---

## 1. Default Seed Credentials

When the backend starts up for the first time, `DataSeeder.java` automatically initializes:

| Role | Credential / Identifier | Default Value | Notes |
|---|---|---|---|
| **Admin Login** | Email | `admin@leopaints.com` | Email + Password authentication |
| **Admin Login** | Password | `Admin@123` | Password hashed with BCrypt (strength 12) |
| **Customer Login** | Mobile Phone | Any 10-digit number (e.g. `9876543210`) | Mobile OTP verification |
| **Customer OTP** | OTP Code | `123456` (Mock/Sandbox default) | Verified in 5-minute window |
| **Coupons** | `WELCOME10` | 10% discount on entire cart | Active |
| **Coupons** | `FLAT200` | Flat ₹200 discount (min order ₹1,500) | Active |
| **Coupons** | `LEO15` | 15% discount (max ₹500 cap) | Active |

---

## 2. Local Development Setup

### Prerequisites
- **Java 21 LTS**
- **Maven 3.9+** (or included `./mvnw`)
- **Node.js 18+** & npm
- **PostgreSQL 16** (or Docker PostgreSQL container)

### Step 1: Clone Repository
```bash
git clone https://github.com/Budidayaswanth/eCommerce-website.git
cd eCommerce-website
```

### Step 2: Database Initialization (PostgreSQL)
```sql
CREATE DATABASE leopaints;
```
*(Default connection configured for `jdbc:postgresql://localhost:5432/leopaints` with user `postgres` / password `postgres`)*

### Step 3: Run Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
*Backend runs on:* `http://localhost:8080`  
*Swagger API Docs:* `http://localhost:8080/swagger-ui.html`

### Step 4: Run React Frontend
```bash
cd ../frontend
npm install
npm run dev
```
*Frontend runs on:* `http://localhost:5173`

---

## 3. Cashfree Payment Gateway Sandbox Testing

### Architecture & Edge Case Handling
1. **Idempotency Key:** Every payment attempt passes a unique `x-idempotency-key` to prevent double charges.
2. **Signature Verification:** All incoming webhooks are validated using constant-time `HmacSHA256` matching against `x-webhook-timestamp + rawBody`.
3. **Pending / Orphan Recovery:** Orders in `PENDING` state reconcile automatically through polling fallback.
4. **Stock Rollback:** If payment status transitions to `FAILED` or `CANCELLED`, reserved inventory is automatically released back to stock.

### Test Cards (Cashfree Sandbox)
- **OTP for all test cards:** `111000`
- **CVV:** `123` | **Expiry:** Any future date (e.g. `12/28`)

| Card Type | Card Number | Expected Result |
|---|---|---|
| **Visa Debit** | `4706131211212123` | ✅ **Payment Success** |
| **Mastercard** | `5409162669381034` | ✅ **Payment Success** |
| **Rupay** | `6074825972083818` | ✅ **Payment Success** |
| **Failure Card** | `4012001030001112` | ❌ **Declined / Failed** |

### UPI VPA Simulator
- `testsuccess@gocash` → Instant UPI Authorization Success
- `testfailure@gocash` → Simulates UPI Failure
- `testtimeoutbank@gocash` → Simulates Bank Timeout (`PENDING` state)

---

## 4. Backend Deployment on Render (Step-by-Step)

### Step 1: Create PostgreSQL Database on Render
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** > **PostgreSQL**.
3. Name: `leopaints-db`.
4. Region: Choose closest (e.g. `Singapore` or `Frankfurt`).
5. Plan: **Free**.
6. Click **Create Database**.
7. Once created, copy the **Internal Database URL** (or External if connecting remotely).

### Step 2: Create Web Service for Spring Boot
1. Click **New +** > **Web Service**.
2. Connect your GitHub repository: `Budidayaswanth/eCommerce-website`.
3. Configure the service settings:
   - **Name:** `leopaints-api`
   - **Root Directory:** `backend`
   - **Runtime:** `Java` (or `Docker`)
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -Dserver.port=$PORT -jar target/leopaints-0.0.1-SNAPSHOT.jar`
   - **Instance Type:** `Free`

### Step 3: Configure Environment Variables on Render
Under **Environment Variables**, add the following:

```env
SPRING_PROFILES_ACTIVE=prod
DATABASE_URL=jdbc:postgresql://<RENDER_DB_HOST>:<PORT>/<DB_NAME>
DB_USERNAME=<RENDER_DB_USER>
DB_PASSWORD=<RENDER_DB_PASSWORD>
JWT_SECRET=leopaints-production-super-secret-key-at-least-256-bits-long-2026
CASHFREE_APP_ID=<YOUR_CASHFREE_APP_ID>
CASHFREE_SECRET_KEY=<YOUR_CASHFREE_SECRET_KEY>
CASHFREE_BASE_URL=https://sandbox.cashfree.com/pg
CORS_ORIGINS=https://<YOUR_FIREBASE_APP_ID>.web.app,https://<YOUR_FIREBASE_APP_ID>.firebaseapp.com
```

4. Click **Deploy Web Service**.

---

## 5. Frontend Deployment on Firebase (Step-by-Step)

### Step 1: Install Firebase CLI & Login
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Configure Environment for Production
In `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://leopaints-api.onrender.com/api
```

### Step 3: Initialize Firebase Hosting
Inside `frontend/`:
```bash
cd frontend
firebase init hosting
```
- **Select Project:** Create a new project or select an existing one (e.g. `leo-paints-ecommerce`).
- **What do you want to use as your public directory?** `dist`
- **Configure as a single-page app (rewrite all urls to /index.html)?** `Yes`
- **Set up automatic builds and deploys with GitHub?** `No` (or `Yes` if CI/CD preferred)
- **File dist/index.html already exists. Overwrite?** `No`

### Step 4: Build & Deploy
```bash
npm run build
firebase deploy --only hosting
```
Firebase will output your live URL:
`https://<YOUR_PROJECT_ID>.web.app`

---

## 6. Audit Logs, Rate Limiting & Edge Case Checklist

### 🔍 Audit Logs
Every administrative and critical order transaction automatically writes an entry to the `audit_logs` table via `AuditService`:
- Entity modified (Product, Order, Coupon, Banner, User)
- Exact action performed (`CREATE`, `UPDATE_STATUS`, `DELETE`, `REFUND`)
- Old value and New value JSON snapshots
- IP address & Timestamp
- Inspectable live in Admin Portal: `/admin/audit-logs`

### 🛡️ Rate Limiting & Throttling
- Configured using **Bucket4j**:
  - Auth endpoints (`/api/auth/**`): 10 requests / minute per IP
  - Public catalog APIs: 120 requests / minute
  - Sensitive profile updates: Protected with 6-digit OTP verification modal

### 🔄 Payment & Order Path Verification
- [x] **Happy Path:** Browse → Cart → Add Address → Cashfree Modal → Success → Order confirmed → Real-time status in dashboard
- [x] **Fail Path:** Card rejected → Order stays in checkout state → Error alert → User can change payment mode without losing cart
- [x] **Pending Path:** Slow bank response → Polling fallback ensures status syncs as soon as bank confirms
- [x] **Cancel Path:** Unpaid orders automatically expire after 30 minutes; admin can cancel and trigger Cashfree API refund
