export function dynamic(defaultValue = undefined, required = false) {
    return (prop) => {
        return {
            prop,
            required,
            defaultValue
        };
    };
}
