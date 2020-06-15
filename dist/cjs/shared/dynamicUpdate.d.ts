import { DynamicStateLocation, IDynamicSymbolOutput, KnownLocation } from "../cr-types";
export declare function dynamicUpdate<V>(library: KnownLocation<IDynamicSymbolOutput<any>>[], location: DynamicStateLocation, newItems: IDynamicSymbolOutput<any>[]): KnownLocation<IDynamicSymbolOutput<any>>[];
