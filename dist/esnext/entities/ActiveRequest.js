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
    /**
     * Builds a new `ActiveRequest` from run time parameters parameters and options and leveraging
     * the configured business logic that was put in place at design time.
     *
     * @param params The dynamic properties passed into this request
     * @param options any options parameters -- both Axios options and/or Mock options -- to modify behavior
     * @param configuredRequest the `ConfiguredRequest` instance
     */
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
    /**
     * The active parameters passed into the request to make it
     * an "active request"
     */
    get params() {
        return this._params;
    }
    /**
     * serializes data properties for an active request; to _de-serialize_
     * use the ActiveRequest's `deserialize` static method. Note that you'll
     * need to pass in both this serialized data along with the constructor
     * for the underlying `SealedRequest`.
     */
    get serialize() {
        return {
            data: JSON.stringify(Object.assign(Object.assign({}, this.requestInfo()), { params: this._params, options: this._options })),
            constructor: this._configuredRequest
                .constructor
        };
    }
    /**
     * the _headers_ being sent out as part of the request
     */
    get headers() {
        return this.requestInfo().headers;
    }
    /** the _query parameters_ which have been incorporated into the **url** */
    get queryParameters() {
        return this.requestInfo().queryParameters;
    }
    /**
     * The request's URL, including all query parameters (where they exist)
     */
    get url() {
        return this.requestInfo().url;
    }
    /**
     * The body of the message in a structured format (all requests will
     * convert this data into a `string` before being sent).
     *
     * **Note:** the typing for the `body` is simply the _body_ property of the input `I`
     * type.
     */
    get body() {
        return this.requestInfo().body;
    }
    /**
     * The HTTP request VERB for the request (aka, `get`, `put`, etc.)
     */
    get method() {
        return this.requestInfo().method;
    }
    /**
     * The options hash -- with the exception of the _headers_ -- which
     * will be added to the Axios request.
     */
    get axiosOptions() {
        return this.requestInfo().axiosOptions;
    }
    /**
     * boolean flag indicating whether this active request is being
     * treated as a _mock_ request or not
     */
    get isMockRequest() {
        return this.requestInfo().isMockRequest;
    }
    /**
     * The configuration options for a mocking function.
     *
     * This is only _relevant_ in the event that you are indeed _mocking_
     * but it will always return a dictionary of mock properties which are
     * available to mocked requests.
     */
    get mockConfig() {
        return this.requestInfo().mockConfig || {};
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
        if (!this.isMockRequest) {
            throw new ConfiguredRequestError(`Attempts to evaluate the "mockDb" with a request which is NOT a mock request!`, "not-mock");
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
