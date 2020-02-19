"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cr_types_1 = require("../cr-types");
function literal(value) {
    return { type: cr_types_1.LITERAL_TYPE, value };
}
exports.literal = literal;
