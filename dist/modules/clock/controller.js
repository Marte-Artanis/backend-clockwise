"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clockRoutes = clockRoutes;
const service_1 = require("./service");
const types_1 = require("./types");
const auth_1 = require("../../middlewares/auth");
async function clockRoutes(app) {
    const service = new service_1.ClockService();
    app.addHook('onRequest', auth_1.authenticate);
    app.get('/clock/status', async (request, reply) => {
        const { id: userId } = (0, auth_1.getUserFromToken)(request);
        const result = await service.getStatus(userId);
        if (!result.success) {
            return reply.status(400).send(result);
        }
        return reply.send(result);
    });
    app.get('/clock/history', async (request, reply) => {
        const { id: userId } = (0, auth_1.getUserFromToken)(request);
        const result = await service.getHistory(userId);
        if (!result.success) {
            return reply.status(400).send(result);
        }
        return reply.send(result);
    });
    app.post('/clock/in', {
        schema: {
            body: types_1.clockEntrySchema
        }
    }, async (request, reply) => {
        const { id: userId } = (0, auth_1.getUserFromToken)(request);
        const result = await service.clockIn(userId, request.body);
        if (!result.success) {
            return reply.status(400).send(result);
        }
        return reply.status(201).send(result);
    });
    app.post('/clock/out', async (request, reply) => {
        const { id: userId } = (0, auth_1.getUserFromToken)(request);
        const result = await service.clockOut(userId);
        if (!result.success) {
            return reply.status(400).send(result);
        }
        return reply.send(result);
    });
}
//# sourceMappingURL=controller.js.map