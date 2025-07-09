// treat logging as no side effect
export function debug(debugFlag: boolean, ...args: any[]) {
  debugFlag && console.log(...args);
}
