"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dynamicUpdate = void 0;
function dynamicUpdate(library, location, newItems) {
    return library
        .filter(i => i.location === location)
        .concat(...newItems.map(ni => (Object.assign(Object.assign({}, ni), { location }))));
}
exports.dynamicUpdate = dynamicUpdate;
