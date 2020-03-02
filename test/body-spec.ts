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
    expect(response.body).to.be.an("object");
    expect(response.payload).to.be.a("string");
    expect(response.body.name).to.equal(body.name);
  });

  it("POST request with calculated and dynamic values in body of configuration is brought into request body", async () => {
    interface IRequest {
      body: {
        name: string;
        age: number;
        gender: string;
        ageGroup: string;
      };
    }
    const API = ConfiguredRequest.post<IRequest>("https://test.com/people")
      .body;
  });
});
