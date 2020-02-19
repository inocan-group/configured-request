import { IDictionary, datetime, seconds, HttpStatusCodes } from "common-types";
import { ConfiguredRequest } from "./entities/ConfiguredRequest";

export interface IRequestInfo {
  method: IRequestMethod;
  headers: IDictionary<Scalar>;
  url: string;
  body?: string;
  options: IDictionary;
}

export enum RequestMethod {
  get = "get",
  post = "post",
  put = "put",
  delete = "delete",
  patch = "patch"
}

export type IRequestMethod = keyof typeof RequestMethod;

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
export interface IApiMock<I, O> {
  (request: I, config: ConfiguredRequest<I, O>): O;
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
