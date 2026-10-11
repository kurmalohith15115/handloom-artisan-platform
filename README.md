# Handloom Artisan Support Platform — Marketplace for Handloom & Traditional Indian Handicrafts

An end-to-end, full-stack marketplace connecting traditional Indian handloom weavers and handicraft creators directly with conscious patrons worldwide. Built with separate Admin, Artisan, and Customer portals, bilingual (English & Telugu) interface support, verified Geographical Indication (GI) craft taxonomies, and Razorpay payment integration.

---

## 1. System Architecture & Tech Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | React 19, Vite, Vanilla CSS (Design Tokens System), React Router v7 |
| **Backend** | Node.js, Express.js REST API |
| **Database** | MongoDB Atlas with Mongoose ODM (Indexes, Constraints, Soft Deletes) |
| **Authentication** | Bcrypt password hashing, JWT authorization, Strict Role Separation |
| **Payments** | Razorpay SDK (Test Sandbox with simulated fallback & Live switch) |
| **Localization** | Custom i18n Architecture with English (`en`) & Telugu (`te`) Dictionaries |
| **Testing** | Vitest, Supertest, MongoDB-Memory-Server |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database), Git & GitHub |

---

## 2. Three Distinct Login & Dashboard Portals

Public registration **never** grants administrator access. Each role is strictly isolated:

### A. Customer Portal
- **Login Route:** `/login`
- **Registration Route:** `/register`
- **Account Dashboard:** `/account`
- **Capabilities:** Browse catalogue, filter by craft/region, add to persistent cart, manage multiple shipping addresses, checkout via Razorpay, track real-time delivery timelines, cancel eligible orders, write reviews for purchased items.

### B. Artisan Portal
- **Login Route:** `/artisan/login`
- **Registration Route:** `/artisan/register`
- **Artisan Studio:** `/artisan/dashboard`
- **Capabilities:** Register with craft tradition, location, and craft story; view application status (*pending*, *approved*, *rejected*); list products with images, dimensions, material, and stock; receive incoming orders; update fulfillment stages (*Processing* → *Shipped* → *Out for Delivery* → *Delivered*) with courier tracking; view earnings and customer reviews.
- *Security Enforcement:* Artisans can only edit their own products and orders. Artisans cannot alter payment status.

### C. Administrator Console
- **Login Route:** `/admin/login`
- **Dashboard:** `/admin/dashboard`
- **Capabilities:** Real-time metrics overview (Revenue, Orders, Artisans, Products); review, approve, reject (with reason) or suspend artisan applications; user management (active/suspended toggle); product moderation (approve/reject, feature on homepage); order oversight across all sellers; category taxonomy management; review moderation; immutable audit logs.
- *Bootstrap Security:* Admins are created exclusively via the server-side CLI bootstrap script.

---

## 3. Project Structure

```
handloom-artisan-platform/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection, env validation, Razorpay SDK
│   │   ├── controllers/     # Auth, Products, Artisans, Orders, Payments, Admin, etc.
│   │   ├── middleware/      # JWT auth, role guard, rate limiting, error handler, multer
│   │   ├── models/          # 12 Mongoose Models (User, Product, Order, Payment, AuditLog...)
│   │   ├── routes/          # REST endpoints
│   │   ├── scripts/         # bootstrapAdmin.js, seedData.js
│   │   ├── tests/           # Vitest integration test suites
│   │   ├── app.js           # Express application setup
│   │   └── server.js        # Server listener and graceful shutdown
│   ├── uploads/             # Static file upload destination
│   ├── .env.example         # Template backend environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProductCard, ArtisanCard, ProtectedRoute, Modal...
│   │   ├── context/         # AuthContext, CartContext, LanguageContext
│   │   ├── locales/         # en.json (English), te.json (Telugu)
│   │   ├── pages/           # Home, AllProducts, ProductDetails, Checkout, Dashboards...
│   │   ├── services/        # Centralized fetch API wrapper
│   │   ├── styles/          # Design tokens and responsive styles
│   │   ├── App.jsx          # Route definitions
│   │   └── main.jsx
│   ├── .env.example         # Template frontend environment variables
│   ├── vercel.json          # SPA routing rewrite rule
│   └── package.json
├── render.yaml              # Render blueprint deployment specification
├── README.md
└── package.json
```

---

## 4. Local Setup & Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm (v9 or higher)
- A running MongoDB instance (Local or free MongoDB Atlas URI)

### Step 1: Install Dependencies
```bash
# In backend
cd backend
npm install

# In frontend
cd ../frontend
npm install
```

### Step 2: Configure Environment Variables

