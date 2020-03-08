import { expect } from "chai";
import { ConfiguredRequest, dynamic } from "../src/index";

describe("Query Parameters", () => {
  it("Dynamic query associated to query parameters works alongside static query parameters", async () => {
    const API = ConfiguredRequest.get<{ page: number; limit?: number }>(
      "https://test.com/products"
    )
      .queryParameters({
        page: dynamic(1, true),
        static1: "foo",
        static2: "bar",
        limit: dynamic()
      })
      .seal();

    const info = API.requestInfo();
    expect(info.url).to.include("page");
    expect(info.queryParameters.page)
      .to.not.equal(undefined)
      .and.equal(5);

    const info2 = API.requestInfo({ page: 5, limit: 2 });
    expect(info2.url).to.include("page");
    expect(info.queryParameters.page)
      .to.not.equal(undefined)
      .and.equal(5);
    expect(info2.url).to.include("limit");
    expect(info2.queryParameters.limit).to.equal(2);

    const API2 = ConfiguredRequest.get<{ page: number; limit?: number }>(
      "https://test.com/products"
    )
      .queryParameters({
        page: dynamic(1, true),
        static1: "foo",
        static2: "bar"
      })
      .seal();

    const info3 = API2.requestInfo({ page: 2 });
    expect(info3.queryParameters.page).to.equal(2);
    expect(info3.url).to.include("page");
  });
});
