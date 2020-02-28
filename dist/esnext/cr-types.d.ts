import { IDictionary, datetime, seconds } from "common-types";
import { ConfiguredRequest } from "./entities/ConfiguredRequest";
import { AxiosRequestConfig, AxiosError } from "axios";
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
export interface IApiMock<I extends IApiInput, O, M = any> {
    (
    /**
     * The run-time parameters passed into the request; this should conform to the
     * input interface `I`.
     */
    request: I, config: ConfiguredRequest<I, O, any, M>, options?: IMockOptions<M>): O | Promise<O>;
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
     * The properties passed in as part of the request; note that this is NOT the
     * body of the message but rather dynamic properties defined in the definition
     * of the `ConfiguredRequest`
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
    payload: I["body"];
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
export interface IMockOptions<M = any> {
    /**
     * Should the request be mocked instead of sending a real
     * network request
     */
    mock?: boolean;
    /**
     * What sort of simulated network delay is desired?
     */
    networkDelay?: INetworkDelaySetting;
    /**
     * Allows certain bearer tokens to be _white listed_ as valid
     * during a mock request.
     */
    authWhitelist?: string[];
    /**
     * Allows certain bearer tokens to be _black listed_ as valid
     * during a mock request.
     */
    authBlacklist?: string[];
    /**
     * optionally pass in a mock database which the allows the mocked API endpoint
     * to interact with a in-memory database which the frontend consumer may also
     * use.
     */
    db?: M;
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
export interface IApiOutput extends IDictionary {
}
export interface IApiIntermediate extends IDictionary {
}
/**
 * A `IDynamicCalculator` takes in the context of a API request
 * and uses this context to calculate the value of a property
 */
export interface IDynamicCalculator<I extends IApiInput, O extends Object> {
    (request: IConfiguredApiRequest<I>["props"], config: Omit<IConfiguredApiRequest<I>, "props">): Scalar;
    /** you may optionally state which properties _must_ be defined before this calculator can run */
    deps?: string[];
}
export declare enum DynamicSymbol {
    dynamic = "dynamic",
    calc = "calc"
}
export declare type IDynamicSymbol = keyof typeof DynamicSymbol;
/**
 * Tests whether the given symbol is a `calc` property
 */
export declare function isCalculator<I extends IApiInput, O extends IApiOutput>(dp: IDynamicProperty<I, O>): dp is ICalcSymbolOutput<I, O>;
/**
 * Tests whether the given symbol is a `dynamic` property
 */
export declare function isDynamicProp<I extends IApiInput, O extends IApiOutput>(dp: IDynamicProperty<I, O>): dp is IDynamicProperty<I, O>;
/**
 * Properties that ALL symbols exports will provide
 */
export interface IBaseSymbolOutput<O extends IApiOutput> {
    location?: DynamicStateLocation;
    symbol: DynamicSymbol;
    prop: string & keyof O;
}
/**
 * The output generated by final function call in a `dynamic` symbol's configuration
 */
export interface IDynamicSymbolOutput<V = Scalar, O extends object = {}> extends IBaseSymbolOutput<O> {
    symbol: DynamicSymbol.dynamic;
    defaultValue: V;
    required: boolean;
}
/**
 * The output generated by final function call in a `calc` symbol's configuration
 */
export interface ICalcSymbolOutput<I extends IApiInput, O extends Object> extends IBaseSymbolOutput<I> {
    symbol: DynamicSymbol.calc;
    fn: IDynamicCalculator<I, O>;
}
export declare type IDynamicProperty<I extends IApiInput, O extends IApiOutput, V = Scalar> = ICalcSymbolOutput<I, O> | IDynamicSymbolOutput<V, O>;
export declare type KnownLocation<T> = T & {
    location: DynamicStateLocation;
};
/**
 * An error handler for Axios requests. If an error is encountered it will
 * pass the error to the handler. If the handler returns a `false` it will
 * also throw an error but any other value will be passed along as the response's
 * `data` property.
 */
export interface IErrorHandler {
    (fn: AxiosError): false | any;
}
