import {
  DynamicStateLocation,
  ICalcSymbolOutput,
  KnownLocation
} from "../cr-types";

export function calculationUpdate<I>(
  library: KnownLocation<ICalcSymbolOutput<I>>[],
  location: DynamicStateLocation,
  newItems: ICalcSymbolOutput<I>[]
): KnownLocation<ICalcSymbolOutput<I>>[] {
  return  library.concat(...library
    .filter(i => i.location === location)
    .concat(...newItems.map(ni => ({ ...ni, location }))));
}
