import {
  ICalcSymbolOutput,
  DynamicStateLocation,
  KnownLocation
} from "../cr-types";

export function calculationUpdate<I, O>(
  library: KnownLocation<ICalcSymbolOutput<I, O>>[],
  location: DynamicStateLocation,
  newItems: ICalcSymbolOutput<I, O>[]
): KnownLocation<ICalcSymbolOutput<I, O>>[] {
  return library
    .filter(i => i.location === location)
    .concat(...newItems.map(ni => ({ ...ni, location })));
}
