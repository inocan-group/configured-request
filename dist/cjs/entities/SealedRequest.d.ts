import { ConfiguredRequest } from "./ConfiguredRequest";
import { IRequestInfo, IAllRequestOptions, IApiInput } from "../cr-types";
export declare class SealedRequest<I extends IApiInput, O> {
    private req;
    constructor(req: ConfiguredRequest<I, O>);
    request(props?: I, options?: IAllRequestOptions): Promise<O>;
    requestInfo(props?: Partial<I>, options?: IAllRequestOptions): IRequestInfo;
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        requiredParameters: string | string[];
        optionalParameters: string | string[];
    };
}
