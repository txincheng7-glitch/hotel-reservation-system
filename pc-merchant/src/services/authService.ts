import axios from 'axios';
import type { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, LogoutResponse } from '../types/auth';

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api', // 使用相对路径，由Vite代理处理
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 登录接口
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return response.data;
  } catch (error: any) {
    console.error('登录请求错误:', error);
    console.error('错误响应:', error.response);
    if (error.response) {
      // 服务器返回了错误响应
      throw new Error(`登录失败: ${error.response.data?.message || `状态码 ${error.response.status}`}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      throw new Error('登录失败: 服务器无响应，请检查网络连接');
    } else {
      // 请求配置出错
      throw new Error(`登录失败: ${error.message}`);
    }
  }
};

// 注册接口
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', data);
  return response.data;
};

// 登出接口
export const logout = async (): Promise<LogoutResponse> => {
  const token = localStorage.getItem('token');
  const response = await api.post<LogoutResponse>('/auth/logout', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 刷新 token 接口
export const refreshToken = async (): Promise<LoginResponse> => {
  const token = localStorage.getItem('token');
  const response = await api.post<LoginResponse>('/auth/refresh', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

// 获取用户信息接口
export const getUserInfo = async (): Promise<LoginResponse> => {
  const token = localStorage.getItem('token');
  const response = await api.post<LoginResponse>('/auth/me', {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export default {
  login,
  register,
  logout,
  refreshToken,
  getUserInfo,
};