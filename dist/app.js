"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildApp = buildApp;
const fastify_1 = __importDefault(require("fastify"));
const cors_1 = __importDefault(require("@fastify/cors"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const env_1 = require("./config/env");
const controller_1 = require("./modules/users/controller");
const controller_2 = require("./modules/clock/controller");
async function buildApp() {
    const app = (0, fastify_1.default)({
        logger: env_1.env.NODE_ENV === 'development'
    });
    await app.register(cors_1.default, {
        origin: true,
        credentials: true
    });
    await app.register(jwt_1.default, {
        secret: env_1.env.JWT_SECRET
    });
    await app.register(controller_1.userRoutes);
    await app.register(controller_2.clockRoutes);
    app.setErrorHandler((error, _request, reply) => {
        app.log.error(error);
        if (error.validation) {
            return reply.status(400).send({
                success: false,
                error: 'Validation error',
                message: error.message
            });
        }
        return reply.status(500).send({
            success: false,
            error: 'Internal server error'
        });
    });
    app.get('/health', async () => {
        return { status: 'ok', timestamp: new Date().toISOString() };
    });
    return app;
}
//# sourceMappingURL=app.js.map