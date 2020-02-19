"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["get"] = "get";
    RequestMethod["post"] = "post";
    RequestMethod["put"] = "put";
    RequestMethod["delete"] = "delete";
    RequestMethod["patch"] = "patch";
})(RequestMethod = exports.RequestMethod || (exports.RequestMethod = {}));
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
var EndpointMockScenario;
(function (EndpointMockScenario) {
    EndpointMockScenario["happyPath"] = "happyPath";
    EndpointMockScenario["authFailure"] = "authFailure";
    EndpointMockScenario["apiFailure"] = "apiFailure";
})(EndpointMockScenario = exports.EndpointMockScenario || (exports.EndpointMockScenario = {}));
