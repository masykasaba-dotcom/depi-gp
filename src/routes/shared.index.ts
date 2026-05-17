/**
 * Shared Routes — accessible by both public visitors and admins.
 * Public endpoints are read-only; write operations require admin JWT.
 */

export { default as ingredientRoutes }    from "./ingredientRoutes";
export { default as faqRoutes }           from "./faqRoutes";
export { default as contactRoutes }       from "./contactRoutes";
export { default as cmsRoutes }           from "./cmsRoutes";
export { default as blogRoutes }          from "./blogRoutes";
export { default as storeSettingsRoutes } from "./storeSettingsRoutes";
export { default as shippingRuleRoutes }  from "./shippingRuleRoutes";
export { default as flashSaleRoutes }     from "./flashSaleRoutes";
