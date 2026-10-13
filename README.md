# 🦁 LEO PAINTS — Full-Stack E-Commerce Platform

[![Java](https://img.shields.io/badge/Java-21%20LTS-ED8B00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.5-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4.10-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Cashfree](https://img.shields.io/badge/Payment-Cashfree%20PG%20v2-8A2BE2)](https://www.cashfree.com/)

A modern, production-grade e-commerce web platform for **LEO PAINTS** built with **React 18**, **Spring Boot 3.3 (Java 21)**, **PostgreSQL 16**, and **Cashfree Payment Gateway**.

---

## 🎨 Brand Identity & UI/UX Highlights
- **Color Palette**: Deep Royal Navy (`#1A237E`), Imperial Gold (`#FFD700`), and Crimson Red (`#C62828`).
- **Sidebar Architecture**: Fixed, non-moving desktop sidebar (260px) — only the main content viewport scrolls.
- **Mobile First**: Bottom navigation bar (4 tabs), responsive touch swipers, and slide-over menu for small screens.
- **Visual Paint Tools**:
  - **Interactive Paint Calculator**: Computes room square footage, door/window deductions, recommended liters, can count, and cost.
  - **Color Swatches & Finish Filter**: Live sheen badges (Matte, Satin, Gloss, Semi-Gloss) and shade picker.
  - **Smart Product Cards**: Displays 1:1 photography, Selling Price (bold), Listing Price (strikethrough MRP), discount badge (`-25% OFF`), quick-add to cart, and wishlist heart.

---

## 🏛️ System Architecture

```
                    ┌─────────────────────────────────────────┐
                    │      React 18 + Vite Frontend           │
                    │   (Firebase Hosting / Port 5173)        │
                    └──────────────┬──────────────────────────┘
                                   │  REST APIs / JWT / WebSocket
                                   ▼
                    ┌─────────────────────────────────────────┐
                    │     Spring Boot 3.3.5 Backend           │
                    │      (Render / Port 8080)               │
                    └──────┬───────────────┬──────────────────┘
                           │               │
                 JPA / SQL │               │ HTTP / Webhooks
                           ▼               ▼
          ┌───────────────────────┐   ┌───────────────────────────┐
          │  PostgreSQL 16 DB     │   │  Cashfree Payment Gateway │
          │  (Tables, ERD, Audit) │   │  (Idempotency, HMAC SHA)  │
          └───────────────────────┘   └───────────────────────────┘
```

---

## 📦 Features & Modules

### 1. Authentication & Security
- **Customer Login**: Mobile OTP login (mock sandbox code `123456`) with 6-digit individual inputs and resend cooldown.
- **Admin Login**: Secure Email & Password login (`admin@leopaints.com` / `Admin@123`) with BCrypt (strength 12).
- **OTP Protection Modal**: Reusable OTP popup required before editing customer mobile or profile details.
- **Stateless JWT**: Access Tokens (15 min) + Refresh Tokens (7 days) with HTTP Authorization Bearer headers.
- **Rate Limiting**: Classic Token Bucket via **Bucket4j** (5 req/hour for OTP).

### 2. Product Catalog & Shopping Experience
- **Explore & Filter**: Filter by category, paint finish, paint type (Interior/Exterior), color, price range, and rating.
- **Debounced Search**: 500ms debounce with instant autocomplete suggestions.
- **Slide-in Cart Drawer**: Real-time item quantity adjustment, coupon code entry, and free delivery thresholds.
- **Wishlist**: Save favorite shades with one-click transfer to cart.

### 3. Cashfree Payment Gateway & Edge Cases
- **Modal Checkout**: In-page modal with fallback to self-redirect.
- **HMAC-SHA256 Signature Verification**: Validates `x-webhook-timestamp + rawBody` against secret key with constant-time equality.
- **Edge Cases Handled**:
  - 🔄 **Idempotent Webhooks**: Avoids duplicate order fulfillment on retried webhooks.
  - 🛑 **Stock Rollback**: Auto-releases reserved stock if payment fails or expires.
  - ⏱️ **Auto-Reconciliation**: Polling fallback resolves bank callback timeouts (`PENDING` state).
  - 🎟️ **Coupon Rollback**: Restores promo code usage limits if transaction is cancelled.

### 4. Admin Management Console (`/admin`)
- **Dashboard**: KPI summary cards, Chart.js 30-day revenue analytics, low stock alerts.
- **Product Management**: Full CRUD with image attachments, slug auto-generation, and stock counters.
- **Order Management**: Status workflow (`PLACED` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`).
- **Coupons & Banners**: Create, edit, and toggle active promotions (`WELCOME10`, `FLAT200`, `LEO15`).
- **Audit Logs**: Full audit trail recording entity, action, actor, IP address, and JSON diffs.
- **Review Moderation**: Approve or reject customer reviews before they appear publicly.
- **Live Helpdesk**: Customer inquiries and auto-response bot with intent matching.

---

## 🚀 Quick Start Guide

### 1. Backend Setup
```bash
cd backend
mvn clean package -DskipTests
java -jar target/leopaints-0.0.1-SNAPSHOT.jar
```
*API Base URL*: `http://localhost:8080/api`  
*Swagger Documentation*: `http://localhost:8080/swagger-ui.html`

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Web App URL*: `http://localhost:5173`

---

## 🌐 Deployment Instructions

Refer to the complete guide in [DEPLOYMENT_AND_RUN_GUIDE.md](DEPLOYMENT_AND_RUN_GUIDE.md) for:
1. **Render**: Deploying Spring Boot web service with Render PostgreSQL.
2. **Firebase Hosting**: Deploying single-page React app with rewrite rules.
3. **Cashfree Sandbox Credentials**: Test cards and UPI VPAs.

---

## 👥 Seed Credentials

| Role | Username / Identifier | Password / Code |
|---|---|---|
| **Admin** | `admin@leopaints.com` | `Admin@123` |
| **User** | Any 10-digit mobile number | `123456` (Mock OTP) |

---

## 📄 License
MIT © 2026 LEO PAINTS.
