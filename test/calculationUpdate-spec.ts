import { expect, assert } from "chai";
import {
  DynamicStateLocation,
  ICalcSymbolOutput,
  KnownLocation,
  DynamicSymbol,
  IApiInput,
  IApiInputWithoutBody
} from "../src";
import { calculationUpdate } from "../src/shared";

interface MockRequest extends IApiInputWithoutBody {
  token: string;
  fooId: string;
}

describe("Calculation update", () => {
  it("should concat calculations on new state location provided", () => {
    const existingHeaderCalculation: KnownLocation<ICalcSymbolOutput<
      MockRequest
    >> = {
      location: DynamicStateLocation.header,
      fn: (req: MockRequest) => `Bearer ${req.token}`,
      prop: "Authorization",
      symbol: DynamicSymbol.calc
    };
    const location = DynamicStateLocation.queryParameter;
    const fooIdQueryStringCalculation: ICalcSymbolOutput<MockRequest> = {
      fn: (req: MockRequest) => req.fooId,
      prop: "fooId",
      symbol: DynamicSymbol.calc
    };

    const actual = calculationUpdate([existingHeaderCalculation], location, [
      fooIdQueryStringCalculation
    ]);

    assert.sameDeepMembers(actual, [
      existingHeaderCalculation,
      { ...fooIdQueryStringCalculation, location }
    ]);
  });
});
