"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clockEntrySchema = void 0;
const zod_1 = require("zod");
exports.clockEntrySchema = zod_1.z.object({
    notes: zod_1.z.string().optional()
});
//# sourceMappingURL=types.js.map