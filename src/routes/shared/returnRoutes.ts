import { Router, RequestHandler } from "express";
import { requestReturn, getMyReturns, getReturns, updateReturnStatus } from "../../controllers/shared/returnController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();

// Client
router.post("/", authenticateToken as RequestHandler, requestReturn as RequestHandler);
router.get("/me", authenticateToken as RequestHandler, getMyReturns as RequestHandler);

// Admin
router.get(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  getReturns as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  updateReturnStatus as RequestHandler
);

export default router;
