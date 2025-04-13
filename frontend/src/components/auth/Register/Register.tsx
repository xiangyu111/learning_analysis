import React, { useState } from 'react';
import { Form, Input, Button, message, Select, Upload, Steps, Card, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined, UploadOutlined, MobileOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import type { UploadFile, RcFile } from 'antd/es/upload/interface';
import './Register.css';

const { Option } = Select;

interface RegisterForm {
  username: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
  mobile: string;
  role: string;
  avatar?: File;
}

const Register: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const steps = [
    {
      title: '账号信息',
      content: (
        <>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 4, message: '用户名至少4个字符' },
              { max: 20, message: '用户名不能超过20个字符' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="请设置用户名" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
            hasFeedback
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请设置密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={['password']}
            hasFeedback
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="请再次输入密码"
            />
          </Form.Item>
        </>
      ),
    },
    {
      title: '个人信息',
      content: (
        <>
          <Form.Item
            name="name"
            label="姓名"
            rules={[
              { required: true, message: '请输入姓名' },
              { max: 20, message: '姓名不能超过20个字符' }
            ]}
          >
            <Input 
              prefix={<TeamOutlined />}
              placeholder="请输入真实姓名" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="请输入邮箱" 
            />
          </Form.Item>

          <Form.Item
            name="mobile"
            label="手机号"
            rules={[
              { required: false, message: '请输入手机号' }
            ]}
          >
            <Input 
              prefix={<MobileOutlined />} 
              placeholder="请输入手机号（选填）" 
            />
          </Form.Item>
        </>
      ),
    },
    {
      title: '角色设置',
      content: (
        <>
          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              <Option value="STUDENT">学生</Option>
              <Option value="TEACHER">教师</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="avatar"
            label="头像"
            extra="支持jpg、png格式，大小不超过2MB"
          >
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={(file) => {
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                if (!isJpgOrPng) {
                  message.error('只能上传JPG/PNG格式的图片!');
                  return Upload.LIST_IGNORE;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('图片大小不能超过2MB!');
                  return Upload.LIST_IGNORE;
                }
                setFileList([file]);
                return false;
              }}
              fileList={fileList}
              onRemove={() => setFileList([])}
            >
              {fileList.length < 1 && <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>上传头像</div>
              </div>}
            </Upload>
          </Form.Item>
        </>
      ),
    },
  ];

  const next = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields(['username', 'password', 'confirmPassword']);
      } else if (currentStep === 1) {
        await form.validateFields(['name', 'email']);
      }
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // 表单验证失败
    }
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateLastStep = async () => {
    try {
      // 验证最后一步的角色字段
      await form.validateFields(['role']);
      return true;
    } catch (error) {
      return false;
    }
  };

  const onFinish = async (values: RegisterForm) => {
    // 最后一步额外验证
    if (currentStep === steps.length - 1) {
      const isLastStepValid = await validateLastStep();
      if (!isLastStepValid) {
        return;
      }
    }

    // 确保至少验证了所有表单字段
    try {
      await form.validateFields();
    } catch (error) {
      console.error('表单验证失败:', error);
      return;
    }

    setLoading(true);
    try {
      // 获取表单的所有值
      const allValues = form.getFieldsValue(true);
      console.log('表单完整数据:', allValues);

      const formData = new FormData();
      
      // 确保添加所有必填字段
      formData.append('username', allValues.username);
      formData.append('password', allValues.password);
      formData.append('name', allValues.name);
      formData.append('email', allValues.email);
      formData.append('role', allValues.role);
      
      // 打印实际传递的值
      console.log('实际传递的username值:', allValues.username);
      console.log('实际传递的password值:', allValues.password ? '已设置' : '未设置');
      console.log('实际传递的name值:', allValues.name);
      console.log('实际传递的email值:', allValues.email);
      console.log('实际传递的role值:', allValues.role);
      
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append('avatar', fileList[0].originFileObj);
      }
      
      // 调试输出FormData内容
      console.log('FormData包含username:', formData.has('username'));
      console.log('FormData包含password:', formData.has('password'));
      console.log('FormData包含name:', formData.has('name'));
      console.log('FormData包含email:', formData.has('email'));
      console.log('FormData包含role:', formData.has('role'));
      console.log('FormData包含avatar:', formData.has('avatar'));

      // 检查是否缺少必要字段
      if (!formData.has('username') || !formData.has('password') || 
          !formData.has('name') || !formData.has('email') || !formData.has('role')) {
        message.error('表单数据不完整，请检查所有字段');
        console.error('表单数据不完整', {
          username: allValues.username,
          password: allValues.password ? '已设置' : '未设置',
          name: allValues.name,
          email: allValues.email,
          role: allValues.role
        });
        return;
      }

      const response = await axios.post('/api/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        message.success('注册成功，请登录');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('注册错误:', error.response?.data);
      
      // 处理特定字段的错误
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.field && errorData.message) {
          // 字段特定错误
          message.error(errorData.message);
          
          // 如果是用户名已存在，清空用户名字段，跳转到第一步
          if (errorData.field === 'username') {
            form.setFieldsValue({ username: '' });
            setCurrentStep(0);
          }
          
          // 如果是邮箱已存在，清空邮箱字段，跳转到第二步
          if (errorData.field === 'email') {
            form.setFieldsValue({ email: '' });
            setCurrentStep(1);
          }
        } else if (errorData.message) {
          // 一般错误消息
          message.error(errorData.message);
        } else {
          // 直接显示错误响应
          message.error(typeof errorData === 'string' ? errorData : '注册失败，请重试');
        }
      } else {
        // 未知错误
        message.error('注册失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <Card className="register-box">
          <div className="register-header">
            <h1 className="register-title">
              <UserAddOutlined className="register-icon" />
              用户注册
            </h1>
            <p className="register-subtitle">创建您的账号，开始使用系统</p>
          </div>

          <Steps
            current={currentStep}
            items={steps.map(item => ({ key: item.title, title: item.title }))}
            className="register-steps"
          />

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="register-form"
          >
            <div className="steps-content">
              {steps[currentStep].content}
            </div>

            <div className="steps-action">
              {currentStep > 0 && (
                <Button style={{ margin: '0 8px' }} onClick={prev}>
                  上一步
                </Button>
              )}
              {currentStep < steps.length - 1 && (
                <Button type="primary" onClick={next}>
                  下一步
                </Button>
              )}
              {currentStep === steps.length - 1 && (
                <Button type="primary" htmlType="submit" loading={loading}>
                  注册
                </Button>
              )}
            </div>
          </Form>

          <div className="register-footer">
            <span>已有账号？</span>
            <Button type="link" onClick={() => navigate('/login')}>
              立即登录
            </Button>
          </div>
          
          <div className="register-slogan">
            <h2>加入我们</h2>
            <p>记录成长，分析提升</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register; 