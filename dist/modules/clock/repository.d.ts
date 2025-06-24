import { ClockEntry } from './types';
export declare class ClockRepository {
    findOpenEntry(userId: string): Promise<ClockEntry | null>;
    findTodayEntries(userId: string): Promise<ClockEntry[]>;
    findHistoryEntries(userId: string, limit?: number): Promise<ClockEntry[]>;
    clockIn(userId: string, notes?: string): Promise<ClockEntry>;
    clockOut(entryId: string): Promise<ClockEntry>;
    private calculateHours;
}
//# sourceMappingURL=repository.d.ts.map