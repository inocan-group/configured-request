import { HttpStatusCodes } from "common-types";
import { DynamicStateLocation, bodyToString } from "../index";
import { ConfiguredRequestError } from "../errors";
import * as queryString from "query-string";
import axios from "axios";
import { SealedRequest } from "./SealedRequest";
import { extract } from "../shared/extract";
export const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
};
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
export class ConfiguredRequest {
    constructor() {
        this._qp = {};
        this._headers = {};
        this._designOptions = {};
        this._bodyType = "none";
        /**
         * The various _dynamic_ aspects of the API call
         */
        this._dynamics = [];
    }
    //#region static initializers
    static get(url) {
        const obj = new ConfiguredRequest();
        obj._method = "get";
        obj.setUrl(url);
        return obj;
    }
    static post(url) {
        const obj = new ConfiguredRequest();
        obj._method = "post";
        obj.setUrl(url);
        return obj;
    }
    static put(url) {
        const obj = new ConfiguredRequest();
        obj._method = "put";
        obj.setUrl(url);
        return obj;
    }
    static delete(url) {
        const obj = new ConfiguredRequest();
        obj._method = "delete";
        obj.setUrl(url);
        return obj;
    }
    //#endregion
    /** add a mock function for this API endpoint */
    async mock(fn) {
        this._mockFn = fn;
        return this;
    }
    isMockRequest(options = {}) {
        return (options.mock ||
            process.env["VUE_APP_MOCK_REQUEST"] ||
            process.env["MOCK_REQUEST"] ||
            false);
    }
    headers(headers) {
        const [staticProps, dynamic] = this.parseParameters(headers);
        this._headers = staticProps;
        const d = dynamic.map(i => (Object.assign(Object.assign({}, i), { type: DynamicStateLocation.header })));
        this._dynamics = this._dynamics
            .filter(i => i.type !== DynamicStateLocation.header)
            .concat(...d);
        return this;
    }
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
    queryParameters(qp) {
        const [staticProps, dynamic] = this.parseParameters(qp);
        this._qp = staticProps;
        const d = dynamic.map(i => (Object.assign(Object.assign({}, i), { type: DynamicStateLocation.queryParameter })));
        this._dynamics = this._dynamics
            .filter(i => i.type !== DynamicStateLocation.queryParameter)
            .concat(...d);
        return this;
    }
    /**
     * Maps the data returned from the API endpoint. This is _not_ a required feature
     * of the ConfiguredRequest but can be useful in some cases. This function uses
     * the fluent style and returns a reference to the ConfiguredRequest.
     *
     * @param fn a mapping function which accepts type <X> and returns type <O>
     */
    mapper(fn) {
        this._mapping = fn;
        return this;
    }
    /**
     * Request the API endpoint; returning the endpoint payload if successful
     * and throwing an error if the Axios status is anything higher than 300.
     *
     * @param props the parameters for this request (if any)
     * @param options any Axios options which you want to pass along; this will be combined
     * with any options which were included in `_designOptions`.
     */
    async request(props, runTimeOptions = {}) {
        const request = this.requestInfo(props, runTimeOptions);
        const isMockRequest = this.isMockRequest(request.options);
        const axiosOptions = Object.assign({ headers: request.headers }, request.axiosOptions);
        let result;
        // MOCK or NETWORK REQUEST
        if (isMockRequest) {
            result = await this.mockRequest(request, axiosOptions);
        }
        else {
            result = await this.makeRequest(request, axiosOptions);
        }
        // THROW on ERROR
        if (result.status >= 300) {
            throw new ConfiguredRequestError(`The API endpoint [ ${this._method.toUpperCase()} ${request.url} ] failed with a ${result.status} / ${result.statusText}} error code.`, String(result.status), result.status);
        }
        // OPTIONALLY MAP, ALWAYS RETURN
        return this._mapping
            ? this._mapping(result.data)
            : result.data;
    }
    /**
     * If there are Axios request options which you which to pass along for every request
     * you can do that by setting them here. Note that each request can also send options
     * and these two dictionaries will be merged where the request's options will take precedence.
     */
    options(opts) {
        this._designOptions = opts;
        return this;
    }
    /**
     * Provides full detail on the `url`, `headers` and `body` of the message
     * but _does not_ send it.
     */
    requestInfo(props, runTimeOptions = {}) {
        const queryParameters = Object.assign(Object.assign({}, this.getDynamics(DynamicStateLocation.queryParameter, props)), this._qp);
        const url = this._url
            .split("{")
            .map(i => i.replace(/(.*})/, ""))
            .join("");
        const headers = Object.assign(Object.assign(Object.assign({}, DEFAULT_HEADERS), this._headers), this.getDynamics(DynamicStateLocation.header, props));
        const bodyType = ["get", "delete"].includes(this._method)
            ? "none"
            : this._bodyType;
        const body = bodyToString(this._body, bodyType);
        const [options, axiosOptions] = extract(Object.assign(Object.assign({}, this._designOptions), runTimeOptions), ["mock", "networkDelay"]);
        return {
            props: props,
            method: this._method,
            url: queryParameters
                ? url + "?" + queryString.stringify(queryParameters)
                : url,
            headers,
            queryParameters,
            payload: this._body,
            bodyType,
            body,
            options,
            axiosOptions
        };
    }
    /**
     * Seals the configuration of the API endpoint and returns
     * a `SealedRequest` which can be used only to make/execute
     * requests (versus configuring them)
     */
    seal() {
        return new SealedRequest(this);
    }
    toString() {
        const info = this.requestInfo({});
        return info.method + " " + info.url;
    }
    toJSON() {
        return {
            method: this._method,
            url: this._url,
            requiredParameters: this._dynamics.filter(d => d.required).length > 0
                ? this._dynamics.filter(d => d.required).map(i => i.prop)
                : "none",
            optionalParameters: this._dynamics.filter(d => !d.required).length > 0
                ? this._dynamics.filter(d => !d.required).map(i => i.prop)
                : "none"
        };
    }
    setUrl(url) {
        this._url = url;
        if (url.includes("{")) {
            // Dynamic properties present
            const parts = url.split("{");
            this._dynamics = this._dynamics.filter(d => d.type !== DynamicStateLocation.url);
            parts.slice(1).forEach(part => {
                const endDelimiter = part.indexOf("}");
                if (endDelimiter === -1) {
                    throw new ConfiguredRequestError(`The structure of the URL parameter is invalid. URL's which have dynamic parameters as part of the URL must be delimited by a openning and closing curly brackets. The current URL appears to have a mismatch of openning and closing brackets. The URL is: ${url}`, "invalid-url");
                }
                const dynamicProp = part.slice(0, endDelimiter);
                this._dynamics = this._dynamics.concat({
                    prop: dynamicProp,
                    required: true,
                    type: DynamicStateLocation.url,
                    defaultValue: undefined
                });
            });
        }
        return this;
    }
    /**
     * Mocks a request to an endpoint
     *
     * @param body The body of the message (left blank for a GET)
     * @param url The URL including query parameters
     * @param options Mock options
     */
    async mockRequest(request, options) {
        // TODO: Implement
        return {
            data: this._mockFn ? this._mockFn(request) : {},
            status: HttpStatusCodes.NotImplemented,
            statusText: "Not Implemented",
            headers: {},
            config: {}
        };
    }
    /**
     * Sends a request to an endpoint using the Axios library
     *
     * @param body The body of the message (left blank for a GET)
     * @param url The URL including query parameters
     * @param options Axios options to pass along to the request
     */
    async makeRequest(request, options) {
        const { url, body } = request;
        switch (this._method) {
            case "get":
                return axios.get(url, options);
            case "put":
                return axios.put(url, body, options);
            case "post":
                return axios.put(url, body, options);
            case "delete":
                return axios.delete(url, options);
            case "patch":
                return axios.patch(url, body, options);
        }
    }
    /**
     * Gets the dynamic properties as known at the given time; if none provided
     * as part of the optional `request` parameter then only dynamics with default
     * values or those which are _required_ will be shown (those required will
     * be returned with a value of REQUIRED).
     */
    getDynamics(type, request = {}) {
        const dynamics = this._dynamics.filter(i => i.type === type);
        let dynamicsHash = {};
        dynamics.forEach(d => {
            const { prop, required, defaultValue } = d;
            if (required || request[prop]) {
                dynamicsHash[prop] =
                    request[prop] !== undefined ? request[prop] : "REQUIRED";
            }
        });
        return dynamicsHash;
    }
    parseParameters(hash) {
        let staticProps = {};
        Object.keys(hash)
            .filter(i => typeof hash[i] !== "function")
            .forEach(i => (staticProps[i] = hash[i]));
        const dynamic = [];
        Object.keys(hash)
            .filter(i => typeof hash[i] === "function")
            .forEach(i => {
            const { required, defaultValue } = hash[i](i);
            dynamic.push({ prop: i, required, defaultValue });
        });
        return [staticProps, dynamic];
    }
}
