import { expect } from "chai";
import { ConfiguredRequest, calc, IDynamicCalculator, dynamic } from "../src";

describe("CALC tests", () => {
  it("Bearer token calculation works", () => {
    interface IRequest {
      token: string;
      body: {
        name: string;
      };
    }
    interface IResponse {
      customerId: string;
    }

    // const bearerToken = ;
    const body = { name: "Ken" };
    const bearer = (req: IRequest) => `Bearer ${req.token}`;

    const API = ConfiguredRequest.post<IRequest, IResponse>(
      "https://test.com/customers"
    )
      .headers({
        Authentication: calc(bearer),
        Store: dynamic("1234", true)
      })
      .seal();

    const request = API.requestInfo({ body, token: "12345" });
    expect(request.headers).to.haveOwnProperty("Authentication");
    expect(request.headers.Authentication).to.equal("Bearer 12345");
    expect(request.headers).to.haveOwnProperty("Store");
    expect(request.headers.Store).to.equal("1234");
  });
});
