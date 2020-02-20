import { Scalar } from "../index";
import { IDynamicProperty, IApiInput, IApiOutput } from "../cr-types";
export declare function dynamic<V = Scalar | undefined>(defaultValue?: V, required?: boolean): <I extends IApiInput, O extends IApiOutput>(prop: keyof O & string) => IDynamicProperty<I, O, V>;
