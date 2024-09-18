// axios 封装
// - 如果需要携带 token：请求中加入 { requiresAuth: true }

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface PendingTask {
  config: AxiosRequestConfig;
  resolve: (value: unknown) => void;
  // 参数是可选的（?:），因为 reject 函数可以不带参数调用
  reject: (reason?: unknown) => void;
}

// 单例模式 Axios 实例
class AxiosSingleton {
  private static instance: AxiosInstance | null = null;
  private static twoInstance: AxiosInstance | null = null;
  // 刷新 Token 状态
  private static refreshing = false;
  // 重试次数
  private static retryCount = 0;
  private static MAX_RETRY_COUNT = 1;
  // 存储待处理的请求
  private static queue: PendingTask[] = [];

  private constructor() {}

  // 获取基础 URL，如果 env 没有http://开头，则添加
  private static getBaseURL(url: string): string {
    // 检查 URL 是否以 http:// 或 https:// 开头
    if (!/^https?:\/\//i.test(url)) {
      return `http://${url}`;
    }
    return url;
  }

  // 主实例
  public static getInstance(config?: AxiosRequestConfig): AxiosInstance {
    if (!AxiosSingleton.instance) {
      const baseURL = AxiosSingleton.getBaseURL(
        process.env.BASE_API_URL || "http://localhost:8080/api/v1"
      );
      AxiosSingleton.instance = AxiosSingleton.createInstance(baseURL, config);
    }
    return AxiosSingleton.instance;
  }

  // // 第二个实例
  // public static getTwoInstance(config?: AxiosRequestConfig): AxiosInstance {
  //   if (!AxiosSingleton.twoInstance) {
  //     const twoURL = AxiosSingleton.getBaseURL(
  //       process.env.TWO_API_URL || "https://twoInstance.com"
  //     );
  //     AxiosSingleton.twoInstance = AxiosSingleton.createInstance(
  //       twoURL,
  //       config
  //     );
  //   }
  //   return AxiosSingleton.twoInstance;
  // }

  // 创建 Axios 实例
  private static createInstance(
    baseURL: string,
    config?: AxiosRequestConfig
  ): AxiosInstance {
    const instance = axios.create({
      baseURL,
      timeout: 10000,
      withCredentials: true,
      ...config,
    });

    // 请求拦截器
    instance.interceptors.request.use(
      (config) => {
        const jwtName = process.env.JWT_NAME || "jwt";
        const accessToken = localStorage.getItem(jwtName);
        // 默认情况下，假设不需要身份验证
        const requiresAuth =
          config.requiresAuth !== undefined ? config.requiresAuth : false;
        // 只有在需要身份验证的情况下才添加 Authorization 头
        if (requiresAuth && accessToken) {
          config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => {
        console.error("请求错误(请求拦截器)", error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    instance.interceptors.response.use(
      (response) => {
        const { code, data, message } = response.data;
        // 处理成功响应
        if (code === 200) return data;
        // 处理未授权（401）错误
        if (code === 401) {
          return AxiosSingleton.handle401(response);
        }
        // 处理其他错误
        console.error("响应错误", message);
        return Promise.reject(new Error(message));
      },
      (error) => {
        console.error("响应错误", error);
        return Promise.reject(error);
      }
    );

    return instance;
  }

  // 处理 401 错误
  private static async handle401(response: AxiosResponse) {
    const originalRequest = response.config;

    // 如果正在刷新 token，直接将请求放入队列
    if (AxiosSingleton.refreshing) {
      return new Promise((resolve, reject) => {
        AxiosSingleton.queue.push({ config: originalRequest, resolve, reject });
      });
    }
    // 如果没有正在刷新 token，且重试次数未达到上限，则开始刷新 token
    if (AxiosSingleton.retryCount < AxiosSingleton.MAX_RETRY_COUNT) {
      AxiosSingleton.refreshing = true;
      AxiosSingleton.retryCount++;

      try {
        await AxiosSingleton.refreshToken();
        AxiosSingleton.retryCount = 0; // 重置重试计数

        // 处理队列中的请求
        AxiosSingleton.queue.forEach((task) =>
          task.resolve(AxiosSingleton.instance!.request(task.config))
        );
        AxiosSingleton.queue = [];

        // 重新发送原始请求
        return AxiosSingleton.instance!.request(originalRequest);
      } catch (error) {
        // 刷新失败，清空队列并重定向
        AxiosSingleton.queue.forEach((task) => task.reject(error));
        AxiosSingleton.queue = [];
        // 清空 localStorage
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      } finally {
        AxiosSingleton.refreshing = false; // 刷新完成
      }
    }

    // 重试次数达到上限，重定向用户
    localStorage.clear();
    window.location.href = "/login";
    console.error("用户身份过期，请重新登录");
    return Promise.reject(new Error("用户身份过期，请重新登录"));
  }

  // 刷新 Token
  private static async refreshToken() {
    try {
      const response = await AxiosSingleton.instance!.get("/user/refresh", {
        params: { token: localStorage.getItem("refreshToken") },
      });
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      return response;
    } catch (error) {
      console.error("刷新 token 失败", error);
      localStorage.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }
  }
}

// 获取 Axios 实例
const request = AxiosSingleton.getInstance();
// const twoRequest = AxiosSingleton.getTwoInstance();

export { request };
