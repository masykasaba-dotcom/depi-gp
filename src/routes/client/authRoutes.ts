import { Router, RequestHandler } from "express";
import { register, login, registerAdmin } from "../../controllers/client/authController";
import { forgotPassword, resetPassword } from "../../controllers/client/forgotPasswordController";
import { authenticateToken, authorizeRoles, AuthRequest } from "../../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);

// Password reset
router.post("/forgot-password", forgotPassword as RequestHandler);
router.post("/reset-password", resetPassword as RequestHandler);

router.post(
  "/admin/register",
  registerAdmin as RequestHandler
);

router.get("/me", authenticateToken as RequestHandler, (req, res) => {
  const authReq = req as AuthRequest;
  res.json({ customer: authReq.user });
});

export default router;
