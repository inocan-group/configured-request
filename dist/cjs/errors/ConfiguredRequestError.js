"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfiguredRequestError = void 0;
const common_types_1 = require("common-types");
class ConfiguredRequestError extends Error {
    constructor(message, code = "error", statusCode = common_types_1.HttpStatusCodes.BadRequest) {
        super();
        this.message = message;
        this.name = `configured-request/${code}`;
        this.code = code;
        this.statusCode = statusCode;
    }
}
exports.ConfiguredRequestError = ConfiguredRequestError;
