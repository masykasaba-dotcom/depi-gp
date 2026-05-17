$src = "f:\WEB\Graduation Project\Backend\DEPI-s-GP-Backend\src"

# 1. Create subdirectories
New-Item -ItemType Directory -Force "$src\controllers\admin"
New-Item -ItemType Directory -Force "$src\controllers\client"
New-Item -ItemType Directory -Force "$src\controllers\shared"
New-Item -ItemType Directory -Force "$src\routes\admin"
New-Item -ItemType Directory -Force "$src\routes\client"
New-Item -ItemType Directory -Force "$src\routes\shared"

# 2. Move CONTROLLERS
$admin_c = @("adminController","adminUsersController","dashboardController","analyticsController","auditLogController","shippingController")
$client_c = @("authController","forgotPasswordController","profileController","addressController","productController","cartController","orderController","paymentController","reviewController","surveyController","recommendationController","wishlistController")
$shared_c = @("ingredientController","faqController","contactController","cmsController","blogController","couponController","flashSaleController","returnController","loyaltyController","storeSettingsController","shippingRuleController","webhookController")

foreach ($f in $admin_c)  { Move-Item -Force "$src\controllers\$f.ts" "$src\controllers\admin\$f.ts" }
foreach ($f in $client_c) { Move-Item -Force "$src\controllers\$f.ts" "$src\controllers\client\$f.ts" }
foreach ($f in $shared_c) { Move-Item -Force "$src\controllers\$f.ts" "$src\controllers\shared\$f.ts" }

# 3. Move ROUTES
$admin_r  = @("adminRoutes","adminUsersRoutes","dashboardRoutes","analyticsRoutes","auditLogRoutes")
$client_r = @("authRoutes","productRoutes","cartRoutes","orderRoutes","profileRoutes","addressRoutes","reviewRoutes","surveyRoutes","recommendationRoutes","wishlistRoutes")
$shared_r = @("ingredientRoutes","faqRoutes","contactRoutes","cmsRoutes","blogRoutes","couponRoutes","flashSaleRoutes","returnRoutes","loyaltyRoutes","storeSettingsRoutes","shippingRuleRoutes","shippingRoutes","webhookRoutes")

foreach ($f in $admin_r)  { Move-Item -Force "$src\routes\$f.ts" "$src\routes\admin\$f.ts" }
foreach ($f in $client_r) { Move-Item -Force "$src\routes\$f.ts" "$src\routes\client\$f.ts" }
foreach ($f in $shared_r) { Move-Item -Force "$src\routes\$f.ts" "$src\routes\shared\$f.ts" }

# 4. Fix imports in CONTROLLERS (all subdirs) — "../../" instead of "../"
$ctrlDirs = @("$src\controllers\admin","$src\controllers\client","$src\controllers\shared")
foreach ($dir in $ctrlDirs) {
  Get-ChildItem "$dir\*.ts" | ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    $c = $c -replace '"\.\.\/config\/',  '"../../config/'
    $c = $c -replace '"\.\.\/middleware\/','../../middleware/'
    $c = $c -replace '"\.\.\/utils\/',    '"../../utils/'
    $c = $c -replace '"\.\.\/generated\/','"../../generated/'
    $c = $c -replace "'\.\.\/config\/",   "'../../config/"
    $c = $c -replace "'\.\.\/middleware\/","'../../middleware/"
    Set-Content $_.FullName $c -NoNewline
  }
}

# 5. Fix imports in ROUTES subdirs
$controllerMap = @{
  "adminController"          = "admin"
  "adminUsersController"     = "admin"
  "dashboardController"      = "admin"
  "analyticsController"      = "admin"
  "auditLogController"       = "admin"
  "shippingController"       = "admin"
  "authController"           = "client"
  "forgotPasswordController" = "client"
  "profileController"        = "client"
  "addressController"        = "client"
  "productController"        = "client"
  "cartController"           = "client"
  "orderController"          = "client"
  "paymentController"        = "client"
  "reviewController"         = "client"
  "surveyController"         = "client"
  "recommendationController" = "client"
  "wishlistController"       = "client"
  "ingredientController"     = "shared"
  "faqController"            = "shared"
  "contactController"        = "shared"
  "cmsController"            = "shared"
  "blogController"           = "shared"
  "couponController"         = "shared"
  "flashSaleController"      = "shared"
  "returnController"         = "shared"
  "loyaltyController"        = "shared"
  "storeSettingsController"  = "shared"
  "shippingRuleController"   = "shared"
  "webhookController"        = "shared"
}

$routeDirs = @("$src\routes\admin","$src\routes\client","$src\routes\shared")
foreach ($dir in $routeDirs) {
  Get-ChildItem "$dir\*.ts" | ForEach-Object {
    $c = Get-Content $_.FullName -Raw
    # Fix middleware path
    $c = $c -replace '"\.\.\/middleware\/', '"../../middleware/'
    # Fix each controller import
    foreach ($ctrl in $controllerMap.Keys) {
      $cat = $controllerMap[$ctrl]
      $c = $c -replace [regex]::Escape("`"../controllers/$ctrl`""), "`"../../controllers/$cat/$ctrl`""
    }
    Set-Content $_.FullName $c -NoNewline
  }
}

Write-Host "✅ Restructure complete!"
