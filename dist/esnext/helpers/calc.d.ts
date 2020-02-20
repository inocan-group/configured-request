import { IApiInput, IDynamicCalculator, IApiOutput, ICalcSymbolOutput } from "../cr-types";
export declare function calc<I extends IApiInput, O extends IApiOutput>(fn: IDynamicCalculator<I, O>): (prop: keyof I & string) => ICalcSymbolOutput<I, O>;
