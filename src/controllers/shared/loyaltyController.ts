import { RequestHandler } from "express";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middleware/authMiddleware";

const POINTS_PER_CURRENCY_UNIT = 10; // 10 points per 1 EGP/USD spent

// GET /api/loyalty — client: balance + history
export const getLoyaltyBalance: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    const customer = await prisma.customer.findUnique({
      where: { customer_id: customerId },
      select: { loyalty_points: true },
    });

    res.json({ data: { loyalty_points: customer?.loyalty_points ?? 0 } });
  } catch (err) {
    console.error("[loyalty] getLoyaltyBalance error:", err);
    res.status(500).json({ error: "Failed to fetch loyalty balance" });
  }
};

// GET /api/loyalty/history
export const getLoyaltyHistory: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [total, transactions] = await Promise.all([
      prisma.loyaltyTransaction.count({ where: { customer_id: customerId } }),
      prisma.loyaltyTransaction.findMany({
        where: { customer_id: customerId },
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: transactions });
  } catch (err) {
    console.error("[loyalty] getLoyaltyHistory error:", err);
    res.status(500).json({ error: "Failed to fetch loyalty history" });
  }
};

// POST /api/loyalty/redeem — client: redeem points at checkout
// Body: { points_to_redeem }  (100 pts = 1 currency unit discount)
export const redeemPoints: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    const { points_to_redeem } = req.body;
    if (!points_to_redeem || typeof points_to_redeem !== "number" || points_to_redeem <= 0) {
      return res.status(400).json({ error: "points_to_redeem must be a positive number" });
    }

    const customer = await prisma.customer.findUnique({
      where: { customer_id: customerId },
      select: { loyalty_points: true },
    });

    if (!customer || customer.loyalty_points < points_to_redeem) {
      return res.status(400).json({ error: "Insufficient loyalty points" });
    }

    const discount_amount = parseFloat((points_to_redeem / 100).toFixed(2));

    await prisma.$transaction([
      prisma.customer.update({
        where: { customer_id: customerId },
        data: { loyalty_points: { decrement: points_to_redeem } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          customer_id: customerId,
          points: -points_to_redeem,
          type: "redeemed",
          description: `Redeemed ${points_to_redeem} points for ${discount_amount} discount`,
        },
      }),
    ]);

    res.json({
      message: `Successfully redeemed ${points_to_redeem} points`,
      data: { discount_amount },
    });
  } catch (err) {
    console.error("[loyalty] redeemPoints error:", err);
    res.status(500).json({ error: "Failed to redeem points" });
  }
};

// POST /api/admin/loyalty/award — admin: manually award points
// Body: { customer_id, points, description }
export const awardLoyaltyPoints: RequestHandler = async (req, res) => {
  try {
    const { customer_id, points, description } = req.body;
    if (!customer_id || points === undefined) {
      return res.status(400).json({ error: "customer_id and points are required" });
    }

    await prisma.$transaction([
      prisma.customer.update({
        where: { customer_id },
        data: { loyalty_points: { increment: points } },
      }),
      prisma.loyaltyTransaction.create({
        data: {
          customer_id,
          points,
          type: "admin_adjustment",
          description: description ?? `Admin adjustment: ${points > 0 ? "+" : ""}${points} points`,
        },
      }),
    ]);

    const updated = await prisma.customer.findUnique({
      where: { customer_id },
      select: { customer_id: true, email: true, loyalty_points: true },
    });

    res.json({ message: "Points awarded", data: updated });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Customer not found" });
    console.error("[loyalty] awardLoyaltyPoints error:", err);
    res.status(500).json({ error: "Failed to award points" });
  }
};

// GET /api/admin/loyalty — admin: all customers' loyalty summary
export const getLoyaltySummary: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [total, customers] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.findMany({
        skip,
        take: limit,
        orderBy: { loyalty_points: "desc" },
        select: {
          customer_id: true, email: true, first_name: true, last_name: true, loyalty_points: true,
        },
      }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: customers });
  } catch (err) {
    console.error("[loyalty] getLoyaltySummary error:", err);
    res.status(500).json({ error: "Failed to fetch loyalty summary" });
  }
};
