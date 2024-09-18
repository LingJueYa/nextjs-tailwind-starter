// // 登录 & 注册 验证

// import * as Yup from "yup";

// //注册表单验证规则
// export const registerSchema = Yup.object().shape({
//   username: Yup.string()
//     .min(3, "至少3个字符")
//     .max(10, "最多10个字符")
//     .required("必填项哦"),
//   password: Yup.string()
//     .min(6, "至少6个字符")
//     .max(12, "最多12个字符")
//     .required("必填项哦"),
//   nickname: Yup.string()
//     .min(3, "至少3个字符")
//     .max(12, "最多12个字符")
//     .required("必填项哦"),
// });
// // 登陆表单验证规则
// export const loginSchema = Yup.object().shape({
//   username: Yup.string().required("必填"),
//   password: Yup.string().required("必填"),
// });
