"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
function bodyToString(body, bodyType) {
    switch (bodyType) {
        case "JSON":
            return JSON.stringify(body);
        case "formFields":
            return ff(body);
        case "literal":
            return body.value;
        case "none":
            return undefined;
        default:
            throw new errors_1.ConfiguredRequestError(`Unknown body type: ${bodyType}`, "invalid-body-type");
    }
}
exports.bodyToString = bodyToString;
function ff(body) {
    return Object.keys(body).reduce((formFields, key) => {
        formFields += `${key}:"${body[key]}"\n`;
        return formFields;
    }, "");
}
