import {
  IDictionary,
  url,
  IHttpRequestHeaders,
  HttpStatusCodes
} from "common-types";
import {
  DynamicStateLocation,
  IDynamicProperty,
  IRequestVerb,
  IApiMock,
  Scalar,
  IConfiguredApiRequest,
  bodyToString,
  IApiInputWithBody,
  IApiInputWithoutBody
} from "../index";
import { ConfiguredRequestError } from "../errors";
import * as queryString from "query-string";
import axios, { AxiosResponse, AxiosRequestConfig } from "axios";
import { SealedRequest } from "./SealedRequest";
import {
  IApiBodyType,
  ILiteralType,
  IAllRequestOptions,
  IRequestOptions,
  IApiInput
} from "../cr-types";
import { extract } from "../shared/extract";

export const DEFAULT_HEADERS: IDictionary<string> = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36",
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
export class ConfiguredRequest<
  /**
   * The **input** requirements to call this endpoint; these requirements can derive from URL, body, or
   * query parameter inputs.
   */
  I extends IApiInput,
  /**
   * The **output** of the API Endpoint
   */
  O extends IDictionary = IDictionary,
  /**
   * if you are doing a transform before returning <O> you can state a preliminary type that comes back
   * from the API directly
   */
  X extends IDictionary = IDictionary
