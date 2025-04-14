import axios from 'axios';
import { message } from 'antd';

// 创建axios实例
const instance = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10秒超时
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    // 添加日志，便于调试
    console.log(`请求API: ${config.method?.toUpperCase()} ${config.url}`);
    
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('添加Authorization头:', `Bearer ${token}`);
    }
    
    return config;
  },
  (error) => {
    console.error('请求拦截器错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    console.log(`API响应成功: ${response.config.url}`);
    
    // 如果是登录接口，保存token
    if (response.config.url === '/api/auth/login' && response.data && response.data.token) {
      console.log('登录成功，保存token');
      localStorage.setItem('token', response.data.token);
      
      // 保存用户信息
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('用户信息已保存');
      }
    }
    
    return response;
  },
  (error) => {
    console.error('响应错误:', error);
    
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      console.error('错误状态码:', status);
      console.error('错误响应数据:', errorData);
      console.error('请求配置:', error.config);
      
      // 处理特定错误状态码
      switch (status) {
        case 401: // 未授权
          message.error('登录已过期，请重新登录');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // 使用setTimeout避免无限循环跳转
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 100);
          break;
        case 403: // 禁止访问
          message.error('您没有权限执行此操作');
          console.error('无权限访问:', error.config?.url);
          
          // 当访问管理员API或班级API时，如果返回403，可能是token格式问题
          if (error.config?.url?.includes('/api/admin/') || error.config?.url?.includes('/api/classes/')) {
            console.log('检测到403权限错误，清除token并处理');
            
            // 打印当前的token以便调试
            const currentToken = localStorage.getItem('token');
            console.log('当前token值:', currentToken);
            
            // 清除现有token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // 如果是在特定页面（如学生管理），给出更明确的提示
            if (window.location.pathname.includes('/admin/students')) {
              message.info('学生管理访问授权失败，请重新登录');
            } else {
              message.info('授权验证失败，请重新登录');
            }
            
            // 使用setTimeout避免无限循环，直接跳转到登录页而不是刷新
            setTimeout(() => {
              if (window.location.pathname !== '/login') {
                window.location.href = '/login';
              }
            }, 500); // 增加延迟，确保用户能看到提示信息
          }
          break;
        case 400: // 错误请求
          // 显示后端返回的详细错误信息
          const errorMsg = errorData?.message || '请求参数错误';
          message.error(errorMsg);
          break;
        case 404: // 资源不存在
          message.error('请求的资源不存在');
          break;
        case 500: // 服务器错误
          message.error('服务器内部错误，请稍后再试');
          break;
        default:
          // 显示后端返回的错误信息
          const defaultErrorMsg = errorData?.message || `请求失败 (${status})，请稍后再试`;
          message.error(typeof defaultErrorMsg === 'string' ? defaultErrorMsg : JSON.stringify(defaultErrorMsg));
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