import { ConfiguredRequest } from "./ConfiguredRequest";
import { IDictionary } from "common-types";
import { IRequestInfo } from "./cr-types";
export declare class SealedRequest<I, O> {
    private req;
    constructor(req: ConfiguredRequest<I, O>);
    /**
     * Make a request to the configured API endpoint
     */
    request(props?: I, options?: IDictionary): Promise<O>;
    /**
     * Get information about the API request structure, given
     * the passed in dynamic props
     */
    requestInfo(props?: Partial<I>): IRequestInfo;
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        requiredParameters: string | string[];
        optionalParameters: string | string[];
    };
}
