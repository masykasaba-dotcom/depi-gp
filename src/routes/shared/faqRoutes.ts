import { Router, RequestHandler } from "express";
import { getFaqs, createFaq, updateFaq, deleteFaq } from "../../controllers/shared/faqController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();

// Public
router.get("/", getFaqs as RequestHandler);

// Admin
router.post(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  createFaq as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  updateFaq as RequestHandler
);
router.delete(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  deleteFaq as RequestHandler
);

export default router;
