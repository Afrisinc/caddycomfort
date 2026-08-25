"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = exports.sendPasswordChangedEmail = exports.sendPasswordResetConfirmationEmail = exports.sendPasswordResetEmail = exports.sendVerificationEmail = void 0;
const notify_1 = require("./notify");
const logger_1 = require("../../config/logger");
const send = async (params) => {
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
    template: 'verify-account',
    data: { name: user.firstName || user.email, code },
    priority: 'high',
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = (user, token) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
    return send({
        to: user.email,
        channel: 'email',
        template: 'forgot-password',
        data: { name: user.firstName || user.email, token, resetUrl },
        priority: 'high',
    });
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendPasswordResetConfirmationEmail = (user) => send({
    to: user.email,
    channel: 'email',
    template: 'password-reset-confirmation',
    data: { name: user.firstName || user.email },
    priority: 'normal',
});
exports.sendPasswordResetConfirmationEmail = sendPasswordResetConfirmationEmail;
const sendPasswordChangedEmail = (user) => send({
    to: user.email,
    channel: 'email',
    template: 'password-changed',
    data: { name: user.firstName || user.email },
    priority: 'normal',
});
exports.sendPasswordChangedEmail = sendPasswordChangedEmail;
const sendWelcomeEmail = (user) => send({
    to: user.email,
    channel: 'email',
    template: 'welcome',
    data: { name: user.firstName || user.email },
    priority: 'normal',
});
exports.sendWelcomeEmail = sendWelcomeEmail;
