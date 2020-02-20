import { ConfiguredRequest } from "../../src";
import Axios from "axios";

/**
 * Returns the count of Products that are available on the
 * iHeartJane platform.
 */
export const ProductCount = ConfiguredRequest.get<
  {},
  { number_of_products: number }
>("https://www.iheartjane.com/api/v1/products_count").seal();

(async () => {
  // const result = await ProductCount.request();
  const result = await Axios.get(
    "https://www.iheartjane.com/api/v1/products_count"
  );
  console.log(result.data);
  console.log(await ProductCount.request());
})();
