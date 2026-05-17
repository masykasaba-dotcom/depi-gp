import { Router } from "express";
import { getProducts, getProductById, getCategories, getFeaturedProducts } from "../../controllers/client/productController";

const router = Router();

router.get("/categories", getCategories);
router.get("/products/featured", getFeaturedProducts); // must be before /:id
router.get("/products", getProducts);
router.get("/products/:id", getProductById);


export default router;
