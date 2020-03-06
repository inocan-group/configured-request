import { ConfiguredRequest } from "./ConfiguredRequest";
import { IAllRequestOptions, IApiInput, ISerializedRequest } from "../cr-types";
export declare class ActiveRequest<I extends IApiInput, O, X = any, M = any> {
    static deserialize(instance: ISerializedRequest): ActiveRequest<any, any, any, any>;
    private _db;
    private _options;
    private _configuredRequest;
    private _params;
    constructor(params: I, options: IAllRequestOptions, configuredRequest: ConfiguredRequest<I, O, X, M>);
    get params(): I;
    get serialize(): ISerializedRequest;
    get headers(): import("common-types").IDictionary<string | number | boolean>;
    get queryParameters(): import("common-types").IDictionary<string | number | boolean>;
    get url(): string;
    get body(): I["body"];
    get method(): "get" | "put" | "post" | "delete" | "patch";
    get axiosOptions(): import("axios").AxiosRequestConfig;
    get isMockRequest(): boolean;
    get mockConfig(): import("../cr-types").IMockOptions<any>;
    get mockDb(): any;
    private requestInfo;
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        queryParameters: import("common-types").IDictionary<string | number | boolean>;
        headers: import("common-types").IDictionary<string | number | boolean>;
        body: I["body"];
        options: IAllRequestOptions;
    };
}
