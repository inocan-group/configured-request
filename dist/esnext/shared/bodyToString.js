import { ConfiguredRequestError } from "../errors";
export function bodyToString(body, bodyType) {
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
            throw new ConfiguredRequestError(`Unknown body type: ${bodyType}`, "invalid-body-type");
    }
}
function ff(body) {
    return Object.keys(body).reduce((formFields, key) => {
        formFields += `${key}:"${body[key]}"\n`;
        return formFields;
    }, "");
}
