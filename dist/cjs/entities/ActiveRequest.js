"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveRequest = void 0;
const errors_1 = require("../errors");
class ActiveRequest {
    constructor(params, options, configuredRequest) {
        this._params = params;
        this._options = options;
        this._configuredRequest = configuredRequest;
    }
    static deserialize(instance) {
        const request = JSON.parse(instance.data);
        const cr = new instance.constructor();
        return new ActiveRequest(request.params, request.options, cr);
    }
    get params() {
        return this._params;
    }
    get serialize() {
        return {
            data: JSON.stringify(Object.assign(Object.assign({}, this.requestInfo()), { params: this._params, options: this._options })),
            constructor: this._configuredRequest
                .constructor
        };
    }
    get headers() {
        return this.requestInfo().headers;
    }
    get queryParameters() {
        return this.requestInfo().queryParameters;
    }
    get url() {
        return this.requestInfo().url;
    }
    get body() {
        return this.requestInfo().body;
    }
    get method() {
        return this.requestInfo().method;
    }
    get axiosOptions() {
        return this.requestInfo().axiosOptions;
    }
    get isMockRequest() {
        return this.requestInfo().isMockRequest;
    }
    get mockConfig() {
        return this.requestInfo().mockConfig || {};
    }
    get mockDb() {
        if (!this.isMockRequest) {
            throw new errors_1.ConfiguredRequestError(`Attempts to evaluate the "mockDb" with a request which is NOT a mock request!`, "not-mock");
        }
        return this.mockConfig.db;
    }
    requestInfo() {
        return this._configuredRequest.requestInfo(this.params, this._options);
    }
    toString() {
        return this.method.toUpperCase() + " " + this.url;
    }
    toJSON() {
        return {
            method: this.method,
            url: this.url,
            queryParameters: this.queryParameters,
            headers: this.headers,
            body: this.body,
            options: this._options
        };
    }
}
exports.ActiveRequest = ActiveRequest;
