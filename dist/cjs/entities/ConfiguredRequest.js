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
        this._bodyType = index_1.ApiBodyType.JSON;
        this._mockConfig = {};
        this._formSeparator = "--configured-request-separator--";
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
    body(content) {
        if (["get", "delete"].includes(this._method)) {
            throw new errors_1.ConfiguredRequestError(`You can not set body parameters when configuring a ${this._method.toUpperCase()} request!`, "body-not-allowed");
        }
        if (![index_1.ApiBodyType.JSON, index_1.ApiBodyType.formFields].includes(this._bodyType)) {
            throw new errors_1.ConfiguredRequestError(`Only JSON and Multipart Forms can be configured with a body section!`, "body-not-allowed");
        }
        const [staticProps, dynamics, calculations] = this.parseParameters(content);
        this._body = staticProps;
        this._dynamics = shared_2.dynamicUpdate(this._dynamics, index_1.DynamicStateLocation.body, dynamics);
        this._calculations = shared_1.calculationUpdate(this._calculations, index_1.DynamicStateLocation.body, calculations);
        return this;
    }
    bodyAsJSON() {
        this.validateBodyType();
        this._bodyType = "JSON";
        return this;
    }
    bodyAsMultipartForm(separator) {
        this.validateBodyType();
        if (separator) {
            this._formSeparator = separator;
        }
        this._bodyType = "formFields";
        return this;
    }
    bodyAsText() {
        this.validateBodyType();
        this._bodyType = "text";
        return this;
    }
    bodyAsHTML() {
        this.validateBodyType();
        this._bodyType = "html";
        return this;
    }
    bodyAsUnknown() {
        this.validateBodyType();
        this._bodyType = "unknown";
        return this;
    }
    validateBodyType() {
        if (["get", "delete"].includes(this._method)) {
            throw new errors_1.ConfiguredRequestError(`You can not state a body type other than NONE for a message using ${this._method.toUpperCase()}`, "invalid-body-type");
        }
    }
    mapper(fn) {
        this._mapping = fn;
        return this;
    }
    async request(requestProps, runTimeOptions = {}) {
        const req = new index_1.ActiveRequest(requestProps, runTimeOptions, this);
        try {
            let result;
            let makeRequest;
            if (req.isMockRequest) {
                makeRequest = this.mockRequest.bind(this);
            }
            else {
                makeRequest = this.realRequest.bind(this);
            }
            result = await makeRequest(req).catch((e) => {
                return this.handleOrThrowError(e, "on-request", req);
            });
            const finalResult = this._mapping && typeof result === "object" && result.data
                ? this._mapping(result === null || result === void 0 ? void 0 : result.data)
                : result === null || result === void 0 ? void 0 : result.data;
            return finalResult;
        }
        catch (e) {
            return this.handleOrThrowError(e, "surrounding-request", req);
        }
    }
    handleOrThrowError(e, location, request) {
        const err = errors_1.ActiveRequestError.wrap(e, location, request);
        const handler = this._errorHandler ? this._errorHandler : () => false;
        const handled = handler(err);
        if (!handled)
            throw err;
        return handled;
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
        const verbHasBody = !["get", "delete"].includes(this._bodyType);
        const ctLookup = {
            text: "text/plain",
            html: "text/html",
            unknown: "application/octet-stream",
            JSON: "application/json",
            formFields: "multipart/form-data"
        };
        let headers = Object.assign(Object.assign(Object.assign(Object.assign({}, exports.DEFAULT_HEADERS), (verbHasBody
            ? { "Content-Type": ctLookup[this._bodyType] }
            : {})), this._headers), this.getDynamics(index_1.DynamicStateLocation.header, props));
        const bodyType = ["get", "delete"].includes(this._method)
            ? "none"
            : this._bodyType;
        const templateBody = this._body || {};
        const requestBody = props && props.body ? props.body : {};
        const body = typeof requestBody === "object"
            ? Object.assign(Object.assign(Object.assign({}, templateBody), requestBody), this.getDynamics(index_1.DynamicStateLocation.body, props)) : requestBody;
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
            payload: body ? "" : undefined,
            bodyType,
            body,
            isMockRequest: this.isMockRequest(runTimeOptions) ? true : false,
            mockConfig,
            axiosOptions
        };
        return shared_1.addBodyPayload(this.runCalculations(apiRequest), this._formSeparator);
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
    async mockRequest(request) {
        if (!this._mockFn) {
            throw new errors_1.ConfiguredRequestError(`The API endpoint at "${request.url}" does NOT have a mock function so can not be used when mocking is enabled!`, "mock-not-ready", common_types_1.HttpStatusCodes.NotImplemented);
        }
        try {
            await this.mockNetworkDelay(request.mockConfig.networkDelay || this._mockConfig.networkDelay);
            const response = await this._mockFn(request);
            return shared_1.fakeAxiosResponse(response, request);
        }
        catch (e) {
            throw new errors_1.ConfiguredRequestError(e.message || `Problem running the mock API request to ${request.url}`, "invalid-mock-call", e.httpStatusCode || common_types_1.HttpStatusCodes.BadRequest);
        }
    }
    async realRequest(request) {
        const options = Object.assign(Object.assign({}, request.axiosOptions), { headers: request.headers });
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
            else if (calc.location === index_1.DynamicStateLocation.body &&
                ["JSON", "formFields"].includes(apiRequest.bodyType)) {
                let b = apiRequest.body;
                b[calc.prop] = value;
                apiRequest.body = b;
            }
        });
        return apiRequest;
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
