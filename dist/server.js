"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
async function start() {
    try {
        const app = await (0, app_1.buildApp)();
        await app.listen({
            port: env_1.env.PORT,
            host: '0.0.0.0'
        });
        console.log(`🚀 Server running on http://localhost:${env_1.env.PORT}`);
        console.log(`📊 Environment: ${env_1.env.NODE_ENV}`);
    }
    catch (err) {
        console.error('❌ Error starting server:', err);
        process.exit(1);
    }
}
start();
//# sourceMappingURL=server.js.map