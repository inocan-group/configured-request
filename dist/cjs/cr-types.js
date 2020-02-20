"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestVerb;
(function (RequestVerb) {
    RequestVerb["get"] = "get";
    RequestVerb["post"] = "post";
    RequestVerb["put"] = "put";
    RequestVerb["delete"] = "delete";
    RequestVerb["patch"] = "patch";
})(RequestVerb = exports.RequestVerb || (exports.RequestVerb = {}));
var DynamicStateLocation;
(function (DynamicStateLocation) {
    DynamicStateLocation["url"] = "url";
    DynamicStateLocation["queryParameter"] = "queryParameter";
    DynamicStateLocation["header"] = "header";
    DynamicStateLocation["bodyJson"] = "bodyJson";
    DynamicStateLocation["bodyForm"] = "bodyForm";
})(DynamicStateLocation = exports.DynamicStateLocation || (exports.DynamicStateLocation = {}));
const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36"
};
var ApiBodyType;
(function (ApiBodyType) {
    ApiBodyType["JSON"] = "JSON";
    ApiBodyType["formFields"] = "formFields";
    ApiBodyType["literal"] = "literal";
    ApiBodyType["none"] = "none";
})(ApiBodyType = exports.ApiBodyType || (exports.ApiBodyType = {}));
exports.LITERAL_TYPE = "LITERAL_BODY_PAYLOAD";
function isLiteralType(body) {
    return body.type === exports.LITERAL_TYPE ? true : false;
}
exports.isLiteralType = isLiteralType;
var DynamicSymbol;
(function (DynamicSymbol) {
    DynamicSymbol["dynamic"] = "dynamic";
    DynamicSymbol["calc"] = "calc";
})(DynamicSymbol = exports.DynamicSymbol || (exports.DynamicSymbol = {}));
function isCalculator(dp) {
    return dp.symbol === DynamicSymbol.calc ? true : false;
}
exports.isCalculator = isCalculator;
function isDynamicProp(dp) {
    return dp.symbol === DynamicSymbol.dynamic ? true : false;
}
exports.isDynamicProp = isDynamicProp;
