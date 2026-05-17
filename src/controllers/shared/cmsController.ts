import { RequestHandler } from "express";
import prisma from "../../config/prisma";

// GET /api/cms/:key — public: get a CMS block by key
// Keys examples: "about", "privacy_policy", "terms", "returns_policy", "home_banner"
export const getCmsContent: RequestHandler = async (req, res) => {
  try {
    const key = req.params.key as string;
    const content = await prisma.cmsContent.findUnique({ where: { key } });

    if (!content) return res.status(404).json({ error: "Content not found" });

    res.json({ data: content });
  } catch (err) {
    console.error("[cms] getCmsContent error:", err);
    res.status(500).json({ error: "Failed to fetch content" });
  }
};

// GET /api/cms — public: list all CMS keys (lightweight)
export const listCmsKeys: RequestHandler = async (req, res) => {
  try {
    const items = await prisma.cmsContent.findMany({
      select: { content_id: true, key: true, title: true, content_type: true, updated_at: true },
      orderBy: { key: "asc" },
    });

    res.json({ data: items });
  } catch (err) {
    console.error("[cms] listCmsKeys error:", err);
    res.status(500).json({ error: "Failed to fetch CMS list" });
  }
};

// PUT /api/admin/cms/:key — admin: create or update a CMS block
export const upsertCmsContent: RequestHandler = async (req, res) => {
  try {
    const key = req.params.key as string;
    const { title, content, content_type } = req.body;

    if (!content) return res.status(400).json({ error: "content is required" });

    const result = await prisma.cmsContent.upsert({
      where: { key },
      create: { key, title, content, content_type: content_type ?? "text" },
      update: {
        ...(title !== undefined && { title }),
        content,
        ...(content_type && { content_type }),
      },
    });

    res.json({ message: "CMS content saved", data: result });
  } catch (err) {
    console.error("[cms] upsertCmsContent error:", err);
    res.status(500).json({ error: "Failed to save CMS content" });
  }
};

// DELETE /api/admin/cms/:key
export const deleteCmsContent: RequestHandler = async (req, res) => {
  try {
    const key = req.params.key as string;
    await prisma.cmsContent.delete({ where: { key } });
    res.json({ message: "CMS content deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Content not found" });
    console.error("[cms] deleteCmsContent error:", err);
    res.status(500).json({ error: "Failed to delete CMS content" });
  }
};
