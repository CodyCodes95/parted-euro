/**
 * Type guard to check if an unknown value is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}
