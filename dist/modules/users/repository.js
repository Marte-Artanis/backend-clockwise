"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const bcryptjs_1 = require("bcryptjs");
const prisma_1 = __importDefault(require("../../config/prisma"));
class UserRepository {
    async findByEmail(email) {
        return prisma_1.default.user.findUnique({
            where: { email }
        });
    }
    async create(name, email, password) {
        const hashedPassword = await (0, bcryptjs_1.hash)(password, 10);
        return prisma_1.default.user.create({
            data: {
                name,
                email,
                passwordHash: hashedPassword
            }
        });
    }
    async validatePassword(user, password) {
        return (0, bcryptjs_1.compare)(password, user.passwordHash);
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=repository.js.map