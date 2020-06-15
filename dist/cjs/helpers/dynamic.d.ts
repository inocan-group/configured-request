import { Scalar } from "../index";
import { IDynamicProperty, IApiInput } from "../cr-types";
export declare function dynamic<V = Scalar | undefined>(defaultValue?: V, required?: boolean): <I extends IApiInput, O extends unknown>(prop: keyof O & string) => IDynamicProperty<I, O, V>;
