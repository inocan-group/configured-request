import get from "lodash.get";
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
    constructor(
    /** The originating error */
    e, 
    /** where the catch block was which caught this error */
    location, 
    /**
     * The full `ActiveRequest` object used for request
     */
    request) {
        super();
        this.kind = "ActiveRequestError";
        if (get(e, "kind") === "ActiveRequestError") {
            Object.keys(e).forEach((key) => {
                this[key] = e[key];
            });
        }
        else {
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
                headers: (request === null || request === void 0 ? void 0 : request.headers) || get(this.config, "headers"),
                queryParameters: (request === null || request === void 0 ? void 0 : request.queryParameters) || get(this.config, "params"),
                url: (request === null || request === void 0 ? void 0 : request.url) || get(this.config, "baseURL"),
                body: request === null || request === void 0 ? void 0 : request.body
            };
            this.name = `active-request/${this.httpStatusCode !== -1 ? this.httpStatusCode : this.code}`;
        }
    }
    /**
     * Wraps an underlying error with a `ActiveRequestError`
     *
     * @param e the underlying error
     * @param location the location of the catch block to better isolate where the error occurred
     * @param request the `ActiveRequest` object which defines the request
     */
    static wrap(e, location, request) {
        return new ActiveRequestError(e, location, request);
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
