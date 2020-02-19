import { HttpStatusCodes } from "common-types";

export class RequestError extends Error {
  public code: string;
  public statusCode: number;

  constructor(
    message: string,
    code: string = "error",
    statusCode = HttpStatusCodes.BadRequest
  ) {
    super();
    this.message = message;
    this.name = `configured-request/${code}`;
    this.code = code;
    this.statusCode = statusCode;
  }
}
