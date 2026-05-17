import { Router, RequestHandler } from "express";
import {
  getStoreSettings, adminGetStoreSettings,
  updateStoreSettings, deleteStoreSetting,
} from "../../controllers/shared/storeSettingsController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();

// Public: get all settings as a map
router.get("/", getStoreSettings as RequestHandler);

// Admin
router.get(
  "/admin",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  adminGetStoreSettings as RequestHandler
);
router.put(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  updateStoreSettings as RequestHandler
);
router.delete(
  "/:key",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  deleteStoreSetting as RequestHandler
);

export default router;
