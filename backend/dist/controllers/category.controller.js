"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryStats = exports.deleteCategory = exports.updateCategory = exports.getCategoryBySlug = exports.getCategoryById = exports.getCategoryTree = exports.getAllCategories = exports.createCategory = void 0;
const category_service_1 = require("../services/category.service");
/**
 * Create a new category
 */
const createCategory = async (req, res) => {
    try {
        const category = await category_service_1.CategoryService.create(req.body);
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: { category },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create category',
        });
    }
};
exports.createCategory = createCategory;
/**
 * Get all categories
 */
const getAllCategories = async (req, res) => {
    try {
        const { includeChildren, parentId } = req.query;
        const options = {
            includeChildren: includeChildren === 'true',
            parentId: parentId === 'null' ? null : parentId,
        };
        const categories = await category_service_1.CategoryService.getAll(options);
        res.json({
            success: true,
            data: { categories },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch categories',
        });
    }
};
exports.getAllCategories = getAllCategories;
/**
 * Get category tree (hierarchical)
 */
const getCategoryTree = async (req, res) => {
    try {
        const tree = await category_service_1.CategoryService.getTree();
        res.json({
            success: true,
            data: { tree },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch category tree',
        });
    }
};
exports.getCategoryTree = getCategoryTree;
/**
 * Get category by ID
 */
const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await category_service_1.CategoryService.getById(id);
        res.json({
            success: true,
            data: { category },
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || 'Category not found',
        });
    }
};
exports.getCategoryById = getCategoryById;
/**
 * Get category by slug
 */
const getCategoryBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const category = await category_service_1.CategoryService.getBySlug(slug);
        res.json({
            success: true,
            data: { category },
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: error.message || 'Category not found',
        });
    }
};
exports.getCategoryBySlug = getCategoryBySlug;
/**
 * Update category
 */
const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await category_service_1.CategoryService.update(id, req.body);
        res.json({
            success: true,
            message: 'Category updated successfully',
            data: { category },
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update category',
        });
    }
};
exports.updateCategory = updateCategory;
/**
 * Delete category
 */
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        await category_service_1.CategoryService.delete(id);
        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to delete category',
        });
    }
};
exports.deleteCategory = deleteCategory;
/**
 * Get category statistics
 */
const getCategoryStats = async (req, res) => {
    try {
        const stats = await category_service_1.CategoryService.getStats();
        res.json({
            success: true,
            data: { stats },
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch statistics',
        });
    }
};
exports.getCategoryStats = getCategoryStats;
