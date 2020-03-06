import { expect } from "chai";
import { ConfiguredRequest, dynamic, IApiMock, ActiveRequest } from "../src";
import { DB } from "abstracted-admin";
import { Record } from "firemodel";
import { Person } from "./models/Person";
import { arrayToHash } from "typed-conversions";

const people = [
  {
    id: "12342345234kjd",
    name: "Joe",
    age: 44
  },
  {
    id: "45353434gh9820934",
    name: "Mary",
    age: 32
  }
];

describe("Mocks with database access", async () => {
  it("mock database available to mock function when passed in with run-time options ", async () => {
    try {
      const db = await DB.connect({
        mocking: true,
        mockData: { people: arrayToHash(people) }
      });
      Record.defaultDb = db;
      const mock: IApiMock<any, any, any> = async request => {
        expect(request.isMockRequest).to.equal(true);
        expect(request.mockDb).to.not.equal(undefined);
        const person = await Record.get(
          Person,
          request.queryParameters.id as string
        );

        return person.data;
      };

      type IRequest = { id: string };
      const MyRequest = ConfiguredRequest.get<IRequest, Person>(
        "https://foo.bar"
      )
        .queryParameters({
          id: dynamic(undefined, true)
        })
        .mockFn(mock)
        .seal();

      const response = await MyRequest.mock(
        {
          id: people.find(i => i.name === "Joe").id
        },
        { db }
      );

      expect(response.age).to.equal(44);
    } catch (e) {
      throw e;
    }
  });

  it("mock database available to mock function when using useMockDatabase()", async () => {
    const testMockFn: IApiMock<any, any, any> = async request => {
      expect(request.isMockRequest).to.equal(true);
      expect(request.mockDb).to.not.equal(undefined);
      const person = await Record.get(
        Person,
        request.queryParameters.id as string,
        { db: request.mockDb }
      );

      return person.data;
    };

    try {
      const db = await DB.connect({
        mocking: true,
        mockData: { people: arrayToHash(people) }
      });

      type IRequest = { id: string };
      const MyRequest = ConfiguredRequest.get<IRequest, Person>(
        "https://foo.bar"
      )
        .queryParameters({
          id: dynamic(undefined, true)
        })
        .mockFn(testMockFn)
        .seal();

      MyRequest.useMockDatabase(db);
      const response = await MyRequest.mock({
        id: people.find(i => i.name === "Joe").id
      });

      expect(response.age).to.equal(44);
    } catch (e) {
      throw e;
    }
  });
});
