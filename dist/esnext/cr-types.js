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
/**
 * When mocking an API endpoint, there
 * are various scenarios that you might
 * want to mock for.
 */
export var EndpointMockScenario;
(function (EndpointMockScenario) {
    /**
     * An normal response which assumes we are on the
     * happy path. This is the default type and if a
     * endpoint only returns a single function then it will
     * be assumed to be for this path.
     */
    EndpointMockScenario["happyPath"] = "happyPath";
    EndpointMockScenario["authFailure"] = "authFailure";
    EndpointMockScenario["apiFailure"] = "apiFailure";
})(EndpointMockScenario || (EndpointMockScenario = {}));
