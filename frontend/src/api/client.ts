import axios from "axios";

const client = axios.create({ baseURL: "/api" });

client.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg: string =
      err.response?.data?.error ??
      err.response?.data?.message ??
      err.message ??
      "Something went wrong";
    return Promise.reject(new Error(msg));
  }
);

export default client;
