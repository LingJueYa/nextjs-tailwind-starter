import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    requiresAuth?: boolean; // 是否需要携带token
  }
}
