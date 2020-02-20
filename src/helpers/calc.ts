import {
  IApiInput,
  IDynamicCalculator,
  DynamicSymbol,
  IApiOutput,
  ICalcSymbolOutput
} from "../cr-types";

export function calc<I extends IApiInput, O extends IApiOutput>(
  fn: IDynamicCalculator<I, O>
) {
  // the
  return (prop: keyof I & string) => {
    return {
      symbol: DynamicSymbol.calc,
      prop,
      fn
    } as ICalcSymbolOutput<I, O>;
  };
}