> {
  private _qp: IDictionary = {};
  private _headers: IDictionary = {};
  private _designOptions: IDictionary = {};
  private _url: string;
  private _body?: I["body"] | ILiteralType;
  private _bodyType: IApiBodyType = "none";
  private _mockFn?: IApiMock<I, O>;
  private _mapping: (input: X) => O;
  /**
   * The various _dynamic_ aspects of the API call
   */
  private _dynamics: Array<
    IDynamicProperty & { type: DynamicStateLocation }
  > = [];
  private _method: IRequestVerb;
  //#region static initializers
  static get<
    I extends IApiInputWithoutBody = IApiInputWithoutBody,
    O extends IDictionary = IDictionary,
    X extends IDictionary = IDictionary
  >(url: string) {
    const obj = new ConfiguredRequest<I, O, X>();
    obj._method = "get";
    obj.setUrl(url);
    return obj;
  }
  static post<
    I extends IApiInputWithBody = IApiInputWithBody,
    O extends IDictionary = IDictionary,
    X extends IDictionary = IDictionary
  >(url: string) {
    const obj = new ConfiguredRequest<I, O, X>();
    obj._method = "post";
    obj.setUrl(url);
    return obj;
  }
  static put<
    I extends IApiInputWithBody = IApiInputWithBody,
    O extends IDictionary = IDictionary,
    X extends IDictionary = IDictionary
  >(url: string) {
    const obj = new ConfiguredRequest<I, O, X>();
    obj._method = "put";
    obj.setUrl(url);
    return obj;
  }
  static delete<
    I extends IApiInputWithoutBody = IApiInputWithoutBody,
    O extends IDictionary = IDictionary,
    X extends IDictionary = IDictionary
  >(url: string) {
    const obj = new ConfiguredRequest<I, O, X>();
    obj._method = "delete";
    obj.setUrl(url);
    return obj;
  }
  //#endregion

  /** add a mock function for this API endpoint */
  async mock(fn: IApiMock<I, O>) {
    this._mockFn = fn;
    return this;
  }

  isMockRequest(options: IDictionary & { mock?: boolean } = {}) {
    return (
      options.mock ||
      process.env["VUE_APP_MOCK_REQUEST"] ||
      process.env["MOCK_REQUEST"] ||
      false
    );
  }

  headers(
    headers: IHttpRequestHeaders | IDictionary<string | number | boolean>
  ) {
    const [staticProps, dynamic] = this.parseParameters(headers);
    this._headers = staticProps;
    const d = dynamic.map(i => ({
      ...i,
      type: DynamicStateLocation.header
    }));
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
  queryParameters(qp: IDictionary) {
    const [staticProps, dynamic] = this.parseParameters(qp);
    this._qp = staticProps;
    const d = dynamic.map(i => ({
      ...i,
      type: DynamicStateLocation.queryParameter
    }));
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
    const isMockRequest = this.isMockRequest(request.options);
    const axiosOptions = { headers: request.headers, ...request.axiosOptions };
    let result: AxiosResponse<O>;

    // MOCK or NETWORK REQUEST
    if (isMockRequest) {
      result = await this.mockRequest(request, axiosOptions);
    } else {
      result = await this.makeRequest(request, axiosOptions);
    }

    // THROW on ERROR
    if (result.status >= 300) {
      throw new ConfiguredRequestError(
        `The API endpoint [ ${this._method.toUpperCase()} ${
          request.url
        } ] failed with a ${result.status} / ${result.statusText}} error code.`,
        String(result.status),
        result.status
      );
    }

    // OPTIONALLY MAP, ALWAYS RETURN
    return this._mapping
      ? this._mapping((result.data as unknown) as X)
      : result.data;
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
    const queryParameters: IDictionary<Scalar> = {
      ...this.getDynamics(DynamicStateLocation.queryParameter, props),
      ...this._qp
    };

    const url = this._url
      .split("{")
      .map(i => i.replace(/(.*})/, ""))
      .join("");

    const headers = {
      ...DEFAULT_HEADERS,
      ...this._headers,
      ...this.getDynamics(DynamicStateLocation.header, props)
    };

    const bodyType: IApiBodyType = ["get", "delete"].includes(this._method)
      ? "none"
      : this._bodyType;

    const body = bodyToString(this._body, bodyType);

    const [options, axiosOptions] = extract<
      IRequestOptions,
      AxiosRequestConfig
    >({ ...this._designOptions, ...runTimeOptions }, ["mock", "networkDelay"]);

    return {
      props: props as I,
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
      requiredParameters:
        this._dynamics.filter(d => d.required).length > 0
          ? this._dynamics.filter(d => d.required).map(i => i.prop)
          : "none",
      optionalParameters:
        this._dynamics.filter(d => !d.required).length > 0
          ? this._dynamics.filter(d => !d.required).map(i => i.prop)
          : "none"
    };
  }

  protected setUrl(url: url) {
    this._url = url;
    if (url.includes("{")) {
      // Dynamic properties present
      const parts = url.split("{");
      this._dynamics = this._dynamics.filter(
        d => d.type !== DynamicStateLocation.url
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
  private async mockRequest(
    request: IConfiguredApiRequest<I>,
    options: AxiosRequestConfig
  ): Promise<AxiosResponse<O>> {
    // TODO: Implement
    return {
      data: this._mockFn ? (this._mockFn(request) as O) : ({} as O),
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
        return axios.put<O>(url, body, options);
      case "delete":
        return axios.delete<O>(url, options);
      case "patch":
        return axios.patch<O>(url, body, options);
    }
  }

  /**
   * Gets the dynamic properties as known at the given time; if none provided
   * as part of the optional `request` parameter then only dynamics with default
   * values or those which are _required_ will be shown (those required will
   * be returned with a value of REQUIRED).
   */
  private getDynamics(type: DynamicStateLocation, request: IDictionary = {}) {
    const dynamics = this._dynamics.filter(i => i.type === type);
    let dynamicsHash: IDictionary = {};
    dynamics.forEach(d => {
      const { prop, required, defaultValue } = d;
      if (required || request[prop]) {
        dynamicsHash[prop] =
          request[prop] !== undefined ? request[prop] : "REQUIRED";
      }
    });

    return dynamicsHash;
  }

  private parseParameters(
    hash: IDictionary
  ): [IDictionary<Scalar>, IDynamicProperty[]] {
    let staticProps: IDictionary<Scalar> = {};
    Object.keys(hash)
      .filter(i => typeof hash[i] !== "function")
      .forEach(i => (staticProps[i] = hash[i]));

    const dynamic: IDynamicProperty[] = [];
    Object.keys(hash)
      .filter(i => typeof hash[i] === "function")
      .forEach(i => {
        const { required, defaultValue } = hash[i](i);
        dynamic.push({ prop: i, required, defaultValue });
      });

    return [staticProps, dynamic];
  }
}
