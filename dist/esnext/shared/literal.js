import { LITERAL_TYPE } from "../cr-types";
export function literal(value) {
    return { type: LITERAL_TYPE, value };
}
