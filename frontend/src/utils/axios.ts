import axios from 'axios';

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
    
    // 对于multipart/form-data请求，不要修改Content-Type，让浏览器自行设置boundary
    if (config.headers && config.headers['Content-Type'] && 
        typeof config.headers['Content-Type'] === 'string' && 
        config.headers['Content-Type'].includes('multipart/form-data')) {
      // 对于multipart/form-data，保留已设置的Content-Type
    } else if (config.headers) {
      // 对于其他请求，设置Content-Type为application/json
      config.headers['Content-Type'] = 'application/json';
    }
    
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    // 如果是登录接口，保存token
    if (response.config.url === '/api/auth/login' && response.data && response.data.token) {
      console.log('登录成功，保存token');
      localStorage.setItem('token', response.data.token);
    }
    console.log(`API响应成功: ${response.config.url}`);
    return response;
  },
  (error) => {
    if (!error.response) {
      console.error('网络错误或服务器未响应');
      return Promise.reject(error);
    }

    console.error(`响应错误: ${error.message}`);
    
    // 登录相关的API路径
    const authPaths = ['/api/auth/login', '/api/auth/register', '/api/auth/logout'];
    const isAuthPath = error.config && authPaths.some(path => error.config.url?.includes(path));
    
    // 当前是否在登录页
    const isLoginPage = window.location.pathname === '/login' || 
                       window.location.pathname === '/register';
    
    // 处理特定错误状态码
    switch (error.response.status) {
      case 401: // 未授权
        if (!isAuthPath && !isLoginPage) {
          console.log('认证失败，清除用户信息');
          
          // 清除用户信息
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // 显示错误消息但不立即跳转
          console.error('登录已过期，请重新登录');
          
          // 使用setTimeout避免无限循环跳转
          setTimeout(() => {
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          }, 100);
        }
        break;
      case 403: // 禁止访问
        // 403错误不自动跳转，而是让组件处理
        console.error('无权限访问:', error.config?.url);
        break;
      case 400: // 错误请求
        console.error('请求参数错误:', error.response.data);
        break;
      case 404: // 资源不存在
        console.error('请求的资源不存在:', error.config?.url);
        break;
      case 500: // 服务器错误
        console.error('服务器内部错误');
        break;
      default:
        console.error('API错误:', error.response.status, error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default instance; 