import jwt from "jsonwebtoken";

// Provide types for verified token
type VerifyType = {
  [key: string]: any | unknown;
};

/**
 * Creates a JWT token with a specified expiration time.
 *
 * @param {Object} data - The payload data to be included in the token.
 * @param {Object.<string, any>} data - An object containing the payload data.
 * @returns {Promise<{ token: string, expires: string }>} A promise that resolves with an object containing the token and its expiration time.
 * @throws Will throw an error if token creation fails.
 * @example
 * createToken({ userId: 123 })
 *   .then(result => {
 *     console.log(result.token); // The generated token
 *     console.log(result.expires); // Expiration time in milliseconds
 *   })
 *   .catch(error => {
 *     console.error(error);
 *   });
 */
export const createToken = async (data: { [key: string]: any }) => {
  try {
    // console.log(parseInt(process.env.JWT_TOKEN_EXPIRE));
    const hrs = 3600000 * parseInt(process.env.JWT_TOKEN_EXPIRE || "");
    // console.log({ hrs });

    const newHrs = String(Date.now() + hrs);
    // console.log({ newHrs, JWT_TOKEN_EXPIRE: process.env.JWT_TOKEN_EXPIRE });

    const token = await jwt.sign({ data }, process.env.SALT || "", {
      expiresIn: `${process.env.JWT_TOKEN_EXPIRE || ""}h`,
    });
    return { token, expires: String(newHrs) };
  } catch (err) {
    throw err;
  }
};

/**
 * Creates a system JWT token without an expiration time.
 *
 * @param {Object} data - The payload data to be included in the token.
 * @param {Object.<string, any>} data - An object containing the payload data.
 * @returns {Promise<{ token: string, expires: string }>} A promise that resolves with an object containing the token and a "never" expiration time.
 * @throws Will throw an error if token creation fails.
 * @example
 * createSystemToken({ systemId: 456 })
 *   .then(result => {
 *     console.log(result.token); // The generated token
 *     console.log(result.expires); // "never"
 *   })
 *   .catch(error => {
 *     console.error(error);
 *   });
 */
export const createSystemToken = async (data: { [key: string]: any }) => {
  try {
    const token = await jwt.sign({ data }, process.env.SALT || "");
    return { token, expires: "never" };
  } catch (err) {
    throw err;
  }
};

/**
 * Verifies a JWT token and returns the decoded data.
 *
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<VerifyType>} A promise that resolves with the decoded token data.
 * @throws Will throw an error if token verification fails.
 * @example
 * verifyToken("some.jwt.token")
 *   .then(decoded => {
 *     console.log(decoded); // The decoded token data
 *   })
 *   .catch(error => {
 *     console.error(error);
 *   });
 */
export const verifyToken = async (token: string): Promise<VerifyType> => {
  try {
    const result = jwt.verify(token, process.env.SALT || "") as VerifyType;
    return result;
  } catch (err) {
    throw err;
  }
};
