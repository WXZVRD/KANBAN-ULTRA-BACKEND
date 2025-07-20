const ms = require('ms');
import type { StringValue } from 'ms';

export function getMsFromEnv(value: string, key = 'unknown'): number {
  const result = ms(value as StringValue);
  if (typeof result !== 'number') {
    throw new Error(
      `Environment variable ${key} has invalid time string: ${value}`,
    );
  }
  return result;
}
