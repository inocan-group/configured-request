/**
 * Choose a random number between two bounds
 */
export function between(start: number, end: number) {
  const delta = Math.abs(start - end);
  return Math.floor(Math.random() * delta) + start;
}
