import { DynamicStateLocation, ICalcSymbolOutput, KnownLocation } from "../cr-types";
export declare function calculationUpdate<I>(library: KnownLocation<ICalcSymbolOutput<I>>[], location: DynamicStateLocation, newItems: ICalcSymbolOutput<I>[]): KnownLocation<ICalcSymbolOutput<I>>[];
