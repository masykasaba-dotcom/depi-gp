import { Router, RequestHandler } from "express";
import { getWishlist, addToWishlist, removeFromWishlist, clearWishlist } from "../controllers/wishlistController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();
router.use(authenticateToken as RequestHandler);

router.get("/", getWishlist as RequestHandler);
router.post("/", addToWishlist as RequestHandler);
router.delete("/", clearWishlist as RequestHandler);
router.delete("/:productId", removeFromWishlist as RequestHandler);

export default router;
