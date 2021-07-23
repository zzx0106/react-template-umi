import { get, post, url } from "@/utils/http";
import { i_api_login } from "./module1.i";

/**
 * 登录
 * @param params
 * @returns
 */
export const api_login = (params: i_api_login.res) => {
  return post<i_api_login.req>(`${url.api}/login`, { params });
};
