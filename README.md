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

export ProductList = ConfiguredRequest
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

## Features

### Basic Config

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

#### The URL

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

#### The `dynamic` symbol

While the URL defines dynamic properties with curly brackets, both _headers_ and _query-parameters_ leverage the `dynamic` export from this repo. We've already seen examples of this but here we'll detail out the capabilities of this helpful utility. The basic structure of **dynamic** is:

```typescript
dynamic<I,O>(defaultValue: Scalar | DynamicFunction<O>, required: boolean = false)
```
