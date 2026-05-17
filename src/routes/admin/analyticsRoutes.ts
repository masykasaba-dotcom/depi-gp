import { Router, RequestHandler } from "express";
import { getRevenue, getTopProducts, getOrdersBreakdown, getQuizAnalytics, getCustomerAnalytics } from "../../controllers/admin/analyticsController";
import { authenticateToken, authorizeRoles } from "../../middleware/authMiddleware";

const router = Router();
router.use(authenticateToken as RequestHandler, authorizeRoles("admin") as RequestHandler);

router.get("/revenue", getRevenue as RequestHandler);
router.get("/top-products", getTopProducts as RequestHandler);
router.get("/orders-breakdown", getOrdersBreakdown as RequestHandler);
router.get("/quiz", getQuizAnalytics as RequestHandler);
router.get("/customers", getCustomerAnalytics as RequestHandler);

export default router;
