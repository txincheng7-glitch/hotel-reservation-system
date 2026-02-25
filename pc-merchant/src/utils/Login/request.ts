import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { getToken } from "./auth";

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: "/api",
  timeout: 1000000,
});

// request拦截器
service.interceptors.request.use(
  (config: import("axios").InternalAxiosRequestConfig) => {
    // Ensure headers are always defined
    if (!config.headers) {
      config.headers = new axios.AxiosHeaders();
    }
    const isToken = (config.headers as any)["isToken"] === false;
    if (getToken() && !isToken) {
      (config.headers as any)["Authorization"] = getToken();
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// response拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {
    const code = (res.data && res.data.code) || 200;
    if (code === 401) {
      return res.data;
    } else if (code === 500) {
      return Promise.reject(new Error(res.data.msg));
    } else {
      return res.data;
    }
  },
  (err) => {
    let { message } = err as any;
    if (message === "Network Error") {
      message = "后端接口连接异常";
    } else if (message.includes("timeout")) {
      message = "系统接口请求超时";
    } else if (message.includes("Request failed with status code")) {
      message = "系统接口" + message.substr(message.length - 3) + "异常";
    }
    // 使用浏览器提示替代 Element Plus 的 ElMessage
    // 保持简洁：改为 alert，调用方可替换为更友好的通知组件
    try {
      // eslint-disable-next-line no-alert
      alert(message);
    } catch (e) {
      // ignore
    }
    return Promise.reject(err);
  }
);

export default service;
