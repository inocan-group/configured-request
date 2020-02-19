"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_types_1 = require("common-types");
const index_1 = require("../index");
const errors_1 = require("../errors");
const queryString = __importStar(require("query-string"));
const axios_1 = __importDefault(require("axios"));
const SealedRequest_1 = require("./SealedRequest");
const extract_1 = require("../shared/extract");
exports.DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
};
class ConfiguredRequest {
    constructor() {
        this._qp = {};
        this._headers = {};
        this._designOptions = {};
        this._bodyType = "none";
        this._dynamics = [];
    }
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
        const d = dynamic.map(i => (Object.assign(Object.assign({}, i), { type: index_1.DynamicStateLocation.header })));
        this._dynamics = this._dynamics
            .filter(i => i.type !== index_1.DynamicStateLocation.header)
            .concat(...d);
        return this;
    }
    queryParameters(qp) {
        const [staticProps, dynamic] = this.parseParameters(qp);
        this._qp = staticProps;
        const d = dynamic.map(i => (Object.assign(Object.assign({}, i), { type: index_1.DynamicStateLocation.queryParameter })));
        this._dynamics = this._dynamics
            .filter(i => i.type !== index_1.DynamicStateLocation.queryParameter)
            .concat(...d);
        return this;
    }
    mapper(fn) {
        this._mapping = fn;
        return this;
    }
    async request(props, runTimeOptions = {}) {
        const request = this.requestInfo(props, runTimeOptions);
        const isMockRequest = this.isMockRequest(request.options);
        const axiosOptions = Object.assign({ headers: request.headers }, request.axiosOptions);
        let result;
        if (isMockRequest) {
            result = await this.mockRequest(request, axiosOptions);
        }
        else {
            result = await this.makeRequest(request, axiosOptions);
        }
        if (result.status >= 300) {
            throw new errors_1.ConfiguredRequestError(`The API endpoint [ ${this._method.toUpperCase()} ${request.url} ] failed with a ${result.status} / ${result.statusText}} error code.`, String(result.status), result.status);
        }
        return this._mapping
            ? this._mapping(result.data)
            : result.data;
    }
    options(opts) {
        this._designOptions = opts;
        return this;
    }
    requestInfo(props, runTimeOptions = {}) {
        const queryParameters = Object.assign(Object.assign({}, this.getDynamics(index_1.DynamicStateLocation.queryParameter, props)), this._qp);
        const url = this._url
            .split("{")
            .map(i => i.replace(/(.*})/, ""))
            .join("");
        const headers = Object.assign(Object.assign(Object.assign({}, exports.DEFAULT_HEADERS), this._headers), this.getDynamics(index_1.DynamicStateLocation.header, props));
        const bodyType = ["get", "delete"].includes(this._method)
            ? "none"
            : this._bodyType;
        const body = index_1.bodyToString(this._body, bodyType);
        const [options, axiosOptions] = extract_1.extract(Object.assign(Object.assign({}, this._designOptions), runTimeOptions), ["mock", "networkDelay"]);
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
    seal() {
        return new SealedRequest_1.SealedRequest(this);
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
            const parts = url.split("{");
            this._dynamics = this._dynamics.filter(d => d.type !== index_1.DynamicStateLocation.url);
            parts.slice(1).forEach(part => {
                const endDelimiter = part.indexOf("}");
                if (endDelimiter === -1) {
                    throw new errors_1.ConfiguredRequestError(`The structure of the URL parameter is invalid. URL's which have dynamic parameters as part of the URL must be delimited by a openning and closing curly brackets. The current URL appears to have a mismatch of openning and closing brackets. The URL is: ${url}`, "invalid-url");
                }
                const dynamicProp = part.slice(0, endDelimiter);
                this._dynamics = this._dynamics.concat({
                    prop: dynamicProp,
                    required: true,
                    type: index_1.DynamicStateLocation.url,
                    defaultValue: undefined
                });
            });
        }
        return this;
    }
    async mockRequest(request, options) {
        return {
            data: this._mockFn ? this._mockFn(request) : {},
            status: common_types_1.HttpStatusCodes.NotImplemented,
            statusText: "Not Implemented",
            headers: {},
            config: {}
        };
    }
    async makeRequest(request, options) {
        const { url, body } = request;
        switch (this._method) {
            case "get":
                return axios_1.default.get(url, options);
            case "put":
                return axios_1.default.put(url, body, options);
            case "post":
                return axios_1.default.put(url, body, options);
            case "delete":
                return axios_1.default.delete(url, options);
            case "patch":
                return axios_1.default.patch(url, body, options);
        }
    }
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
exports.ConfiguredRequest = ConfiguredRequest;
