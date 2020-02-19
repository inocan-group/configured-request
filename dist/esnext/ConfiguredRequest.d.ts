import { IDictionary, url, IHttpRequestHeaders } from "common-types";
import { IEndpointMock } from "./index";
import { AxiosRequestConfig } from "axios";
import { SealedRequest } from "./SealedRequest";
import { IRequestInfo } from "./cr-types";
export declare const DEFAULT_HEADERS: IDictionary<string>;
/**
 * **Request**
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
I extends IDictionary = IDictionary, 
/**
 * The **output** of the API Endpoint
 */
O extends IDictionary = IDictionary, 
/**
 * if you are doing a transform before returning <O> you can state a preliminary type that comes back
 * from the API directly
 */
X extends IDictionary = IDictionary> {
    private _qp;
    private _headers;
    private _designOptions;
    private _url;
    private _body?;
    private _bodyType;
    private _mockFn?;
    private _mapping;
    /**
     * The various _dynamic_ aspects of the API call
     */
    private _dynamics;
    private _method;
    static get<I extends IDictionary = IDictionary, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    static post<I extends IDictionary = IDictionary, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    static put<I extends IDictionary = IDictionary, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    static delete<I extends IDictionary = IDictionary, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    /** add a mock function for this API endpoint */
    mock(fn: IEndpointMock<I, O>): Promise<this>;
    isMockRequest(options?: IDictionary & {
        mock?: boolean;
    }): string | boolean;
    headers(headers: IHttpRequestHeaders | IDictionary<string | number | boolean>): this;
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
     * @param props the parameters for this request (if any)
     * @param options any Axios options which you want to pass along; this will be combined
     * with any options which were included in `_designOptions`.
     */
    request(props?: I, runTimeOptions?: IDictionary): Promise<O>;
    /**
     * If there are Axios request options which you which to pass along for every request
     * you can do that by setting them here. Note that each request can also send options
     * and these two dictionaries will be merged where the request's options will take precedence.
     */
    axiosOptions(opts: Omit<AxiosRequestConfig, "headers" | "method" | "url">): this;
    /**
     * Provides full detail on the `url`, `headers` and `body` of the message
     * but _does not_ send it.
     */
    requestInfo(props?: Partial<I>): IRequestInfo;
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
        requiredParameters: string | string[];
        optionalParameters: string | string[];
    };
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
     * Gets the dynamic properties as known at the given time; if none provided
     * as part of the optional `request` parameter then only dynamics with default
     * values or those which are _required_ will be shown (those required will
     * be returned with a value of REQUIRED).
     */
    private getDynamics;
    private parseParameters;
}
