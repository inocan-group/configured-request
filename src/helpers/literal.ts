import { LITERAL_TYPE } from "../cr-types";

export function literal(value: string) {
  return { type: LITERAL_TYPE, value };
}
