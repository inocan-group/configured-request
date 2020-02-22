import { ConfiguredRequest } from "./ConfiguredRequest";
import { IAllRequestOptions, IApiInput, IErrorHandler } from "../cr-types";
export declare class SealedRequest<I extends IApiInput, O> {
    private req;
    constructor(req: ConfiguredRequest<I, O>);
    request(props?: I, options?: IAllRequestOptions): Promise<O>;
    mock(props?: I, options?: IAllRequestOptions): Promise<O>;
    requestInfo(props?: Partial<I>, options?: IAllRequestOptions): import("../cr-types").IConfiguredApiRequest<I>;
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
