import axios from 'axios';
import { message } from 'antd';

// 创建axios实例
const instance = axios.create({
  baseURL: 'http://localhost:8080', // 确保这里的端口与后端端口一致
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 从localStorage获取token添加到请求头
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    console.error('响应错误:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error('错误状态码:', status);
      console.error('错误响应数据:', errorData);
      console.error('请求配置:', error.config);
      
      // 处理不同状态码
      if (status === 401) {
        message.error('登录已过期，请重新登录');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (status === 403) {
        message.error('没有权限访问');
      } else if (status === 404) {
        message.error('请求的资源不存在');
      } else if (status === 400) {
        // 显示后端返回的详细错误信息
        const errorMsg = errorData?.message || '请求参数错误';
        message.error(errorMsg);
      } else {
        // 显示后端返回的错误信息
        const errorMsg = error.response.data || '请求失败，请稍后再试';
        message.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      console.error('请求已发送但无响应:', error.request);
      message.error('服务器无响应，请检查网络连接');
    } else {
      // 请求配置出错
      console.error('请求配置错误:', error.message);
      message.error('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

export default instance; 