import { HttpStatusCodes } from "common-types";
export declare class ConfiguredRequestError extends Error {
    code: string;
    statusCode: number;
    constructor(message: string, code?: string, statusCode?: HttpStatusCodes);
}
