import { IDictionary, url } from "common-types";
import { IApiMock, IConfiguredApiRequest, IApiInputWithBody, IApiInputWithoutBody, IApiOutput, IApiIntermediate, IErrorHandler, CalcOption } from "../index";
import { AxiosRequestConfig } from "axios";
import { SealedRequest } from "./SealedRequest";
import { IAllRequestOptions, IApiInput, INetworkDelaySetting } from "../cr-types";
export declare const DEFAULT_HEADERS: IDictionary<string>;
/**
 * **ConfiguredRequest**
 *
 * Allows the configuration of an RESTful API endpoint and subsequently the calling of this
 * request. The typing for this is:
 *
 ```md
 * <I> - the input requirements
 * <O> - the output of the API endpoint
 * <X> - optionally, if you use the _mapping_ configuration, you can state an intermediate type
 * that comes from the API prior to the _mapping_ transforming to the <O> type.
 ```
 */
export declare class ConfiguredRequest<
/**
 * The **input** requirements to call this endpoint; these requirements can derive from URL, body, or
 * query parameter inputs.
 */
I extends IApiInput, 
/**
 * The **output** of the API Endpoint
 */
O extends IApiOutput = IApiOutput, 
/**
 * if you are doing a transform before returning <O> you can state a preliminary type that comes back
 * from the API directly
 */
X extends IApiIntermediate = IApiIntermediate, 
/**
 * The type/data structure for the mocking database, if it is passed in by the run-time environment
 */
MDB = any> {
    static authWhitelist: string[];
    static authBlacklist: string[];
    static networkDelay: INetworkDelaySetting;
    private _qp;
    private _headers;
    private _designOptions;
    private _url;
    private _body?;
    private _bodyType;
    private _mockConfig;
    private _formSeparator;
    private _mockFn?;
    private _mapping;
    private _errorHandler;
    /**
     * The various _dynamic_ aspects of the API call
     */
    private _dynamics;
    /**
     * Properties which have calculations associated
     */
    private _calculations;
    private _method;
    static get<I extends IApiInputWithoutBody = IApiInputWithoutBody, O extends IApiOutput = IApiOutput, X extends IApiIntermediate = IApiIntermediate, MDB = any>(url: string): ConfiguredRequest<I, O, X, MDB>;
    static post<I extends IApiInputWithBody = IApiInputWithBody, O extends IApiOutput = IApiOutput, X extends IApiIntermediate = IApiIntermediate, MDB = any>(url: string): ConfiguredRequest<I, O, X, MDB>;
    static put<I extends IApiInputWithBody = IApiInputWithBody, O extends IApiOutput = IApiOutput, X extends IApiIntermediate = IApiIntermediate, MDB = any>(url: string): ConfiguredRequest<I, O, X, MDB>;
    static delete<I extends IApiInputWithoutBody = IApiInputWithoutBody, O extends IApiOutput = IApiOutput, X extends IApiIntermediate = IApiIntermediate, MDB = any>(url: string): ConfiguredRequest<I, O, X, MDB>;
    constructor();
    /**
     * Add a mock function for this API endpoint.
     *
     * When this API requests from the mock it will pass the
     * props (aka, `I`) as well as a config object as a second
     * parameter which everything you should need to
     */
    mockFn(fn: IApiMock<I, O>): this;
    isMockRequest(options?: IAllRequestOptions): boolean;
    headers(headers: IDictionary<string | number | boolean | Function>): this;
    /**
     * If you want to pass in an error handler function in you can determine which
     * errors should be handled (return of boolean flag).
     */
    errorHandler(fn: IErrorHandler): this;
    /**
     * **Query Parameters**
     *
     * States the query parameters that this API endpoint uses. In the case of
     * _static_ parameters the key and value is stated and then this key is **not**
     * expected at the time of query execution (although it will overwrite the static
     * value if you use it at execution time)
     *
     * @param qp a dictionary of query parameters; you may state but static
     * or _dynamic_ parameters (using the `dynamic` symbol export)
     */
    queryParameters(qp: IDictionary): this;
    /**
     * Allows setting properties in a JSON or Multipart Form as default values
     * which can be overwritten at execution time.
     */
    body(content: CalcOption<Partial<I["body"]>>): this;
    /** message body will be sent as a stringified JSON blob */
    bodyAsJSON(): this;
    /** message body will be sent as multi-part form fields */
    bodyAsMultipartForm(separator?: string): this;
    /** message body will be sent as plain text */
    bodyAsText(): this;
    /** message body will be sent as HTML */
    bodyAsHTML(): this;
    /** message body is of an unknown type; Content-Type will be set to `application/octet-stream` */
    bodyAsUnknown(): this;
    /** validates that only VERBs which _have_ a body can have their body type set */
    private validateBodyType;
    /**
     * Maps the data returned from the API endpoint. This is _not_ a required feature
     * of the ConfiguredRequest but can be useful in some cases. This function uses
     * the fluent style and returns a reference to the ConfiguredRequest.
     *
     * @param fn a mapping function which accepts type <X> and returns type <O>
     */
    mapper(fn: (input: X) => O): this;
    /**
     * Request the API endpoint; returning the endpoint payload if successful
     * and throwing an error if the Axios status is anything higher than 300.
     *
     * @param requestProps the parameters for this request (if any)
     * @param options any Axios options which you want to pass along; this will be combined
     * with any options which were included in `_designOptions`.
     */
    request(requestProps?: I, runTimeOptions?: IAllRequestOptions): Promise<O>;
    /**
     * If there are Axios request options which you which to pass along for every request
     * you can do that by setting them here. Note that each request can also send options
     * and these two dictionaries will be merged where the request's options will take precedence.
     */
    options(opts: Omit<AxiosRequestConfig, "headers" | "method" | "url">): this;
    /**
     * Provides full detail on the `url`, `headers` and `body` of the message
     * but _does not_ send it.
     */
    requestInfo(props?: Partial<I>, runTimeOptions?: IAllRequestOptions): IConfiguredApiRequest<I>;
    /**
     * Seals the configuration of the API endpoint and returns
     * a `SealedRequest` which can be used only to make/execute
     * requests (versus configuring them)
     */
    seal(): SealedRequest<I, O>;
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        calculators: (string & keyof I)[];
        requiredParameters: (string & keyof O)[];
        optionalParameters: (string & keyof O)[];
    };
    /**
     * Pulls the dynamic segments from the URL string and adds them to
     * the `_dynamics` array.
     */
    protected setUrl(url: url): this;
    /**
     * Mocks a request to an endpoint
     *
     * @param body The body of the message (left blank for a GET)
     * @param url The URL including query parameters
     * @param options Mock options
     */
    private mockRequest;
    /**
     * Sends a request to an endpoint using the Axios library
     *
     * @param body The body of the message (left blank for a GET)
     * @param url The URL including query parameters
     * @param options Axios options to pass along to the request
     */
    private makeRequest;
    /**
     * Gets the _dynamic_ properties for a given location (aka, headers, query params).
     * If a dynamic property is not
     * as part of the optional `request` parameter then only dynamics with default
     * values or those which are _required_ will be shown (those required will
     * be returned with a value of REQUIRED).
     */
    private getDynamics;
    /**
     * **runCalculations**
     *
     * Runs all the configured `calc` callbacks to resolve values
     * for the dynamic properties in the body, headers, and query
     * parameters.
     */
    private runCalculations;
    /**
     * **parseParameters**
     *
     * Separates static properties from dynamic; "dynamic" properties
     * are those produced by a functional symbol export like `dynamic`
     * or `calc`.
     */
    private parseParameters;
    private mockNetworkDelay;
}
