# 📋 DermaCare — Complete API Routes Reference

**Base URL:** `https://depi-gp-production.up.railway.app/api`  
**Local:** `http://localhost:3000/api`

> 🔑 **Auth Header:** `Authorization: Bearer <token>`  
> 👤 **[auth]** = requires customer JWT  
> 🛡️ **[admin]** = requires admin JWT  
> 🌐 **[public]** = no auth needed

---

## 🩺 Health Check

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | 🌐 | Server + DB status |

---

## ━━━ CLIENT ROUTES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

---

## 🔐 Auth

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/auth/register` | 🌐 | `{ email, password, first_name, last_name }` |
| POST | `/auth/login` | 🌐 | `{ email, password }` |
| POST | `/auth/forgot-password` | 🌐 | `{ email }` |
| POST | `/auth/reset-password` | 🌐 | `{ token, new_password }` |
| GET | `/auth/me` | 👤 | — |

---

## 🛍️ Products (PLP / PDP / Search)

| Method | Endpoint | Auth | Params / Body |
|--------|----------|------|---------------|
| GET | `/products` | 🌐 | `?page&limit&category_id&search&sort=price_asc\|price_desc\|newest\|popular` |
| GET | `/products/:id` | 🌐 | — |
| GET | `/products/featured` | 🌐 | — |
| GET | `/categories` | 🌐 | — |

---

## 🧴 Ingredients Guide

| Method | Endpoint | Auth | Params / Body |
|--------|----------|------|---------------|
| GET | `/ingredients` | 🌐 | `?page&limit&search` |
| GET | `/ingredients/:id` | 🌐 | — |

---

## 🛒 Cart

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/cart` | 👤 | — |
| POST | `/cart` | 👤 | `{ variant_id, quantity }` |
| PUT | `/cart/:itemId` | 👤 | `{ quantity }` |
| DELETE | `/cart/:itemId` | 👤 | — |
| DELETE | `/cart` | 👤 | — (clear cart) |

---

## 💳 Checkout & Orders

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/orders` | 👤 | `{ address_id, coupon_code?, loyalty_points_to_redeem? }` |
| GET | `/orders/me` | 👤 | `?page&limit` |
| GET | `/orders/:id` | 👤 | — |
| POST | `/payment/create-intent` | 👤 | `{ order_id }` |
| POST | `/webhooks/stripe` | 🌐 | Stripe webhook payload |

---

## 🎟️ Coupons

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/coupons/validate` | 👤 | `{ code, cart_total }` |

---

## ⚡ Flash Sales

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/flash-sales/active` | 🌐 | Currently active flash sales with products |

---

## ❤️ Wishlist

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/wishlist` | 👤 | — |
| POST | `/wishlist` | 👤 | `{ product_id }` |
| DELETE | `/wishlist/:productId` | 👤 | — |
| DELETE | `/wishlist` | 👤 | — (clear all) |

---

## 👤 Profile

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/profile` | 👤 | — |
| PUT | `/profile` | 👤 | `{ first_name, last_name, phone }` |
| PUT | `/profile/password` | 👤 | `{ current_password, new_password }` |

---

## 📍 Addresses

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/addresses` | 👤 | — |
| POST | `/addresses` | 👤 | `{ street_address, city, state, country, zip_code, phone, is_default }` |
| PUT | `/addresses/:id` | 👤 | `{ ...fields }` |
| DELETE | `/addresses/:id` | 👤 | — |
| PUT | `/addresses/:id/default` | 👤 | — |

---

## 📦 Returns

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/returns` | 👤 | `{ order_id, reason, items: [{ order_item_id, quantity, reason }] }` |
| GET | `/returns/me` | 👤 | — |

---

## 🏆 Loyalty Points

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/loyalty/balance` | 👤 | — |
| GET | `/loyalty/history` | 👤 | `?page&limit` |
| POST | `/loyalty/redeem` | 👤 | `{ points_to_redeem }` |

---

## ⭐ Reviews

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/products/:id/reviews` | 🌐 | `?page&limit` |
| POST | `/products/:id/reviews` | 👤 | `{ rating, comment }` |
| DELETE | `/reviews/:id` | 👤 | — |

---

## 🧪 Skin Quiz

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/survey/active` | 🌐 | — |
| POST | `/survey/submit` | 👤 | `{ responses: [{ question_id, answer_value }] }` |
| GET | `/survey/result` | 👤 | — |

---

## 💡 Recommendations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/recommendations` | 👤 | Personalized product recommendations |

---

## 🚚 Shipping Calculator

| Method | Endpoint | Auth | Params |
|--------|----------|------|--------|
| GET | `/shipping-rules/calculate` | 🌐 | `?country=Egypt&order_total=500` |

---

## 📖 Blog / Journal

