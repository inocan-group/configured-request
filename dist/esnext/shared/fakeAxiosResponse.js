/**
 * Takes a response object returned from a mocked function and
 * places it into a dictionary/hash that looks like an Axios
 * response.
 */
export function fakeAxiosResponse(response, request) {
    return {
        data: response,
        status: response ? 200 : 204,
        statusText: "Ok",
        headers: request.headers,
        config: request.axiosOptions
    };
}
