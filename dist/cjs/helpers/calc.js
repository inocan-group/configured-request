"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cr_types_1 = require("../cr-types");
function calc(fn) {
    return (prop) => {
        return {
            symbol: cr_types_1.DynamicSymbol.calc,
            prop,
            fn
        };
    };
}
exports.calc = calc;
