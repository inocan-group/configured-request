"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.between = void 0;
function between(start, end) {
    const delta = Math.abs(start - end);
    return Math.floor(Math.random() * delta) + start;
}
exports.between = between;
