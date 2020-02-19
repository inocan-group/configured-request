import { IDictionary, url, IHttpRequestHeaders } from "common-types";
import { IApiMock, IConfiguredApiRequest, IApiInputWithBody, IApiInputWithoutBody } from "../index";
import { AxiosRequestConfig } from "axios";
import { SealedRequest } from "./SealedRequest";
import { IAllRequestOptions, IApiInput } from "../cr-types";
export declare const DEFAULT_HEADERS: IDictionary<string>;
export declare class ConfiguredRequest<I extends IApiInput, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary> {
    private _qp;
    private _headers;
    private _designOptions;
    private _url;
    private _body?;
    private _bodyType;
    private _mockFn?;
    private _mapping;
    private _dynamics;
    private _method;
    static get<I extends IApiInputWithoutBody = IApiInputWithoutBody, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    static post<I extends IApiInputWithBody = IApiInputWithBody, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    static put<I extends IApiInputWithBody = IApiInputWithBody, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    static delete<I extends IApiInputWithoutBody = IApiInputWithoutBody, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    mock(fn: IApiMock<I, O>): Promise<this>;
    isMockRequest(options?: IDictionary & {
        mock?: boolean;
    }): string | boolean;
    headers(headers: IHttpRequestHeaders | IDictionary<string | number | boolean>): this;
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
        requiredParameters: string | string[];
        optionalParameters: string | string[];
    };
    protected setUrl(url: url): this;
    private mockRequest;
    private makeRequest;
    private getDynamics;
    private parseParameters;
}
