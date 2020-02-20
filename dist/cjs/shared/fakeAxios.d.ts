import { IConfiguredApiRequest } from "../cr-types";
import { AxiosResponse } from "axios";
export declare function fakeAxios<I, O>(response: O, request: IConfiguredApiRequest<I>): AxiosResponse<O>;
