import { ConfiguredRequest } from "./ConfiguredRequest";
import { IAllRequestOptions, IApiInput, IErrorHandler } from "../cr-types";
export declare class SealedRequest<I extends IApiInput, O, M = any> {
    private req;
    private _db;
    constructor(req: ConfiguredRequest<I, O, M>);
    request(props?: I, options?: IAllRequestOptions): Promise<O>;
    useMockDatabase(db: M): this;
    mock(props?: I, options?: IAllRequestOptions): Promise<O>;
    requestInfo(props?: Partial<I>, options?: IAllRequestOptions): import("../cr-types").IConfiguredApiRequest<I>;
    errorHandler(eh: IErrorHandler): this;
    toString(): string;
    toJSON(): {
        method: "get" | "delete" | "post" | "put" | "patch";
        url: string;
        calculators: string[];
        requiredParameters: string[];
        optionalParameters: string[];
    };
}
