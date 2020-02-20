import { DynamicSymbol } from "../cr-types";
export function calc(fn) {
    // the
    return (prop) => {
        return {
            symbol: DynamicSymbol.calc,
            prop,
            fn
        };
    };
}
