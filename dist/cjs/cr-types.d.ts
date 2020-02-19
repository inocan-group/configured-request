import { IDictionary, datetime, seconds } from "common-types";
import { AxiosRequestConfig } from "axios";
export interface IRequestInfo {
    method: IRequestVerb;
    headers: IDictionary<Scalar>;
    url: string;
    body?: string;
    bodyType: IApiBodyType;
    options: IDictionary;
}
export declare enum RequestVerb {
    get = "get",
    post = "post",
    put = "put",
    delete = "delete",
    patch = "patch"
}
export declare type IRequestVerb = keyof typeof RequestVerb;
export declare enum DynamicStateLocation {
    url = "url",
    queryParameter = "queryParameter",
    header = "header",
    bodyJson = "bodyJson",
    bodyForm = "bodyForm"
}
export declare type Scalar = string | number | boolean;
export interface IDynamicProperty {
    prop: string;
    required: boolean;
    defaultValue: Scalar | undefined;
    type?: DynamicStateLocation;
}
export interface IDatedScrape<T> {
    date: datetime;
    duration?: seconds;
    data: T;
}
export interface IApiMock<I extends IApiInput, O> {
    (request: IConfiguredApiRequest<I>): O;
}
export declare enum ApiBodyType {
    JSON = "JSON",
    formFields = "formFields",
    literal = "literal",
    none = "none"
}
export declare type IApiBodyType = keyof typeof ApiBodyType;
export declare type PropertyName = string;
export declare type NamedValuePair = [PropertyName, Scalar];
export declare type DynamicFunction<I> = (request: I) => Scalar | NamedValuePair;
export interface IConfiguredApiRequest<I extends IApiInput> {
    method: IRequestVerb;
    props: I;
    url: string;
    headers: IDictionary<Scalar>;
    queryParameters: IDictionary<Scalar>;
    payload: I["body"] | ILiteralType;
    body: undefined | string;
    bodyType: IApiBodyType;
    axiosOptions: AxiosRequestConfig;
    mockConfig: IMockOptions;
}
export interface IMockOptions {
    mock?: boolean;
    networkDelay?: INetworkDelaySetting;
    authWhitelist?: string[];
    authBlacklist?: string[];
}
export declare type INetworkDelaySetting = "light" | "medium" | "heavy" | "very-heavy";
export declare type IAllRequestOptions = IMockOptions & AxiosRequestConfig;
export declare const LITERAL_TYPE = "LITERAL_BODY_PAYLOAD";
export interface ILiteralType {
    type: "LITERAL_BODY_PAYLOAD";
    value: string;
}
export declare function isLiteralType<I extends IApiInput>(body: I["body"] | ILiteralType): body is ILiteralType;
export interface IApiInputWithBody extends IDictionary {
    body: IDictionary<Scalar>;
}
export interface IApiInputWithoutBody extends IDictionary {
    body?: undefined;
}
export declare type IApiInput = IApiInputWithBody | IApiInputWithoutBody;
