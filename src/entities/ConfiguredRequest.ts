import { IDictionary, url, HttpStatusCodes, wait } from "common-types";
import {
  DynamicStateLocation,
  IDynamicProperty,
  IRequestVerb,
  IApiMock,
  Scalar,
  IConfiguredApiRequest,
  IApiInputWithBody,
  IApiInputWithoutBody,
  isDynamicProp,
  IApiOutput,
  IApiIntermediate,
  IDynamicSymbolOutput,
  IErrorHandler
} from "../index";
import { calculationUpdate, bodyToString, fakeAxios, between } from "../shared";
import { ConfiguredRequestError } from "../errors";
import * as queryString from "query-string";
import axios, { AxiosResponse, AxiosRequestConfig, AxiosError } from "axios";
import { SealedRequest } from "./SealedRequest";
import {
  IApiBodyType,
  IAllRequestOptions,
  IMockOptions,
  IApiInput,
  DynamicSymbol,
  isCalculator,
  ICalcSymbolOutput,
  INetworkDelaySetting
} from "../cr-types";
import { extract } from "../shared/extract";
import { dynamicUpdate } from "../shared";

export const DEFAULT_HEADERS: IDictionary<string> = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
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
export class ConfiguredRequest<
  /**
   * The **input** requirements to call this endpoint; these requirements can derive from URL, body, or
   * query parameter inputs.
   */
  I extends IApiInput,
  /**
   * The **output** of the API Endpoint
   */
  O extends IApiOutput = IApiOutput,
  /**
   * if you are doing a transform before returning <O> you can state a preliminary type that comes back
   * from the API directly
   */
  X extends IApiIntermediate = IApiIntermediate,
  /**
   * The type/API for the mocking database, if it is passed in by the run-time environment
   */
  M = any
