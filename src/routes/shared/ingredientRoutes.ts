import { Router, RequestHandler } from "express";
import {
  getIngredients, getIngredientById,
  createIngredient, updateIngredient, deleteIngredient,
  addIngredientToProduct, removeIngredientFromProduct,
} from "../../controllers/shared/ingredientController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();

// Public
router.get("/", getIngredients as RequestHandler);
router.get("/:id", getIngredientById as RequestHandler);

// Admin
router.post(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin", "product_manager") as RequestHandler,
  createIngredient as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin", "product_manager") as RequestHandler,
  updateIngredient as RequestHandler
);
router.delete(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin", "product_manager") as RequestHandler,
  deleteIngredient as RequestHandler
);

export default router;
