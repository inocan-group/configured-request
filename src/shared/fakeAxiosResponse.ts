import { IConfiguredApiRequest } from "../cr-types";
import { AxiosResponse } from "axios";
import { ActiveRequest } from "../entities";

/**
 * Takes a response object returned from a mocked function and
 * places it into a dictionary/hash that looks like an Axios
 * response.
 */
export function fakeAxiosResponse<I, O>(
  response: O,
  request: ActiveRequest<I, O, any, any>
): AxiosResponse<O> {
  return {
    data: response,
    status: response ? 200 : 204,
    statusText: "Ok",
    headers: request.headers,
    config: request.axiosOptions
  };
}
