import { Router, RequestHandler } from "express";
import { getAuditLogs } from "../../controllers/admin/auditLogController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();
router.use(authenticateToken as RequestHandler, authorizeRoles("admin") as RequestHandler);

router.get("/", getAuditLogs as RequestHandler);

export default router;
