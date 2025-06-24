"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClockRepository = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
class ClockRepository {
    async findOpenEntry(userId) {
        return prisma_1.default.clockEntry.findFirst({
            where: {
                userId,
                status: 'open'
            }
        });
    }
    async findTodayEntries(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return prisma_1.default.clockEntry.findMany({
            where: {
                userId,
                clockIn: {
                    gte: today
                }
            },
            orderBy: {
                clockIn: 'desc'
            }
        });
    }
    async findHistoryEntries(userId, limit = 7) {
        return prisma_1.default.clockEntry.findMany({
            where: {
                userId
            },
            orderBy: {
                clockIn: 'desc'
            },
            take: limit
        });
    }
    async clockIn(userId, notes) {
        return prisma_1.default.clockEntry.create({
            data: {
                userId,
                clockIn: new Date(),
                notes,
                status: 'open'
            }
        });
    }
    async clockOut(entryId) {
        const clockOut = new Date();
        const currentEntry = await prisma_1.default.clockEntry.findUnique({
            where: { id: entryId }
        });
        if (!currentEntry) {
            throw new Error('Registro não encontrado');
        }
        return prisma_1.default.clockEntry.update({
            where: { id: entryId },
            data: {
                clockOut,
                status: 'closed',
                totalHours: this.calculateHours(currentEntry.clockIn, clockOut)
            }
        });
    }
    calculateHours(clockIn, clockOut) {
        const diffMs = clockOut.getTime() - clockIn.getTime();
        return Number((diffMs / (1000 * 60 * 60)).toFixed(2));
    }
}
exports.ClockRepository = ClockRepository;
//# sourceMappingURL=repository.js.map