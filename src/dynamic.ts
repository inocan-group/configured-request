import { IDictionary } from "common-types";
import { Scalar } from "./index";

export function dynamic<
  T = Scalar,
  K extends IDictionary<Scalar> = IDictionary<Scalar>
>(defaultValue: T = undefined, required: boolean = false) {
  return (prop: keyof K & string) => {
    return {
      prop,
      required,
      defaultValue
    };
  };
}
