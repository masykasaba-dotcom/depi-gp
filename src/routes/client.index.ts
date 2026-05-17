/**
 * Client Routes — all routes accessible by authenticated customers
 * and public visitors.
 *
 * Mounted in app.ts under their individual prefixes.
 * This barrel file provides a single import point for documentation
 * and future refactoring.
 */

export { default as authRoutes }           from "./authRoutes";
export { default as productRoutes }        from "./productRoutes";
export { default as cartRoutes }           from "./cartRoutes";
export { default as orderRoutes }          from "./orderRoutes";
export { default as profileRoutes }        from "./profileRoutes";
export { default as addressRoutes }        from "./addressRoutes";
export { default as reviewRoutes }         from "./reviewRoutes";
export { default as surveyRoutes }         from "./surveyRoutes";
export { default as recommendationRoutes } from "./recommendationRoutes";
export { default as wishlistRoutes }       from "./wishlistRoutes";
export { default as returnRoutes }         from "./returnRoutes";
export { default as loyaltyRoutes }        from "./loyaltyRoutes";
export { default as couponRoutes }         from "./couponRoutes";
export { default as shippingRoutes }       from "./shippingRoutes";
export { default as webhookRoutes }        from "./webhookRoutes";
