import React, { useState } from 'react';
import { Form, Input, Button, message, Checkbox, Tabs } from 'antd';
import { UserOutlined, LockOutlined, MobileOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import './Login.css';

interface LoginForm {
  username: string;
  password: string;
  remember?: boolean;
}

interface MobileLoginForm {
  mobile: string;
  captcha: string;
  remember?: boolean;
}

type TabKey = 'account' | 'mobile';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('account');
  const [form] = Form.useForm();
  const [mobileForm] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values: LoginForm) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/login', values);
      
      if (response.data && response.data.user) {
        // 保存用户信息和token
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        
        if (values.remember) {
          localStorage.setItem('rememberedUser', values.username);
        } else {
          localStorage.removeItem('rememberedUser');
        }
        
        localStorage.setItem('user', JSON.stringify(response.data.user));
        message.success('登录成功');
        
        // 根据用户角色进行跳转
        const role = response.data.user.role;
        if (role === 'STUDENT') {
          navigate('/student/dashboard');
        } else if (role === 'TEACHER') {
          navigate('/teacher/dashboard');
        } else if (role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleMobileLogin = async (values: MobileLoginForm) => {
    setLoading(true);
    try {
      // 这里是模拟的手机登录接口
      const response = await axios.post('/api/auth/mobile-login', values);
      
      if (response.data && response.data.user) {
        if (values.remember) {
          localStorage.setItem('rememberedUser', values.mobile);
        } else {
          localStorage.removeItem('rememberedUser');
        }
        
        localStorage.setItem('user', JSON.stringify(response.data.user));
        message.success('登录成功');
        navigate('/dashboard');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '登录失败，请检查手机号和验证码');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCaptcha = async () => {
    try {
      const values = await mobileForm.validateFields(['mobile']);
      setCaptchaLoading(true);
      
      // 模拟发送验证码
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success(`验证码已发送至 ${values.mobile}`);
    } catch (error) {
      // 表单验证失败
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key as TabKey);
  };

  const tabItems = [
    {
      key: 'account',
      label: '账号密码登录',
      children: (
        <Form
          form={form}
          name="login"
          initialValues={{
            remember: true,
            username: localStorage.getItem('rememberedUser') || ''
          }}
          onFinish={handleLogin}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 4, message: '用户名至少4个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请输入用户名" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请输入密码" 
            />
          </Form.Item>

          <Form.Item>
            <div className="login-form-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
              <Button type="link" className="login-form-forgot">
                忘记密码?
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="login-form-footer">
              <span>还没有账号？</span>
              <Button type="link" onClick={() => navigate('/register')}>
                立即注册
              </Button>
            </div>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'mobile',
      label: '手机号登录',
      children: (
        <Form
          form={mobileForm}
          name="mobileLogin"
          initialValues={{ remember: true }}
          onFinish={handleMobileLogin}
          size="large"
        >
          <Form.Item
            name="mobile"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' }
            ]}
          >
            <Input 
              prefix={<MobileOutlined />} 
              placeholder="请输入手机号" 
            />
          </Form.Item>

          <Form.Item>
            <div className="captcha-row">
              <Form.Item
                name="captcha"
                noStyle
                rules={[
                  { required: true, message: '请输入验证码' },
                  { pattern: /^\d{6}$/, message: '验证码为6位数字' }
                ]}
              >
                <Input 
                  prefix={<KeyOutlined />}
                  placeholder="请输入验证码" 
                />
              </Form.Item>
              <Button 
                onClick={handleSendCaptcha} 
                loading={captchaLoading}
                className="captcha-button"
              >
                获取验证码
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <div className="login-form-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>记住我</Checkbox>
              </Form.Item>
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>

          <Form.Item>
            <div className="login-form-footer">
              <span>还没有账号？</span>
              <Button type="link" onClick={() => navigate('/register')}>
                立即注册
              </Button>
            </div>
          </Form.Item>
        </Form>
      ),
    }
  ];

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1 className="login-title">大学生课外学情记录分析系统</h1>
            <p className="login-subtitle">欢迎使用本系统，请登录您的账号</p>
          </div>
          
          <Tabs
            activeKey={activeTab}
            items={tabItems}
            onChange={handleTabChange}
            centered
            className="login-tabs"
          />
          
          <div className="login-slogan">
            <h2>记录课外学习时光</h2>
            <p>科学分析，助力成长</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 