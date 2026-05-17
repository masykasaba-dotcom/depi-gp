import { Router, RequestHandler } from "express";
import { register, login, registerAdmin } from "../controllers/authController";
import { forgotPassword, resetPassword } from "../controllers/forgotPasswordController";
import { authenticateToken, authorizeRoles, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Password reset
router.post("/forgot-password", forgotPassword as RequestHandler);
router.post("/reset-password", resetPassword as RequestHandler);

// P0: Admin registration is now protected — requires an existing admin JWT
router.post(
  "/admin/register",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  registerAdmin as RequestHandler
);

router.get("/me", authenticateToken as RequestHandler, (req, res) => {
  const authReq = req as AuthRequest;
  res.json({ customer: authReq.user });
});

export default router;
