import { RequestHandler } from "express";
import prisma from "../config/prisma";

// GET /api/store-settings — public: get all active store settings as key-value map
export const getStoreSettings: RequestHandler = async (req, res) => {
  try {
    const settings = await prisma.storeSettings.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => { map[s.key] = s.value; });
    res.json({ data: map });
  } catch (err) {
    console.error("[storeSettings] getStoreSettings error:", err);
    res.status(500).json({ error: "Failed to fetch store settings" });
  }
};

// GET /api/admin/store-settings — admin: list all settings (with IDs)
export const adminGetStoreSettings: RequestHandler = async (req, res) => {
  try {
    const settings = await prisma.storeSettings.findMany({ orderBy: { key: "asc" } });
    res.json({ data: settings });
  } catch (err) {
    console.error("[storeSettings] adminGetStoreSettings error:", err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

// PUT /api/admin/store-settings — admin: bulk upsert settings
// Body: { settings: { key: string, value: string }[] }
export const updateStoreSettings: RequestHandler = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({ error: "settings must be a non-empty array of {key, value} objects" });
    }

    const results = await Promise.all(
      settings.map((s: { key: string; value: string }) =>
        prisma.storeSettings.upsert({
          where: { key: s.key },
          create: { key: s.key, value: s.value },
          update: { value: s.value },
        })
      )
    );

    res.json({ message: `${results.length} setting(s) saved`, data: results });
  } catch (err) {
    console.error("[storeSettings] updateStoreSettings error:", err);
    res.status(500).json({ error: "Failed to update settings" });
  }
};

// DELETE /api/admin/store-settings/:key
export const deleteStoreSetting: RequestHandler = async (req, res) => {
  try {
    await prisma.storeSettings.delete({ where: { key: req.params.key as string } });
    res.json({ message: "Setting deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Setting not found" });
    console.error("[storeSettings] deleteStoreSetting error:", err);
    res.status(500).json({ error: "Failed to delete setting" });
  }
};
