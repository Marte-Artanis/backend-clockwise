import { z } from 'zod';
import type { ClockEntry as PrismaClockEntry } from '../../generated/prisma';
export declare const clockEntrySchema: z.ZodObject<{
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    notes?: string | undefined;
}, {
    notes?: string | undefined;
}>;
export type ClockEntryInput = z.infer<typeof clockEntrySchema>;
export type ClockEntry = PrismaClockEntry;
export type ClockStatusResponse = {
    success: boolean;
    data?: {
        current_entry?: PrismaClockEntry;
        is_clocked_in: boolean;
        today_hours: number;
    };
    error?: string;
    message?: string;
};
export type ClockHistoryResponse = {
    success: boolean;
    data?: {
        entries: PrismaClockEntry[];
        total_hours: number;
    };
    error?: string;
    message?: string;
};
export type ClockActionResponse = {
    success: boolean;
    data?: PrismaClockEntry;
    error?: string;
    message?: string;
};
//# sourceMappingURL=types.d.ts.map