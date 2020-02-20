"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cr_types_1 = require("../cr-types");
function dynamic(defaultValue = undefined, required = false) {
    return (prop) => {
        return {
            symbol: cr_types_1.DynamicSymbol.dynamic,
            prop,
            required,
            defaultValue
        };
    };
}
exports.dynamic = dynamic;
