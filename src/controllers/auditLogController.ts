import { RequestHandler } from "express";
import prisma from "../config/prisma";

// GET /api/admin/audit-logs?entity=product&admin_id=1&page=1
export const getAuditLogs: RequestHandler = async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const entity = req.query.entity as string | undefined;
    const admin_id = req.query.admin_id ? parseInt(req.query.admin_id as string) : undefined;

    const where: any = {};
    if (entity) where.entity = entity;
    if (admin_id && !isNaN(admin_id)) where.admin_id = admin_id;

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          admin: { select: { admin_id: true, email: true, first_name: true, last_name: true } },
        },
      }),
    ]);

    res.json({ meta: { total, page, pages: Math.ceil(total / limit) }, data: logs });
  } catch (err) {
    console.error("[auditLog] getAuditLogs error:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
};

// Utility: write an audit log entry (to be called from other controllers)
export const writeAuditLog = async (params: {
  admin_id?: number;
  action: string;
  entity: string;
  entity_id?: string | number;
  details?: string;
  ip_address?: string;
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        admin_id: params.admin_id ?? null,
        action: params.action,
        entity: params.entity,
        entity_id: params.entity_id !== undefined ? String(params.entity_id) : null,
        details: params.details ?? null,
        ip_address: params.ip_address ?? null,
      },
    });
  } catch (err) {
    // Don't let audit log failure break the main operation
    console.error("[auditLog] write error:", err);
  }
};
