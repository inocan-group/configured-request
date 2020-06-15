import { IApiInput, IApiOutput, ICalcSymbolOutput, IDynamicCalculator } from "../cr-types";
export declare function calc<I extends IApiInput, O extends IApiOutput>(fn: IDynamicCalculator<I>): (prop: keyof I & string) => ICalcSymbolOutput<I>;
