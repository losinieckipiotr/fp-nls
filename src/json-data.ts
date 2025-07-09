export type JsonData = { [key: string]: any };

export function isJsonData(value: unknown): value is JsonData {
  if (typeof value == 'object' && value !== null) {
    return Object.values(value)
      .every((v) => typeof v == 'string');
  }
  return false;
}
