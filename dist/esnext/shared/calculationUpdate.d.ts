import { ICalcSymbolOutput, DynamicStateLocation, KnownLocation } from "../cr-types";
export declare function calculationUpdate<I, O>(library: KnownLocation<ICalcSymbolOutput<I, O>>[], location: DynamicStateLocation, newItems: ICalcSymbolOutput<I, O>[]): KnownLocation<ICalcSymbolOutput<I, O>>[];
