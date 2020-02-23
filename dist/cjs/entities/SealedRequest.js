"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SealedRequest {
    constructor(req) {
        this.req = req;
    }
    async request(props, options = {}) {
        let response;
        try {
            response = await this.req.request(props, options);
        }
        catch (e) {
            this.req.errorHandler(undefined);
            throw e;
        }
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
