export var RequestVerb;
(function (RequestVerb) {
    RequestVerb["get"] = "get";
    RequestVerb["post"] = "post";
    RequestVerb["put"] = "put";
    RequestVerb["delete"] = "delete";
    RequestVerb["patch"] = "patch";
})(RequestVerb || (RequestVerb = {}));
export var DynamicStateLocation;
(function (DynamicStateLocation) {
    DynamicStateLocation["url"] = "url";
    DynamicStateLocation["queryParameter"] = "queryParameter";
    DynamicStateLocation["header"] = "header";
    DynamicStateLocation["body"] = "body";
})(DynamicStateLocation || (DynamicStateLocation = {}));
const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36"
};
export var ApiBodyType;
(function (ApiBodyType) {
    ApiBodyType["JSON"] = "JSON";
    ApiBodyType["formFields"] = "formFields";
    ApiBodyType["text"] = "text";
    ApiBodyType["html"] = "html";
    ApiBodyType["unknown"] = "unknown";
    ApiBodyType["none"] = "none";
})(ApiBodyType || (ApiBodyType = {}));
export const LITERAL_TYPE = "LITERAL_BODY_PAYLOAD";
export function isLiteralType(body) {
    return body.type === LITERAL_TYPE ? true : false;
}
export var DynamicSymbol;
(function (DynamicSymbol) {
    DynamicSymbol["dynamic"] = "dynamic";
    DynamicSymbol["calc"] = "calc";
})(DynamicSymbol || (DynamicSymbol = {}));
/**
 * Tests whether the given symbol is a `calc` property
 */
export function isCalculator(dp) {
    return dp.symbol === DynamicSymbol.calc ? true : false;
}
/**
 * Tests whether the given symbol is a `dynamic` property
 */
export function isDynamicProp(dp) {
    return dp.symbol === DynamicSymbol.dynamic ? true : false;
}
