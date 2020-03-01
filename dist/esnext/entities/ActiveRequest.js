import { ConfiguredRequestError } from "../errors";
/**
 * **ActiveRequest**
 *
 * When a request is actuated, it is sent either to Axios or to a Mock function.
 * In both cases the `SealedRequest` is converted to an `ActiveRequest` for the
 * benefit largely of mocking and debugging consumers but it is done for requests
 * to Axios too; mainly for consistency sake as it quite quickly
 */
export class ActiveRequest {
    constructor(params, options, req) {
        this.params = params;
        this.options = options;
        this.req = req;
    }
    /**
     * the _headers_ being sent out as part of the request
     */
    get headers() {
        return this.req.requestInfo(this.params).headers;
    }
    /** the _query parameters_ which have been incorporated into the **url** */
    get queryParameters() {
        return this.req.requestInfo(this.params).queryParameters;
    }
    /**
     * The request's URL, including all query parameters (where they exist)
     */
    get url() {
        return this.req.requestInfo(this.params).url;
    }
    /**
     * The body of the message in a structured format (all requests will
     * convert this data into a `string` before being sent).
     *
     * **Note:** the typing for the `body` is simply the _body_ property of the input `I`
     * type.
     */
    get body() {
        return this.req.requestInfo(this.params).payload;
    }
    /**
     * The HTTP request VERB for the request (aka, `get`, `put`, etc.)
     */
    get method() {
        return this.req.requestInfo(this.params).method;
    }
    /**
     * The options hash -- with the exception of the _headers_ -- which
     * will be added to the Axios request.
     */
    get axiosOptions() {
        return this.req.requestInfo(this.params).axiosOptions;
    }
    /**
     * The configuration options for a mocking function.
     *
     * This is only _relevant_ in the event that you are indeed _mocking_
     * but it will always return a dictionary of mock properties which are
     * available to mocked requests.
     */
    get mockConfig() {
        return this.req.requestInfo(this.params).mockConfig || {};
    }
    /**
     * If the request is a mock request _and_ there was a `db` property
     * passed into the `SealedRequest` then this `db` will be made available.
     *
     * **Note:** this just a convenience to consumers as this property is
     * available at `mockConfig.db` too. Accessing it from here simply provides
     * a root level API endpoint and it also throws an error if you try access
     * it when you are in a non-mocking scenario.
     */
    get mockDb() {
        if (!this.req.requestInfo(this.params).isMockRequest) {
            throw new ConfiguredRequestError(`Attempts to evaluate the "mockDb" with a request which is NOT a mock request!`, "not-mock");
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
