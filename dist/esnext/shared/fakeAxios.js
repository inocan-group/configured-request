export function fakeAxios(response, request) {
    return {
        data: response,
        status: response ? 200 : 204,
        statusText: "Ok",
        headers: request.headers,
        config: request.axiosOptions
    };
}
