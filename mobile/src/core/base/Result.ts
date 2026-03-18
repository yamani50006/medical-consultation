export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

export const success = <T>(data: T): Result<T> => ({ success: true, data });
export const failure = <E = Error>(error: E): Result<never, E> => ({ success: false, error });

