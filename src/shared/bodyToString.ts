import { IDictionary } from "common-types";
import { IApiBodyType } from "../cr-types";

export function bodyToString<I extends object & { body: IDictionary }>(
  body: I["body"],
  bodyType: IApiBodyType
) {
  switch (bodyType) {
    case "JSON":
      return JSON.stringify(body);
    case "formFields":
      return ff(body);
    case "literal":
      return body.value;
    case "none":
      return undefined;
    default:
      throw new ConfiguredRequestError(
        `Unknown body type: ${bodyType}`,
        "invalid-body-type"
      );
  }
}
