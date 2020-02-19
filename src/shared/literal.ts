export const LITERAL_TYPE = "LITERAL_BODY_PAYLOAD";
export function literal(value: string) {
  return { type: LITERAL_TYPE, value };
}
