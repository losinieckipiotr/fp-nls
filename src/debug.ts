/**
 * Debug implementation
 * @param debugFlag if true prints rest arguments to console
 */
export function debug(debugFlag: boolean, ...args: any[]) {
  if (debugFlag) {
    console.log(...args);
  }
}