**Backend (`backend/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/handloom_db?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_handloom_artisan_platform_2026
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Frontend (`frontend/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```

### Step 3: Bootstrap Initial Administrator
Create your initial administrator account securely via CLI:
```bash
cd backend
npm run bootstrap:admin -- --name "Master Admin" --email "admin@handloom-artisan.org" --password "YourStrongAdminPassword123!"
```

### Step 4: Seed Initial Categories & Demonstration Artisans
Seed authentic GI categories (Pochampally Ikat, Kalamkari, Mangalagiri, Gadwal, Bidriware) safely:
```bash
cd backend
npm run seed
```

### Step 5: Start the Development Servers
In terminal 1 (Backend):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
# Health check available at http://localhost:5000/api/health
```

In terminal 2 (Frontend):
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 5. Razorpay Payment Gateway Integration

### Payment Lifecycle:
1. **Stock & Price Validation:** Customer requests checkout. Backend recalculates order total strictly on the server from verified database product prices and reserves available stock.
2. **Razorpay Order Initialization:** Backend creates an official Razorpay order entity (`razorpay.orders.create`) and records a pending payment in the database.
3. **Frontend Checkout Modal:** The client opens Razorpay Checkout via `new window.Razorpay(options).open()`.
4. **Server Verification:** Upon payment authorization, client sends `orderId`, `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/payments/verify`.
5. **Cryptographic Signature Verification:** Backend validates `crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')`.
6. **Fulfillment & Payouts:** Stock is decremented atomically, cart is cleared, and notification events are dispatched to customer and artisan.

### Testing Mode vs Production Mode:
- **Test Mode:** Use test keys starting with `rzp_test_...` from the [Razorpay Dashboard](https://dashboard.razorpay.com). Test cards and UPI can be used freely.
- **Simulated Sandbox Fallback:** If Razorpay credentials are not yet configured in `.env`, the system automatically activates a safe simulation provider allowing end-to-end checkout testing and signature verification without network failures.
- **Switching to Live:** Set `RAZORPAY_KEY_ID` to `rzp_live_...` and `RAZORPAY_KEY_SECRET` in production environment variables.

---

## 6. Automated Testing

The backend includes a dedicated Vitest automated test suite running against an isolated in-memory MongoDB server:

```bash
cd backend
npm test
```

**Verified Test Scenarios:**
- Customer registration without role tampering
- Artisan registration with pending approval state
- Password comparison and rejection of incorrect passwords
- Portal role restriction (customers prohibited from admin portals)
- JWT token expiration and invalid token rejection
- Empty database catalogue graceful handling
- Unapproved artisan product listing block
- Verified purchase requirement before review submission
- Razorpay order creation, payment signature verification and stock deduction

---

## 7. Production Deployment Guide

### A. MongoDB Atlas
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write privileges.
3. In *Network Access*, add IP address `0.0.0.0/0` (Allow Access from Anywhere) to permit connections from Render.
4. Copy the connection string: `mongodb+srv://<user>:<password>@cluster0.mongodb.net/handloom_db?retryWrites=true&w=majority`.

### B. Backend Deployment on Render
1. Create a new **Web Service** on [Render](https://render.com) connected to your GitHub repository.
2. Set Root Directory: `backend`
3. Set Build Command: `npm install`
4. Set Start Command: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: (Your Atlas connection URI)
   - `JWT_SECRET`: (A strong random 64-char string)
   - `FRONTEND_URL`: (Your Vercel frontend URL)
   - `RAZORPAY_KEY_ID`: `rzp_test_...`
   - `RAZORPAY_KEY_SECRET`: `...`
6. Verify deployment by visiting `https://<your-render-service>.onrender.com/api/health`.

### C. Frontend Deployment on Vercel
1. Import the repository on [Vercel](https://vercel.com).
2. Set Framework Preset: `Vite`
3. Set Root Directory: `frontend`
4. Configure Environment Variable:
   - `VITE_API_URL`: `https://<your-render-service>.onrender.com/api`
5. Deploy. `vercel.json` automatically handles single-page client routing.

---

## 8. REST API Reference

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/health` | GET | Public | Health and database diagnostics |
| `/api/auth/register-customer` | POST | Public | Register customer account |
| `/api/auth/register-artisan` | POST | Public | Register artisan application |
| `/api/auth/login` | POST | Public | Login with role verification |
| `/api/auth/me` | GET | Authenticated | Current user details |
| `/api/products` | GET | Public | Search, filter, and paginate products |
| `/api/products/:id` | GET | Public | Product details by ID |
| `/api/products` | POST | Approved Artisan | List new product |
| `/api/products/:id` | PUT/DELETE | Owner / Admin | Edit or delete product |
| `/api/artisans` | GET | Public | Directory of approved artisans |
| `/api/artisans/profile/:id` | GET | Public | Public artisan profile & catalog |
| `/api/cart` | GET | Customer | Fetch shopping cart |
| `/api/cart/add` | POST | Customer | Add product to cart |
| `/api/orders` | POST | Customer | Place order & create Razorpay order |
| `/api/orders/my-orders` | GET | Customer | Customer order history |
| `/api/orders/artisan-orders` | GET | Artisan | Orders containing artisan items |
| `/api/orders/:id/status` | PUT | Artisan / Admin | Update fulfillment status |
| `/api/payments/verify` | POST | Authenticated | Verify Razorpay payment signature |
| `/api/admin/metrics` | GET | Admin | Totals for users, revenue, orders |
| `/api/admin/artisan-applications` | GET | Admin | Review artisan applications |
| `/api/admin/artisan-applications/:id/status` | PUT | Admin | Approve, reject, or suspend artisan |
| `/api/admin/audit-logs` | GET | Admin | View immutable administrative logs |
