import {
  DynamicStateLocation,
  IApiOutput,
  IDynamicSymbolOutput,
  KnownLocation
} from "../cr-types";

export function dynamicUpdate<V>(
  library: KnownLocation<IDynamicSymbolOutput<any>>[],
  location: DynamicStateLocation,
  newItems: IDynamicSymbolOutput<any>[]
): KnownLocation<IDynamicSymbolOutput<any>>[] {
  return library
    .filter(i => i.location === location)
    .concat(...newItems.map(ni => ({ ...ni, location })));
}
