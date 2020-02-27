import { ConfiguredRequest } from "./ConfiguredRequest";
import { IAllRequestOptions, IApiInput, IErrorHandler } from "../cr-types";
export declare class SealedRequest<I extends IApiInput, O, M = any> {
    private req;
    private _db;
    constructor(req: ConfiguredRequest<I, O, M>);
    /**
     * Make a request to the configured API endpoint
     */
    request(props?: I, options?: IAllRequestOptions): Promise<O>;
    /**
     * Make a request to the **Mock** API.
     *
     * Note: if there is no mock function configured for this
     * API then this will throw a `mock-not-ready` error.
     */
    mock(props?: I, options?: IAllRequestOptions): Promise<O>;
    /**
     * Get information about the API request structure, given
     * the passed in dynamic props
     */
    requestInfo(props?: Partial<I>, options?: IAllRequestOptions): import("../cr-types").IConfiguredApiRequest<I>;
    /**
     * If you want to pass in an error handler you can be notified
     * of all errors. If you return `false` the error will _still_ be
     * thrown but any other value will be passed back as the `data`
     * property of the response.
     */
    errorHandler(eh: IErrorHandler): this;
    toString(): string;
    toJSON(): {
        method: "get" | "put" | "post" | "delete" | "patch";
        url: string;
        calculators: (string & keyof I)[];
        requiredParameters: (string & keyof O)[];
        optionalParameters: (string & keyof O)[];
    };
}
