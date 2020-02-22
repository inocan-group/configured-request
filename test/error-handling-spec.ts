import { expect } from "chai";
import { ConfiguredRequest } from "../src";
import { AxiosError } from "axios";

describe("Error handling => ", () => {
  it("calling an invalid URL produces an error but is handled correctly", async () => {
    const errors: AxiosError[] = [];
    const handle = (e: AxiosError) => errors.push(e);
    const badApi = ConfiguredRequest.get("https://dev.null")
      .errorHandler(handle)
      .seal();

    try {
      const response = await badApi.request();
      expect(response).to.equal(1);
      expect(errors).to.have.lengthOf(1);
      expect(errors[0].config.url).to.equal("https://dev.null");
    } catch (e) {
      throw new Error("Error handler should catch all errors!");
    }
  });

  it("calling a valid URL with data (422) is handled that can't be processed returns a 422", async () => {
    const errors: AxiosError[] = [];
    const handle = (e: AxiosError) => errors.push(e);
    const badApi = ConfiguredRequest.get(
      "https://www.iheartjane.com/api/v1/products/0"
    )
      .errorHandler(handle)
      .seal();

    try {
      const response = await badApi.request();
      expect(response).to.equal(1);
      expect(errors).to.have.lengthOf(1);
      console.log(errors);
      expect(errors[0].response.status).to.equal(422);
    } catch (e) {
      throw new Error("Error handler should catch all errors!");
    }
  });
});
