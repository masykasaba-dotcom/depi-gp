import { Router, RequestHandler } from "express";
import { getCmsContent, listCmsKeys, upsertCmsContent, deleteCmsContent } from "../controllers/cmsController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Public
router.get("/", listCmsKeys as RequestHandler);
router.get("/:key", getCmsContent as RequestHandler);

// Admin
router.put(
  "/:key",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  upsertCmsContent as RequestHandler
);
router.delete(
  "/:key",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  deleteCmsContent as RequestHandler
);

export default router;
