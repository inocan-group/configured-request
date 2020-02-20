# Configured Request

## Installation

This repo is available as an **npm** library:

```sh
# npm
npm i --save configured-request
# yarn
yarn add configured-request
```

This repo provides both ES and CJS exports as well as full TypeScript typing support.

## Introduction

This library is intended to help you _define_ strongly typed API requests once and then once configured, to use them
whenever you need them. This library sets up all static aspects of the API endpoints across:

- url
- query-parameters
- headers
- and request body (_in cases outside of a **GET** request_)

It also allows you to creatively state where all of the _dynamic_ aspects of the request are located across URL,
query-parameters, and the body and let consumers pass these dynamic attributes in as they see fit. As an example,
imagine an API endpoint where the consumer is asking for a list of Products. The endpoint does implement pagination
through the common `limit/offset` parameters. To define this endpoint you would start by defining the endpoint's
_response_ type:

```typescript
export interface IProductResponse {
  meta: {
    totalProducts: number;
  };
  data: {
    products: [{ id: string; name: string; price: number }];
  };
}
```

You'll also want to _type_ the dynamic parameters which your consumers will be able to use:

```typescript
export interface IProductRequest {
  limit?: number;
  offset?: number;
  version?: "v1" | "v2";
}
```

Once, defined you will export a symbol for your consumers like so:

```typescript
import { ConfiguredRequest, dynamic } from 'configured-request';

export const ProductList = ConfiguredRequest
  .get<IProductRequest, IProductResponse>('https://api.fictional-store.com/{version:v1}/products')
  .queryParameters({
    limit: dynamic(50, false)
    offset: dynamic(0, false)
  })
  .seal();
```

That's it, our `ProductList` symbol is now ready to be used:

```typescript
import { ProductList } from "./queries";

// using it with just the default values (aka, the first page of products)
const products = await ProductList.request();

// if we did want to page into the product list, we could do the following...
const page2 = await ProductList.request({ offset: 50, limit: 50 });

// and while the default API version is "v1", we could call the v2 api with ...
const version2 = await ProductList.request({ version: "v2" });
```

That's a quick summary of the top line features. We will now go into greater details as well as explore more advanced capabilities that this library brings.

> **Note:** it's worth noting that the call to `.seal()` at the end of the definition is not 100% required but it packages up the configuration and provides consumers with a reduced API surface that is intended only for usage not for configuration.

## Basic Config

The `.queryParameters()` method was demonstrated in the example above but you also get:

