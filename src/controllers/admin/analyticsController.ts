import { RequestHandler } from "express";
import prisma from "../../config/prisma";

// GET /api/admin/analytics/revenue?period=daily&days=30
export const getRevenue: RequestHandler = async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const orders = await prisma.order.findMany({
      where: {
        created_at: { gte: since },
        status: { not: "cancelled" }, // include pending, processing, paid, shipped, delivered
      },
      select: { created_at: true, total: true, discount: true },
      orderBy: { created_at: "asc" },
    });

    // Group by date
    const revenueMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    orders.forEach((o) => {
      const date = o.created_at.toISOString().split("T")[0];
      if (!revenueMap[date]) revenueMap[date] = { date, revenue: 0, orders: 0 };
      revenueMap[date].revenue += Number(o.total);
      revenueMap[date].orders += 1;
    });

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const totalDiscount = orders.reduce((sum, o) => sum + Number(o.discount), 0);

    res.json({
      data: {
        daily: Object.values(revenueMap),
        summary: {
          total_revenue: parseFloat(totalRevenue.toFixed(2)),
          total_orders: orders.length,
          total_discount: parseFloat(totalDiscount.toFixed(2)),
          avg_order_value: orders.length > 0 ? parseFloat((totalRevenue / orders.length).toFixed(2)) : 0,
        },
      },
    });
  } catch (err) {
    console.error("[analytics] getRevenue error:", err);
    res.status(500).json({ error: "Failed to fetch revenue data" });
  }
};

// GET /api/admin/analytics/top-products?limit=10
export const getTopProducts: RequestHandler = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const topItems = await prisma.order_Item.groupBy({
      by: ["variant_id"],
      _sum: { quantity: true },
      _count: { order_id: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: limit,
    });

    const variantIds = topItems.map((i: any) => i.variant_id);
    const variants = await prisma.product_Variant.findMany({
      where: { variant_id: { in: variantIds } },
      include: {
        product: { include: { images: { where: { is_primary: true } } } },
      },
    });

    const result = topItems.map((item: any) => {
      const variant = variants.find((v) => v.variant_id === item.variant_id);
      return {
        variant_id: item.variant_id,
        product_name: variant?.product.product_name ?? "Unknown",
        size: variant?.size ?? "-",
        total_sold: item._sum.quantity ?? 0,
        times_ordered: item._count.order_id,
        image: variant?.product.images?.[0]?.image_url ?? null,
      };
    });

    res.json({ data: result });
  } catch (err) {
    console.error("[analytics] getTopProducts error:", err);
    res.status(500).json({ error: "Failed to fetch top products" });
  }
};

// GET /api/admin/analytics/orders-breakdown
export const getOrdersBreakdown: RequestHandler = async (req, res) => {
  try {
    const statuses = ["pending", "paid", "shipped", "delivered", "cancelled"];

    const counts = await Promise.all(
      statuses.map((status) => prisma.order.count({ where: { status } }))
    );

    const total = counts.reduce((a, b) => a + b, 0);

    const breakdown = statuses.map((status, i) => ({
      status,
      count: counts[i],
      percentage: total > 0 ? parseFloat(((counts[i] / total) * 100).toFixed(1)) : 0,
    }));

    res.json({ data: { total, breakdown } });
  } catch (err) {
    console.error("[analytics] getOrdersBreakdown error:", err);
    res.status(500).json({ error: "Failed to fetch order breakdown" });
  }
};

// GET /api/admin/analytics/quiz — Quiz Analytics
export const getQuizAnalytics: RequestHandler = async (req, res) => {
  try {
    const totalSubmissions = await prisma.survey_Response.groupBy({
      by: ["customer_id"],
      _count: true,
    });

    // Get skin type distribution
    const skinTypes = await prisma.skin_Profile.groupBy({
      by: ["skin_type"],
      _count: { skin_type: true },
      orderBy: { _count: { skin_type: "desc" } },
    });

    // Get top concerns
    const profiles = await prisma.skin_Profile.findMany({
      select: { concerns: true },
    });
    const concernCount: Record<string, number> = {};
    profiles.forEach((p) => {
      p.concerns.forEach((c) => {
        concernCount[c] = (concernCount[c] ?? 0) + 1;
      });
    });
    const topConcerns = Object.entries(concernCount)
      .map(([concern, count]) => ({ concern, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Response count per question
    const questionStats = await prisma.survey_Question.findMany({
      include: {
        _count: { select: { responses: true } },
      },
    });

    res.json({
      data: {
        total_quiz_takers: totalSubmissions.length,
        skin_type_distribution: skinTypes.map((s) => ({
          skin_type: s.skin_type,
          count: s._count.skin_type,
        })),
        top_concerns: topConcerns,
        question_response_counts: questionStats.map((q) => ({
          question_id: q.question_id,
          question_text: q.question_text,
          response_count: q._count.responses,
        })),
      },
    });
  } catch (err) {
    console.error("[analytics] getQuizAnalytics error:", err);
    res.status(500).json({ error: "Failed to fetch quiz analytics" });
  }
};

// GET /api/admin/analytics/customers?days=30
export const getCustomerAnalytics: RequestHandler = async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const since = new Date();
    since.setDate(since.getDate() - days);

    const [totalCustomers, newCustomers, activeCustomers] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { created_at: { gte: since } } }),
      prisma.order.groupBy({
        by: ["customer_id"],
        where: { created_at: { gte: since } },
      }).then((r) => r.length),
    ]);

    res.json({
      data: {
        total_customers: totalCustomers,
        new_customers_last_n_days: newCustomers,
        active_customers_last_n_days: activeCustomers,
        period_days: days,
      },
    });
  } catch (err) {
    console.error("[analytics] getCustomerAnalytics error:", err);
    res.status(500).json({ error: "Failed to fetch customer analytics" });
  }
};
