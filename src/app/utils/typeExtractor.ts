/**
 * Represents the primitive types supported by the `typeExtractor` function.
 * @typedef {"string" | "number" | "boolean" | "bigint" | "hexadecimal" | "undefined" | "object" | "array" | "function" | "async function" | "null"} PrimitiveType
 */
type PrimitiveType =
  | string
  | number
  | bigint
  | boolean
  | undefined
  | object
  | null
  | Date;
/**
 * Represents the result of the `typeExtractor` function, which includes any potential error
 * and the type and value extracted.
 *
 * @template T - The type of the value being processed.
 * @typedef {[Error | null | undefined, [PrimitiveType, T | undefined | null] | null]} TypeResult
 */
type TypeResult<T> = [
  Error | null | undefined,
  [PrimitiveType, T | PrimitiveType] | null
];

/**
 * Checks if a string is a valid date in ISO format or MM/DD/YYYY format.
 *
 * @param {string} value - The string to check
 * @returns {boolean} True if the string represents a valid date
 */
function isValidDateString(value: string): boolean {
  const dateRegex =
    /^(?:\d{4}-\d{2}-\d{2}|(?:\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)|\d{2}\/\d{2}\/\d{4})$/;

  if (!dateRegex.test(value)) {
    return false;
  }

  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Extracts the type and value of the provided input, attempting conversions for strings
 * that represent numbers or JSON objects.
 *
 * @template T - The type of the value being processed.
 * @param {T} [value] - The value whose type and content are to be analyzed.
 * @returns {TypeResult<T>} A tuple where the first element is an Error (if any) and the
 * second element is a tuple of the detected primitive type and the value (or null if an error occurred).
 *
 *
 * @example
 *
 * const [err1, result1] = typeExtractor("1");
 * console.log(result1); // ['number', 1]
 *
 * const [err2, result2] = typeExtractor("9007199254740991");
 * console.log(result2); // ['number', 9007199254740991]
 *
 * const [err3, result3] = typeExtractor("9007199254740992");
 * console.log(result3); // ['bigint', 9007199254740992n]
 *
 * const [err4, result4] = typeExtractor("123n");
 * console.log(result4); // ['bigint', 123n]
 *
 * const [err5, result5] = typeExtractor(BigInt(123));
 * console.log(result5); // ['bigint', 123n]
 *
 * const [err6, result6] = typeExtractor("hello");
 * console.log(result6); // ['string', "hello"]
 *
 * const [err7, result7] = typeExtractor('{"name": "Dwight", "age": 32}');
 * console.log(result7); // ['json', { name: "Dwight", age: 32 }]
 *
 * const [err8, result8] = typeExtractor("123.45");
 * console.log(result8); // ['number', 123.45]
 *
 * const [err9, result9] = typeExtractor("-9007199254740992n");
 * console.log(result9); // ['bigint', -9007199254740992n]
 *
 * const [err10, result10] = typeExtractor(42);
 * console.log(result10); // ['number', 42]
 *
 * const [err11, result11] = typeExtractor("#FF0000FF"); // With alpha channel
 * console.log(result11); // ['hexadecimal', '#FF0000FF']
 *
 * const [err12, result12] = typeExtractor("0xFFFFFFFF"); // Large hex number
 * console.log(result12); // ['hexadecimal', '0xFFFFFFFF']
 *
 * const [err2, result2] = typeExtractor("2024-03-15"); // yyyy-mm-dd
 * console.log(result2); // ['date', Date object]
 *
 * const [err3, result3] = typeExtractor("2024-03-15T14:30:00Z"); // yyyy-mm-ddTHH-mm-ssZ
 * console.log(result3); // ['date', Date object]
 *
 * const [err4, result4] = typeExtractor("03/15/2024"); // mm/dd/yyyy
 * console.log(result4); // ['date', Date object]
 *
 * const [err5, result5] = typeExtractor(new Date());
 * console.log(result5); // ['date', Date object]
 */
function typeExtractor<T>(value?: T | string): TypeResult<T | string> {
  try {
    // Handle undefined case
    if (value === undefined) {
      return [null, ["undefined", undefined]];
    }

    // Handle null case
    if (value === null) {
      return [null, ["null", null]];
    }

    // Handle Date objects directly
    if (value instanceof Date && !isNaN(value.getTime())) {
      return [null, ["date", value]];
    }

    // Handle string cases
    if (typeof value === "string") {
      // Check for date formats
      // Check for date formats first
      if (isValidDateString(value)) {
        return [null, ["date", new Date(value) as unknown as T]];
      }

      // Check for hexadecimal formats
      const hexRegex =
        /^(0x[0-9A-Fa-f]+|#[0-9A-Fa-f]{3,8}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
      if (hexRegex.test(value)) {
        let normalizedHex = value;

        // Convert short hex color (#RGB) to full form (#RRGGBB)
        if (value.startsWith("#") && value.length === 4) {
          normalizedHex =
            "#" +
            value[1] +
            value[1] +
            value[2] +
            value[2] +
            value[3] +
            value[3];
        }

        // Add # prefix if it's a bare hex color
        if (!value.startsWith("0x") && !value.startsWith("#")) {
          normalizedHex = "#" + value;
        }

        return [null, ["hexadecimal", normalizedHex as T]];
      }
      // Check if string represents a BigInt
      if (value.match(/^-?\d+n$/) || value.match(/^-?\d{16,}$/)) {
        try {
          const bigIntValue = BigInt(value.replace("n", ""));
          return [null, ["bigint", bigIntValue as T]];
        } catch {
          // If BigInt conversion fails, continue to number check
        }
      }
      // Check if string is a valid number
      const numberValue = Number(value);
      if (!isNaN(numberValue) && value !== "") {
        // Check if the number needs to be BigInt
        if (
          numberValue > Number.MAX_SAFE_INTEGER ||
          numberValue < Number.MIN_SAFE_INTEGER
        ) {
          try {
            const bigIntValue = BigInt(value);
            return [null, ["bigint", bigIntValue as T]];
          } catch {
            // If BigInt conversion fails, return as regular number
          }
        }
        return [null, ["number", numberValue as T]];
      }

      // Try parsing JSON
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed === "object" && parsed !== null) {
          return [
            null,
            [Array.isArray(parsed) ? "array" : "object", parsed as T],
          ];
        }
        // If JSON.parse succeeds but result is primitive, fall through to regular type checking
        value = parsed as T;
      } catch {
        // Not valid JSON, return as string
        return [null, ["string", value]];
      }
    }

    // Handle other primitive types
    const type = typeof value as PrimitiveType;
    return [null, [type, value]];
  } catch (error) {
    return [error instanceof Error ? error : new Error("Unknown error"), null];
  }
}

export { typeExtractor, PrimitiveType, TypeResult };
