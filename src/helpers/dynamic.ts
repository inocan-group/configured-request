import { Scalar } from "../index";
import {
  IDynamicProperty,
  IApiInput,
  DynamicSymbol,
  IApiOutput
} from "../cr-types";

export function dynamic<V = Scalar | undefined>(
  defaultValue: V = undefined,
  required: boolean = false
) {
  return <I extends IApiInput, O extends IApiOutput>(
    prop: keyof O & string
  ) => {
    // return a IDynamicProperty
    return {
      symbol: DynamicSymbol.dynamic,
      prop,
      required,
      defaultValue
    } as IDynamicProperty<I, O, V>;
  };
}
