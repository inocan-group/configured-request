"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
class RequestError extends Error {
    constructor(message, code = "error", statusCode = common_types_1.HttpStatusCodes.BadRequest) {
        super();
        this.message = message;
        this.name = `configured-request/${code}`;
        this.code = code;
        this.statusCode = statusCode;
    }
}
exports.RequestError = RequestError;
