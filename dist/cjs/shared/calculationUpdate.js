"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculationUpdate = void 0;
function calculationUpdate(library, location, newItems) {
    return library.concat(...library
        .filter(i => i.location === location)
        .concat(...newItems.map(ni => (Object.assign(Object.assign({}, ni), { location })))));
}
exports.calculationUpdate = calculationUpdate;
