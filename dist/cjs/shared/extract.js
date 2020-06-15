"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extract = void 0;
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
