import { IDictionary } from "common-types";
/**
 * Given a dictionary and set of properties, returns an tuple with [ extracted, remaining ]
 */
export declare function extract<E = IDictionary, R = IDictionary, T = E & R>(input: T, props: string[]): [E, R];
