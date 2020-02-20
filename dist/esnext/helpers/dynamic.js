import { DynamicSymbol } from "../cr-types";
export function dynamic(defaultValue = undefined, required = false) {
    return (prop) => {
        // return a IDynamicProperty
        return {
            symbol: DynamicSymbol.dynamic,
            prop,
            required,
            defaultValue
        };
    };
}
