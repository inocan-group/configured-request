import { IDictionary, datetime, seconds } from "common-types";
import { ConfiguredRequest } from "./ConfiguredRequest";

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
export interface IEndpointMock<I, O> {
  (request: ConfiguredRequest<I, O>, scenario?: IEndpointMockScenario): O;
}

/**
 * When mocking an API endpoint, there
 * are various scenarios that you might
 * want to mock for.
 */
export enum EndpointMockScenario {
  /**
   * An normal response which assumes we are on the
   * happy path. This is the default type and if a
   * endpoint only returns a single function then it will
   * be assumed to be for this path.
   */
  happyPath = "happyPath",
  authFailure = "authFailure",
  apiFailure = "apiFailure"
}

export type IEndpointMockScenario = keyof typeof EndpointMockScenario;

export type IApiBodyType = "none" | "literal" | "form-fields" | "JSON";
