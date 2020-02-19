import { IDictionary } from "common-types";

/**
 * Given a dictionary and set of properties, returns an tuple with [ extracted, remaining ]
 */
export function extract<E = IDictionary, R = IDictionary, T = E & R>(
  input: T,
  props: string[]
): [E, R] {
  const extracted: IDictionary = {};
  const remaining = { ...input };
  Object.keys(input).forEach((key: string & keyof T) => {
    extracted[key] = input[key];
    delete remaining[key];
  });

  return [extracted as E, (remaining as unknown) as R];
}
