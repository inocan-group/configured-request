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
  options: IRequestOptions;
}

/**
 * The request options which are _not_ going to be
 * passed to the Axios request.
 */
export interface IRequestOptions {
  mock?: boolean;
  networkDelay?: INetworkDelaySetting;
}

export type INetworkDelaySetting = "light" | "medium" | "heavy" | "very-heavy";

export type IAllRequestOptions = IRequestOptions & AxiosRequestConfig;

export const LITERAL_TYPE = "LITERAL_BODY_PAYLOAD";
export interface ILiteralType {
  type: "LITERAL_BODY_PAYLOAD";
  value: string;
}

export interface IApiInputWithBody extends IDictionary {
  body: IDictionary<Scalar>;
}

export interface IApiInputWithoutBody extends IDictionary {
  body: undefined;
}

export type IApiInput = IApiInputWithBody | IApiInputWithoutBody;
