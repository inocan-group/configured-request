import { expect } from "chai";
import { IApiMock } from "../src/cr-types";
import { ConfiguredRequest } from "../src";

describe("Mapping results", () => {
  it('mapper and mock work together in concert to replace numeric "id" with string equivalent', async () => {
    interface IRequest {}
    interface IResponse<T = string> {
      data: Array<{
        id: T;
        name: string;
        age: number;
      }>;
    }

    const mock: IApiMock<IRequest, IResponse<any>> = config => {
      return {
        data: [
          {
            id: 123,
            name: "Roger Dodger",
            age: 14
          },
          {
            id: 456,
            name: "Roger Dodger",
            age: 14
          }
        ]
      };
    };

    const API = ConfiguredRequest.get<IRequest, IResponse, IResponse<number>>(
      "https://test.com/customers"
    )
      .mockFn(mock)
      .mapper(input => {
        const data = input.data.map(i => ({ ...i, id: String(i.id) }));
        return { ...input, data } as IResponse;
      })
      .seal();
    const results = await API.mock();
    results.data.forEach(i => expect(typeof i.id).to.equal("string"));
  });

  it("When unwrap is configured it will unwrap the result it gets as a response", async () => {
    const mock = () => ({
      data: {
        foobar: {
          customers: [
            { id: 1, name: "bob" },
            { id: 2, name: "mary" }
          ]
        }
      }
    });

    const API = ConfiguredRequest.get("https://test.com/customers")
      .mockFn(mock)
      .unwrap("data.foobar.customers")
      .seal();

    expect(await API.mock())
      .to.be.an("array")
      .and.to.have.lengthOf(2);
  });
});
