"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const logger_1 = require("../config/logger");
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    // Console log for better visibility in development
    console.error('\n🔴 ERROR OCCURRED:');
    console.error(`Method: ${req.method} ${req.url}`);
    console.error(`Status: ${statusCode}`);
    console.error(`Message: ${err.message}`);
    if (process.env.NODE_ENV === 'development') {
        console.error('Stack:', err.stack);
    }
    console.error('');
    logger_1.logger.error({
        err,
        req: {
            method: req.method,
            url: req.url,
            body: req.body,
            query: req.query,
        },
    });
    res.status(statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
exports.notFound = notFound;
