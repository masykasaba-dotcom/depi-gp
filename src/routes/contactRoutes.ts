import { Router, RequestHandler } from "express";
import { submitContact, getContactMessages, updateMessageStatus, deleteContactMessage } from "../controllers/contactController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Public
router.post("/", submitContact as RequestHandler);

// Admin
router.get(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  getContactMessages as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  updateMessageStatus as RequestHandler
);
router.delete(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  deleteContactMessage as RequestHandler
);

export default router;
