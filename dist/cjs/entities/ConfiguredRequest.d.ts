import { IDictionary, url } from "common-types";
import { IApiMock, IConfiguredApiRequest, IApiInputWithBody, IApiInputWithoutBody, IApiOutput, IApiIntermediate, IErrorHandler } from "../index";
import { AxiosRequestConfig } from "axios";
import { SealedRequest } from "./SealedRequest";
import { IAllRequestOptions, IApiInput, INetworkDelaySetting } from "../cr-types";
export declare const DEFAULT_HEADERS: IDictionary<string>;
export declare class ConfiguredRequest<I extends IApiInput, O extends IApiOutput = IApiOutput, X extends IApiIntermediate = IApiIntermediate> {
    static authWhitelist: string[];
    static authBlacklist: string[];
    static networkDelay: INetworkDelaySetting;
    private _qp;
    private _headers;
    private _designOptions;
    private _url;
    private _body?;
    private _bodyType;
    private _mockConfig;
    private _mockFn?;
    private _mapping;
    private _errorHandler;
    private _dynamics;
    private _calculations;
    private _method;
    static get<I extends IApiInputWithoutBody = IApiInputWithoutBody, O extends IApiOutput = IApiOutput, X extends IApiIntermediate = IApiIntermediate>(url: string): ConfiguredRequest<I, O, X>;
    static post<I extends IApiInputWithBody = IApiInputWithBody, O extends IApiOutput = IApiOutput, X extends IApiIntermediate = IApiIntermediate>(url: string): ConfiguredRequest<I, O, X>;
    static put<I extends IApiInputWithBody = IApiInputWithBody, O extends IApiOutput = IApiOutput, X extends IApiIntermediate = IApiIntermediate>(url: string): ConfiguredRequest<I, O, X>;
    static delete<I extends IApiInputWithoutBody = IApiInputWithoutBody, O extends IApiOutput = IApiOutput, X extends IApiIntermediate = IApiIntermediate>(url: string): ConfiguredRequest<I, O, X>;
    constructor();
    mockFn(fn: IApiMock<I, O>): this;
    isMockRequest(options?: IDictionary & {
        mock?: boolean;
    }): string | boolean;
    headers(headers: IDictionary<string | number | boolean | Function>): this;
    errorHandler(fn: IErrorHandler): this;
    queryParameters(qp: IDictionary): this;
    mapper(fn: (input: X) => O): this;
    request(props?: I, runTimeOptions?: IAllRequestOptions): Promise<O>;
    options(opts: Omit<AxiosRequestConfig, "headers" | "method" | "url">): this;
    requestInfo(props?: Partial<I>, runTimeOptions?: IAllRequestOptions): IConfiguredApiRequest<I>;
    seal(): SealedRequest<I, O>;
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        calculators: (string & keyof I)[];
        requiredParameters: (string & keyof O)[];
        optionalParameters: (string & keyof O)[];
    };
    protected setUrl(url: url): this;
    private mockRequest;
    private makeRequest;
    private getDynamics;
    private runCalculations;
    private parseParameters;
    private mockNetworkDelay;
}