- `headers(h: IDictionary)`

      Pass in your own dictionary of name/value pairings which you want to add to the _headers_ of the API request. The configuration -- just like the queryParameters -- can include both static values and dynamic ones (_via use of the `dynamic` symbol exported by this repo_). A typical example might include:

      ```typescript
      export API = ConfigureRequest.get<IRequest, IResponse>(URL)
        .headers({
          ...dynamic( (v: string) => ['Authorization', `Bearer ${v}`, true`] ),
          Store: 'abd34234-234234'
        })
      ```

      Here we see:

      - a different way of leveraging the `dynamic` function (which will be covered in more detail in the next section),
      - a static setting of the header variable `Store`

- `body(content: I["body"] | LiteralBody )`

      In **POST** and **PUT** messages it is typical that most of the data that you are passing to the API endpoint is a JSON object of data. This means that _typically_ you would NOT configure the body until you're ready to make the request but if there is a reason to you can do it.

      Probably the most useful use-case would be to setup default properties for your consumers. For that reason, if a value _is_ set, it will deep merge this _body_ definition with whatever is provided at request time (giving request time precedence).

      There are two other considerations worth mentioning:

      1. **Body Structure** - it is assumed by default that the body _payload_ will be a JSON blob but that is not always the case and if you need to change this to a different type you should configure this with `.bodyType()`. The _bodyType_ will allow you to choose between JSON, Form Fields, and "literal". In all cases, the value passed into `body()` should be a dictionary of some sort.
      2. **Typing for the body** - unlike other _dynamic_ properties show up in your request interface under the property name, the _payload_ or message body is always defined as `payload` on the request interface. So if you were defining a POST request with a payload of `{ id: string, price: number }` this would be done like so:

          ```typescript
          export interface IRequest {
            body: { id: string, price: number }
          }
          export API = ConfigureRequest.post<IRequest, IResponse>(URL);
          ```

      If we had wanted to change the _bodyType_ to a Form Field that wouldn't change the typing part of the equation as both JSON and Form Fields benefit from having input be provided via a strongly typed dictionary. In both _bodyType's_ the dictionary would be converted to a string based variable before being sent over the wire.

      > **Note:** the last _bodyType_ is "literal" (which would be very rare); if you need to use this type we would ask that you use the `literal` export from this repo: `.body(literal('abcd'))`

We have now covered the primary aspects of "state" that you might want to configure for an API endpoint, however, we were a bit _implicit_ about the URL itself as that is another area where we often see important state being conveyed. So, let's get explicit about the URL.

### The URL

The URL gets stated along with the method and might look like any of the following:

```typescript
import { ConfiguredRequest as CR } from "configured-request";
const baseUrl = "https://my.site";
const Example1 = CR.get(`${baseUrl}/products/{id}`).seal();
const Example2 = CR.get(`${baseUrl}/products/{id:}`).seal();
const Example3 = CR.get(`${baseUrl}/{version:v1}/products`).seal();
```

In all cases the expression of a _dynamic_ property in the URL is notated by enclosing a part of the URL with curly brackets. In the first example we show a very standard API pattern where you must pass along an `id` to indicate which _product_ you want detail on. Putting the `{id}` text into the URL means that requests must include an `id` as part of the request (or ConfiguredRequest will throw an error). This means that in the first example `id` is both dynamic _and_ required.

In the second and third examples, the dynamic property name is followed by a colon and the _default value_ for the dynamic property. This is more clear in the third example as the default value of "v1" stands out but in the second example the default value is also being stated but in this case the default value is _undefined_.

When a dynamic URL property has a default value it is considered _optional_ and can be left off of the actual network request.

### The `dynamic` symbol

While the URL defines dynamic properties with curly brackets, both _headers_ and _query-parameters_ leverage the `dynamic` export from this repo. We've already seen examples of this but here we'll detail out the capabilities of this helpful utility. The basic structure of **dynamic** is:

```typescript
dynamic<I,O>(defaultValue: undefined | Scalar, required: boolean = false)
```

So in the many cases the main thing you're stating with dynamic is that a given property is available as a dynamic property. The property _isn't_ required and it might or might now have a default value. Examples of this include:

```typescript
// not required, with default value
API.queryParameters({ limit: dynamic(10), offset: dynamic(0) });
// not required, no default value
API.headers({ Store: dynamic() });
// required prop but no default
API.queryParameters({ userId: dynamic(undefined, true) });
```

### The `calc` symbol

The `calc` symbol plays a similar but distinct role to the `dynamic` symbol. Whereas the `dynamic` symbol allows stating that a given property is dynamic (and optionally what it's default value is), the `calc` symbol _calculates_ the value of a dynamic property. For the basis of this calculation, the _calc_ symbol accepts a callback function which is passed two properties:

- `request` - this dictionary of properties that a consumer passes in when making a request
- `config` - a dictionary of useful details about the request, including the payload, queryParameters, etc.

To see this used in context, here is an example:

```typescript
API.headers({
  Authorization: calc(req => `Bearer ${req.token}`),
  Page: calc((req, config) =>
    Math.floor(req.queryParameters.offset / req.queryParameters.limit)
  )
});
```

In the case of the first usage, the consumers will be able to pass in a `token` in the request and this will be transformed into a standard [Bearer Token](https://swagger.io/docs/specification/authentication/bearer-authentication/).

## Basic usage

As a consumer of a configured API, you will be receiving a `SealedRequest` class which provides a compact API for you to make requests with. An example would be:

```typescript
try {
  const products = await ProductList.request({ offset: 500, limit: 50 });
  // do things
} catch (e) {
  // if the API fails for any reason a `ConfiguredRequestError` will be thrown
}
```

The usage interface is both compact and fully typed so usage should be very intuitive and to keep the docs up-to-date, we'll point you to the Typescript typings for the best docs.

## Advanced features

### Mocking

You can pass in a _mock function_ to the configuration which will mock an API response (given a request as an input). This function will look like:

```typescript
// define the mock
const mockFn: IApiMock<I, O> = (
  request: I,
  config: ConfiguredRequest<I, O>
) => {
  if (["productId", "operation"].every(i => request[i] !== undefined)) {
    return {
      id: "1234",
      name: "Magic Carpet"
    };
  } else {
    throw new HttpError(
      HttpStatusCodes.Forbidden,
      "Required fields were missing"
    );
  }
};

