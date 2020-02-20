import { IConfiguredApiRequest } from "../cr-types";
import { AxiosResponse } from "axios";

export function fakeAxios<I, O>(
  response: O,
  request: IConfiguredApiRequest<I>
): AxiosResponse<O> {
  return {
    data: response,
    status: response ? 200 : 204,
    statusText: "Ok",
    headers: request.headers,
    config: request.axiosOptions
  };
}
