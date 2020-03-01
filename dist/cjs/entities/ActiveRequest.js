"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
class ActiveRequest {
    constructor(params, options, req) {
        this.params = params;
        this.options = options;
        this.req = req;
    }
    get headers() {
        return this.req.requestInfo(this.params).headers;
    }
    get queryParameters() {
        return this.req.requestInfo(this.params).queryParameters;
    }
    get url() {
        return this.req.requestInfo(this.params).url;
    }
    get body() {
        return this.req.requestInfo(this.params).payload;
    }
    get method() {
        return this.req.requestInfo(this.params).method;
    }
    get axiosOptions() {
        return this.req.requestInfo(this.params).axiosOptions;
    }
    get mockConfig() {
        return this.req.requestInfo(this.params).mockConfig || {};
    }
    get mockDb() {
        if (!this.req.requestInfo(this.params).isMockRequest) {
            throw new errors_1.ConfiguredRequestError(`Attempts to evaluate the "mockDb" with a request which is NOT a mock request!`, "not-mock");
        }
        return this.mockConfig.db;
    }
    toString() {
        return this.req.toString();
    }
    toJSON() {
        return this.req.toJSON();
    }
}
exports.ActiveRequest = ActiveRequest;
