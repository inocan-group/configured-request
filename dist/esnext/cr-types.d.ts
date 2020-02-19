import { IDictionary, datetime, seconds } from "common-types";
import { AxiosRequestConfig } from "axios";
export interface IRequestInfo {
    method: IRequestVerb;
    headers: IDictionary<Scalar>;
    url: string;
    body?: string;
    bodyType: IApiBodyType;
    options: IDictionary;
}
export declare enum RequestVerb {
    get = "get",
    post = "post",
    put = "put",
    delete = "delete",
    patch = "patch"
}
export declare type IRequestVerb = keyof typeof RequestVerb;
export declare enum DynamicStateLocation {
    url = "url",
    queryParameter = "queryParameter",
    header = "header",
    bodyJson = "bodyJson",
    bodyForm = "bodyForm"
}
export declare type Scalar = string | number | boolean;
export interface IDynamicProperty {
    prop: string;
    required: boolean;
    defaultValue: Scalar | undefined;
    type?: DynamicStateLocation;
}
/**
 * Puts a high-level meta embrella around a scraped data structure to provide basic
 * meta about the scrape.
 */
export interface IDatedScrape<T> {
    date: datetime;
    duration?: seconds;
    data: T;
}
/** A function that sends back a mocked response to a given endpoint */
export interface IApiMock<I extends IApiInput, O> {
    (request: IConfiguredApiRequest<I>): O;
}
export declare enum ApiBodyType {
    JSON = "JSON",
    formFields = "formFields",
    literal = "literal",
    none = "none"
}
export declare type IApiBodyType = keyof typeof ApiBodyType;
export declare type PropertyName = string;
/**
 * A tuple with the property's name as the first element, the value
 * as the second element.
 */
export declare type NamedValuePair = [PropertyName, Scalar];
/**
 * a function used in the `dynamic` helper to resolve either:
 *
 * 1. The value of a dynamic property
 * 2. The key and value of a dynamic property
 */
export declare type DynamicFunction<I> = (request: I) => Scalar | NamedValuePair;
export interface IConfiguredApiRequest<I extends IApiInput> {
    method: IRequestVerb;
    /**
     * The properties passed in as part of the request
     */
    props: I;
    /**
     * The resolved URL which now includes all queryParameters as well as dynamic URL params
     */
    url: string;
    /**
     * The headers to be included in the request
     */
    headers: IDictionary<Scalar>;
    /**
     * A structured view into the name/value pairs that are part of the query parameters
     */
    queryParameters: IDictionary<Scalar>;
    /**
     * the body as a structured dictionary (aka, prior to conversion to a string)
     */
    payload: I["body"] | ILiteralType;
    /**
     * The stringified body/payload of the message
     */
    body: undefined | string;
    /**
     * The structure of the body when parsed
     */
    bodyType: IApiBodyType;
    /**
     * The Axios options -- excluding the `headers` which will be
     * passed in later.
     */
    axiosOptions: AxiosRequestConfig;
    /**
     * Options -- such as mocking -- which are _not_ related to Axios
     */
    mockConfig: IMockOptions;
}
/**
 * The request options which are _not_ going to be
 * passed to the Axios request.
 */
export interface IMockOptions {
    mock?: boolean;
    networkDelay?: INetworkDelaySetting;
    authWhitelist?: string[];
    authBlacklist?: string[];
}
export declare type INetworkDelaySetting = "light" | "medium" | "heavy" | "very-heavy";
export declare type IAllRequestOptions = IMockOptions & AxiosRequestConfig;
export declare const LITERAL_TYPE = "LITERAL_BODY_PAYLOAD";
export interface ILiteralType {
    type: "LITERAL_BODY_PAYLOAD";
    value: string;
}
export declare function isLiteralType<I extends IApiInput>(body: I["body"] | ILiteralType): body is ILiteralType;
export interface IApiInputWithBody extends IDictionary {
    body: IDictionary<Scalar>;
}
export interface IApiInputWithoutBody extends IDictionary {
    body?: undefined;
}
export declare type IApiInput = IApiInputWithBody | IApiInputWithoutBody;
