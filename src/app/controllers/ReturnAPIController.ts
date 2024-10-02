export default class ReturnAPIController {
  static async post_return(api_key: string, url: string, data: any) {
    try {
      const raw = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
          credentials: "include",
          Authorization: `Bearer ${api_key}`,
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
