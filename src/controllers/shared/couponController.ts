import { RequestHandler } from "express";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middleware/authMiddleware";

// POST /api/coupons/validate — client: validate a coupon code against cart total
// Body: { code, cart_total }
export const validateCoupon: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    const { code, cart_total } = req.body;
    if (!code) return res.status(400).json({ error: "code is required" });

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });

    if (!coupon || !coupon.is_active) {
      return res.status(404).json({ error: "Coupon not found or inactive" });
    }
    if (coupon.expires_at && new Date() > coupon.expires_at) {
      return res.status(400).json({ error: "Coupon has expired" });
    }
    if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
      return res.status(400).json({ error: "Coupon usage limit reached" });
    }
    if (coupon.min_order_amount && cart_total < Number(coupon.min_order_amount)) {
      return res.status(400).json({
        error: `Minimum order amount for this coupon is ${coupon.min_order_amount}`,
      });
    }

    // Check if customer already used this coupon
    const alreadyUsed = await prisma.couponUsage.findFirst({
      where: { coupon_id: coupon.coupon_id, customer_id: customerId },
    });
    if (alreadyUsed) {
      return res.status(400).json({ error: "You have already used this coupon" });
    }

    let discount_amount = 0;
    if (coupon.discount_type === "percentage") {
      discount_amount = (cart_total * Number(coupon.discount_value)) / 100;
    } else {
      discount_amount = Math.min(Number(coupon.discount_value), cart_total);
    }

    res.json({
      message: "Coupon is valid",
      data: {
        coupon_id: coupon.coupon_id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        discount_amount: parseFloat(discount_amount.toFixed(2)),
      },
    });
  } catch (err) {
    console.error("[coupon] validateCoupon error:", err);
    res.status(500).json({ error: "Failed to validate coupon" });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/admin/coupons
export const getCoupons: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [total, coupons] = await Promise.all([
      prisma.coupon.count(),
      prisma.coupon.findMany({ skip, take: limit, orderBy: { created_at: "desc" } }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: coupons });
  } catch (err) {
    console.error("[coupon] getCoupons error:", err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
};

// POST /api/admin/coupons
export const createCoupon: RequestHandler = async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, min_order_amount, max_uses, expires_at } = req.body;
    if (!code || !discount_type || discount_value === undefined) {
      return res.status(400).json({ error: "code, discount_type, and discount_value are required" });
    }
    if (!["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({ error: "discount_type must be 'percentage' or 'fixed'" });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        description,
        discount_type,
        discount_value,
        min_order_amount: min_order_amount ?? null,
        max_uses: max_uses ?? null,
        expires_at: expires_at ? new Date(expires_at) : null,
      },
    });

    res.status(201).json({ message: "Coupon created", data: coupon });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Coupon code already exists" });
    console.error("[coupon] createCoupon error:", err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
};

// PUT /api/admin/coupons/:id
export const updateCoupon: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid coupon ID" });

    const { description, discount_type, discount_value, min_order_amount, max_uses, is_active, expires_at } = req.body;

    const coupon = await prisma.coupon.update({
      where: { coupon_id: id },
      data: {
        ...(description !== undefined && { description }),
        ...(discount_type && { discount_type }),
        ...(discount_value !== undefined && { discount_value }),
        ...(min_order_amount !== undefined && { min_order_amount }),
        ...(max_uses !== undefined && { max_uses }),
        ...(is_active !== undefined && { is_active }),
        ...(expires_at !== undefined && { expires_at: expires_at ? new Date(expires_at) : null }),
      },
    });

    res.json({ message: "Coupon updated", data: coupon });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Coupon not found" });
    console.error("[coupon] updateCoupon error:", err);
    res.status(500).json({ error: "Failed to update coupon" });
  }
};

// DELETE /api/admin/coupons/:id
export const deleteCoupon: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid coupon ID" });

    await prisma.coupon.delete({ where: { coupon_id: id } });
    res.json({ message: "Coupon deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Coupon not found" });
    console.error("[coupon] deleteCoupon error:", err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};
