import { RequestHandler } from "express";
import prisma from "../config/prisma";

// POST /api/contact
export const submitContact: RequestHandler = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "name, email, subject, and message are required" });
    }

    const msg = await prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    res.status(201).json({ message: "Message received. We will get back to you soon.", id: msg.message_id });
  } catch (err) {
    console.error("[contact] submitContact error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// GET /api/admin/contact — Admin: list all messages
export const getContactMessages: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;

    const where = status ? { status } : {};
    const [total, messages] = await Promise.all([
      prisma.contactMessage.count({ where }),
      prisma.contactMessage.findMany({ where, skip, take: limit, orderBy: { created_at: "desc" } }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: messages });
  } catch (err) {
    console.error("[contact] getContactMessages error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

// PUT /api/admin/contact/:id
export const updateMessageStatus: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid message ID" });

    const { status } = req.body;
    const allowed = ["unread", "read", "responded"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${allowed.join(", ")}` });
    }

    const msg = await prisma.contactMessage.update({
      where: { message_id: id },
      data: { status },
    });

    res.json({ message: "Status updated", data: msg });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Message not found" });
    console.error("[contact] updateMessageStatus error:", err);
    res.status(500).json({ error: "Failed to update message" });
  }
};

// DELETE /api/admin/contact/:id
export const deleteContactMessage: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid message ID" });

    await prisma.contactMessage.delete({ where: { message_id: id } });
    res.json({ message: "Message deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Message not found" });
    console.error("[contact] deleteContactMessage error:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
};
