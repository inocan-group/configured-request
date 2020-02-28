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
});
