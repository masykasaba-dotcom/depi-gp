import { RequestHandler } from "express";
import prisma from "../../config/prisma";

// GET /api/shipping-rules/calculate?country=EG&order_total=250
export const calculateShipping: RequestHandler = async (req, res) => {
  try {
    const country = req.query.country as string | undefined;
    const order_total = parseFloat(req.query.order_total as string) || 0;

    // Find best matching rule: exact country match first, then global (null country)
    const rules = await prisma.shippingRule.findMany({
      where: {
        is_active: true,
        OR: [
          { country: country ?? null },
          { country: null },
        ],
      },
      orderBy: { country: "desc" }, // country-specific rules take priority (non-null first)
    });

    if (rules.length === 0) {
      return res.json({ data: { shipping_cost: 0, rule: null, is_free: false } });
    }

    const rule = rules[0];
    const is_free = rule.min_order_amount !== null && order_total >= Number(rule.min_order_amount);
    const shipping_cost = is_free ? 0 : Number(rule.flat_rate);

    res.json({ data: { shipping_cost, is_free, rule } });
  } catch (err) {
    console.error("[shippingRule] calculateShipping error:", err);
    res.status(500).json({ error: "Failed to calculate shipping" });
  }
};

// GET /api/admin/shipping-rules
export const getShippingRules: RequestHandler = async (req, res) => {
  try {
    const rules = await prisma.shippingRule.findMany({ orderBy: { country: "asc" } });
    res.json({ data: rules });
  } catch (err) {
    console.error("[shippingRule] getShippingRules error:", err);
    res.status(500).json({ error: "Failed to fetch shipping rules" });
  }
};

// POST /api/admin/shipping-rules
export const createShippingRule: RequestHandler = async (req, res) => {
  try {
    const { name, country, min_order_amount, flat_rate } = req.body;
    if (!name || flat_rate === undefined) {
      return res.status(400).json({ error: "name and flat_rate are required" });
    }

    const rule = await prisma.shippingRule.create({
      data: {
        name,
        country: country ?? null,
        min_order_amount: min_order_amount ?? null,
        flat_rate,
      },
    });

    res.status(201).json({ message: "Shipping rule created", data: rule });
  } catch (err) {
    console.error("[shippingRule] createShippingRule error:", err);
    res.status(500).json({ error: "Failed to create shipping rule" });
  }
};

// PUT /api/admin/shipping-rules/:id
export const updateShippingRule: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid rule ID" });

    const { name, country, min_order_amount, flat_rate, is_active } = req.body;

    const rule = await prisma.shippingRule.update({
      where: { rule_id: id },
      data: {
        ...(name && { name }),
        ...(country !== undefined && { country }),
        ...(min_order_amount !== undefined && { min_order_amount }),
        ...(flat_rate !== undefined && { flat_rate }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    res.json({ message: "Shipping rule updated", data: rule });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Rule not found" });
    console.error("[shippingRule] updateShippingRule error:", err);
    res.status(500).json({ error: "Failed to update rule" });
  }
};

// DELETE /api/admin/shipping-rules/:id
export const deleteShippingRule: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid rule ID" });

    await prisma.shippingRule.delete({ where: { rule_id: id } });
    res.json({ message: "Shipping rule deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Rule not found" });
    console.error("[shippingRule] deleteShippingRule error:", err);
    res.status(500).json({ error: "Failed to delete rule" });
  }
};
