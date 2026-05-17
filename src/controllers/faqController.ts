import { RequestHandler } from "express";
import prisma from "../config/prisma";

// GET /api/faqs?category=shipping
export const getFaqs: RequestHandler = async (req, res) => {
  try {
    const category = req.query.category as string | undefined;
    const where: any = { is_active: true };
    if (category) where.category = category;

    const faqs = await prisma.faq.findMany({
      where,
      orderBy: [{ category: "asc" }, { sort_order: "asc" }],
    });

    res.json({ data: faqs });
  } catch (err) {
    console.error("[faq] getFaqs error:", err);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
};

// POST /api/admin/faqs
export const createFaq: RequestHandler = async (req, res) => {
  try {
    const { question, answer, category, sort_order } = req.body;
    if (!question || !answer) {
      return res.status(400).json({ error: "question and answer are required" });
    }

    const faq = await prisma.faq.create({
      data: { question, answer, category: category ?? null, sort_order: sort_order ?? 0 },
    });

    res.status(201).json({ message: "FAQ created", data: faq });
  } catch (err) {
    console.error("[faq] createFaq error:", err);
    res.status(500).json({ error: "Failed to create FAQ" });
  }
};

// PUT /api/admin/faqs/:id
export const updateFaq: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid FAQ ID" });

    const { question, answer, category, sort_order, is_active } = req.body;

    const faq = await prisma.faq.update({
      where: { faq_id: id },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(category !== undefined && { category }),
        ...(sort_order !== undefined && { sort_order }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    res.json({ message: "FAQ updated", data: faq });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "FAQ not found" });
    console.error("[faq] updateFaq error:", err);
    res.status(500).json({ error: "Failed to update FAQ" });
  }
};

// DELETE /api/admin/faqs/:id
export const deleteFaq: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid FAQ ID" });

    await prisma.faq.delete({ where: { faq_id: id } });
    res.json({ message: "FAQ deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "FAQ not found" });
    console.error("[faq] deleteFaq error:", err);
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
};
