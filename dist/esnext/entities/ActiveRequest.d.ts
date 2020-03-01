import { ConfiguredRequest } from "./ConfiguredRequest";
import { IAllRequestOptions, IApiInput } from "../cr-types";
/**
 * **ActiveRequest**
 *
 * When a request is actuated, it is sent either to Axios or to a Mock function.
 * In both cases the `SealedRequest` is converted to an `ActiveRequest` for the
 * benefit largely of mocking and debugging consumers but it is done for requests
 * to Axios too; mainly for consistency sake as it quite quickly
 */
export declare class ActiveRequest<I extends IApiInput, O, M = any> {
    private params;
    private options;
    private req;
    private _db;
    constructor(params: I, options: IAllRequestOptions, req: ConfiguredRequest<I, O, M>);
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
    get method(): "get" | "put" | "post" | "delete" | "patch";
    /**
     * The options hash -- with the exception of the _headers_ -- which
     * will be added to the Axios request.
     */
    get axiosOptions(): import("axios").AxiosRequestConfig;
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
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        calculators: (string & keyof I)[];
        requiredParameters: (string & keyof O)[];
        optionalParameters: (string & keyof O)[];
    };
}
