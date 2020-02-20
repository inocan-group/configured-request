import {
  DynamicStateLocation,
  KnownLocation,
  IDynamicSymbolOutput,
  IApiOutput
} from "../cr-types";

export function dynamicUpdate<V, O extends IApiOutput>(
  library: KnownLocation<IDynamicSymbolOutput<any, O>>[],
  location: DynamicStateLocation,
  newItems: IDynamicSymbolOutput<any, O>[]
): KnownLocation<IDynamicSymbolOutput<any, O>>[] {
  return library
    .filter(i => i.location === location)
    .concat(...newItems.map(ni => ({ ...ni, location })));
}
