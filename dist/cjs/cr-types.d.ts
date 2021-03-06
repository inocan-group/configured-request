import { AxiosError, AxiosRequestConfig } from "axios";
import { IDictionary, datetime, seconds } from "common-types";
import { ActiveRequest } from "./entities/ActiveRequest";
import { ConfiguredRequest } from "./entities/ConfiguredRequest";
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
    body = "body"
}
export declare type Scalar = string | number | boolean;
export interface IDatedScrape<T> {
    date: datetime;
    duration?: seconds;
    data: T;
}
export interface IApiMock<I extends IApiInput, O, M = any> {
    (request: ActiveRequest<I, O, any, M>): O | Promise<O>;
}
export declare enum ApiBodyType {
    JSON = "JSON",
    formFields = "formFields",
    text = "text",
    html = "html",
    unknown = "unknown",
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
    payload: undefined | string;
    body: I["body"];
    bodyType: IApiBodyType;
    axiosOptions: AxiosRequestConfig;
    isMockRequest: boolean;
    mockConfig: IMockOptions;
}
export interface IMockOptions<M = any> {
    mock?: boolean;
    networkDelay?: INetworkDelaySetting;
    authWhitelist?: string[];
    authBlacklist?: string[];
    db?: M;
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
    body: IDictionary;
}
export interface IApiInputWithoutBody extends IDictionary {
    body?: undefined;
}
export declare type IApiInput = IApiInputWithBody | IApiInputWithoutBody;
export declare type IApiOutput = any;
export interface IApiIntermediate extends IDictionary {
}
export interface IDynamicCalculator<I extends IApiInput> {
    (request: IConfiguredApiRequest<I>["props"], config: Omit<IConfiguredApiRequest<I>, "props">): Scalar;
    deps?: string[];
}
export declare enum DynamicSymbol {
    dynamic = "dynamic",
    calc = "calc"
}
export declare type IDynamicSymbol = keyof typeof DynamicSymbol;
export declare function isCalculator<I extends IApiInput, O extends IApiOutput>(dp: IDynamicProperty<I, O>): dp is ICalcSymbolOutput<I>;
export declare function isDynamicProp<I extends IApiInput, O extends IApiOutput>(dp: IDynamicProperty<I, O>): dp is IDynamicProperty<I, O>;
export interface IBaseSymbolOutput {
    location?: DynamicStateLocation;
    symbol: DynamicSymbol;
    prop: string;
}
export interface IDynamicSymbolOutput<V = Scalar> extends IBaseSymbolOutput {
    symbol: DynamicSymbol.dynamic;
    defaultValue?: V;
    required: boolean;
}
export interface ICalcSymbolOutput<I extends IApiInput> extends IBaseSymbolOutput {
    symbol: DynamicSymbol.calc;
    fn: IDynamicCalculator<I>;
}
export declare type IDynamicProperty<I extends IApiInput, O extends IApiOutput, V = Scalar> = ICalcSymbolOutput<I> | IDynamicSymbolOutput<V>;
export declare type KnownLocation<T> = T & {
    location: DynamicStateLocation;
};
export interface IErrorHandler {
    (fn: AxiosError): false | any;
}
export declare type CalcOption<T extends IApiInput, K extends keyof T = keyof T> = {
    [key in keyof T]: T[K] | Function;
};
export interface ISerializedRequest<T extends ConfiguredRequest<any, any, any, any> = ConfiguredRequest<any, any, any, any>> {
    data: string;
    constructor: ISerializedRequestConstructor<T>;
}
export interface ISerializedRequestConstructor<T extends ConfiguredRequest<any, any, any, any>> {
    new (): ConfiguredRequest<any, any, any, any>;
}
