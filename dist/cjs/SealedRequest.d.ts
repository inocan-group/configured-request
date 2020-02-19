import { ConfiguredRequest } from "./ConfiguredRequest";
import { IDictionary } from "common-types";
import { IRequestInfo } from "./cr-types";
export declare class SealedRequest<I, O> {
    private req;
    constructor(req: ConfiguredRequest<I, O>);
    request(props?: I, options?: IDictionary): Promise<O>;
    requestInfo(props?: Partial<I>): IRequestInfo;
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        requiredParameters: string | string[];
        optionalParameters: string | string[];
    };
}