// add the mock to the API definition
const myApi = API.mockFn(mock).seal();
```

With this mocking capability now available, the consumers can leverage this through two means:

1.  **Consumer's `.mock()` API**

    When a consumer uses a sealed API they get both the `.request()` and `.mock()` methods which
    call the actual and mock API respectively. In the example below you will be assured of calling
    the _mock_ API:

    ```typescript
    import { ProductDetail } from "./queries";
    const product = await ProductDetail.mock({ id: "1234" });
    ```

2.  **ENV variables**

    While calling `.mock()` _always_ results in a mocked API call, calling `.request()` will switch between
    calling the _real_ API and the _mock_ API based on environment variables. The following ENV variables impact the behavior of `.request()`:

    - `MOCK_API`

          This is just a boolean flag; when it is set -- by convention to the value `true` but in reality, any value other than `false` -- will activate mock requests for all API's.

    - `MOCK_API_NETWORK_DELAY`

          Mock API's have a simulated "network delay" added automatically. By default this is very mild (10-50ms per request) but you can set this variable to:

          - `medium` - delay between 50ms and 150ms
          - `heavy` - delay between 150ms and 500ms
          - `very-heavy` - delay between 1 and 2 seconds

          Unrecognized values will be ignored. Also note that if you have some API endpoints which you want to notate as being slower than the default, you can configure the API directly on `object.networkDelay()` or statically as `ConfigureRequest.networkDelay()` to set this across all APIs.

    - `MOCK_API_AUTH_BLACKLIST`

          You can set one or more "tokens" which should be deemed invalid and therefore when passed in, it will allow your mock functions to throw AUTH errors. This is achieved by having the mock function pickup the blacklist and respond:

          ```typescript
          process.env.MOCK_API_AUTH_BLACKLIST="1234,4567";
          const mockFn = (request, config) => {
            if (config.authBlacklist.includes(request.token)) {
              throw new AuthError(`The token ${request.token} was on the blacklist for AUTH`)
            }
            return { id: request.id, name: 'Bob Marley', age: 55 }
          }

          const UserProfile = ConfiguredRequest
            .get<{id: string, token: string}, { id: string, name: string, age: number}>(URL)
            .mockFn( mockFn )
          ```

          In addition to this ENV variable you _can_ configure this statically for all APIs at `ConfigureRequest.setBlacklist()`.

          > **Note:** the environment variable's value will be treated as a comma separated list.

    - `MOCK_API_AUTH_WHITELIST`

          The same principle as _black listing_ but instead you list tokens which are considered valid. In general you should choose between _white_ and _black_ listing but not use both.

## Result Mapping

Sometimes the results you get back from an API aren't precisely what you want. In these cases it is easy to map the result to a different structure or set of values. Imagine as an example that you call to get a UserProfile but the external system uses numbers to represent an `id` but internally you prefer to represent the `id` as a string:

```typescript
const UserProfile = ConfiguredRequest.get<I, O, X>(URL)
  .mapper((profile: X) => {
    return { ...profile, id: String(profile.id) } as O;
  })
  .seal();
```

In this example the _mapper_ is pretty clear. When the API returns all results "as is" (in this case just a single UserProfile record). In our example the API returns a profile with a numeric `id` but after the mapping the `id` is a string. As is standard, the `I` and `O` types represent the overall _input_ and _output_ but we now have an `X` type. The `X` type represents the _intermediate_ type that the API returns. You _can_ leave off defining `X` and just focus on the inputs and outputs but in most cases where you use a mapper, you should define X as well:

```typescript
interface I { id: string };
interface IResponse<T = string> {
  id: T,
  name: string
};
interface O = IResponse;
interface X = IResponse<number>;
```
