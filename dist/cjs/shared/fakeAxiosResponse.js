"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fakeAxiosResponse(response, request) {
    return {
        data: response,
        status: response ? 200 : 204,
        statusText: "Ok",
        headers: request.headers,
        config: request.axiosOptions
    };
}
exports.fakeAxiosResponse = fakeAxiosResponse;
