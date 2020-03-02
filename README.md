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
- and request body (_for verbs which support it_)

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

The job of configuration is all about stating _static_, _dynamic_, and _calculated_ properties that are involved in the API endpoint. These properties can exist in any of the locations which RESTful API's store them: headers, query parameters, the URL, and the message body. The previous example showed how we might configure the query parameters and as you'll see, the other "state locations" follow a very similar approach.

### Headers

> `API.headers(h: IDictionary) { ... }`

Pass in your own dictionary of name/value pairings which you want to add to the _headers_ of the API request. The configuration -- just like the queryParameters -- can include both static values and dynamic properties. A very common thing to see in the headers of an API endpoints is the requirement that you pass in a Bearer Token. With this in mind, let's show how this might be done where the caller of this API is asked to include the property `token` and that is in turn placed into the correct place in the headers array.

```typescript
export API = ConfigureRequest.get<IRequest, IResponse>(URL)
  .headers({
    Authorization: calc( params => `Bearer ${params.token}` ),
    Store: 'abd34234-234234'
  })
```

Here we see:

- that at run-time we convert the `token` input into a bearer token and put into the header array
- the header array, takes on a static value for the key of `Store`

### Body

> `API.body(content: I["body"] ) { ... }`

In **POST** and **PUT** messages it is typical that most of the data that you are passing to the API endpoint is a JSON object of data. In these cases, you want strong typing for the body of the message but the values are likely less of a _configuration-time_ concern and more of a _execution time_ concern. If this is your situation then just make sure that the input typing for the `ConfiguredRequest` (aka, `<I>`) includes the appropriate typing for the `body` property and consumers who execute queries then will benefit from the typing (aka, at "design time" for the consumer). In this case, you don't need to use the `.body()` method to do anything during configuration.

If you _do_ want to setup defaults for values in the JSON payload or inject some calculations into the body of the message than you can do this and the approach is similar to what we've done so far.

To illustrate, let's imagine the case where we have an interface for an `OrderList` endpoint, where `OrderList` gives us all orders for a particular day and by default we will have it use today's date. Also, we allow for _limiting_ the total records we get back as well as providing an _offset_ so that we can page through the results. It might be more typical that the limit and offsets be stated as query parameters, and it is _definitely_ more common to use the GET verb but this particular 3rd party has decided to use POST and are putting all state into the body of the message.

Yeah we may think _poorly_ of 3rd parties but we can't control them (a shame really). Plus, let's be honest, if our fictional 3rd party were using GET we'd have no BODY anyway and our example would make no sense. :)

```typescript
import { format } from 'date-fns';
export interface IRequest {
  page?: number;
  body: {
    limit: number;
    offset: number;
    day: string;
  }
}
export OrderList = ConfigureRequest.get('http://bad-third-party.com/v1/order-list')
  .body({
    limit: 50,
    offset: calc( params => params.page ? params.page * 50 : 0),
    day: calc( () => format(new Date(), 'yyyy-MM-dd') )
  })
```

In our example you'll see that the required properties for the **body** are either static or calculated. This means that if a consumer of this configured were to pass in no body at execution time, all required properties of the interface would still be met. If they wanted to pass in a `page` property then it would adjust the `offset` property accordingly. This gives gives us a nice set of defaults and if at execution time there's a need to pass in another `day` that is achieved with:

```typescript
const response = await OrderList.request({ body: { day } });
```

This will ensure that the caller's `day` value overrights the default for `day` but the other default values are persisted.

#### Body Structure / Content Type

Up to now we've assumed that the BODY of the message will be delivered as a JSON object _stringified_. That is overwhelming the most common configuration, but there are exceptions. `ConfiguredRequest` supports the following structures:

1. **JSON** <br/>
   The default type and no additional configuration is needed. Using this ensures the `Content-Type` in the header is set to **application/json** and will ensure the structured object that is input is converted to a string notation before being sent over the wire.

