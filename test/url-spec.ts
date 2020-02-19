import { expect } from "chai";
import { ConfiguredRequest, dynamic } from "../src/index";

describe("URL tests", () => {
  it("dynamic prop in URL (with no default value) is properly injected", () => {
    const API = ConfiguredRequest.get<{ id: string }>(
      "https://test.com/products/{id}"
    ).seal();
    const request = API.requestInfo({ id: "1234" });

    expect(request.url).to.equal("https://test.com/products/1234");
  });

  it("dynamic prop in URL (with no default value) is properly injected when queryParameter is involved", () => {
    const API = ConfiguredRequest.get<{ id: string; limit: number }>(
      "https://test.com/products/{id}"
    )
      .queryParameters({ limit: dynamic() })
      .seal();
    const request = API.requestInfo({ id: "1234", limit: 50 });

    expect(request.url).to.equal("https://test.com/products/1234?limit=50");
  });

  it("dynamic prop in URL -- with a default value -- but no param", () => {
    const API = ConfiguredRequest.get<{ id?: string }>(
      "https://test.com/products/{id:1234}"
    ).seal();
    const request = API.requestInfo();

    expect(request.url).to.equal("https://test.com/products/1234");
  });

  it("dynamic prop in URL -- with a default value and prop -- allows prop to override", () => {
    const API = ConfiguredRequest.get<{ id?: string }>(
      "https://test.com/products/{id:4567}"
    ).seal();
    const request = API.requestInfo({ id: "1234" });

    expect(request.url).to.equal("https://test.com/products/1234");
  });

  it("multiple query parameters make it into the URL", () => {
    const API = ConfiguredRequest.get<{
      id?: string;
      limit: number;
      offset: number;
    }>("https://test.com/products/{id:4567}")
      .queryParameters({ limit: dynamic(10), offset: dynamic(0) })
      .seal();

    const request = API.requestInfo({ id: "1234", limit: 50, offset: 100 });

    expect(request.url).to.equal(
      "https://test.com/products/1234?limit=50&offset=100"
    );
  });
});
