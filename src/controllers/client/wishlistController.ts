import { RequestHandler } from "express";
import prisma from "../../config/prisma";
import { AuthRequest } from "../../middleware/authMiddleware";

// GET /api/wishlist
export const getWishlist: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    const items = await prisma.wishlistItem.findMany({
      where: { customer_id: customerId },
      include: {
        product: {
          include: {
            images: { where: { is_primary: true } },
            variants: true,
          },
        },
      },
      orderBy: { added_at: "desc" },
    });

    res.json({ data: items });
  } catch (err) {
    console.error("[wishlist] getWishlist error:", err);
    res.status(500).json({ error: "Failed to fetch wishlist" });
  }
};

// POST /api/wishlist
// Body: { product_id }
export const addToWishlist: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    const { product_id } = req.body;
    if (!product_id || typeof product_id !== "number") {
      return res.status(400).json({ error: "product_id is required" });
    }

    const product = await prisma.product.findUnique({ where: { product_id } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    const item = await prisma.wishlistItem.upsert({
      where: { customer_id_product_id: { customer_id: customerId, product_id } },
      create: { customer_id: customerId, product_id },
      update: {},
    });

    res.status(201).json({ message: "Added to wishlist", data: item });
  } catch (err) {
    console.error("[wishlist] addToWishlist error:", err);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
};

// DELETE /api/wishlist/:productId
export const removeFromWishlist: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    const product_id = parseInt(req.params.productId as string);
    if (isNaN(product_id)) return res.status(400).json({ error: "Invalid product ID" });

    await prisma.wishlistItem.delete({
      where: { customer_id_product_id: { customer_id: customerId, product_id } },
    });

    res.json({ message: "Removed from wishlist" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Item not in wishlist" });
    console.error("[wishlist] removeFromWishlist error:", err);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
};

// DELETE /api/wishlist
export const clearWishlist: RequestHandler = async (req, res) => {
  try {
    const customerId = (req as AuthRequest).user?.customerId;
    if (!customerId) return res.status(401).json({ error: "Unauthorized" });

    await prisma.wishlistItem.deleteMany({ where: { customer_id: customerId } });

    res.json({ message: "Wishlist cleared" });
  } catch (err) {
    console.error("[wishlist] clearWishlist error:", err);
    res.status(500).json({ error: "Failed to clear wishlist" });
  }
};
