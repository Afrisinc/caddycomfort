"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = void 0;
const notify_sdk_1 = require("@afrisinc/notify-sdk");
exports.notify = new notify_sdk_1.Notify({
    apiKey: process.env.NOTIFY_API_KEY,
});
