import { IDictionary, datetime, seconds } from "common-types";
import { ConfiguredRequest } from "./entities/ConfiguredRequest";
import { AxiosRequestConfig } from "axios";

export interface IRequestInfo {
  method: IRequestVerb;
  headers: IDictionary<Scalar>;
  url: string;
  body?: string;
  bodyType: IApiBodyType;
  options: IDictionary;
}

export enum RequestVerb {
  get = "get",
  post = "post",
  put = "put",
  delete = "delete",
  patch = "patch"
}

export type IRequestVerb = keyof typeof RequestVerb;

export enum DynamicStateLocation {
  url = "url",
  queryParameter = "queryParameter",
  header = "header",
  bodyJson = "bodyJson",
  bodyForm = "bodyForm"
}

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36"
};

export type Scalar = string | number | boolean;

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
  (request: I, config: Omit<IConfiguredApiRequest<I>, "props">): O;
}

export enum ApiBodyType {
  JSON = "JSON",
  formFields = "formFields",
  literal = "literal",
  none = "none"
}

export type IApiBodyType = keyof typeof ApiBodyType;

export type PropertyName = string;

/**
 * A tuple with the property's name as the first element, the value
 * as the second element.
 */
export type NamedValuePair = [PropertyName, Scalar];

/**
 * a function used in the `dynamic` helper to resolve either:
 *
 * 1. The value of a dynamic property
 * 2. The key and value of a dynamic property
 */
export type DynamicFunction<I> = (request: I) => Scalar | NamedValuePair;

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
export interface IMockOptions {
  mock?: boolean;
  networkDelay?: INetworkDelaySetting;
  authWhitelist?: string[];
  authBlacklist?: string[];
}

export type INetworkDelaySetting = "light" | "medium" | "heavy" | "very-heavy";

export type IAllRequestOptions = IMockOptions & AxiosRequestConfig;

export const LITERAL_TYPE = "LITERAL_BODY_PAYLOAD";
export interface ILiteralType {
  type: "LITERAL_BODY_PAYLOAD";
  value: string;
}

export function isLiteralType<I extends IApiInput>(
  body: I["body"] | ILiteralType
): body is ILiteralType {
  return (body as any).type === LITERAL_TYPE ? true : false;
}

export interface IApiInputWithBody extends IDictionary {
  body: IDictionary<Scalar>;
}

export interface IApiInputWithoutBody extends IDictionary {
  body?: undefined;
}

export type IApiInput = IApiInputWithBody | IApiInputWithoutBody;
export interface IApiOutput extends IDictionary {}
export interface IApiIntermediate extends IDictionary {}

/**
 * A `IDynamicCalculator` takes in the context of a API request
 * and uses this context to calculate the value of a property
 */
export interface IDynamicCalculator<I extends IApiInput, O extends Object> {
  (
    request: IConfiguredApiRequest<I>["props"],
    config: Omit<IConfiguredApiRequest<I>, "props">
  ): Scalar;
  /** you may optionally state which properties _must_ be defined before this calculator can run */
  deps?: string[];
}

export enum DynamicSymbol {
  dynamic = "dynamic",
  calc = "calc"
}
export type IDynamicSymbol = keyof typeof DynamicSymbol;

/**
 * Tests whether the given symbol is a `calc` property
 */
export function isCalculator<I extends IApiInput, O extends IApiOutput>(
  dp: IDynamicProperty<I, O>
): dp is ICalcSymbolOutput<I, O> {
  return dp.symbol === DynamicSymbol.calc ? true : false;
}

/**
 * Tests whether the given symbol is a `dynamic` property
 */
export function isDynamicProp<I extends IApiInput, O extends IApiOutput>(
  dp: IDynamicProperty<I, O>
): dp is IDynamicProperty<I, O> {
  return dp.symbol === DynamicSymbol.dynamic ? true : false;
}

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
export interface IDynamicSymbolOutput<V = Scalar, O extends object = {}>
  extends IBaseSymbolOutput<O> {
  symbol: DynamicSymbol.dynamic;
  defaultValue: V;
  required: boolean;
}

/**
 * The output generated by final function call in a `calc` symbol's configuration
 */
export interface ICalcSymbolOutput<I extends IApiInput, O extends Object>
  extends IBaseSymbolOutput<I> {
  symbol: DynamicSymbol.calc;
  fn: IDynamicCalculator<I, O>;
}

export type IDynamicProperty<
  I extends IApiInput,
  O extends IApiOutput,
  V = Scalar
> = ICalcSymbolOutput<I, O> | IDynamicSymbolOutput<V, O>;

export type KnownLocation<T> = T & { location: DynamicStateLocation };
