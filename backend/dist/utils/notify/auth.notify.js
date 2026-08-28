"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendPasswordChangedEmail = exports.sendPasswordResetConfirmationEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const notify_1 = require("./notify");
const logger_1 = require("../../config/logger");
const send = async (params) => {
    if (!notify_1.notify) {
        return;
    }
    try {
        await notify_1.notify.send(params);
    }
    catch (error) {
        logger_1.logger.error({ err: error, to: params.to, template: params.template }, 'Failed to send notification');
    }
};
const sendVerificationEmail = (user, code) => send({
    to: user.email,
    channel: 'email',
    template: 'ed11ac8a-e568-480c-bee1-74a2e7a20d74',
    data: { name: user.firstName || user.email, code },
    priority: 'high',
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    return send({
        to: user.email,
        channel: 'email',
        template: 'd3891b93-db7e-4f02-a4c9-2f6709bf21f2',
        data: { name: user.firstName || user.email, token, resetUrl },
        priority: 'high',
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordResetConfirmationEmail = (user) => send({
    to: user.email,
    channel: 'email',
    template: '33bd1dc7-3203-4b55-aba8-85c25b376e43',
    data: { name: user.firstName || user.email },
    priority: 'normal',
});
exports.sendPasswordResetConfirmationEmail = sendPasswordResetConfirmationEmail;
const sendPasswordChangedEmail = (user) => send({
    to: user.email,
    channel: 'email',
    template: 'b6afc2d3-5ae4-469f-9946-cde61ade3cdf',
    data: { name: user.firstName || user.email },
    priority: 'normal',
});
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
const sendWelcomeEmail = (user) => send({
    to: user.email,
    channel: 'email',
    template: '4ec3ade5-1af3-4edc-908d-cf8f4adb6018',
    data: { name: user.firstName || user.email },
    priority: 'normal',
});
exports.sendWelcomeEmail = sendWelcomeEmail;
