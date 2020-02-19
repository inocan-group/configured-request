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
/**
 * Puts a high-level meta embrella around a scraped data structure to provide basic
 * meta about the scrape.
 */
export interface IDatedScrape<T> {
    date: datetime;
    duration?: seconds;
    data: T;
}
/** A function that sends back a mocked response to a given endpoint */
export interface IApiMock<I, O> {
    (request: I, config: ConfiguredRequest<I, O>): O;
}
export declare enum ApiBodyType {
    JSON = "JSON",
    formFields = "formFields",
    literal = "literal",
    none = "none"
}
export declare type IApiBodyType = keyof typeof ApiBodyType;
export declare type PropertyName = string;
/**
 * A tuple with the property's name as the first element, the value
 * as the second element.
 */
export declare type NamedValuePair = [PropertyName, Scalar];
/**
 * a function used in the `dynamic` helper to resolve either:
 *
 * 1. The value of a dynamic property
 * 2. The key and value of a dynamic property
 */
export declare type DynamicFunction<I> = (request: I) => Scalar | NamedValuePair;
