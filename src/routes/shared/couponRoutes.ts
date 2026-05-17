import { Router, RequestHandler } from "express";
import { validateCoupon, getCoupons, createCoupon, updateCoupon, deleteCoupon } from "../../controllers/shared/couponController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();

// Client: validate coupon
router.post("/validate", authenticateToken as RequestHandler, validateCoupon as RequestHandler);

// Admin
router.get(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  getCoupons as RequestHandler
);
router.post(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  createCoupon as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  updateCoupon as RequestHandler
);
router.delete(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  deleteCoupon as RequestHandler
);

export default router;
