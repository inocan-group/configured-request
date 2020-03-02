import { IConfiguredApiRequest } from "../cr-types";
import { ConfiguredRequestError } from "../errors";
import * as queryString from "query-string";

export function addBodyPayload<I>(
  request: IConfiguredApiRequest<I>,
  /** a string separator which is used when body type if "formFields"; otherwise ignored */
  randomSeed: string = "::use-a-seed-for-form-fields::"
): IConfiguredApiRequest<I> {
  const { body } = request;
  let payload: string;
  switch (request.bodyType) {
    case "JSON":
      payload = JSON.stringify(body);
      break;
    case "formFields":
      payload = queryString.stringify(body, {
        arrayFormat: "separator",
        arrayFormatSeparator: randomSeed
      });
      break;
    case "html":
    case "text":
    case "unknown":
      payload = String(body);
    case "none":
      payload = undefined;
      break;

    default:
      throw new ConfiguredRequestError(
        `Unknown body type: ${request.bodyType}`,
        "invalid-body-type"
      );
  }

  return { ...request, payload };
}
