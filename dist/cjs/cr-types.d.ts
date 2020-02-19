import { IDictionary, datetime, seconds } from "common-types";
import { ConfiguredRequest } from "./ConfiguredRequest";
export interface IRequestInfo {
    method: IRequestMethod;
    headers: IDictionary<Scalar>;
    url: string;
    body?: string;
    options: IDictionary;
}
export declare enum RequestMethod {
    get = "get",
    post = "post",
    put = "put",
    delete = "delete",
    patch = "patch"
}
export declare type IRequestMethod = keyof typeof RequestMethod;
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
export interface IEndpointMock<I, O> {
    (request: ConfiguredRequest<I, O>, scenario?: IEndpointMockScenario): O;
}
export declare enum EndpointMockScenario {
    happyPath = "happyPath",
    authFailure = "authFailure",
    apiFailure = "apiFailure"
}
export declare type IEndpointMockScenario = keyof typeof EndpointMockScenario;
export declare type IApiBodyType = "none" | "literal" | "form-fields" | "JSON";
