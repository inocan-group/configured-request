import { expect, assert } from "chai";
import {
  DynamicStateLocation,
  ICalcSymbolOutput,
  KnownLocation,
  DynamicSymbol,
  IApiInput,
  IApiInputWithoutBody,
  IDynamicSymbolOutput
} from "../src";
import { dynamicUpdate } from "../src/shared";

interface MockRequest extends IApiInputWithoutBody {
  token: string;
  fooId: string;
}

describe("Dynamic update", () => {
  it("should concat dynamics on new state location provided", () => {
    const existingDynamicHeader: KnownLocation<IDynamicSymbolOutput<
      MockRequest
    >> = {
      location: DynamicStateLocation.header,
      prop: "Authorization",
      required: true,
      symbol: DynamicSymbol.dynamic
    };
    const location = DynamicStateLocation.queryParameter;
    const fooIdDynamicQueryString: IDynamicSymbolOutput<MockRequest> = {
      prop: "fooId",
      symbol: DynamicSymbol.dynamic,
      required: true
    };

    const actual = dynamicUpdate([existingDynamicHeader], location, [
      fooIdDynamicQueryString
    ]);

    assert.sameDeepMembers(actual, [
      existingDynamicHeader,
      { ...fooIdDynamicQueryString, location }
    ]);
  });
});