| Method | Endpoint | Auth | Params |
|--------|----------|------|--------|
| GET | `/blog` | 🌐 | `?page&limit` |
| GET | `/blog/:slug` | 🌐 | — |

---

## 📄 CMS Pages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cms` | 🌐 | List all CMS keys |
| GET | `/cms/about` | 🌐 | About page |
| GET | `/cms/privacy_policy` | 🌐 | Privacy policy |
| GET | `/cms/terms` | 🌐 | Terms & conditions |
| GET | `/cms/returns_policy` | 🌐 | Returns policy |
| GET | `/cms/contact_info` | 🌐 | Contact info JSON |
| GET | `/cms/:key` | 🌐 | Any CMS block by key |

---

## ❓ FAQs

| Method | Endpoint | Auth | Params |
|--------|----------|------|--------|
| GET | `/faqs` | 🌐 | `?category` |

---

## 📬 Contact / Support

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/contact` | 🌐 | `{ name, email, subject, message }` |

---

## 🏪 Store Settings (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/store-settings` | 🌐 | All settings as key-value map |

---

## ━━━ ADMIN ROUTES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

> All admin routes require `Authorization: Bearer <admin_token>`

---

## 🔐 Admin Auth

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/auth/admin/login` | 🌐 | `{ email, password }` |
| POST | `/auth/admin/register` | 🛡️ | `{ email, password, first_name, last_name, role }` |

---

## 📊 Dashboard

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | 🛡️ | Summary stats (orders, revenue, customers, products) |

---

## 📈 Analytics

| Method | Endpoint | Auth | Params |
|--------|----------|------|--------|
| GET | `/admin/analytics/revenue` | 🛡️ | `?days=30` |
| GET | `/admin/analytics/top-products` | 🛡️ | `?limit=10` |
| GET | `/admin/analytics/orders-breakdown` | 🛡️ | — |
| GET | `/admin/analytics/quiz` | 🛡️ | — |
| GET | `/admin/analytics/customers` | 🛡️ | `?days=30` |

---

## 🧴 Products (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/admin/products` | 🛡️ | `{ product_name, description, category_id, is_featured, seo_title, seo_description }` |
| PUT | `/admin/products/:id` | 🛡️ | `{ ...fields }` |
| DELETE | `/admin/products/:id` | 🛡️ | — |
| POST | `/admin/products/:id/images` | 🛡️ | `{ images: [{ image_url, is_primary, display_order }] }` |
| DELETE | `/admin/images/:imageId` | 🛡️ | — |
| POST | `/admin/products/:id/variants` | 🛡️ | `{ variants: [{ size, price, stock_qty }] }` |
| PUT | `/admin/variants/:id/stock` | 🛡️ | `{ stock_qty }` |
| PUT | `/admin/variants/:variantId` | 🛡️ | `{ size, price, stock_qty }` |
| DELETE | `/admin/variants/:variantId` | 🛡️ | — |

---

## 🧪 Ingredients (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/admin/ingredients` | 🛡️ | `{ name, description, benefits, concerns, skin_types[] }` |
| PUT | `/admin/ingredients/:id` | 🛡️ | `{ ...fields }` |
| DELETE | `/admin/ingredients/:id` | 🛡️ | — |
| POST | `/admin/products/:productId/ingredients` | 🛡️ | `{ ingredient_id }` |
| DELETE | `/admin/products/:productId/ingredients/:ingredientId` | 🛡️ | — |

---

## 📂 Categories (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/admin/categories` | 🛡️ | `{ category_name, description, image_url, slug }` |
| PUT | `/admin/categories/:id` | 🛡️ | `{ ...fields }` |
| DELETE | `/admin/categories/:id` | 🛡️ | — |

---

## 📦 Orders (Admin)

| Method | Endpoint | Auth | Params / Body |
|--------|----------|------|---------------|
| GET | `/admin/orders` | 🛡️ | `?page&limit&status` |
| PUT | `/admin/orders/:id/status` | 🛡️ | `{ status }` |
| PUT | `/admin/orders/:id/cancel` | 🛡️ | — |
| PUT | `/admin/orders/:id/ship` | 🛡️ | `{ partner_id, tracking_num, est_delivery }` |

---

## 🔄 Returns (Admin)

| Method | Endpoint | Auth | Params / Body |
|--------|----------|------|---------------|
| GET | `/returns` | 🛡️ | `?status&page&limit` |
| PUT | `/returns/:id` | 🛡️ | `{ status, refund_amount, notes }` |

---

## 👥 Customers (Admin)

| Method | Endpoint | Auth | Params |
|--------|----------|------|--------|
| GET | `/admin/customers` | 🛡️ | `?page&limit&search` |
| GET | `/admin/customers/:id` | 🛡️ | — |

---

