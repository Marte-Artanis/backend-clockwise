import { FastifyInstance } from 'fastify';
import { LoginInput, RegisterInput, AuthResponse } from './types';
export declare class UserService {
    private repository;
    private app;
    constructor(app: FastifyInstance);
    login(input: LoginInput): Promise<AuthResponse>;
    register(input: RegisterInput): Promise<AuthResponse>;
}
//# sourceMappingURL=service.d.ts.map