import { IDictionary } from "common-types";
import { ActiveRequest } from "../entities";
import { AxiosRequestConfig, AxiosError } from "axios";
export declare type IGeneralizedError = (IDictionary & Error) | AxiosError;
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
export declare class ActiveRequestError extends Error {
    static wrap(e: IGeneralizedError, location: string, request?: ActiveRequest<any, any>): ActiveRequestError;
    kind: string;
    code: string;
    baseError: IGeneralizedError;
    isAxiosError: boolean;
    httpStatusCode: number;
    httpStatusText: string;
    nodeError: string;
    responseBody: string;
    /** the catch block which caught this error */
    location: string;
    /**
     * details of the precise _state_ of the request
     */
    request?: {
        headers: IDictionary;
        queryParameters: IDictionary;
        body: IDictionary | string;
        url: string;
    };
    /**
     * The Axios configuration object (if the underlying error was an Axios error)
     */
    config: AxiosRequestConfig;
    constructor(
    /** The originating error */
    e: IGeneralizedError, 
    /** where the catch block was which caught this error */
    location: string, 
    /**
     * The full `ActiveRequest` object used for request
     */
    request?: ActiveRequest<any, any>);
    toJSON(): {
        code: string;
        httpStatusCode: number;
        httpStatusText: string;
        location: string;
        message: string;
        config: AxiosRequestConfig | {
            request: {
                headers: IDictionary<any>;
                queryParameters: IDictionary<any>;
                body: string | IDictionary<any>;
                url: string;
            };
        };
        isAxiosError: boolean;
    };
}
