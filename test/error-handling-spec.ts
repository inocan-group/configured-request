import { expect } from "chai";
import { ConfiguredRequest, ActiveRequestError } from "../src";

describe("Error handling => ", () => {
  it("calling an invalid URL produces an error but is handled correctly", async () => {
    const errors: ActiveRequestError[] = [];
    const handle = (e: ActiveRequestError) => {
      errors.push(e);
      return true;
    };
    const badApi = ConfiguredRequest.get("https://dev.null")
      .errorHandler(handle)
      .seal();

    let response;
    try {
      response = await badApi.request();
    } catch (e) {
      throw new Error(
        `Error handler should catch all errors! Error: ${e.message}`
      );
    }
    expect(response).to.equal(true);

    expect(errors).to.have.lengthOf(1);
    expect(errors[0].config.url).to.equal("https://dev.null");
  });

  it("calling a valid URL but to an {id} which is NOT valid (422) is handled that can't be processed returns a 422", async () => {
    const errors: ActiveRequestError[] = [];
    const handle = (e: ActiveRequestError) => {
      errors.push(e);
      return true;
    };
    const badApi = ConfiguredRequest.get(
      "https://www.iheartjane.com/api/v1/products/0"
    )
      .errorHandler(handle)
      .seal();

    try {
      const response = await badApi.request();
      expect(response).to.equal(true);
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].httpStatusCode).to.equal(422);
    } catch (e) {
      throw new Error(
        `Error handler should catch all errors! Error: ${e.message}`
      );
    }
  });

  it("recursive catch blocks of ActiveRequestErrors to avoid recursive wrapping", () => {
    const msg = "this is the first error";
    const firstError = ActiveRequestError.wrap(new Error(msg), "inner");
    const secondError = ActiveRequestError.wrap(firstError, "outer");

    expect(secondError.message).to.equal(msg);
    expect(secondError.baseError.name).to.equal("Error");
    expect(secondError.location).to.equal("inner");
  });
});
