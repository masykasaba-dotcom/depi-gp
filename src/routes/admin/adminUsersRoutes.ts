import { Router, RequestHandler } from "express";
import { getAdminUsers, getAdminUserById, updateAdminUser, deleteAdminUser } from "../../controllers/admin/adminUsersController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();
router.use(authenticateToken as RequestHandler, authorizeRoles("admin") as RequestHandler);

router.get("/", getAdminUsers as RequestHandler);
router.get("/:id", getAdminUserById as RequestHandler);
router.put("/:id", updateAdminUser as RequestHandler);
router.delete("/:id", deleteAdminUser as RequestHandler);

export default router;
