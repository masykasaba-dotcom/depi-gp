import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import prisma from "./config/prisma";

// ── Webhook (must be before express.json) ─────────────────────
import webhookRoutes       from "./routes/shared/webhookRoutes";

// ── Client Routes ──────────────────────────────────────────────
import authRoutes          from "./routes/client/authRoutes";
import productRoutes       from "./routes/client/productRoutes";
import cartRoutes          from "./routes/client/cartRoutes";
import orderRoutes         from "./routes/client/orderRoutes";
import profileRoutes       from "./routes/client/profileRoutes";
import addressRoutes       from "./routes/client/addressRoutes";
import reviewRoutes        from "./routes/client/reviewRoutes";
import surveyRoutes        from "./routes/client/surveyRoutes";
import recommendationRoutes from "./routes/client/recommendationRoutes";
import wishlistRoutes      from "./routes/client/wishlistRoutes";

// ── Admin Routes ───────────────────────────────────────────────
import adminRoutes         from "./routes/admin/adminRoutes";
import adminUsersRoutes    from "./routes/admin/adminUsersRoutes";
import dashboardRoutes     from "./routes/admin/dashboardRoutes";
import analyticsRoutes     from "./routes/admin/analyticsRoutes";
import auditLogRoutes      from "./routes/admin/auditLogRoutes";

// ── Shared Routes (Public read + Admin write) ──────────────────
import ingredientRoutes    from "./routes/shared/ingredientRoutes";
import faqRoutes           from "./routes/shared/faqRoutes";
import contactRoutes       from "./routes/shared/contactRoutes";
import cmsRoutes           from "./routes/shared/cmsRoutes";
import blogRoutes          from "./routes/shared/blogRoutes";
import couponRoutes        from "./routes/shared/couponRoutes";
import flashSaleRoutes     from "./routes/shared/flashSaleRoutes";
import returnRoutes        from "./routes/shared/returnRoutes";
import loyaltyRoutes       from "./routes/shared/loyaltyRoutes";
import storeSettingsRoutes from "./routes/shared/storeSettingsRoutes";
import shippingRuleRoutes  from "./routes/shared/shippingRuleRoutes";
import shippingRoutes      from "./routes/shared/shippingRoutes";

const app = express();
app.set("trust proxy", 1);

// Webhook must be before express.json()
app.use("/api/webhooks", webhookRoutes);

// ── Global Middleware ──────────────────────────────────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : "*";

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet());
app.use(express.json());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again in 15 minutes." },
});

// ── CLIENT Routes ──────────────────────────────────────────────
app.use("/api/auth",            authLimiter, authRoutes);
app.use("/api/cart",            cartRoutes);
app.use("/api/profile",         profileRoutes);
app.use("/api/survey",          surveyRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/addresses",       addressRoutes);
app.use("/api/wishlist",        wishlistRoutes);
app.use("/api",                 productRoutes);
app.use("/api",                 orderRoutes);
app.use("/api",                 reviewRoutes);
app.use("/api",                 shippingRoutes);

// ── ADMIN Routes ───────────────────────────────────────────────
app.use("/api/admin",           adminRoutes);
app.use("/api/admin/users",     adminUsersRoutes);
app.use("/api/dashboard",       dashboardRoutes);
app.use("/api/admin/analytics", analyticsRoutes);
app.use("/api/admin/audit-logs",auditLogRoutes);

// ── SHARED Routes ──────────────────────────────────────────────
app.use("/api/ingredients",     ingredientRoutes);
app.use("/api/faqs",            faqRoutes);
app.use("/api/contact",         contactRoutes);
app.use("/api/cms",             cmsRoutes);
app.use("/api/blog",            blogRoutes);
app.use("/api/coupons",         couponRoutes);
app.use("/api/flash-sales",     flashSaleRoutes);
app.use("/api/returns",         returnRoutes);
app.use("/api/loyalty",         loyaltyRoutes);
app.use("/api/store-settings",  storeSettingsRoutes);
app.use("/api/shipping-rules",  shippingRuleRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "OK", db: "connected", timestamp: new Date().toISOString() });
  } catch {
    res.status(500).json({ status: "ERROR", db: "disconnected", timestamp: new Date().toISOString() });
  }
});

// ── Global Error Handler ───────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("[error]", err.message);
  res.status(500).json({ error: err.message || "Internal server error" });
});

export default app;
