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
const shared_1 = require("../shared");
const errors_1 = require("../errors");
const queryString = __importStar(require("query-string"));
const axios_1 = __importDefault(require("axios"));
const SealedRequest_1 = require("./SealedRequest");
const cr_types_1 = require("../cr-types");
const extract_1 = require("../shared/extract");
const shared_2 = require("../shared");
exports.DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
    "Cache-Control": "no-cache",
    Connection: "keep-alive"
};
class ConfiguredRequest {
    constructor() {
        this._qp = {};
        this._headers = {};
        this._designOptions = {};
        this._bodyType = "JSON";
        this._mockConfig = {};
        this._dynamics = [];
        this._calculations = [];
        this._mockConfig.networkDelay =
            ConfiguredRequest.networkDelay ||
                process.env.MOCK_API_NETWORK_DELAY ||
                "light";
        if (ConfiguredRequest.authWhitelist) {
            this._mockConfig.authWhitelist = ConfiguredRequest.authWhitelist;
        }
        else if (process.env.MOCK_API_AUTH_WHITELIST) {
            this._mockConfig.authWhitelist = process.env.MOCK_API_AUTH_WHITELIST.split(",");
        }
        if (ConfiguredRequest.authBlacklist) {
            this._mockConfig.authBlacklist = ConfiguredRequest.authBlacklist;
        }
        else if (process.env.MOCK_API_AUTH_BLACKLIST) {
            this._mockConfig.authBlacklist = process.env.MOCK_API_AUTH_BLACKLIST.split(",");
        }
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
    mockFn(fn) {
        this._mockFn = fn;
        return this;
    }
    isMockRequest(options = {}) {
        return options.mock ||
            this._mockConfig.mock ||
            process.env["MOCK_API"] ||
            process.env["VUE_APP_MOCK_API"] ||
            false
            ? true
            : false;
    }
    headers(headers) {
        const [staticProps, dynamics, calculations] = this.parseParameters(headers);
        this._headers = staticProps;
        this._dynamics = shared_2.dynamicUpdate(this._dynamics, index_1.DynamicStateLocation.header, dynamics);
        this._calculations = shared_1.calculationUpdate(this._calculations, index_1.DynamicStateLocation.header, calculations);
        return this;
    }
    errorHandler(fn) {
        this._errorHandler = fn;
        return this;
    }
    queryParameters(qp) {
        const [staticProps, dynamics, calculations] = this.parseParameters(qp);
        this._qp = staticProps;
        this._dynamics = shared_2.dynamicUpdate(this._dynamics, index_1.DynamicStateLocation.queryParameter, dynamics);
        this._calculations = shared_1.calculationUpdate(this._calculations, index_1.DynamicStateLocation.queryParameter, calculations);
        return this;
    }
    mapper(fn) {
        this._mapping = fn;
        return this;
    }
    async request(props, runTimeOptions = {}) {
        var _a, _b;
        const info = this.requestInfo(props, runTimeOptions);
        const axiosOptions = Object.assign({ headers: info.headers }, info.axiosOptions);
        let result;
        try {
            if (info.isMockRequest) {
                result = await this.mockRequest(info, axiosOptions);
            }
            else {
                result = await this.makeRequest(info, axiosOptions);
            }
        }
        catch (e) {
            if (this._errorHandler) {
                const handlerOutcome = this._errorHandler(e);
                if (handlerOutcome === false)
                    throw e;
                result = Object.assign(Object.assign({}, e), { data: handlerOutcome });
            }
            else {
                throw e;
            }
        }
        return this._mapping
            ? this._mapping((_a = result) === null || _a === void 0 ? void 0 : _a.data)
            : (_b = result) === null || _b === void 0 ? void 0 : _b.data;
    }
    options(opts) {
        this._designOptions = opts;
        return this;
    }
    requestInfo(props, runTimeOptions = {}) {
        let queryParameters = Object.assign(Object.assign({}, this.getDynamics(index_1.DynamicStateLocation.queryParameter, props)), this._qp);
        const hasQueryParameters = Object.keys(queryParameters).length > 0 ? true : false;
        const url = this._url
            .split("{")
            .map((urlPart, idx) => {
            if (idx === 0) {
                return urlPart;
            }
            const justVariable = urlPart.replace(/}.*/, "");
            const afterVariable = urlPart.replace(/.*}/, "");
            const [propName, defaultValue] = justVariable.includes(":")
                ? justVariable.split(":")
                : [justVariable, "default-value-undefined"];
            const hasDefaultValue = defaultValue !== "default-value-undefined" ? true : false;
            const requestHasValue = props && Object.keys(props).includes(propName) ? true : false;
            if (requestHasValue) {
                return props[propName] + afterVariable;
            }
            else if (hasDefaultValue) {
                return defaultValue;
            }
            else {
                throw new errors_1.ConfiguredRequestError(`Attempt to build URL failed because there was no default value for "${propName}" nor was this passed into the request!`, "url-dynamics-invalid");
            }
        })
            .join("");
        let headers = Object.assign(Object.assign(Object.assign({}, exports.DEFAULT_HEADERS), this._headers), this.getDynamics(index_1.DynamicStateLocation.header, props));
        const bodyType = ["get", "delete"].includes(this._method)
            ? "none"
            : this._bodyType;
        const templateBody = this._body || {};
        const requestBody = props && props.body ? props.body : {};
        const payload = Object.assign(Object.assign({}, templateBody), requestBody);
        const body = shared_1.bodyToString(payload, bodyType);
        const [mockConfig, axiosOptions] = extract_1.extract(Object.assign(Object.assign(Object.assign({}, this._mockConfig), this._designOptions), runTimeOptions), [
            "mock",
            "networkDelay",
            "authWhiteList",
            "authBlacklist",
            "db"
        ]);
        const apiRequest = {
            props: props,
            method: this._method,
            url: hasQueryParameters
                ? url + "?" + queryString.stringify(queryParameters)
                : url,
            headers,
            queryParameters,
            payload: payload,
            bodyType,
            body,
            isMockRequest: this.isMockRequest(mockConfig) ? true : false,
            mockConfig,
            axiosOptions
        };
        this.runCalculations(apiRequest);
        return apiRequest;
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
            calculators: this._calculations.map(i => i.prop),
            requiredParameters: this._dynamics.filter(d => d.symbol === cr_types_1.DynamicSymbol.dynamic && d.required).length > 0
                ? this._dynamics
                    .filter(d => d.symbol === cr_types_1.DynamicSymbol.dynamic && d.required)
                    .map(i => i.prop)
                : null,
            optionalParameters: this._dynamics.filter(d => d.symbol === cr_types_1.DynamicSymbol.dynamic && !d.required).length > 0
                ? this._dynamics
                    .filter(d => d.symbol === cr_types_1.DynamicSymbol.dynamic && !d.required)
                    .map(i => i.prop)
                : null
        };
    }
    setUrl(url) {
        this._url = url;
        if (url.includes("{")) {
            const parts = url.split("{");
            this._dynamics = this._dynamics.filter(d => d.location !== index_1.DynamicStateLocation.url);
            parts.slice(1).forEach(part => {
                const endDelimiter = part.indexOf("}");
                if (endDelimiter === -1) {
                    throw new errors_1.ConfiguredRequestError(`The structure of the URL parameter is invalid. URL's which have dynamic parameters as part of the URL must be delimited by a openning and closing curly brackets. The current URL appears to have a mismatch of openning and closing brackets. The URL is: ${url}`, "invalid-url");
                }
                const dynamicProp = part.slice(0, endDelimiter);
                this._dynamics = this._dynamics.concat({
                    symbol: cr_types_1.DynamicSymbol.dynamic,
                    prop: dynamicProp,
                    required: true,
                    location: index_1.DynamicStateLocation.url,
                    defaultValue: undefined
                });
            });
        }
        return this;
    }
    async mockRequest(request, options) {
        if (!this._mockFn) {
            throw new errors_1.ConfiguredRequestError(`The API endpoint at ${request.url} does NOT have a mock function so can not be used when mocking is enabled!`, "mock-not-ready", common_types_1.HttpStatusCodes.NotImplemented);
        }
        try {
            const response = await this._mockFn(request.props, this, options);
            await this.mockNetworkDelay(request.mockConfig.networkDelay || this._mockConfig.networkDelay);
            return shared_1.fakeAxios(response, request);
        }
        catch (e) {
            throw new errors_1.ConfiguredRequestError(e.message || `Problem running the mock API request to ${request.url}`, "invalid-mock-call", e.httpStatusCode || common_types_1.HttpStatusCodes.BadRequest);
        }
    }
    async makeRequest(request, options) {
        const { url, body } = request;
        switch (this._method) {
            case "get":
                return axios_1.default.get(url, options);
            case "put":
                return axios_1.default.put(url, body, options);
            case "post":
                return axios_1.default.post(url, body, options);
            case "delete":
                return axios_1.default.delete(url, options);
            case "patch":
                return axios_1.default.patch(url, body, options);
        }
    }
    getDynamics(location, request = {}) {
        const dynamics = this._dynamics.filter(i => i.location === location);
        let dynamicsHash = {};
        dynamics.forEach(d => {
            const { required, prop, defaultValue } = d;
            const hasValueFromInput = Object.getOwnPropertyNames(request).includes(prop);
            if (hasValueFromInput) {
                dynamicsHash[prop] = request[prop];
            }
            else if (defaultValue !== undefined) {
                dynamicsHash[prop] = defaultValue;
            }
            else if (required) {
                dynamicsHash[prop] = "REQUIRED!";
            }
        });
        return dynamicsHash;
    }
    runCalculations(apiRequest) {
        const [{ props: request }, config] = extract_1.extract(apiRequest, ["props"]);
        this._calculations.forEach(calc => {
            const value = calc.fn(request, config);
            if (calc.location === "queryParameter") {
                apiRequest.queryParameters[calc.prop] = value;
            }
            else if (calc.location === index_1.DynamicStateLocation.header) {
                apiRequest.headers[calc.prop] = value;
            }
        });
        return [apiRequest.headers, apiRequest.queryParameters];
    }
    parseParameters(hash) {
        let staticProps = {};
        Object.keys(hash)
            .filter(i => typeof hash[i] !== "function")
            .forEach(i => (staticProps[i] = hash[i]));
        const dynamic = [];
        const calculations = [];
        Object.keys(hash)
            .filter(i => typeof hash[i] === "function")
            .forEach(i => {
            const config = hash[i](i);
            if (cr_types_1.isCalculator(config)) {
                calculations.push(config);
            }
            else if (index_1.isDynamicProp(config)) {
                dynamic.push(config);
            }
            else {
                console.warn(`detected a dynamic property of an unknown type`, {
                    config
                });
            }
        });
        return [staticProps, dynamic, calculations];
    }
    async mockNetworkDelay(delay) {
        const lookup = {
            light: [10, 50],
            medium: [50, 150],
            heavy: [150, 500],
            "very-heavy": [1000, 2000]
        };
        const range = lookup[delay];
        await common_types_1.wait(shared_1.between(range[0], range[1]));
    }
}
exports.ConfiguredRequest = ConfiguredRequest;
ConfiguredRequest.networkDelay = "light";
