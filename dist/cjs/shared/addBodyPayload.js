"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBodyPayload = void 0;
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
