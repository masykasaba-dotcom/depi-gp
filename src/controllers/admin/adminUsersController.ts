import { RequestHandler } from "express";
import bcrypt from "bcrypt";
import prisma from "../../config/prisma";

// GET /api/admin/users
export const getAdminUsers: RequestHandler = async (req, res) => {
  try {
    const admins = await prisma.admin.findMany({
      select: {
        admin_id: true, email: true, first_name: true,
        last_name: true, role: true, is_active: true, created_at: true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ data: admins });
  } catch (err) {
    console.error("[adminUsers] getAdminUsers error:", err);
    res.status(500).json({ error: "Failed to fetch admin users" });
  }
};

// GET /api/admin/users/:id
export const getAdminUserById: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid admin ID" });

    const admin = await prisma.admin.findUnique({
      where: { admin_id: id },
      select: {
        admin_id: true, email: true, first_name: true,
        last_name: true, role: true, is_active: true, created_at: true,
      },
    });

    if (!admin) return res.status(404).json({ error: "Admin not found" });

    res.json({ data: admin });
  } catch (err) {
    console.error("[adminUsers] getAdminUserById error:", err);
    res.status(500).json({ error: "Failed to fetch admin user" });
  }
};

// PUT /api/admin/users/:id
export const updateAdminUser: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid admin ID" });

    const { first_name, last_name, role, is_active, password } = req.body;
    const allowedRoles = ["admin", "product_manager", "support"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: `role must be one of: ${allowedRoles.join(", ")}` });
    }

    const updateData: any = {
      ...(first_name && { first_name }),
      ...(last_name && { last_name }),
      ...(role && { role }),
      ...(is_active !== undefined && { is_active }),
    };

    if (password) {
      if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    const admin = await prisma.admin.update({
      where: { admin_id: id },
      data: updateData,
      select: {
        admin_id: true, email: true, first_name: true,
        last_name: true, role: true, is_active: true,
      },
    });

    res.json({ message: "Admin user updated", data: admin });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Admin not found" });
    console.error("[adminUsers] updateAdminUser error:", err);
    res.status(500).json({ error: "Failed to update admin user" });
  }
};

// DELETE /api/admin/users/:id
export const deleteAdminUser: RequestHandler = async (req, res) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid admin ID" });

    await prisma.admin.delete({ where: { admin_id: id } });
    res.json({ message: "Admin user deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ error: "Admin not found" });
    console.error("[adminUsers] deleteAdminUser error:", err);
    res.status(500).json({ error: "Failed to delete admin user" });
  }
};
