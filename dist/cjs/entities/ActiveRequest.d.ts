import { ConfiguredRequest } from "./ConfiguredRequest";
import { IAllRequestOptions, IApiInput } from "../cr-types";
export declare class ActiveRequest<I extends IApiInput, O, M = any> {
    private params;
    private options;
    private req;
    private _db;
    constructor(params: I, options: IAllRequestOptions, req: ConfiguredRequest<I, O, M>);
    get headers(): import("common-types").IDictionary<string | number | boolean>;
    get queryParameters(): import("common-types").IDictionary<string | number | boolean>;
    get url(): string;
    get body(): I["body"];
    get method(): "get" | "put" | "post" | "delete" | "patch";
    get axiosOptions(): import("axios").AxiosRequestConfig;
    get mockConfig(): import("../cr-types").IMockOptions<any>;
    get mockDb(): any;
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        calculators: (string & keyof I)[];
        requiredParameters: (string & keyof O)[];
        optionalParameters: (string & keyof O)[];
    };
}
