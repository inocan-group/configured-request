import { IDictionary } from "common-types";
import { ActiveRequest } from "../entities";
import get from "lodash.get";
import { AxiosRequestConfig, AxiosError } from "axios";

export type IGeneralizedError = (IDictionary & Error) | AxiosError;

/**
 * **ActiveRequestError**
 *
 * An error that occurred during the _active_ requesting of one (or more) network resources
 * from a `SealedRequest` / `ConfiguredRequest`. This error provides a similar interface to
 * what Axios's `AxiosError` provides but provides a slightly different surface area (the underlying
 * error _may_ or _may not_ be an Axios derived error).
 *
 * Note that the underlying error can be found in it's full form at `[err].baseError` and you can
 * test whether this underlying error as from Axios with `[err].isAxiosError`.
 *
 * Finally, in situations where one catch block throws an `ActiveRequestError` within another catch
 * block (presumably with a different "location" property) this error will return the original error.
 */
export class ActiveRequestError extends Error {
  /**
   * Wraps an underlying error with a `ActiveRequestError`
   *
   * @param e the underlying error
   * @param location the location of the catch block to better isolate where the error occurred
   * @param request the `ActiveRequest` object which defines the request
   */
  static wrap(
    e: IGeneralizedError,
    location: string,
    request?: ActiveRequest<any, any>
  ) {
    return new ActiveRequestError(e, location, request);
  }
  public kind = "ActiveRequestError";
  public code: string;
  public baseError: IGeneralizedError;
  public isAxiosError: boolean;
  public httpStatusCode: number;
  public httpStatusText: string;
  public nodeError: string;
  public responseBody: string;
  /** the catch block which caught this error */
  public location: string;

  /**
   * details of the precise _state_ of the request
   */
  public request?: {
    headers: IDictionary;
    queryParameters: IDictionary;
    body: IDictionary | string;
    url: string;
  };

  /**
   * The Axios configuration object (if the underlying error was an Axios error)
   */
  public config: AxiosRequestConfig;

  constructor(
    /** The originating error */
    e: IGeneralizedError,
    /** where the catch block was which caught this error */
    location: string,
    /**
     * The full `ActiveRequest` object used for request
     */
    request?: ActiveRequest<any, any>
  ) {
    super();
    if (get(e, "kind") === "ActiveRequestError") {
      Object.keys(e).forEach((key: string & keyof ActiveRequestError) => {
        (this as any)[key] = (e as ActiveRequestError)[key];
      });
    } else {
      this.location = location;
      this.baseError = e;
      this.isAxiosError = get(e, "isAxiosError") ? true : false;
      this.message = get(e, "message", `no error message`);
      this.stack = get(e, "stack");

      this.httpStatusCode = get(e, "response.status", -1);
      this.httpStatusText = get(e, "response.statusText", "");
      this.code = get(e, "code") || this.httpStatusText || "unknown";
      this.responseBody = get(e, "response.body", "");
      this.config = get(e, "config");
      this.request = {
        headers: request?.headers || get(this.config, "headers"),
        queryParameters: request?.queryParameters || get(this.config, "params"),
        url: request?.url || get(this.config, "baseURL"),
        body: request?.body
      };

      this.name = `active-request/${
        this.httpStatusCode !== -1 ? this.httpStatusCode : this.code
      }`;
    }
  }

  toJSON() {
    return {
      code: this.code,
      httpStatusCode: this.httpStatusCode,
      httpStatusText: this.httpStatusText,
      location: this.location,
      message: this.message,
      config: this.config || { request: this.request },
      isAxiosError: this.isAxiosError
    };
  }
}
