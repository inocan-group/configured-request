/**
 * Choose a random number between two bounds
 */
export function between(start, end) {
    const delta = Math.abs(start - end);
    return Math.floor(Math.random() * delta) + start;
}
