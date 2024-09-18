// global.d.ts
declare module "*.svg" {
  const value: string;
  export default value;
}
declare module "*.webp" {
  const value: string;
  export default value;
}
declare module "*.avif" {
  const value: string;
  export default value;
}
declare module "*.md" {
  const value: string;
  export default value;
}
declare module "*.json" {
  const value: unknown;
  export default value;
}
// 环境变量
// @types/env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    BASE_API_URL: string; // 环境变量案例
  }
}
