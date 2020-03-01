import { AxiosResponse } from "axios";
import { ActiveRequest } from "../entities";
/**
 * Takes a response object returned from a mocked function and
 * places it into a dictionary/hash that looks like an Axios
 * response.
 */
export declare function fakeAxiosResponse<I, O>(response: O, request: ActiveRequest<I, O, any, any>): AxiosResponse<O>;
