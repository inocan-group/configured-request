import { AxiosResponse } from "axios";
import { ActiveRequest } from "../entities";
export declare function fakeAxiosResponse<I, O>(response: O, request: ActiveRequest<I, O, any, any>): AxiosResponse<O>;
