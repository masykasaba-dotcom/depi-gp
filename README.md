# 🧬 DermaCare Backend API

> A feature-complete RESTful backend for the **DermaCare** skincare e-commerce platform, built with **Express 5**, **Prisma ORM**, **TypeScript**, and **PostgreSQL** (NeonDB).

---

## ⚡ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express 5 |
| Language | TypeScript 5 |
| ORM | Prisma 7 |
| Database | PostgreSQL (NeonDB Serverless) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Payments | Stripe |
| Deployment | Railway |

---

## 📁 Project Structure

```
src/
├── app.ts                    # Express app — all routes registered here
├── server.ts                 # HTTP server entry point
│
├── config/
│   └── prisma.ts             # Prisma client singleton
│
├── middleware/
│   └── authMiddleware.ts     # JWT auth + role-based guards
│
├── controllers/
│   │
│   ├── ── CLIENT ─────────────────────────────────
│   ├── authController.ts         # Register, Login
│   ├── forgotPasswordController.ts # Forgot/Reset password
│   ├── profileController.ts       # Profile CRUD
│   ├── addressController.ts       # Saved addresses
│   ├── productController.ts       # PLP, PDP, search
│   ├── cartController.ts          # Cart management
│   ├── orderController.ts         # Checkout, order history, tracking
│   ├── paymentController.ts       # Stripe payment intent
│   ├── reviewController.ts        # Product reviews
│   ├── surveyController.ts        # Skin quiz
│   ├── recommendationController.ts# Personalized recommendations
│   ├── wishlistController.ts      # Wishlist
│   ├── returnController.ts        # Return requests (client side)
│   ├── loyaltyController.ts       # Loyalty points (client side)
│   │
│   ├── ── ADMIN ──────────────────────────────────
│   ├── adminController.ts         # Products, Categories, Orders, Customers
│   ├── adminUsersController.ts    # Admin user management
│   ├── dashboardController.ts     # Dashboard summary stats
│   ├── analyticsController.ts     # Revenue, top products, quiz stats
│   ├── auditLogController.ts      # Audit trail
│   ├── shippingController.ts      # Ship orders, labels
│   │
│   └── ── SHARED (Public + Admin) ─────────────────
│       ├── ingredientController.ts  # Ingredients database
│       ├── faqController.ts         # FAQs
│       ├── contactController.ts     # Contact messages
│       ├── cmsController.ts         # CMS pages (About, Privacy, etc.)
│       ├── blogController.ts        # Blog / Journal
│       ├── couponController.ts      # Coupons
│       ├── flashSaleController.ts   # Flash sales
│       ├── returnController.ts      # Returns (admin side)
│       ├── loyaltyController.ts     # Loyalty (admin side)
│       ├── storeSettingsController.ts # Store settings
│       ├── shippingRuleController.ts  # Shipping rules
│       └── webhookController.ts       # Stripe webhooks
│
├── routes/
│   ├── authRoutes.ts
│   ├── productRoutes.ts
│   ├── cartRoutes.ts
│   ├── orderRoutes.ts
│   ├── profileRoutes.ts
│   ├── addressRoutes.ts
│   ├── reviewRoutes.ts
│   ├── surveyRoutes.ts
│   ├── recommendationRoutes.ts
│   ├── wishlistRoutes.ts
│   ├── returnRoutes.ts
│   ├── loyaltyRoutes.ts
│   ├── ingredientRoutes.ts
│   ├── faqRoutes.ts
│   ├── contactRoutes.ts
│   ├── cmsRoutes.ts
│   ├── blogRoutes.ts
│   ├── couponRoutes.ts
│   ├── flashSaleRoutes.ts
│   ├── storeSettingsRoutes.ts
│   ├── shippingRoutes.ts
│   ├── shippingRuleRoutes.ts
│   ├── adminRoutes.ts
│   ├── adminUsersRoutes.ts
│   ├── analyticsRoutes.ts
│   ├── auditLogRoutes.ts
│   ├── dashboardRoutes.ts
│   └── webhookRoutes.ts
│
├── services/                 # Business logic services
└── utils/                    # Zod schemas, helpers
```

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/masykasaba-dotcom/depi-gp.git
cd depi-gp
npm install
```

### 2. Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://..."     # NeonDB connection string
PORT=3000
JWT_SECRET="your-secret-key"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
ALLOWED_ORIGINS="http://localhost:5173,https://yourfrontend.com"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to DB (first time)
npx prisma db push

# Run seed SQL (in NeonDB SQL Editor)
# → Use seed.sql from project docs
```

### 4. Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## 🔐 Authentication

All protected routes require a **Bearer token** in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Roles
| Role | Access |
|---|---|
| `customer` | Client routes only |
| `admin` | All admin routes |
| `product_manager` | Products, categories, inventory |

---

## 🌐 API Base URL

- **Local:** `http://localhost:3000/api`
- **Production:** `https://depi-gp-production.up.railway.app/api`

---

## 📋 Complete API Routes

See **[API_ROUTES.md](./API_ROUTES.md)** for the full list of all endpoints organized by feature.

---

## 🗄️ Database Models

| Model | Description |
|---|---|
| `Customer` | End-user accounts |
| `Admin` | Admin panel users |
| `Product` | Skincare products |
| `ProductVariant` | Size/price variants |
| `Category` | Product categories |
| `Ingredient` | Skincare ingredients database |
| `Cart` / `CartItem` | Shopping cart |
| `Order` / `OrderItem` | Orders |
| `Payment` | Stripe payment records |
| `Review` | Product reviews |
| `SkinProfile` | Quiz results |
| `SurveyQuestion` | Skin quiz questions |
| `Recommendation` | AI-matched products |
| `WishlistItem` | Customer wishlists |
| `Coupon` | Discount codes |
| `FlashSale` | Time-limited sales |
| `Return` | Return requests |
| `LoyaltyTransaction` | Points history |
| `BlogPost` | Blog / Journal |
| `CmsContent` | Dynamic pages |
| `Faq` | FAQ entries |
| `ContactMessage` | Support messages |
| `ShippingRule` | Shipping cost rules |
| `StoreSettings` | Key-value store config |
| `AuditLog` | Admin action trail |

---

## 🏥 Health Check

```
GET /api/health
```

Returns `200 OK` with DB connection status.

---

## 📦 Deployment

Deployed automatically to **Railway** on every push to `main` branch.

```bash
git push origin main  # triggers auto-deploy
```
