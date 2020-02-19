"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function extract(input, props) {
    const extracted = {};
    const remaining = Object.assign({}, input);
    Object.keys(input).forEach((key) => {
        extracted[key] = input[key];
        delete remaining[key];
    });
    return [extracted, remaining];
}
exports.extract = extract;
