import { createToken } from "../utils/jwt";
import { generateString as g, getRandomNumber } from "../utils/helpers";

export default class ReturnAPIController {
  static async post_return(api_key: string, url: string, data: any) {
    try {
      const { token } = await createToken({
        api_key_sig: api_key.split(".")[1],
        api_gen_code: `${g(15)}.${g(10)}.${g(8)}`,
        url,
      });

      const raw = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          credentials: "include",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const resData = await raw.json();

      return resData;
    } catch (error) {
      throw error;
    }
  }
}
