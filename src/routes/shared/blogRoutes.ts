import { Router, RequestHandler } from "express";
import { getPosts, getPostBySlug, adminGetPosts, createPost, updatePost, deletePost } from "../../controllers/shared/blogController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();

// Public
router.get("/", getPosts as RequestHandler);
router.get("/:slug", getPostBySlug as RequestHandler);

// Admin
router.get(
  "/admin/all",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  adminGetPosts as RequestHandler
);
router.post(
  "/",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  createPost as RequestHandler
);
router.put(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  updatePost as RequestHandler
);
router.delete(
  "/:id",
  authenticateToken as RequestHandler,
  authorizeRoles("admin") as RequestHandler,
  deletePost as RequestHandler
);

export default router;
