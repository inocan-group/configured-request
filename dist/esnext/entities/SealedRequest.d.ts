import { ConfiguredRequest } from "./ConfiguredRequest";
import { IAllRequestOptions, IApiInput } from "../cr-types";
export declare class SealedRequest<I extends IApiInput, O> {
    private req;
    constructor(req: ConfiguredRequest<I, O>);
    /**
     * Make a request to the configured API endpoint
     */
    request(props?: I, options?: IAllRequestOptions): Promise<O>;
    /**
     * Get information about the API request structure, given
     * the passed in dynamic props
     */
    requestInfo(props?: Partial<I>, options?: IAllRequestOptions): import("../cr-types").IConfiguredApiRequest<I>;
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        requiredParameters: string | string[];
        optionalParameters: string | string[];
    };
}
