export function dynamicUpdate(library, location, newItems) {
    return library.concat(...library
        .filter(i => i.location === location)
        .concat(...newItems.map(ni => (Object.assign(Object.assign({}, ni), { location })))));
}
