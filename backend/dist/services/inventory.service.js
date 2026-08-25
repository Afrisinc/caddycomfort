"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const database_1 = __importDefault(require("../config/database"));
class InventoryService {
    /**
     * Get inventory logs for a product
     */
    static async getProductInventoryLogs(productId, page = 1, limit = 20, type) {
        const skip = (page - 1) * limit;
        const where = { productId };
        if (type) {
            where.type = type;
        }
        const [logs, total] = await Promise.all([
            database_1.default.inventoryLog.findMany({
                where,
                include: {
                    product: {
                        select: {
                            name: true,
                            sku: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.default.inventoryLog.count({ where }),
        ]);
        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Get all inventory logs (admin)
     */
    static async getAllInventoryLogs(page = 1, limit = 50, type, startDate, endDate) {
        const skip = (page - 1) * limit;
        const where = {};
        if (type)
            where.type = type;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const [logs, total] = await Promise.all([
            database_1.default.inventoryLog.findMany({
                where,
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            sku: true,
                            stockQuantity: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            database_1.default.inventoryLog.count({ where }),
        ]);
        return {
            logs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Adjust stock quantity
     */
    static async adjustStock(input) {
        const { productId, quantity, type, reason } = input;
        const product = await database_1.default.product.findUnique({
            where: { id: productId },
        });
        if (!product) {
            throw new Error('Product not found');
        }
        // Validate quantity based on type
        if (type === 'RESTOCK' || type === 'RETURN') {
            if (quantity <= 0) {
                throw new Error('Quantity must be positive for this operation');
            }
        }
        else if (type === 'SALE' || type === 'DAMAGED') {
            if (quantity >= 0) {
                throw new Error('Quantity must be negative for this operation');
            }
        }
        // ADJUSTMENT can be positive or negative
        // Calculate new stock quantity
        let newQuantity = product.stockQuantity + quantity;
        if (newQuantity < 0) {
            throw new Error('Insufficient stock for this adjustment');
        }
        // Update stock in transaction
        const [updatedProduct, log] = await database_1.default.$transaction([
            database_1.default.product.update({
                where: { id: productId },
                data: { stockQuantity: newQuantity },
            }),
            database_1.default.inventoryLog.create({
                data: {
                    productId,
                    type,
                    quantity,
                    reason,
                },
            }),
        ]);
        return {
            product: updatedProduct,
            log,
        };
    }
    /**
     * Bulk stock adjustment
     */
    static async bulkAdjustStock(adjustments) {
        const results = [];
        const errors = [];
        for (const adjustment of adjustments) {
            try {
                const result = await this.adjustStock(adjustment);
                results.push({
                    productId: adjustment.productId,
                    success: true,
                    result,
                });
            }
            catch (error) {
                errors.push({
                    productId: adjustment.productId,
                    success: false,
                    error: error.message,
                });
            }
        }
        return {
            successful: results,
            failed: errors,
            summary: {
                total: adjustments.length,
                successful: results.length,
                failed: errors.length,
            },
        };
    }
    /**
     * Get inventory alerts (low stock and out of stock)
     */
    static async getInventoryAlerts(lowStockThreshold = 10) {
        const products = await database_1.default.product.findMany({
            where: {
                isActive: true,
                stockQuantity: {
                    lte: lowStockThreshold,
                },
            },
            select: {
                id: true,
                name: true,
                stockQuantity: true,
            },
            orderBy: {
                stockQuantity: 'asc',
            },
        });
        return products.map((product) => ({
            productId: product.id,
            productName: product.name,
            currentStock: product.stockQuantity,
            threshold: lowStockThreshold,
            alertType: product.stockQuantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
        }));
    }
    /**
     * Get inventory summary
     */
    static async getInventorySummary() {
        const [totalProducts, totalStockValue, lowStockCount, outOfStockCount, activeProducts, inactiveProducts,] = await Promise.all([
            database_1.default.product.count(),
            database_1.default.product.aggregate({
                _sum: {
                    stockQuantity: true,
                },
            }),
            database_1.default.product.count({
                where: {
                    isActive: true,
                    stockQuantity: {
                        gt: 0,
                        lte: 10,
                    },
                },
            }),
            database_1.default.product.count({
                where: {
                    isActive: true,
                    stockQuantity: 0,
                },
            }),
            database_1.default.product.count({
                where: { isActive: true },
            }),
            database_1.default.product.count({
                where: { isActive: false },
            }),
        ]);
        // Calculate total inventory value
        const products = await database_1.default.product.findMany({
            select: {
                price: true,
                stockQuantity: true,
            },
        });
        const totalValue = products.reduce((sum, product) => sum + product.price * product.stockQuantity, 0);
        return {
            totalProducts,
            activeProducts,
            inactiveProducts,
            totalStockQuantity: totalStockValue._sum.stockQuantity || 0,
            totalInventoryValue: totalValue,
            lowStockCount,
            outOfStockCount,
        };
    }
    /**
     * Get inventory valuation report
     */
    static async getInventoryValuation() {
        const products = await database_1.default.product.findMany({
            select: {
                id: true,
                name: true,
                sku: true,
                price: true,
                stockQuantity: true,
                isActive: true,
                category: {
                    select: {
                        name: true,
                    },
                },
            },
            where: {
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        const valuation = products.map((product) => ({
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            category: product.category?.name || 'Uncategorized',
            unitPrice: product.price,
            quantity: product.stockQuantity,
            totalValue: product.price * product.stockQuantity,
        }));
        const totalValue = valuation.reduce((sum, item) => sum + item.totalValue, 0);
        const totalQuantity = valuation.reduce((sum, item) => sum + item.quantity, 0);
        return {
            items: valuation,
            summary: {
                totalProducts: products.length,
                totalQuantity,
                totalValue,
                averageValue: totalValue / products.length,
            },
        };
    }
    /**
     * Get inventory turnover report
     */
    static async getInventoryTurnover(days = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        // Get sales data from inventory logs
        const salesLogs = await database_1.default.inventoryLog.findMany({
            where: {
                type: 'SALE',
                createdAt: {
                    gte: startDate,
                },
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                        stockQuantity: true,
                        price: true,
                    },
                },
            },
        });
        // Group by product
        const productSales = salesLogs.reduce((acc, log) => {
            const productId = log.productId;
            if (!acc[productId]) {
                acc[productId] = {
                    product: log.product,
                    totalSold: 0,
                    salesCount: 0,
                };
            }
            acc[productId].totalSold += Math.abs(log.quantity);
            acc[productId].salesCount += 1;
            return acc;
        }, {});
        const turnoverData = Object.values(productSales).map((data) => {
            const averageStock = data.product.stockQuantity + data.totalSold / 2;
            const turnoverRate = averageStock > 0 ? (data.totalSold / averageStock) * (365 / days) : 0;
            return {
                productId: data.product.id,
                productName: data.product.name,
                sku: data.product.sku,
                currentStock: data.product.stockQuantity,
                totalSold: data.totalSold,
                salesCount: data.salesCount,
                turnoverRate: Math.round(turnoverRate * 100) / 100,
                revenue: data.totalSold * data.product.price,
            };
        });
        // Sort by turnover rate
        turnoverData.sort((a, b) => b.turnoverRate - a.turnoverRate);
        return {
            period: `Last ${days} days`,
            items: turnoverData,
            summary: {
                totalProducts: turnoverData.length,
                averageTurnoverRate: turnoverData.reduce((sum, item) => sum + item.turnoverRate, 0) /
                    turnoverData.length,
                totalRevenue: turnoverData.reduce((sum, item) => sum + item.revenue, 0),
            },
        };
    }
    /**
     * Get stock movement report
     */
    static async getStockMovement(startDate, endDate, productId) {
        const where = {};
        if (productId) {
            where.productId = productId;
        }
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        const logs = await database_1.default.inventoryLog.findMany({
            where,
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        sku: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        // Group by type
        const movementByType = logs.reduce((acc, log) => {
            if (!acc[log.type]) {
                acc[log.type] = {
                    count: 0,
                    totalQuantity: 0,
                };
            }
            acc[log.type].count += 1;
            acc[log.type].totalQuantity += Math.abs(log.quantity);
            return acc;
        }, {});
        return {
            logs,
            summary: {
                totalMovements: logs.length,
                byType: movementByType,
            },
        };
    }
    /**
     * Reconcile inventory (compare system stock with actual count)
     */
    static async reconcileInventory(actualCounts) {
        const discrepancies = [];
        for (const { productId, actualCount } of actualCounts) {
            const product = await database_1.default.product.findUnique({
                where: { id: productId },
                select: {
                    id: true,
                    name: true,
                    sku: true,
                    stockQuantity: true,
                },
            });
            if (!product) {
                discrepancies.push({
                    productId,
                    error: 'Product not found',
                });
                continue;
            }
            const systemCount = product.stockQuantity;
            const difference = actualCount - systemCount;
            if (difference !== 0) {
                // Create adjustment log
                await this.adjustStock({
                    productId,
                    quantity: difference,
                    type: 'ADJUSTMENT',
                    reason: `Inventory reconciliation: System=${systemCount}, Actual=${actualCount}`,
                });
                discrepancies.push({
                    productId,
                    productName: product.name,
                    sku: product.sku,
                    systemCount,
                    actualCount,
                    difference,
                    adjusted: true,
                });
            }
        }
        return {
            reconciled: actualCounts.length,
            discrepanciesFound: discrepancies.length,
            discrepancies,
        };
    }
    /**
     * Get products requiring restock
     */
    static async getRestockRecommendations(threshold = 10, daysToAnalyze = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysToAnalyze);
        // Get low stock products
        const lowStockProducts = await database_1.default.product.findMany({
            where: {
                isActive: true,
                stockQuantity: {
                    lte: threshold,
                },
            },
            select: {
                id: true,
                name: true,
                sku: true,
                stockQuantity: true,
                price: true,
            },
        });
        // Get sales data for these products
        const recommendations = await Promise.all(lowStockProducts.map(async (product) => {
            const salesLogs = await database_1.default.inventoryLog.findMany({
                where: {
                    productId: product.id,
                    type: 'SALE',
                    createdAt: {
                        gte: startDate,
                    },
                },
            });
            const totalSold = salesLogs.reduce((sum, log) => sum + Math.abs(log.quantity), 0);
            const averageDailySales = totalSold / daysToAnalyze;
            const daysOfStockLeft = averageDailySales > 0
                ? Math.floor(product.stockQuantity / averageDailySales)
                : 999;
            // Recommend restock quantity (30 days worth of stock)
            const recommendedQuantity = Math.ceil(averageDailySales * 30);
            return {
                productId: product.id,
                productName: product.name,
                sku: product.sku,
                currentStock: product.stockQuantity,
                averageDailySales: Math.round(averageDailySales * 100) / 100,
                daysOfStockLeft,
                recommendedRestockQuantity: recommendedQuantity,
                priority: daysOfStockLeft < 7 ? 'HIGH' : daysOfStockLeft < 14 ? 'MEDIUM' : 'LOW',
            };
        }));
        // Sort by priority and days of stock left
        recommendations.sort((a, b) => {
            const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
            const priorityDiff = priorityOrder[a.priority] -
                priorityOrder[b.priority];
            if (priorityDiff !== 0)
                return priorityDiff;
            return a.daysOfStockLeft - b.daysOfStockLeft;
        });
        return recommendations;
    }
}
exports.InventoryService = InventoryService;