> {
  // Static props which serve as defaults for new instances
  public static authWhitelist: string[];
  public static authBlacklist: string[];
  public static networkDelay: INetworkDelaySetting = "light";

  private _qp: IDictionary = {};
  private _headers: IDictionary = {};
  private _designOptions: IDictionary = {};
  private _url: string;
  private _body?: I["body"];
  private _bodyType: IApiBodyType = "JSON";
  private _mockConfig: IMockOptions = {};
  private _mockFn?: IApiMock<I, O>;
  private _mapping: (input: X) => O;
  private _errorHandler: IErrorHandler;
  /**
   * The various _dynamic_ aspects of the API call
   */
  private _dynamics: Array<
    IDynamicSymbolOutput<any, O> & { location: DynamicStateLocation }
  > = [];
  /**
   * Properties which have calculations associated
   */
  private _calculations: Array<
    ICalcSymbolOutput<I, O> & { location: DynamicStateLocation }
  > = [];
  private _method: IRequestVerb;
  //#region static initializers
  static get<
    I extends IApiInputWithoutBody = IApiInputWithoutBody,
    O extends IApiOutput = IApiOutput,
    X extends IApiIntermediate = IApiIntermediate,
    M = any
  >(url: string) {
    const obj = new ConfiguredRequest<I, O, X, M>();
    obj._method = "get";
    obj.setUrl(url);
    return obj;
  }
  static post<
    I extends IApiInputWithBody = IApiInputWithBody,
    O extends IApiOutput = IApiOutput,
    X extends IApiIntermediate = IApiIntermediate,
    M = any
  >(url: string) {
    const obj = new ConfiguredRequest<I, O, X, M>();
    obj._method = "post";
    obj.setUrl(url);
    return obj;
  }
  static put<
    I extends IApiInputWithBody = IApiInputWithBody,
    O extends IApiOutput = IApiOutput,
    X extends IApiIntermediate = IApiIntermediate,
    M = any
  >(url: string) {
    const obj = new ConfiguredRequest<I, O, X, M>();
    obj._method = "put";
    obj.setUrl(url);
    return obj;
  }
  static delete<
    I extends IApiInputWithoutBody = IApiInputWithoutBody,
    O extends IApiOutput = IApiOutput,
    X extends IApiIntermediate = IApiIntermediate,
    M = any
  >(url: string) {
    const obj = new ConfiguredRequest<I, O, X, M>();
    obj._method = "delete";
    obj.setUrl(url);
    return obj;
  }
  //#endregion

  constructor() {
    // network delay settings
    this._mockConfig.networkDelay =
      ConfiguredRequest.networkDelay ||
      (process.env.MOCK_API_NETWORK_DELAY as INetworkDelaySetting) ||
      "light";
    // auth whitelist
    if (ConfiguredRequest.authWhitelist) {
      this._mockConfig.authWhitelist = ConfiguredRequest.authWhitelist;
    } else if (process.env.MOCK_API_AUTH_WHITELIST) {
      this._mockConfig.authWhitelist = process.env.MOCK_API_AUTH_WHITELIST.split(
        ","
      ) as string[];
    }

    // auth blacklist
    if (ConfiguredRequest.authBlacklist) {
      this._mockConfig.authBlacklist = ConfiguredRequest.authBlacklist;
    } else if (process.env.MOCK_API_AUTH_BLACKLIST) {
      this._mockConfig.authBlacklist = process.env.MOCK_API_AUTH_BLACKLIST.split(
        ","
      ) as string[];
    }
  }

  /**
   * Add a mock function for this API endpoint.
   *
   * When this API requests from the mock it will pass the
   * props (aka, `I`) as well as a config object as a second
   * parameter which everything you should need to
   */
  mockFn(fn: IApiMock<I, O>) {
    this._mockFn = fn;
    return this;
  }

  isMockRequest(options: IDictionary & { mock?: boolean } = {}) {
    return (
      options.mock ||
      this._mockConfig.mock ||
      process.env["MOCK_API"] ||
      process.env["VUE_APP_MOCK_API"] ||
      false
    );
  }

  headers(headers: IDictionary<string | number | boolean | Function>) {
    const [staticProps, dynamics, calculations] = this.parseParameters(headers);
    this._headers = staticProps;

    this._dynamics = dynamicUpdate<I, O>(
      this._dynamics,
      DynamicStateLocation.header,
      dynamics
    );

    this._calculations = calculationUpdate<I, O>(
      this._calculations,
      DynamicStateLocation.header,
      calculations
    );

    return this;
  }

  /**
   * If you want to pass in an error handler function in you can determine which
   * errors should be handled (return of boolean flag).
   */
  errorHandler(fn: IErrorHandler) {
    this._errorHandler = fn;

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
  queryParameters(qp: IDictionary) {
    const [staticProps, dynamics, calculations] = this.parseParameters(qp);
    this._qp = staticProps;

    this._dynamics = dynamicUpdate<I, O>(
      this._dynamics,
      DynamicStateLocation.queryParameter,
      dynamics
    );

    this._calculations = calculationUpdate<I, O>(
      this._calculations,
      DynamicStateLocation.queryParameter,
      calculations
    );
    return this;
  }

  /**
   * Maps the data returned from the API endpoint. This is _not_ a required feature
   * of the ConfiguredRequest but can be useful in some cases. This function uses
   * the fluent style and returns a reference to the ConfiguredRequest.
   *
   * @param fn a mapping function which accepts type <X> and returns type <O>
   */
  mapper(fn: (input: X) => O) {
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
  async request(props?: I, runTimeOptions: IAllRequestOptions = {}) {
    const request = this.requestInfo(props, runTimeOptions);
    const isMockRequest = this.isMockRequest(request.mockConfig);
    const axiosOptions = { headers: request.headers, ...request.axiosOptions };
    let result: AxiosResponse<O>;

    // MOCK or NETWORK REQUEST
    try {
      if (isMockRequest) {
        result = await this.mockRequest(request, axiosOptions);
      } else {
        result = await this.makeRequest(request, axiosOptions);
      }
    } catch (e) {
      if (this._errorHandler) {
        const handlerOutcome = this._errorHandler(e);

        if (handlerOutcome === false) throw e;

        result = { ...e, data: handlerOutcome };
      } else {
        throw e;
      }
    }

    // OPTIONALLY MAP, ALWAYS RETURN
    return this._mapping
      ? this._mapping((result?.data as unknown) as X)
      : result?.data;
  }

  /**
   * If there are Axios request options which you which to pass along for every request
   * you can do that by setting them here. Note that each request can also send options
   * and these two dictionaries will be merged where the request's options will take precedence.
   */
  options(opts: Omit<AxiosRequestConfig, "headers" | "method" | "url">) {
    this._designOptions = opts;
    return this;
  }

  /**
   * Provides full detail on the `url`, `headers` and `body` of the message
   * but _does not_ send it.
   */
  requestInfo(
    props?: Partial<I>,
    runTimeOptions: IAllRequestOptions = {}
  ): IConfiguredApiRequest<I> {
    let queryParameters: IDictionary<Scalar> = {
      ...this.getDynamics(DynamicStateLocation.queryParameter, props),
      ...this._qp
    };
    const hasQueryParameters =
      Object.keys(queryParameters).length > 0 ? true : false;

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
        const hasDefaultValue =
          defaultValue !== "default-value-undefined" ? true : false;
        const requestHasValue =
          props && Object.keys(props).includes(propName) ? true : false;

        if (requestHasValue) {
          return props[propName] + afterVariable;
        } else if (hasDefaultValue) {
          return defaultValue;
        } else {
          throw new ConfiguredRequestError(
            `Attempt to build URL failed because there was no default value for "${propName}" nor was this passed into the request!`,
            "url-dynamics-invalid"
          );
        }
      })
      .join("");

    let headers = {
      ...DEFAULT_HEADERS,
      ...this._headers,
      ...this.getDynamics(DynamicStateLocation.header, props)
    };

    const bodyType: IApiBodyType = ["get", "delete"].includes(this._method)
      ? "none"
      : this._bodyType;

    const templateBody = this._body || {};
    const requestBody = props && props.body ? props.body : {};
    const payload = { ...templateBody, ...requestBody };
    const body = bodyToString(payload, bodyType);

    const [mockConfig, axiosOptions] = extract<
      IMockOptions,
      AxiosRequestConfig
    >({ ...this._mockConfig, ...this._designOptions, ...runTimeOptions }, [
      "mock",
      "networkDelay",
      "authWhiteList",
      "authBlacklist",
      "db"
    ]);

    const apiRequest = {
      props: props as I,
      method: this._method,
      url: hasQueryParameters
        ? url + "?" + queryString.stringify(queryParameters)
        : url,
      headers,
      queryParameters,
      payload: payload as I["body"],
      bodyType,
      body,
      mockConfig,
      axiosOptions
    };

    this.runCalculations(apiRequest);

    return apiRequest;
  }

  /**
   * Seals the configuration of the API endpoint and returns
   * a `SealedRequest` which can be used only to make/execute
   * requests (versus configuring them)
   */
  seal(): SealedRequest<I, O> {
    return new SealedRequest<I, O>(this);
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
      requiredParameters:
        this._dynamics.filter(
          d => d.symbol === DynamicSymbol.dynamic && d.required
        ).length > 0
          ? this._dynamics
              .filter(d => d.symbol === DynamicSymbol.dynamic && d.required)
              .map(i => i.prop)
          : null,
      optionalParameters:
        this._dynamics.filter(
          d => d.symbol === DynamicSymbol.dynamic && !d.required
        ).length > 0
          ? this._dynamics
              .filter(d => d.symbol === DynamicSymbol.dynamic && !d.required)
              .map(i => i.prop)
          : null
    };
  }

  /**
   * Pulls the dynamic segments from the URL string and adds them to
   * the `_dynamics` array.
   */
  protected setUrl(url: url) {
    this._url = url;
    if (url.includes("{")) {
      // Dynamic properties present
      const parts = url.split("{");
      this._dynamics = this._dynamics.filter(
        d => d.location !== DynamicStateLocation.url
      );
      parts.slice(1).forEach(part => {
        const endDelimiter = part.indexOf("}");
        if (endDelimiter === -1) {
          throw new ConfiguredRequestError(
            `The structure of the URL parameter is invalid. URL's which have dynamic parameters as part of the URL must be delimited by a openning and closing curly brackets. The current URL appears to have a mismatch of openning and closing brackets. The URL is: ${url}`,
            "invalid-url"
          );
        }
        const dynamicProp = part.slice(0, endDelimiter);

        this._dynamics = this._dynamics.concat({
          symbol: DynamicSymbol.dynamic,
          prop: dynamicProp,
          required: true,
          location: DynamicStateLocation.url,
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
  private async mockRequest(
    request: IConfiguredApiRequest<I>,
    options: AxiosRequestConfig
  ): Promise<AxiosResponse<O>> {
    if (!this._mockFn) {
      throw new ConfiguredRequestError(
        `The API endpoint at ${request.url} does NOT have a mock function so can not be used when mocking is enabled!`,
        "mock-not-ready",
        HttpStatusCodes.NotImplemented
      );
    }

    try {
      const response = await this._mockFn(request.props, request);
      await this.mockNetworkDelay(
        request.mockConfig.networkDelay || this._mockConfig.networkDelay
      );
      return fakeAxios(response, request);
    } catch (e) {
      throw new ConfiguredRequestError(
        e.message || `Problem running the mock API request to ${request.url}`,
        "invalid-mock-call",
        e.httpStatusCode || HttpStatusCodes.BadRequest
      );
    }
  }

  /**
   * Sends a request to an endpoint using the Axios library
   *
   * @param body The body of the message (left blank for a GET)
   * @param url The URL including query parameters
   * @param options Axios options to pass along to the request
   */
  private async makeRequest(
    request: IConfiguredApiRequest<I>,
    options: IDictionary
  ) {
    const { url, body } = request;
    switch (this._method) {
      case "get":
        return axios.get<O>(url, options);
      case "put":
        return axios.put<O>(url, body, options);
      case "post":
        return axios.post<O>(url, body, options);
      case "delete":
        return axios.delete<O>(url, options);
      case "patch":
        return axios.patch<O>(url, body, options);
    }
  }

  /**
   * Gets the _dynamic_ properties for a given location (aka, headers, query params).
   * If a dynamic property is not
   * as part of the optional `request` parameter then only dynamics with default
   * values or those which are _required_ will be shown (those required will
   * be returned with a value of REQUIRED).
   */
  private getDynamics(
    location: DynamicStateLocation,
    request: Partial<I> = {}
  ) {
    const dynamics = this._dynamics.filter(i => i.location === location);
    let dynamicsHash: IDictionary = {};
    // iterate over each dynamic property
    dynamics.forEach(d => {
      const { required, prop, defaultValue } = d;
      const hasValueFromInput = Object.getOwnPropertyNames(request).includes(
        prop
      );

      if (hasValueFromInput) {
        dynamicsHash[prop] = request[prop];
      } else if (defaultValue !== undefined) {
        dynamicsHash[prop] = defaultValue;
      } else if (required) {
        dynamicsHash[prop] = "REQUIRED!";
      }
    });

    return dynamicsHash;
  }

  private runCalculations(apiRequest: IConfiguredApiRequest<I>) {
    const [{ props: request }, config] = extract<
      I,
      Omit<IConfiguredApiRequest<I>, "props">,
      IConfiguredApiRequest<I>
    >(apiRequest, ["props"]);
    this._calculations.forEach(calc => {
      const value = calc.fn(request, config);
      if (calc.location === "queryParameter") {
        apiRequest.queryParameters[calc.prop] = value;
      } else if (calc.location === DynamicStateLocation.header) {
        apiRequest.headers[calc.prop] = value;
      }
    });
    return [apiRequest.headers, apiRequest.queryParameters];
  }

  /**
   * Separates static properties from dynamic; "dynamic" properties
   * are those produced by a functional symbol export like `dynamic`
   * or `calc`.
   */
  private parseParameters(
    hash: IDictionary
  ): [
    IDictionary<Scalar>,
    IDynamicSymbolOutput<any, O>[],
    ICalcSymbolOutput<I, O>[]
  ] {
    // gather the static props
    let staticProps: IDictionary<Scalar> = {};
    Object.keys(hash)
      .filter(i => typeof hash[i] !== "function")
      .forEach(i => (staticProps[i] = hash[i]));

    // gather the dynamic props
    const dynamic: IDynamicSymbolOutput<any, O>[] = [];
    const calculations: ICalcSymbolOutput<I, O>[] = [];
    Object.keys(hash)
      .filter(i => typeof hash[i] === "function")
      .forEach(i => {
        // pass in the property name into the dynamic symbol
        const config: IDynamicProperty<I, O> = hash[i](i);

        if (isCalculator(config)) {
          calculations.push(config);
        } else if (isDynamicProp(config)) {
          dynamic.push(config);
        } else {
          console.warn(`detected a dynamic property of an unknown type`, {
            config
          });
        }
      });

    return [staticProps, dynamic, calculations];
  }

  private async mockNetworkDelay(delay: INetworkDelaySetting) {
    const lookup = {
      light: [10, 50],
      medium: [50, 150],
      heavy: [150, 500],
      "very-heavy": [1000, 2000]
    };
    const range = lookup[delay as keyof typeof lookup];
    await wait(between(range[0], range[1]));
  }
}
