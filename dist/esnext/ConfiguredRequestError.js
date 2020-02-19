import { HttpStatusCodes } from "common-types";
export class RequestError extends Error {
    constructor(message, code = "error", statusCode = HttpStatusCodes.BadRequest) {
        super();
        this.message = message;
        this.name = `configured-request/${code}`;
        this.code = code;
        this.statusCode = statusCode;
    }
}
