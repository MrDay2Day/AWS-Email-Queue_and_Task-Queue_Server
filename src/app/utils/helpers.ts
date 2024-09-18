/**
 * Attempts to parse a JSON string into a specified data type.

 * @template DataType - The expected type of the parsed data.
 * @param {string} jsonString - The JSON string to parse.
 * @returns {DataType | undefined} The parsed data as the specified type, or undefined if parsing fails.
 */
export function checkJSONToData<DataType>(
  jsonString: string
): DataType | undefined {
  try {
    const parsedData = JSON.parse(jsonString);
    return parsedData as DataType;
  } catch (error) {
    return undefined;
  }
}

/**
 *
 * @param {number} min Minimum number
 * @param {number} max Maximum number
 * @returns {number} A random number between
 */
export function getRandomNumber(min: number, max: number): number {
  const value = Math.random() * (max - min) + min;
  return parseInt(value.toFixed(0));
}

/**
 * Generates a random string of the specified length containing at least one uppercase letter, one lowercase letter, one number, and one special character.
 *
 * @param {number} length - The desired length of the generated string.
 * @returns {string} The generated random string.
 * @throws {Error} If the length is less than or equal to 0 or greater than 200.
 */
export function generateString(length: number): string {
  // Check for invalid length
  if (length <= 0 || length > 200) {
    throw new Error("Length must be between 1 and 200 characters");
  }

  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&!";
  let randomString = "";

  for (let i = 0; i < length; i++) {
    randomString += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  const string_regex_special = /[@#$%&!]/;
  const string_regex_num = /[0-9]/;
  const uppercaseRegex = /[A-Z]/;
  const lowercaseRegex = /[a-z]/;

  if (
    !uppercaseRegex.test(randomString) ||
    !string_regex_num.test(randomString) ||
    !lowercaseRegex.test(randomString) ||
    !string_regex_special.test(randomString)
  ) {
    return generateString(length);
  }

  return randomString;
}

/**
 * Selects a random element from an array.
 *
 * @template T - The type of elements in the array.
 * @param {Array<T>} array - The array to select from.
 * @returns {T | undefined} The randomly selected element or undefined if the array is empty.
 */
export function getRandomElement<T>(array: Array<T>): T | undefined {
  // Check for empty array
  if (array.length === 0) {
    return undefined; // Or handle empty array as needed
  }

  // Generate a random index within the array's length
  const randomIndex = Math.floor(Math.random() * array.length);

  // Return the element at the random index
  return array[randomIndex];
}

/**
 * Converts a string to a number if possible.
 *
 * If the provided value is a string representing a valid number, it is converted to a number and returned.
 * If the value is undefined, 0 is returned.
 * If the value cannot be converted to a valid number, 0 is returned.
 *
 * @param {string|undefined} value The value to convert.
 * @returns {number} The converted number or 0 if conversion fails.
 */
export function isStringNumber(value: string | undefined): number {
  if (typeof value === undefined) return 0;
  const num = Number(value);
  if (!Number.isNaN(num) && Number.isFinite(num)) {
    return num;
  } else {
    return 0;
  }
}
