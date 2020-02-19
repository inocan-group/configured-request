import { IDictionary } from "common-types";
import { IApiBodyType, ILiteralType } from "../cr-types";
export declare function bodyToString<I extends object & {
    body: IDictionary;
}>(body: I["body"] | ILiteralType, bodyType: IApiBodyType): any;
