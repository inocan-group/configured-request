import { IConfiguredApiRequest } from "../cr-types";
export declare function addBodyPayload<I>(request: IConfiguredApiRequest<I>, 
/** a string separator which is used when body type if "formFields"; otherwise ignored */
randomSeed?: string): IConfiguredApiRequest<I>;
