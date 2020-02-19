export var RequestMethod;
(function (RequestMethod) {
    RequestMethod["get"] = "get";
    RequestMethod["post"] = "post";
    RequestMethod["put"] = "put";
    RequestMethod["delete"] = "delete";
    RequestMethod["patch"] = "patch";
})(RequestMethod || (RequestMethod = {}));
export var DynamicStateLocation;
(function (DynamicStateLocation) {
    DynamicStateLocation["url"] = "url";
    DynamicStateLocation["queryParameter"] = "queryParameter";
    DynamicStateLocation["header"] = "header";
    DynamicStateLocation["bodyJson"] = "bodyJson";
    DynamicStateLocation["bodyForm"] = "bodyForm";
})(DynamicStateLocation || (DynamicStateLocation = {}));
const DEFAULT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.87 Safari/537.36"
};
export var ApiBodyType;
(function (ApiBodyType) {
    ApiBodyType["JSON"] = "JSON";
    ApiBodyType["formFields"] = "formFields";
    ApiBodyType["literal"] = "literal";
    ApiBodyType["none"] = "none";
})(ApiBodyType || (ApiBodyType = {}));
