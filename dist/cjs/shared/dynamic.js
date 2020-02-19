"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dynamic(defaultValue = undefined, required = false) {
    return (prop) => {
        return {
            prop,
            required,
            defaultValue
        };
    };
}
exports.dynamic = dynamic;
