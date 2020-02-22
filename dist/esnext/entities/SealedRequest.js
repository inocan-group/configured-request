export class SealedRequest {
    constructor(req) {
        this.req = req;
    }
    /**
     * Make a request to the configured API endpoint
     */
    async request(props, options = {}) {
        const response = await this.req.request(props, options);
        this.req.errorHandler(undefined); // reset error
        return response;
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
    /**
     * If you want to pass in an error handler you can be notified
     * of all errors. If you return `false` the error will _still_ be
     * thrown but any other value will be passed back as the `data`
     * property of the response.
     */
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
