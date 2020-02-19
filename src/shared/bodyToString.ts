import { IDictionary } from "common-types";
import { IApiBodyType, ILiteralType } from "../cr-types";
import { ConfiguredRequestError } from "../errors";

export function bodyToString<I extends object & { body: IDictionary }>(
  body: I["body"] | ILiteralType,
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

function ff(body: IDictionary): string {
  return Object.keys(body).reduce((formFields: string, key: string) => {
    formFields += `${key}:"${body[key]}"\n`;
    return formFields;
  }, "");
}
