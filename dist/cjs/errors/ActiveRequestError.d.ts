import { IDictionary } from "common-types";
import { ActiveRequest } from "../entities";
import { AxiosRequestConfig, AxiosError } from "axios";
export declare type IGeneralizedError = (IDictionary & Error) | AxiosError;
export declare class ActiveRequestError extends Error {
    static wrap(e: IGeneralizedError, location: string, request?: ActiveRequest<any, any>): ActiveRequestError;
    kind: string;
    code: string;
    baseError: IGeneralizedError;
    isAxiosError: boolean;
    httpStatusCode: number;
    httpStatusText: string;
    nodeError: string;
    responseBody: string;
    location: string;
    request?: {
        headers: IDictionary;
        queryParameters: IDictionary;
        body: IDictionary | string;
        url: string;
    };
    config: AxiosRequestConfig;
    constructor(e: IGeneralizedError, location: string, request?: ActiveRequest<any, any>);
    toJSON(): {
        code: string;
        httpStatusCode: number;
        httpStatusText: string;
        location: string;
        message: string;
        config: AxiosRequestConfig | {
            request: {
                headers: IDictionary<any>;
                queryParameters: IDictionary<any>;
                body: string | IDictionary<any>;
                url: string;
            };
        };
        isAxiosError: boolean;
    };
}
