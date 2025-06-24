"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.getUserFromToken = getUserFromToken;
async function authenticate(request, reply) {
    try {
        await request.jwtVerify();
    }
    catch (err) {
        reply.status(401).send({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid or missing token'
        });
    }
}
function getUserFromToken(request) {
    return request.user;
}
//# sourceMappingURL=auth.js.map