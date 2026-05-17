import { RequestHandler } from "express";
import prisma from "../../config/prisma";

// GET /api/flash-sales/active — public: get currently active flash sales
export const getActiveFlashSales: RequestHandler = async (req, res) => {
  try {
    const now = new Date();
    const sales = await prisma.flashSale.findMany({
      where: {
        is_active: true,
        starts_at: { lte: now },
        ends_at: { gte: now },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { is_primary: true } },
                variants: true,
              },
            },
          },
        },
      },
    });

    res.json({ data: sales });
  } catch (err) {
    console.error("[flashSale] getActiveFlashSales error:", err);
    res.status(500).json({ error: "Failed to fetch flash sales" });
  }
};

// GET /api/admin/flash-sales
export const getFlashSales: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [total, sales] = await Promise.all([
      prisma.flashSale.count(),
      prisma.flashSale.findMany({
        skip,
        take: limit,
        orderBy: { starts_at: "desc" },
        include: { _count: { select: { items: true } } },
      }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: sales });
  } catch (err) {
    console.error("[flashSale] getFlashSales error:", err);
    res.status(500).json({ error: "Failed to fetch flash sales" });
  }
};

// POST /api/admin/flash-sales
// Body: { title, description, discount_pct, starts_at, ends_at, product_ids[] }
export const createFlashSale: RequestHandler = async (req, res) => {
  try {
    const { title, description, discount_pct, starts_at, ends_at, product_ids } = req.body;
    if (!title || discount_pct === undefined || !starts_at || !ends_at) {
      return res.status(400).json({ error: "title, discount_pct, starts_at, ends_at are required" });
    }

    const sale = await prisma.flashSale.create({
      data: {
        title,
        description,
        discount_pct: parseInt(discount_pct),
        starts_at: new Date(starts_at),
        ends_at: new Date(ends_at),
        items: product_ids?.length
          ? { create: product_ids.map((product_id: number) => ({ product_id })) }
          : undefined,
      },
      include: { items: true },
    });

    res.status(201).json({ message: "Flash sale created", data: sale });
  } catch (err) {
    console.error("[flashSale] createFlashSale error:", err);
    res.status(500).json({ error: "Failed to create flash sale" });
  }
};

// PUT /api/admin/flash-sales/:id
export const updateFlashSale: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    const { title, description, discount_pct, starts_at, ends_at, is_active } = req.body;

    const sale = await prisma.flashSale.update({
      where: { flash_sale_id: id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(discount_pct !== undefined && { discount_pct: parseInt(discount_pct) }),
        ...(starts_at && { starts_at: new Date(starts_at) }),
        ...(ends_at && { ends_at: new Date(ends_at) }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    res.json({ message: "Flash sale updated", data: sale });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Flash sale not found" });
    console.error("[flashSale] updateFlashSale error:", err);
    res.status(500).json({ error: "Failed to update flash sale" });
  }
};

// DELETE /api/admin/flash-sales/:id
export const deleteFlashSale: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

    await prisma.flashSale.delete({ where: { flash_sale_id: id } });
    res.json({ message: "Flash sale deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Flash sale not found" });
    console.error("[flashSale] deleteFlashSale error:", err);
    res.status(500).json({ error: "Failed to delete flash sale" });
  }
};

// POST /api/admin/flash-sales/:id/products — add products to a flash sale
export const addProductToFlashSale: RequestHandler = async (req, res) => {
  try {
    const flash_sale_id = parseInt(req.params.id as string);
    const { product_id } = req.body;
    if (isNaN(flash_sale_id) || !product_id) {
      return res.status(400).json({ error: "flash_sale_id and product_id required" });
    }

    const item = await prisma.flashSaleItem.create({ data: { flash_sale_id, product_id } });
    res.status(201).json({ message: "Product added to flash sale", data: item });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Product already in this flash sale" });
    console.error("[flashSale] addProductToFlashSale error:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
};

// DELETE /api/admin/flash-sales/:id/products/:productId
export const removeProductFromFlashSale: RequestHandler = async (req, res) => {
  try {
    const flash_sale_id = parseInt(req.params.id as string);
    const product_id = parseInt(req.params.productId as string);

    await prisma.flashSaleItem.deleteMany({ where: { flash_sale_id, product_id } });
    res.json({ message: "Product removed from flash sale" });
  } catch (err) {
    console.error("[flashSale] removeProductFromFlashSale error:", err);
    res.status(500).json({ error: "Failed to remove product" });
  }
};