## 🏆 Loyalty (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/loyalty/summary` | 🛡️ | `?page&limit` |
| POST | `/loyalty/award` | 🛡️ | `{ customer_id, points, description }` |

---

## 🎟️ Coupons (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/coupons` | 🛡️ | `?page&limit` |
| POST | `/coupons` | 🛡️ | `{ code, discount_type, discount_value, min_order_amount, max_uses, expires_at }` |
| PUT | `/coupons/:id` | 🛡️ | `{ ...fields }` |
| DELETE | `/coupons/:id` | 🛡️ | — |

---

## ⚡ Flash Sales (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/flash-sales` | 🛡️ | `?page&limit` |
| POST | `/flash-sales` | 🛡️ | `{ title, discount_pct, starts_at, ends_at, product_ids[] }` |
| PUT | `/flash-sales/:id` | 🛡️ | `{ ...fields }` |
| DELETE | `/flash-sales/:id` | 🛡️ | — |
| POST | `/flash-sales/:id/products` | 🛡️ | `{ product_id }` |
| DELETE | `/flash-sales/:id/products/:productId` | 🛡️ | — |

---

## 📝 Blog (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/blog/admin/all` | 🛡️ | `?page&limit` |
| POST | `/blog` | 🛡️ | `{ slug, title, excerpt, content, cover_image, is_published, seo_title, seo_desc }` |
| PUT | `/blog/:id` | 🛡️ | `{ ...fields }` |
| DELETE | `/blog/:id` | 🛡️ | — |

---

## 🗂️ CMS (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| PUT | `/cms/:key` | 🛡️ | `{ title, content, content_type }` |
| DELETE | `/cms/:key` | 🛡️ | — |

---

## ❓ FAQs (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/faqs` | 🛡️ | `{ question, answer, category, sort_order }` |
| PUT | `/faqs/:id` | 🛡️ | `{ ...fields }` |
| DELETE | `/faqs/:id` | 🛡️ | — |

---

## 📬 Contact Messages (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/contact` | 🛡️ | `?status&page&limit` |
| PUT | `/contact/:id` | 🛡️ | `{ status }` |
| DELETE | `/contact/:id` | 🛡️ | — |

---

## ⚙️ Store Settings (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/store-settings/admin` | 🛡️ | — |
| PUT | `/store-settings` | 🛡️ | `{ settings: [{ key, value }] }` |
| DELETE | `/store-settings/:key` | 🛡️ | — |

---

## 🚚 Shipping Rules (Admin)

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/shipping-rules` | 🛡️ | — |
| POST | `/shipping-rules` | 🛡️ | `{ name, country, min_order_amount, flat_rate }` |
| PUT | `/shipping-rules/:id` | 🛡️ | `{ ...fields }` |
| DELETE | `/shipping-rules/:id` | 🛡️ | — |

---

## 👤 Admin Users Management

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| GET | `/admin/users` | 🛡️ | — |
| GET | `/admin/users/:id` | 🛡️ | — |
| PUT | `/admin/users/:id` | 🛡️ | `{ first_name, last_name, role, is_active, password }` |
| DELETE | `/admin/users/:id` | 🛡️ | — |

---

## 📋 Audit Log

| Method | Endpoint | Auth | Params |
|--------|----------|------|--------|
| GET | `/admin/audit-logs` | 🛡️ | `?entity&admin_id&page&limit` |

---

## 📊 Summary Count

| Category | Endpoints |
|---|---|
| Auth | 5 |
| Products & Categories | 12 |
| Ingredients | 7 |
| Cart | 5 |
| Orders & Checkout | 5 |
| Wishlist | 4 |
| Profile & Addresses | 9 |
| Reviews | 3 |
| Skin Quiz | 3 |
| Recommendations | 1 |
| Returns | 4 |
| Loyalty | 5 |
| Coupons | 5 |
| Flash Sales | 7 |
| Blog | 5 |
| CMS | 5 |
| FAQs | 4 |
| Contact | 4 |
| Store Settings | 4 |
| Shipping | 6 |
| Analytics | 5 |
| Admin Users | 4 |
| Audit Log | 1 |
| Dashboard | 1 |
| Health | 1 |
| **TOTAL** | **~120 endpoints** |

---

## 🧪 Testing with Postman

### Quick Setup

1. Import the base URL as an environment variable: `{{BASE_URL}}`
2. Login as admin → copy JWT → set as `{{ADMIN_TOKEN}}`
3. Register/login as customer → copy JWT → set as `{{CUSTOMER_TOKEN}}`

### Login Admin
```
POST {{BASE_URL}}/auth/admin/login
Body: { "email": "admin@dermacare.com", "password": "Admin@1234" }
```

### Login Customer
```
POST {{BASE_URL}}/auth/login
Body: { "email": "customer@example.com", "password": "yourpassword" }
```
