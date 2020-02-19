import { IDictionary } from "common-types";
import { Scalar } from "./index";
export declare function dynamic<T = Scalar, K extends IDictionary<Scalar> = IDictionary<Scalar>>(defaultValue?: T, required?: boolean): (prop: keyof K & string) => {
    prop: keyof K & string;
    required: boolean;
    defaultValue: T;
};
