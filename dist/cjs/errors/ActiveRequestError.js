"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveRequestError = void 0;
const lodash_get_1 = __importDefault(require("lodash.get"));
class ActiveRequestError extends Error {
    constructor(e, location, request) {
        super();
        this.kind = "ActiveRequestError";
        if (lodash_get_1.default(e, "kind") === "ActiveRequestError") {
            Object.keys(e).forEach((key) => {
                this[key] = e[key];
            });
        }
        else {
            this.location = location;
            this.baseError = e;
            this.isAxiosError = lodash_get_1.default(e, "isAxiosError") ? true : false;
            this.message = lodash_get_1.default(e, "message", `no error message`);
            this.stack = lodash_get_1.default(e, "stack");
            this.httpStatusCode = lodash_get_1.default(e, "response.status", -1);
            this.httpStatusText = lodash_get_1.default(e, "response.statusText", "");
            this.code = lodash_get_1.default(e, "code") || this.httpStatusText || "unknown";
            this.responseBody = lodash_get_1.default(e, "response.body", "");
            this.config = lodash_get_1.default(e, "config");
            this.request = {
                headers: (request === null || request === void 0 ? void 0 : request.headers) || lodash_get_1.default(this.config, "headers"),
                queryParameters: (request === null || request === void 0 ? void 0 : request.queryParameters) || lodash_get_1.default(this.config, "params"),
                url: (request === null || request === void 0 ? void 0 : request.url) || lodash_get_1.default(this.config, "baseURL"),
                body: request === null || request === void 0 ? void 0 : request.body
            };
            this.name = `active-request/${this.httpStatusCode !== -1 ? this.httpStatusCode : this.code}`;
        }
    }
    static wrap(e, location, request) {
        return new ActiveRequestError(e, location, request);
    }
    toJSON() {
        return {
            code: this.code,
            httpStatusCode: this.httpStatusCode,
            httpStatusText: this.httpStatusText,
            location: this.location,
            message: this.message,
            config: this.config || { request: this.request },
            isAxiosError: this.isAxiosError
        };
    }
}
exports.ActiveRequestError = ActiveRequestError;
