"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const address_controller_1 = require("../controllers/address.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticateToken);
// Get all addresses for logged-in user
router.get('/', address_controller_1.AddressController.getAll);
// Get default address
router.get('/default', address_controller_1.AddressController.getDefault);
// Get address by ID
router.get('/:id', address_controller_1.AddressController.getById);
// Create new address
router.post('/', address_controller_1.AddressController.create);
// Update address
router.put('/:id', address_controller_1.AddressController.update);
// Set address as default
router.patch('/:id/default', address_controller_1.AddressController.setDefault);
// Delete address
router.delete('/:id', address_controller_1.AddressController.delete);
exports.default = router;
