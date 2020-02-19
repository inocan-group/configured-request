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
     * Get information about the API request structure, given
     * the passed in dynamic props
     */
    requestInfo(props) {
        return this.req.requestInfo(props);
    }
    toString() {
        return this.req.toString();
    }
    toJSON() {
        return this.req.toJSON();
    }
}