2. **Multipart Forms** <br/>
   Multipart Forms are undoubtedly the second most common means of sending data for a POST/PUT request and it's format originates from the need for an HTML page to be able to post form data directly to an endpoint without the need for code to format the request for us. Whereas JSON is more comfortable for code, Multi-part Forms are comfortable to HTML. In order to state that the body is a multipart form you just use `API.bodyAsMultipartForm()` in the configuration. This will set the `Content-Type` header to **application/x-www-form-urlencoded** as well as ensure that the dictionary/hash object input is converted to this form structure before being sent over the wire.

3. **Text** <br/>
   If the body content being sent is plain text then you can state this with `API.bodyAsPlainText()` and the `Content-Type` will be set to **text/plain**. If the body content passed in at execution time is _not_ a string a `configured-request/invalid-body` error will be thrown.

4. **HTML** <br/>
   If the body content being sent is HTML then you can state this with `API.bodyAsHTML()` and the `Content-Type` will be set to **text/html**. If the body content passed in at execution time is _not_ a string a `configured-request/invalid-body` error will be thrown.

5. **Unknown** <br/>
   If the body of the message is neither JSON nor a Multi-Part Form then the remaining option is to call `API.bodyAsUnknown()`. This will require that you transform the body into a string payload yourself and pass it in as a string blob. This will set the `Content-Type` to **application/octet-stream** (which you can override in the headers config if you wish).

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

## Dynamic Behavior

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
  config: ConfiguredRequest<I, O>,
  db?: any
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

### Connecting the Mock Endpoint to a Mock Database

It is not uncommon that the two primary sources of state are an application's primary database as well as API's that may come from both internal as well as external sources. For the internal API's it is also possible that calling an internal API endpoint will result in changes to the same database that your application uses (or that the internal API endpoint may derive/get some state from that database but not write to it). This use-case increases substantially when you use a database like Firebase's Real-Time Database or Firestore. Both of these databases provide a convenient means for the client apps to interact directly with the database but there are use cases where a backend is needed to deal with more complicated authentication/authorization business logic.

To address this, a `ConfiguredRequest` allows you to optionally pass along a "db" reference at run time. This reference is is intended to provide your mock function the means to interact with a database (in most cases this would be a _mock_ database or static object representing a shared data state for the front and backend to share ). Imagine an example where the API access for an app has a simple `get`/`set` API not dissimlar to a lot of document/no-sql databases and that the frontend calls the mock with the following:

```typescript
const db = new myMockDatabase({ products: { 1234: { name: "snazzy" } } });
const product = await ProductDetail.mock({ id: "1234" }, { db });
```

With this request the mock function get's not only the standard `ActiveRequest` object but also the `db` property and can respond in the following way:

```typescript
export mockFn = async (context: ConfigureRequest<undefined, {product: Product}>, { db }) => {
  if(db) {
    const product = await db.get(Product, "1234");
    return product;
  } else {
    // ok no shared DB so just fake it
    return {
      name: "The Magic Carpet",
      price: 10000000
    }
  }
}
```

In the above example the mock function doesn't _assume_ that it will get a DB connection but if it does it can do more.

> the above example is loosely modeled off the interaction/api you might use with a mock DB from [Firemodel](https://firemodel.info) but any API is supported and therefore the **db** property is typed as `all` in `IApiMock` type.

```typescript
export interface IApiMock<I extends IApiInput, O> {
  (request: ActiveRequest<I, O>, options: IAllRequestOptions): Promise<O>;
}

export interface IAllRequestOptions<M = any> {
  db: M;
  // ...
}
```

If you really want to narrow the typing for DB at _design time_ you can by passing in the type like so:

```typescript
const MyConfiguredRequest = ConfiguredRequest.get<
  Request,
  Response,
  Intermediate,
  DB
>("https://somewhere.com")
  .mockFn(mock)
  .seal();
```

In most cases, however, this level of typing is not critical to enforce at design time as the runtime environment _should_ have all the typing for the function and thereby the real source of value for the typing is achieved.

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
