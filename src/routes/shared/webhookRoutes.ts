import { Router } from "express";
import express from "express";
import { handleStripeWebhook } from "../../controllers/shared/webhookController";

const router = Router();


router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

export default router;
