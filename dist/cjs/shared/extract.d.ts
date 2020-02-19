import { IDictionary } from "common-types";
export declare function extract<E = IDictionary, R = IDictionary, T = E & R>(input: T, props: string[]): [E, R];
