// API 通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
  timestamp?: number;
  path?: string;
}

// 登录请求参数
export interface LoginRequest {
  username: string;
  password: string;
}

// 注册请求参数
export interface RegisterRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

// 用户信息
export interface UserInfo {
  id: number;
  username: string;
  role: string;
  email?: string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 登录响应数据
export interface LoginResponseData {
  token: string;
  expiresIn: number;
  user: UserInfo;
}

// 登录响应
export interface LoginResponse extends ApiResponse<LoginResponseData> {}

// 注册响应
export interface RegisterResponse extends ApiResponse<UserInfo> {}

// 登出响应
export interface LogoutResponse extends ApiResponse {}