/**
 * A helper function to handle errors in asynchronous code without the need for try-catch blocks.
 * It wraps a promise and returns a tuple where the first element is an error (if any) and the second is the resolved data.
 *
 * @template T - The type of the promise result.
 *
 * @param {Promise<T>} promise - The promise to handle errors for.
 * @returns {Promise<[undefined, T] | [Error | unknown | undefined]>} A promise that resolves to a tuple:
 *  - On success: `[undefined, T]` where `T` is the resolved value of the passed promise.
 *  - On error: `[Error | unknown]` where the first element is the caught error.
 */
export async function catchErrorPromise<T>(
  promise: Promise<T>
): Promise<[undefined, T] | [Error | unknown | undefined]> {
  try {
    const data = await promise;
    return [undefined, data] as [undefined, T];
  } catch (error: Error | unknown) {
    return [error];
  }
}

/**
 * A helper function to handle errors for a function that takes arguments.
 * It wraps a function and its arguments, and returns a tuple where the first element is an error (if any) and the second is the result.
 *
 * @template T - The type of the function result.
 *
 * @param {(x: any) => any} func - The function to handle errors for.
 * @param {any[]} func_var - The arguments to pass to the function.
 * @returns {[undefined, T] | [Error | unknown | undefined]} A tuple:
 *  - On success: `[undefined, T]` where `T` is the result of the function.
 *  - On error: `[Error | unknown]` where the first element is the caught error.
 */
export function catchError<T>(
  func: (...args: any[]) => T,
  func_var: any[]
): [undefined, T] | [Error | unknown | undefined] {
  try {
    const data = func(...func_var);
    return [undefined, data] as [undefined, T];
  } catch (error: Error | unknown) {
    return [error];
  }
}
