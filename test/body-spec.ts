import { expect } from "chai";
import { ConfiguredRequest, dynamic, calc } from "../src/index";

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

  it("POST request with calculated and static values in body of configuration is brought through to request body", async () => {
    interface IRequest {
      body: {
        name: string;
        age: number;
        gender: string;
        ageGroup?: string;
        retired?: boolean;
      };
    }
    const API = ConfiguredRequest.post<IRequest>("https://test.com/people")
      .body({
        ageGroup: "undefined",
        retired: calc(props => (props.body.age > 65 ? true : false))
      })
      .seal();

    let info = await API.requestInfo({
      body: {
        name: "Bob",
        age: 45,
        gender: "male"
      }
    });

    expect(info.body.name).to.equal("Bob");
    expect(info.body.age).to.equal(45);
    expect(info.body.ageGroup).to.equal(
      "undefined",
      "the static prop 'ageGroup' has made it through to request"
    );
    expect(info.body.retired).to.equal(
      false,
      'the "retired" property has been calculated correctly'
    );

    info = API.requestInfo({
      body: {
        name: "Amy",
        age: 85,
        gender: "female"
      }
    });

    expect(info.body.name).to.equal("Amy");
    expect(info.body.age).to.equal(85);
    expect(info.body.ageGroup).to.equal(
      "undefined",
      "the static prop 'ageGroup' has made it through to request"
    );
    expect(info.body.retired).to.equal(
      true,
      'the "retired" property has been calculated correctly'
    );
  });
});
