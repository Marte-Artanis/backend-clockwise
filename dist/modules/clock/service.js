"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClockService = void 0;
const repository_1 = require("./repository");
class ClockService {
    constructor() {
        this.repository = new repository_1.ClockRepository();
    }
    async getStatus(userId) {
        try {
            const [currentEntry, todayEntries] = await Promise.all([
                this.repository.findOpenEntry(userId),
                this.repository.findTodayEntries(userId)
            ]);
            const todayHours = todayEntries.reduce((total, entry) => {
                if (entry.totalHours) {
                    return total + entry.totalHours;
                }
                return total;
            }, 0);
            return {
                success: true,
                data: {
                    ...(currentEntry ? { current_entry: currentEntry } : {}),
                    is_clocked_in: !!currentEntry,
                    today_hours: Number(todayHours.toFixed(2))
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'clock/unknown',
                message: 'Erro ao buscar status do ponto'
            };
        }
    }
    async getHistory(userId) {
        try {
            const entries = await this.repository.findHistoryEntries(userId);
            const totalHours = entries.reduce((total, entry) => {
                if (entry.totalHours) {
                    return total + entry.totalHours;
                }
                return total;
            }, 0);
            return {
                success: true,
                data: {
                    entries,
                    total_hours: Number(totalHours.toFixed(2))
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'clock/unknown',
                message: 'Erro ao buscar histórico de ponto'
            };
        }
    }
    async clockIn(userId, input) {
        try {
            const openEntry = await this.repository.findOpenEntry(userId);
            if (openEntry) {
                return {
                    success: false,
                    error: 'clock/already-open',
                    message: 'Já existe um registro de ponto aberto'
                };
            }
            const entry = await this.repository.clockIn(userId, input?.notes);
            return {
                success: true,
                data: entry
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'clock/unknown',
                message: 'Erro ao registrar entrada'
            };
        }
    }
    async clockOut(userId) {
        try {
            const openEntry = await this.repository.findOpenEntry(userId);
            if (!openEntry) {
                return {
                    success: false,
                    error: 'clock/no-open-entry',
                    message: 'Não existe um registro de ponto aberto'
                };
            }
            const entry = await this.repository.clockOut(openEntry.id);
            return {
                success: true,
                data: entry
            };
        }
        catch (error) {
            return {
                success: false,
                error: 'clock/unknown',
                message: 'Erro ao registrar saída'
            };
        }
    }
}
exports.ClockService = ClockService;
//# sourceMappingURL=service.js.map