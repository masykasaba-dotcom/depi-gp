import { RequestHandler } from "express";
import prisma from "../../config/prisma";

// ─── PUBLIC ───────────────────────────────────────────────────────────────────

// GET /api/ingredients?page=1&limit=20&search=
export const getIngredients: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search as string | undefined;

    const where = search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {};

    const [total, ingredients] = await Promise.all([
      prisma.ingredient.count({ where }),
      prisma.ingredient.findMany({ where, skip, take: limit, orderBy: { name: "asc" } }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: ingredients });
  } catch (err) {
    console.error("[ingredients] getIngredients error:", err);
    res.status(500).json({ error: "Failed to fetch ingredients" });
  }
};

// GET /api/ingredients/:id
export const getIngredientById: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ingredient ID" });

    const ingredient = await prisma.ingredient.findUnique({
      where: { ingredient_id: id },
      include: {
        product_ingredients: {
          include: { product: { include: { images: { where: { is_primary: true } } } } },
        },
      },
    });

    if (!ingredient) return res.status(404).json({ error: "Ingredient not found" });

    res.json({ data: ingredient });
  } catch (err) {
    console.error("[ingredients] getIngredientById error:", err);
    res.status(500).json({ error: "Failed to fetch ingredient" });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// POST /api/admin/ingredients
export const createIngredient: RequestHandler = async (req, res) => {
  try {
    const { name, description, benefits, concerns, skin_types } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const ingredient = await prisma.ingredient.create({
      data: { name, description, benefits, concerns, skin_types: skin_types ?? [] },
    });

    res.status(201).json({ message: "Ingredient created", data: ingredient });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Ingredient already exists" });
    console.error("[ingredients] createIngredient error:", err);
    res.status(500).json({ error: "Failed to create ingredient" });
  }
};

// PUT /api/admin/ingredients/:id
export const updateIngredient: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ingredient ID" });

    const { name, description, benefits, concerns, skin_types } = req.body;

    const ingredient = await prisma.ingredient.update({
      where: { ingredient_id: id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(benefits !== undefined && { benefits }),
        ...(concerns !== undefined && { concerns }),
        ...(skin_types !== undefined && { skin_types }),
      },
    });

    res.json({ message: "Ingredient updated", data: ingredient });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Ingredient not found" });
    console.error("[ingredients] updateIngredient error:", err);
    res.status(500).json({ error: "Failed to update ingredient" });
  }
};

// DELETE /api/admin/ingredients/:id
export const deleteIngredient: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ingredient ID" });

    await prisma.ingredient.delete({ where: { ingredient_id: id } });

    res.json({ message: "Ingredient deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Ingredient not found" });
    console.error("[ingredients] deleteIngredient error:", err);
    res.status(500).json({ error: "Failed to delete ingredient" });
  }
};

// POST /api/admin/products/:productId/ingredients
// Body: { ingredient_id }
export const addIngredientToProduct: RequestHandler = async (req, res) => {
  try {
    const product_id = parseInt(req.params.productId as string);
    const { ingredient_id } = req.body;
    if (isNaN(product_id) || !ingredient_id) {
      return res.status(400).json({ error: "product_id and ingredient_id are required" });
    }

    const link = await prisma.product_Ingredient.create({
      data: { product_id, ingredient_id },
    });

    res.status(201).json({ message: "Ingredient linked to product", data: link });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ error: "Already linked" });
    console.error("[ingredients] addIngredientToProduct error:", err);
    res.status(500).json({ error: "Failed to link ingredient" });
  }
};

// DELETE /api/admin/products/:productId/ingredients/:ingredientId
export const removeIngredientFromProduct: RequestHandler = async (req, res) => {
  try {
    const product_id = parseInt(req.params.productId as string);
    const ingredient_id = parseInt(req.params.ingredientId as string);

    await prisma.product_Ingredient.delete({
      where: { product_ingredient_id: (await prisma.product_Ingredient.findFirstOrThrow({
        where: { product_id, ingredient_id },
        select: { product_ingredient_id: true },
      })).product_ingredient_id },
    });

    res.json({ message: "Ingredient removed from product" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Link not found" });
    console.error("[ingredients] removeIngredientFromProduct error:", err);
    res.status(500).json({ error: "Failed to remove ingredient" });
  }
};
