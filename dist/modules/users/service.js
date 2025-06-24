"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const repository_1 = require("./repository");
class UserService {
    constructor(app) {
        this.repository = new repository_1.UserRepository();
        this.app = app;
    }
    async login(input) {
        try {
            const user = await this.repository.findByEmail(input.email);
            if (!user) {
                return {
                    success: false,
                    error: 'auth/invalid-credentials',
                    message: 'Email ou senha inválidos'
                };
            }
            const isValidPassword = await this.repository.validatePassword(user, input.password);
            if (!isValidPassword) {
                return {
                    success: false,
                    error: 'auth/invalid-credentials',
                    message: 'Email ou senha inválidos'
                };
            }
            const token = this.app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '7d' });
            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'auth/unknown',
                message: 'Erro ao realizar login'
            };
        }
    }
    async register(input) {
        try {
            const existingUser = await this.repository.findByEmail(input.email);
            if (existingUser) {
                return {
                    success: false,
                    error: 'auth/email-in-use',
                    message: 'Email já está em uso'
                };
            }
            const user = await this.repository.create(input.name, input.email, input.password);
            const token = this.app.jwt.sign({ id: user.id, email: user.email }, { expiresIn: '7d' });
            return {
                success: true,
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'auth/unknown',
                message: 'Erro ao realizar cadastro'
            };
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=service.js.map