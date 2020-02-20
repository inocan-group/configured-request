export class SealedRequest {
    constructor(req) {
        this.req = req;
    }
    /**
     * Make a request to the configured API endpoint
     */
    async request(props, options = {}) {
        return this.req.request(props, options);
    }
    /**
     * Make a request to the **Mock** API.
     *
     * Note: if there is no mock function configured for this
     * API then this will throw a `mock-not-ready` error.
     */
    async mock(props, options = {}) {
        return this.req.request(props, Object.assign(Object.assign({}, options), { mock: true }));
    }
    /**
     * Get information about the API request structure, given
     * the passed in dynamic props
     */
    requestInfo(props, options = {}) {
        return this.req.requestInfo(props, options);
    }
    toString() {
        return this.req.toString();
    }
    toJSON() {
        return this.req.toJSON();
    }
}
