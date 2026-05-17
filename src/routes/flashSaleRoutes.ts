import { Router, RequestHandler } from "express";
import {
  getActiveFlashSales, getFlashSales, createFlashSale, updateFlashSale,
  deleteFlashSale, addProductToFlashSale, removeProductFromFlashSale,
} from "../controllers/flashSaleController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";

const router = Router();

// Public
router.get("/active", getActiveFlashSales as RequestHandler);

// Admin
router.get(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin", "product_manager") as RequestHandler,
  getFlashSales as RequestHandler
);
router.post(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  createFlashSale as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  updateFlashSale as RequestHandler
);
router.delete(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  deleteFlashSale as RequestHandler
);
router.post(
  "/:id/products",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  addProductToFlashSale as RequestHandler
);
router.delete(
  "/:id/products/:productId",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  removeProductFromFlashSale as RequestHandler
);

export default router;
