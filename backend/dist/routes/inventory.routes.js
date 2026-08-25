"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const inventory_controller_1 = require("../controllers/inventory.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All inventory routes require authentication and admin privileges
router.use(auth_middleware_1.authenticateToken);
router.use(auth_middleware_1.requireAdmin);
// Inventory logs
router.get('/logs', inventory_controller_1.InventoryController.getAllInventoryLogs);
router.get('/logs/product/:productId', inventory_controller_1.InventoryController.getProductInventoryLogs);
// Stock management
router.post('/adjust', inventory_controller_1.InventoryController.adjustStock);
router.post('/bulk-adjust', inventory_controller_1.InventoryController.bulkAdjustStock);
// Inventory alerts and monitoring
router.get('/alerts', inventory_controller_1.InventoryController.getInventoryAlerts);
router.get('/summary', inventory_controller_1.InventoryController.getInventorySummary);
// Reports
router.get('/valuation', inventory_controller_1.InventoryController.getInventoryValuation);
router.get('/turnover', inventory_controller_1.InventoryController.getInventoryTurnover);
router.get('/movement', inventory_controller_1.InventoryController.getStockMovement);
// Reconciliation
router.post('/reconcile', inventory_controller_1.InventoryController.reconcileInventory);
// Recommendations
router.get('/restock-recommendations', inventory_controller_1.InventoryController.getRestockRecommendations);
exports.default = router;
