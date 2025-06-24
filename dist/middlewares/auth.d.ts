import { FastifyRequest, FastifyReply } from 'fastify';
export declare function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
export declare function getUserFromToken(request: FastifyRequest): {
    id: string;
    email: string;
};
//# sourceMappingURL=auth.d.ts.map