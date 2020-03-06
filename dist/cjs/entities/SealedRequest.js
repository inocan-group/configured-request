"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SealedRequest {
    constructor(req) {
        this.req = req;
    }
    async request(props, options = {}) {
        let response;
        const isMockRequest = this.requestInfo(props, options).isMockRequest;
        if (isMockRequest && this._db) {
            options = Object.assign({ db: this._db }, options);
        }
        try {
            response = await this.req.request(props, options);
            this.req.errorHandler(undefined);
        }
        catch (e) {
            this.req.errorHandler(undefined);
            throw e;
        }
        return response;
    }
    useMockDatabase(db) {
        this._db = db;
        return this;
    }
    async mock(props, options = {}) {
        return this.request(props, Object.assign(Object.assign({}, options), { mock: true }));
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
