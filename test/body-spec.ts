import { expect } from "chai";
import { ConfiguredRequest, dynamic } from "../src/index";

describe("BODY requests", () => {
  it("POST request with JSON body is translated correctly", async () => {
    interface IRequest {
      body: {
        name: string;
        age: number;
      };
      limit?: number;
      offset?: number;
    }

    const API = ConfiguredRequest.post<IRequest>("https://test.com/products")
      .queryParameters({ limit: dynamic(), offset: dynamic() })
      .seal();

    const body = {
      name: "Bob",
      age: 56
    };
    const response = API.requestInfo({
      body
    });

    expect(response.bodyType).to.equal("JSON");
    expect(response.payload).to.be.an("object");
    expect(response.body).to.be.a("string");
    expect(response.payload.name).to.equal(body.name);
    expect(response.body)
      .to.include("name")
      .and.to.include("Bob");
  });
});
