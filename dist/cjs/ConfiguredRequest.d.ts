import { IDictionary, url, IHttpRequestHeaders } from "common-types";
import { IEndpointMock } from "./index";
import { AxiosRequestConfig } from "axios";
import { SealedRequest } from "./SealedRequest";
import { IRequestInfo } from "./cr-types";
export declare const DEFAULT_HEADERS: IDictionary<string>;
export declare class ConfiguredRequest<I extends IDictionary = IDictionary, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary> {
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
    static get<I extends IDictionary = IDictionary, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    static post<I extends IDictionary = IDictionary, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    static put<I extends IDictionary = IDictionary, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    static delete<I extends IDictionary = IDictionary, O extends IDictionary = IDictionary, X extends IDictionary = IDictionary>(url: string): ConfiguredRequest<I, O, X>;
    mock(fn: IEndpointMock<I, O>): Promise<this>;
    isMockRequest(options?: IDictionary & {
        mock?: boolean;
    }): string | boolean;
    headers(headers: IHttpRequestHeaders | IDictionary<string | number | boolean>): this;
    queryParameters(qp: IDictionary): this;
    mapper(fn: (input: X) => O): this;
    request(props?: I, runTimeOptions?: IDictionary): Promise<O>;
    axiosOptions(opts: Omit<AxiosRequestConfig, "headers" | "method" | "url">): this;
    requestInfo(props?: Partial<I>): IRequestInfo;
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
