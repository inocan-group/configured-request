import { DynamicStateLocation, KnownLocation, IDynamicSymbolOutput, IApiOutput } from "../cr-types";
export declare function dynamicUpdate<V, O extends IApiOutput>(library: KnownLocation<IDynamicSymbolOutput<any, O>>[], location: DynamicStateLocation, newItems: IDynamicSymbolOutput<any, O>[]): KnownLocation<IDynamicSymbolOutput<any, O>>[];
