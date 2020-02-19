/**
 * Given a dictionary and set of properties, returns an tuple with [ extracted, remaining ]
 */
export function extract(input, props) {
    const extracted = {};
    const remaining = Object.assign({}, input);
    Object.keys(input).forEach((key) => {
        extracted[key] = input[key];
        delete remaining[key];
    });
    return [extracted, remaining];
}
