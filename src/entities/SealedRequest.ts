import { ConfiguredRequest } from "./ConfiguredRequest";
import { IRequestInfo, IAllRequestOptions, IApiInput } from "../cr-types";

export class SealedRequest<I extends IApiInput, O> {
  constructor(private req: ConfiguredRequest<I, O>) {}

  /**
   * Make a request to the configured API endpoint
   */
  async request(props?: I, options: IAllRequestOptions = {}) {
    return this.req.request(props, options);
  }

  /**
   * Get information about the API request structure, given
   * the passed in dynamic props
   */
  requestInfo(props?: Partial<I>, options: IAllRequestOptions = {}) {
    return this.req.requestInfo(props, options);
  }

  toString() {
    return this.req.toString();
  }

  toJSON() {
    return this.req.toJSON();
  }
}
