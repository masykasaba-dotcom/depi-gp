import { Router, RequestHandler } from "express";
import {
  calculateShipping, getShippingRules,
  createShippingRule, updateShippingRule, deleteShippingRule,
} from "../../controllers/shared/shippingRuleController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();

// Public: calculate shipping cost
router.get("/calculate", calculateShipping as RequestHandler);

// Admin
router.get(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  getShippingRules as RequestHandler
);
router.post(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  createShippingRule as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  updateShippingRule as RequestHandler
);
router.delete(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  deleteShippingRule as RequestHandler
);

export default router;
