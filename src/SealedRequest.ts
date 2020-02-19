import { ConfiguredRequest } from "./ConfiguredRequest";
import { IDictionary } from "common-types";
import { IRequestInfo } from "./cr-types";

export class SealedRequest<I, O> {
  constructor(private req: ConfiguredRequest<I, O>) {}

  /**
   * Make a request to the configured API endpoint
   */
  async request(props?: I, options: IDictionary = {}) {
    return this.req.request(props, options);
  }

  /**
   * Get information about the API request structure, given
   * the passed in dynamic props
   */
  requestInfo(props?: Partial<I>): IRequestInfo {
    return this.req.requestInfo(props);
  }

  toString() {
    return this.req.toString();
  }

  toJSON() {
    return this.req.toJSON();
  }
}
