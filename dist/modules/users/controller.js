"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = userRoutes;
const service_1 = require("./service");
const types_1 = require("./types");
async function userRoutes(app) {
    const service = new service_1.UserService(app);
    app.post('/auth/login', {
        schema: {
            body: types_1.loginSchema
        }
    }, async (request, reply) => {
        const result = await service.login(request.body);
        if (!result.success) {
            return reply.status(401).send(result);
        }
        return reply.send(result);
    });
    app.post('/auth/register', {
        schema: {
            body: types_1.registerSchema
        }
    }, async (request, reply) => {
        const result = await service.register(request.body);
        if (!result.success) {
            return reply.status(400).send(result);
        }
        return reply.status(201).send(result);
    });
}
//# sourceMappingURL=controller.js.map