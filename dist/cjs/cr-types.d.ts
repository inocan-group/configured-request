import { IDictionary, datetime, seconds } from "common-types";
import { ConfiguredRequest } from "./entities/ConfiguredRequest";
import { AxiosRequestConfig, AxiosError } from "axios";
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
export interface IDatedScrape<T> {
    date: datetime;
    duration?: seconds;
    data: T;
}
export interface IApiMock<I extends IApiInput, O, M = any> {
    (request: I, config: ConfiguredRequest<I, O, any, M>, options?: IMockOptions<M>): O | Promise<O>;
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
    payload: I["body"];
    body: undefined | string;
    bodyType: IApiBodyType;
    axiosOptions: AxiosRequestConfig;
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
    body: IDictionary<Scalar>;
}
export interface IApiInputWithoutBody extends IDictionary {
    body?: undefined;
}
export declare type IApiInput = IApiInputWithBody | IApiInputWithoutBody;
export interface IApiOutput extends IDictionary {
}
export interface IApiIntermediate extends IDictionary {
}
export interface IDynamicCalculator<I extends IApiInput, O extends Object> {
    (request: IConfiguredApiRequest<I>["props"], config: Omit<IConfiguredApiRequest<I>, "props">): Scalar;
    deps?: string[];
}
export declare enum DynamicSymbol {
    dynamic = "dynamic",
    calc = "calc"
}
export declare type IDynamicSymbol = keyof typeof DynamicSymbol;
export declare function isCalculator<I extends IApiInput, O extends IApiOutput>(dp: IDynamicProperty<I, O>): dp is ICalcSymbolOutput<I, O>;
export declare function isDynamicProp<I extends IApiInput, O extends IApiOutput>(dp: IDynamicProperty<I, O>): dp is IDynamicProperty<I, O>;
export interface IBaseSymbolOutput<O extends IApiOutput> {
    location?: DynamicStateLocation;
    symbol: DynamicSymbol;
    prop: string & keyof O;
}
export interface IDynamicSymbolOutput<V = Scalar, O extends object = {}> extends IBaseSymbolOutput<O> {
    symbol: DynamicSymbol.dynamic;
    defaultValue: V;
    required: boolean;
}
export interface ICalcSymbolOutput<I extends IApiInput, O extends Object> extends IBaseSymbolOutput<I> {
    symbol: DynamicSymbol.calc;
    fn: IDynamicCalculator<I, O>;
}
export declare type IDynamicProperty<I extends IApiInput, O extends IApiOutput, V = Scalar> = ICalcSymbolOutput<I, O> | IDynamicSymbolOutput<V, O>;
export declare type KnownLocation<T> = T & {
    location: DynamicStateLocation;
};
export interface IErrorHandler {
    (fn: AxiosError): false | any;
}
