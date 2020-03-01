import { expect } from "chai";
import { ConfiguredRequest, dynamic, IApiMock } from "../src";

describe("Mock tests", () => {
  it("mock config only has default networkDelay when nothing is set", () => {
    const API = ConfiguredRequest.get<{ id: string; limit: number }>(
      "https://test.com/products/{id}"
    )
      .queryParameters({ limit: dynamic() })
      .seal();

    const mockConfig = API.requestInfo({ id: "foobar" }).mockConfig;
    expect(mockConfig).to.be.an("object");
    expect(Object.keys(mockConfig))
      .to.have.lengthOf(1)
      .and.to.include("networkDelay");
  });

  it("mock config can be set with options passed in at request time", () => {
    const API = ConfiguredRequest.get<{ id: string; limit: number }>(
      "https://test.com/products/{id}"
    )
      .queryParameters({ limit: dynamic() })
      .seal();

    const mockConfig = API.requestInfo(
      { id: "foobar" },
      { networkDelay: "heavy", authBlacklist: ["123", "456"], mock: true }
    ).mockConfig;
    expect(mockConfig).to.be.an("object");
    expect(mockConfig.authBlacklist).to.have.lengthOf(2);
    expect(mockConfig.networkDelay).to.equal("heavy");
    expect(mockConfig.mock).to.equal(true);
  });

  it("Setting mock properties statically sets the new default for new instances", () => {
    const API1 = ConfiguredRequest.get("https://test.com/products/").seal();
    let mockConfig = API1.requestInfo().mockConfig;
    expect(mockConfig)
      .to.be.an("object")
      .and.to.not.haveOwnProperty("mock");

    ConfiguredRequest.networkDelay = "heavy";

    const API2 = ConfiguredRequest.get("https://test.com/products/").seal();
    mockConfig = API2.requestInfo({}, { mock: true }).mockConfig;

    expect(mockConfig.mock).to.equal(true);
    expect(mockConfig.networkDelay).to.equal("heavy");
  });

  it("Simple mock function passed in is executed successfully when calling SealedRequest.mock()", async () => {
    interface IRequest {
      id: string;
    }
    interface IResponse {
      id: string;
      name: string;
      age: number;
    }
    const mock: IApiMock<IRequest, IResponse> = req => {
      return {
        id: req.params.id,
        name: "Roger Dodger",
        age: 14
      };
    };

    const API = ConfiguredRequest.get<IRequest, IResponse>(
      "https://test.com/customers/{id}"
    )
      .mockFn(mock)
      .seal();

    const response = await API.mock({ id: "1234" });
    expect(response.id).to.equal("1234");
    expect(response.age).to.equal(14);
  });
});
