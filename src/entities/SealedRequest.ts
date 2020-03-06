import { ConfiguredRequest } from "./ConfiguredRequest";
import { IAllRequestOptions, IApiInput, IErrorHandler } from "../cr-types";

export class SealedRequest<I extends IApiInput, O, M = any> {
  private _db: M;
  constructor(private req: ConfiguredRequest<I, O, M>) {}

  /**
   * Make a request to the configured API endpoint
   */
  async request(props?: I, options: IAllRequestOptions = {}) {
    let response: O;
    const isMockRequest = this.requestInfo(props, options).isMockRequest;
    if (isMockRequest && this._db) {
      options = { db: this._db, ...options };
    }
    try {
      response = await this.req.request(props, options);
      this.req.errorHandler(undefined); // reset error
    } catch (e) {
      this.req.errorHandler(undefined); // reset error
      throw e;
    }
    return response;
  }

  /**
   * **useMockDatabase**
   *
   * If you want to pass in a mock database which
   * will be used for all _mock_ requests (and be
   * passed to mock functions as context) you may pass
   * it in here.
   *
   * This property will be _not_ be used when making a real
   * network request.
   *
   * @param db any database mocking API
   */
  public useMockDatabase(db: M) {
    this._db = db;
    return this;
  }

  /**
   * Make a request to the **Mock** API.
   *
   * Note: if there is no mock function configured for this
   * API then this will throw a `mock-not-ready` error.
   */
  async mock(props?: I, options: IAllRequestOptions = {}) {
    return this.request(props, { ...options, mock: true });
  }

  /**
   * Get information about the API request structure, given
   * the passed in dynamic props
   */
  requestInfo(props?: Partial<I>, options: IAllRequestOptions = {}) {
    return this.req.requestInfo(props, options);
  }

  /**
   * If you want to pass in an error handler you can be notified
   * of all errors. If you return `false` the error will _still_ be
   * thrown but any other value will be passed back as the `data`
   * property of the response.
   */
  errorHandler(eh: IErrorHandler) {
    this.req.errorHandler(eh);
    return this;
  }

  toString() {
    return this.req.toString();
  }

  toJSON() {
    return this.req.toJSON();
  }
}
