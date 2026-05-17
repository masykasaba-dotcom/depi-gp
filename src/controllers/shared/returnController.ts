import { RequestHandler } from "express";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middleware/authMiddleware";

// POST /api/returns — client: request a return
// Body: { order_id, reason, items: [{ order_item_id, quantity, reason }] }
export const requestReturn: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    const { order_id, reason, items } = req.body;
    if (!order_id || !reason) {
      return res.status(400).json({ error: "order_id and reason are required" });
    }

    // Verify order belongs to customer and is delivered
    const order = await prisma.order.findFirst({
      where: { order_id, customer_id: customerId },
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.status !== "delivered") {
      return res.status(400).json({ error: "Only delivered orders can be returned" });
    }

    // Check no existing return request
    const existing = await prisma.return.findUnique({ where: { order_id } });
    if (existing) return res.status(409).json({ error: "Return request already exists for this order" });

    const returnReq = await prisma.return.create({
      data: {
        order_id,
        customer_id: customerId,
        reason,
        items: items?.length
          ? {
              create: items.map((i: any) => ({
                order_item_id: i.order_item_id,
                quantity: i.quantity,
                reason: i.reason ?? null,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });

    res.status(201).json({ message: "Return request submitted", data: returnReq });
  } catch (err) {
    console.error("[returns] requestReturn error:", err);
    res.status(500).json({ error: "Failed to submit return request" });
  }
};

// GET /api/returns/me — client: my return requests
export const getMyReturns: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    const returns = await prisma.return.findMany({
      where: { customer_id: customerId },
      include: {
        order: { select: { order_ref: true, total: true, created_at: true } },
        items: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ data: returns });
  } catch (err) {
    console.error("[returns] getMyReturns error:", err);
    res.status(500).json({ error: "Failed to fetch returns" });
  }
};

// GET /api/admin/returns
export const getReturns: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where = status ? { status } : {};
    const [total, returns] = await Promise.all([
      prisma.return.count({ where }),
      prisma.return.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          customer: { select: { customer_id: true, email: true, first_name: true, last_name: true } },
          order: { select: { order_ref: true, total: true } },
          items: true,
        },
      }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: returns });
  } catch (err) {
    console.error("[returns] getReturns error:", err);
    res.status(500).json({ error: "Failed to fetch returns" });
  }
};

// PUT /api/admin/returns/:id
// Body: { status, refund_amount, notes }
export const updateReturnStatus: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid return ID" });

    const { status, refund_amount, notes } = req.body;
    const allowed = ["pending", "approved", "rejected", "refunded"];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
    }

    const returnReq = await prisma.return.update({
      where: { return_id: id },
      data: {
        ...(status && { status }),
        ...(refund_amount !== undefined && { refund_amount }),
        ...(notes !== undefined && { notes }),
      },
    });

    // If refunded, give back loyalty points (10 pts per currency unit refunded)
    if (status === "refunded" && refund_amount) {
      const pointsToAdd = Math.floor(Number(refund_amount) * 10);
      await prisma.$transaction([
        prisma.customer.update({
          where: { customer_id: returnReq.customer_id },
          data: { loyalty_points: { increment: pointsToAdd } },
        }),
        prisma.loyaltyTransaction.create({
          data: {
            customer_id: returnReq.customer_id,
            points: pointsToAdd,
            type: "earned",
            description: `Refund for return #${returnReq.return_id}`,
          },
        }),
      ]);
    }

    res.json({ message: "Return updated", data: returnReq });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Return request not found" });
    console.error("[returns] updateReturnStatus error:", err);
    res.status(500).json({ error: "Failed to update return" });
  }
};
