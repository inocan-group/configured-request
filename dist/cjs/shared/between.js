"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function between(start, end) {
    const delta = Math.abs(start - end);
    return Math.floor(Math.random() * delta) + start;
}
exports.between = between;
