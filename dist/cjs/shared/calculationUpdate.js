"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function calculationUpdate(library, location, newItems) {
    return library
        .filter(i => i.location === location)
        .concat(...newItems.map(ni => (Object.assign(Object.assign({}, ni), { location }))));
}
exports.calculationUpdate = calculationUpdate;
