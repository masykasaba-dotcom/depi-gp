/**
 * Admin Routes — all routes restricted to admin users.
 *
 * Mounted in app.ts under their individual prefixes.
 * This barrel file provides a single import point for documentation
 * and future refactoring.
 */

export { default as adminRoutes }        from "./adminRoutes";
export { default as adminUsersRoutes }   from "./adminUsersRoutes";
export { default as dashboardRoutes }    from "./dashboardRoutes";
export { default as analyticsRoutes }    from "./analyticsRoutes";
export { default as auditLogRoutes }     from "./auditLogRoutes";
export { default as returnRoutes }       from "./returnRoutes";
export { default as loyaltyRoutes }      from "./loyaltyRoutes";
export { default as couponRoutes }       from "./couponRoutes";
export { default as flashSaleRoutes }    from "./flashSaleRoutes";
export { default as storeSettingsRoutes } from "./storeSettingsRoutes";
export { default as shippingRuleRoutes } from "./shippingRuleRoutes";
