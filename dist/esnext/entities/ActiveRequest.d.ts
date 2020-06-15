import { ConfiguredRequest } from "./ConfiguredRequest";
import { IAllRequestOptions, IApiInput, ISerializedRequest } from "../cr-types";
/**
 * **ActiveRequest**
 *
 * When a request is actuated, it is sent either to Axios or to a Mock function.
 * In both cases the `SealedRequest` is converted to an `ActiveRequest` for the
 * benefit largely of mocking and debugging consumers but it is done for requests
 * to Axios too; mainly for consistency sake as it quite quickly
 */
export declare class ActiveRequest<I extends IApiInput, O, X = any, M = any> {
    static deserialize(instance: ISerializedRequest): ActiveRequest<any, any, any, any>;
    private _db;
    private _options;
    private _configuredRequest;
    private _params;
    /**
     * Builds a new `ActiveRequest` from run time parameters parameters and options and leveraging
     * the configured business logic that was put in place at design time.
     *
     * @param params The dynamic properties passed into this request
     * @param options any options parameters -- both Axios options and/or Mock options -- to modify behavior
     * @param configuredRequest the `ConfiguredRequest` instance
     */
    constructor(params: I, options: IAllRequestOptions, configuredRequest: ConfiguredRequest<I, O, X, M>);
    /**
     * The active parameters passed into the request to make it
     * an "active request"
     */
    get params(): I;
    /**
     * serializes data properties for an active request; to _de-serialize_
     * use the ActiveRequest's `deserialize` static method. Note that you'll
     * need to pass in both this serialized data along with the constructor
     * for the underlying `SealedRequest`.
     */
    get serialize(): ISerializedRequest;
    /**
     * the _headers_ being sent out as part of the request
     */
    get headers(): import("common-types").IDictionary<string | number | boolean>;
    /** the _query parameters_ which have been incorporated into the **url** */
    get queryParameters(): import("common-types").IDictionary<string | number | boolean>;
    /**
     * The request's URL, including all query parameters (where they exist)
     */
    get url(): string;
    /**
     * The body of the message in a structured format (all requests will
     * convert this data into a `string` before being sent).
     *
     * **Note:** the typing for the `body` is simply the _body_ property of the input `I`
     * type.
     */
    get body(): I["body"];
    /**
     * The HTTP request VERB for the request (aka, `get`, `put`, etc.)
     */
    get method(): "get" | "delete" | "post" | "put" | "patch";
    /**
     * The options hash -- with the exception of the _headers_ -- which
     * will be added to the Axios request.
     */
    get axiosOptions(): import("axios").AxiosRequestConfig;
    /**
     * boolean flag indicating whether this active request is being
     * treated as a _mock_ request or not
     */
    get isMockRequest(): boolean;
    /**
     * The configuration options for a mocking function.
     *
     * This is only _relevant_ in the event that you are indeed _mocking_
     * but it will always return a dictionary of mock properties which are
     * available to mocked requests.
     */
    get mockConfig(): import("../cr-types").IMockOptions<any>;
    /**
     * If the request is a mock request _and_ there was a `db` property
     * passed into the `SealedRequest` then this `db` will be made available.
     *
     * **Note:** this just a convenience to consumers as this property is
     * available at `mockConfig.db` too. Accessing it from here simply provides
     * a root level API endpoint and it also throws an error if you try access
     * it when you are in a non-mocking scenario.
     */
    get mockDb(): any;
    private requestInfo;
    toString(): string;
    toJSON(): {
        method: "get" | "delete" | "post" | "put" | "patch";
        url: string;
        queryParameters: import("common-types").IDictionary<string | number | boolean>;
        headers: import("common-types").IDictionary<string | number | boolean>;
        body: I["body"];
        options: IAllRequestOptions;
    };
}
