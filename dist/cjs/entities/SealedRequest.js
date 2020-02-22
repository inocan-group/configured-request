"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SealedRequest {
    constructor(req) {
        this.req = req;
    }
    async request(props, options = {}) {
        const response = this.req.request(props, options);
        this.req.errorHandler(undefined);
        return response;
    }
    async mock(props, options = {}) {
        return this.req.request(props, Object.assign(Object.assign({}, options), { mock: true }));
    }
    requestInfo(props, options = {}) {
        return this.req.requestInfo(props, options);
    }
    errorHandler(eh) {
        this.req.errorHandler(eh);
        return this;
    }
    toString() {
        return this.req.toString();
    }
    toJSON() {
        return this.req.toJSON();
    }
}
exports.SealedRequest = SealedRequest;
