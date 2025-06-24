import { ClockEntryInput, ClockStatusResponse, ClockHistoryResponse, ClockActionResponse } from './types';
export declare class ClockService {
    private repository;
    constructor();
    getStatus(userId: string): Promise<ClockStatusResponse>;
    getHistory(userId: string): Promise<ClockHistoryResponse>;
    clockIn(userId: string, input?: ClockEntryInput): Promise<ClockActionResponse>;
    clockOut(userId: string): Promise<ClockActionResponse>;
}
//# sourceMappingURL=service.d.ts.map