"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentDateTime = getCurrentDateTime;
exports.getTodayStart = getTodayStart;
exports.getTodayEnd = getTodayEnd;
exports.calculateHoursWorked = calculateHoursWorked;
exports.formatDate = formatDate;
exports.formatTime = formatTime;
exports.isSameDay = isSameDay;
function getCurrentDateTime() {
    return new Date().toISOString();
}
function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString();
}
function getTodayEnd() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today.toISOString();
}
function calculateHoursWorked(clockIn, clockOut) {
    const start = new Date(clockIn);
    const end = new Date(clockOut);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const hours = Math.floor(diffHours);
    const minutes = Math.floor((diffHours - hours) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}
function formatTime(date) {
    return new Date(date).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}
//# sourceMappingURL=date.js.map