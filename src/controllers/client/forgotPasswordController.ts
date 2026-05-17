import crypto from "crypto";
import bcrypt from "bcrypt";
import { RequestHandler } from "express";
import prisma from "../../config/prisma";

// POST /api/auth/forgot-password
// Body: { email }
// NOTE: In production, send `token` via email instead of returning it in the response.
export const forgotPassword: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const customer = await prisma.customer.findUnique({ where: { email } });
    // Always respond 200 to prevent email enumeration
    if (!customer) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Invalidate existing tokens for this customer
    await prisma.passwordResetToken.updateMany({
      where: { customer_id: customer.customer_id, used: false },
      data: { used: true },
    });

    const token = crypto.randomBytes(32).toString("hex");
    const expires_at = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        customer_id: customer.customer_id,
        token,
        expires_at,
      },
    });

    // TODO (production): send email with reset link containing the token
    // e.g. `https://yourapp.com/reset-password?token=${token}`
    console.log(`[forgotPassword] Reset token for ${email}: ${token}`);

    res.json({
      message: "If that email exists, a reset link has been sent.",
      dev_token: token, // Always returned for testing in this GP
    });
  } catch (err) {
    console.error("[auth] forgotPassword error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// POST /api/auth/reset-password
// Body: { token, new_password }
export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ error: "token and new_password are required" });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });

    if (!resetToken || resetToken.used) {
      return res.status(400).json({ error: "Invalid or already used token" });
    }
    if (new Date() > resetToken.expires_at) {
      return res.status(400).json({ error: "Token has expired" });
    }

    const password_hash = await bcrypt.hash(new_password, 12);

    await prisma.$transaction([
      prisma.customer.update({
        where: { customer_id: resetToken.customer_id },
        data: { password_hash },
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("[auth] resetPassword error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};
