import { Router, RequestHandler } from "express";
import {
  getLoyaltyBalance, getLoyaltyHistory, redeemPoints,
  awardLoyaltyPoints, getLoyaltySummary,
} from "../controllers/loyaltyController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Client
router.get("/balance", authenticateToken as RequestHandler, getLoyaltyBalance as RequestHandler);
router.get("/history", authenticateToken as RequestHandler, getLoyaltyHistory as RequestHandler);
router.post("/redeem", authenticateToken as RequestHandler, redeemPoints as RequestHandler);

// Admin
router.get(
  "/summary",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  getLoyaltySummary as RequestHandler
);
router.post(
  "/award",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  awardLoyaltyPoints as RequestHandler
);

export default router;
