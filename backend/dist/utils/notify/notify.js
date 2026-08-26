"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = void 0;
const notify_sdk_1 = require("@afrisinc/notify-sdk");
const logger_1 = require("../../config/logger");
const apiKey = process.env.NOTIFY_API_KEY;
if (!apiKey) {
    logger_1.logger.warn('NOTIFY_API_KEY is not set; notifications will not be sent');
}
exports.notify = apiKey ? new notify_sdk_1.Notify({ apiKey }) : null;
