import {
  DynamicSymbol,
  IApiInput,
  IApiOutput,
  ICalcSymbolOutput,
  IDynamicCalculator
} from "../cr-types";

export function calc<I extends IApiInput, O extends IApiOutput>(
  fn: IDynamicCalculator<I>
) {
  // the
  return (prop: keyof I & string) => {
    return {
      symbol: DynamicSymbol.calc,
      prop,
      fn
    } as ICalcSymbolOutput<I>;
  };
}
