"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const errors_1 = require("../errors");
const queryString = __importStar(require("query-string"));
function addBodyPayload(request, randomSeed = "::use-a-seed-for-form-fields::") {
    const { body } = request;
    let payload;
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
            throw new errors_1.ConfiguredRequestError(`Unknown body type: ${request.bodyType}`, "invalid-body-type");
    }
    return Object.assign(Object.assign({}, request), { payload });
}
exports.addBodyPayload = addBodyPayload;
