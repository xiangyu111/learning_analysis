import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Form, Input, Button, Avatar, Row, Col, Upload, message, Table, Modal, Space, Select } from 'antd';
import { UserOutlined, UploadOutlined, TeamOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;

interface ProfileProps {
  user: any;
  refreshUserInfo: () => void;
}

interface ClassItem {
  id: number;
  name: string;
  description: string;
  teacher: {
    id: number;
    name: string;
  };
  studentsCount: number;
  students?: Array<any>;
  createdAt: string;
}

interface ApplicationItem {
  id: number;
  classEntity: {
    id: number;
    name: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string;
  rejectReason?: string;
  createdAt: string;
  handledAt?: string;
}

const ProfileCenter: React.FC<ProfileProps> = ({ user, refreshUserInfo }) => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [joinedClasses, setJoinedClasses] = useState<ClassItem[]>([]);
  const [availableClasses, setAvailableClasses] = useState<ClassItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [activeKey, setActiveKey] = useState('1');
  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);

  // 初始化个人资料表单
  useEffect(() => {
    if (user) {
      profileForm.setFieldsValue({
        name: user.name,
        email: user.email,
      });

      // 设置头像
      if (user.avatarUrl) {
        setFileList([
          {
            uid: '-1',
            name: 'avatar',
            status: 'done',
            url: user.avatarUrl,
          },
        ]);
      }
    }
  }, [user, profileForm]);

  // 获取已加入班级
  useEffect(() => {
    const fetchJoinedClasses = async () => {
      try {
        const response = await axios.get('/api/classes/student/joined');
        if (response.data) {
          setJoinedClasses(response.data);
        }
      } catch (error) {
        console.error('获取已加入班级失败:', error);
        message.error('获取已加入班级失败');
      }
    };

    if (user && user.role === 'STUDENT') {
      fetchJoinedClasses();
    }
  }, [user]);

  // 获取可加入班级
  useEffect(() => {
    const fetchAvailableClasses = async () => {
      try {
        const response = await axios.get('/api/classes/student/available');
        if (response.data) {
          setAvailableClasses(response.data);
        }
      } catch (error) {
        console.error('获取可加入班级失败:', error);
        message.error('获取可加入班级失败');
      }
    };

    if (user && user.role === 'STUDENT' && activeKey === '2') {
      fetchAvailableClasses();
    }
  }, [user, activeKey]);

  // 获取申请历史
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        console.log('获取申请历史请求时的token:', localStorage.getItem('token'));
        const response = await axios.get('/api/classes/applications/student');
        if (response.data) {
          setApplications(response.data);
        }
      } catch (error) {
        console.error('获取申请历史失败:', error);
        message.error('获取申请历史失败');
      }
    };

    if (user && user.role === 'STUDENT' && activeKey === '3') {
      fetchApplications();
    }
  }, [user, activeKey]);

  // 修改个人资料
  const updateProfile = async (values: any) => {
    setLoading(true);
    try {
      await axios.put(`/api/users/${user.id}/profile`, values);
      message.success('个人资料更新成功');
      refreshUserInfo();
    } catch (error) {
      console.error('更新个人资料失败:', error);
      message.error('更新个人资料失败');
    } finally {
      setLoading(false);
    }
  };

  // 修改密码
  const changePassword = async (values: any) => {
    setLoading(true);
    try {
      await axios.put(`/api/users/${user.id}/password`, {
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success('密码修改成功');
      passwordForm.resetFields();
    } catch (error: any) {
      console.error('修改密码失败:', error);
      message.error(error.response?.data?.message || '修改密码失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开申请对话框
  const openApplyModal = (classId: number) => {
    setSelectedClassId(classId);
    setApplicationMessage('');
    setApplyModalVisible(true);
  };

  // 提交申请
  const submitApplication = async () => {
    if (!selectedClassId) return;

    setApplyLoading(true);
    try {
      await axios.post(`/api/classes/${selectedClassId}/apply`, {
        message: applicationMessage,
      });
      message.success('申请已提交，请等待教师审批');
      setApplyModalVisible(false);
      
      // 刷新申请历史和可用班级
      const availableResponse = await axios.get('/api/classes/student/available');
      if (availableResponse.data) {
        setAvailableClasses(availableResponse.data);
      }
      
      const applicationsResponse = await axios.get('/api/classes/applications/student');
      if (applicationsResponse.data) {
        setApplications(applicationsResponse.data);
      }
    } catch (error: any) {
      console.error('申请加入班级失败:', error);
      message.error(error.response?.data?.message || '申请加入班级失败');
    } finally {
      setApplyLoading(false);
    }
  };

  // 取消申请
  const cancelApplication = async (applicationId: number) => {
    try {
      await axios.delete(`/api/classes/applications/${applicationId}`);
      message.success('申请已取消');
      
      // 刷新申请历史
      const response = await axios.get('/api/classes/applications/student');
      if (response.data) {
        setApplications(response.data);
      }
    } catch (error: any) {
      console.error('取消申请失败:', error);
      message.error(error.response?.data?.message || '取消申请失败');
    }
  };

  // 已加入班级表格列定义
  const joinedClassesColumns = [
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '教师',
      dataIndex: ['teacher', 'name'],
      key: 'teacher',
    },
    {
      title: '学生人数',
      dataIndex: 'studentsCount',
      key: 'studentsCount',
      render: (_: any, record: ClassItem) => record.students?.length || 0,
    },
    {
      title: '加入时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
  ];

  // 可加入班级表格列定义
  const availableClassesColumns = [
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '教师',
      dataIndex: ['teacher', 'name'],
      key: 'teacher',
    },
    {
      title: '班级描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ClassItem) => (
        <Button 
          type="primary" 
          onClick={() => openApplyModal(record.id)}
          size="small"
        >
          申请加入
        </Button>
      ),
    },
  ];

  // 申请历史表格列定义
  const applicationsColumns = [
    {
      title: '班级名称',
      dataIndex: ['classEntity', 'name'],
      key: 'className',
    },
    {
      title: '申请状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'PENDING') return <Text type="warning"><ClockCircleOutlined /> 待处理</Text>;
        if (status === 'APPROVED') return <Text type="success"><CheckCircleOutlined /> 已批准</Text>;
        if (status === 'REJECTED') return <Text type="danger"><CloseCircleOutlined /> 已拒绝</Text>;
        return status;
      },
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '处理时间',
      dataIndex: 'handledAt',
      key: 'handledAt',
      render: (text: string) => text ? new Date(text).toLocaleDateString() : '-',
    },
    {
      title: '拒绝原因',
      dataIndex: 'rejectReason',
      key: 'rejectReason',
      render: (text: string) => text || '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApplicationItem) => (
        <Space>
          {record.status === 'PENDING' && (
            <Button 
              danger 
              size="small" 
              onClick={() => cancelApplication(record.id)}
            >
              取消申请
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}><UserOutlined /> 个人中心</Title>
      <Tabs activeKey={activeKey} onChange={setActiveKey}>
        <TabPane tab="基本信息" key="1">
          <Row gutter={24}>
            <Col span={12}>
              <Card title="个人资料">
                <Form 
                  form={profileForm}
                  layout="vertical"
                  onFinish={updateProfile}
                >
                  <Form.Item
                    name="avatar"
                    label="头像"
                  >
                    <Upload
                      listType="picture-card"
                      maxCount={1}
                      fileList={fileList}
                      beforeUpload={() => false}
                      onChange={({ fileList }) => setFileList(fileList)}
                    >
                      {fileList.length < 1 && (
                        <div>
                          <UploadOutlined />
                          <div style={{ marginTop: 8 }}>上传头像</div>
                        </div>
                      )}
                    </Upload>
                  </Form.Item>

                  <Form.Item
                    name="name"
                    label="姓名"
                    rules={[{ required: true, message: '请输入姓名' }]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    label="邮箱"
                    rules={[
                      { required: true, message: '请输入邮箱' },
                      { type: 'email', message: '请输入有效的邮箱地址' }
                    ]}
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      保存修改
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="修改密码">
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={changePassword}
                >
                  <Form.Item
                    name="oldPassword"
                    label="原密码"
                    rules={[{ required: true, message: '请输入原密码' }]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="新密码"
                    rules={[
                      { required: true, message: '请输入新密码' },
                      { min: 6, message: '密码至少6个字符' }
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="确认新密码"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: '请确认新密码' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('两次输入的密码不一致'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                      修改密码
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="我的班级" key="2">
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <Card title="已加入的班级">
                <Table
                  dataSource={joinedClasses}
                  columns={joinedClassesColumns}
                  rowKey="id"
                  pagination={false}
                  locale={{ emptyText: '您还没有加入任何班级' }}
                />
              </Card>
            </Col>
            <Col span={24}>
              <Card title="可加入的班级">
                <Table
                  dataSource={availableClasses}
                  columns={availableClassesColumns}
                  rowKey="id"
                  pagination={false}
                  locale={{ emptyText: '没有可加入的班级' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>
        <TabPane tab="申请记录" key="3">
          <Card title="班级申请历史">
            <Table
              dataSource={applications}
              columns={applicationsColumns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: '暂无申请记录' }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 申请加入班级对话框 */}
      <Modal
        title="申请加入班级"
        open={applyModalVisible}
        onOk={submitApplication}
        onCancel={() => setApplyModalVisible(false)}
        confirmLoading={applyLoading}
      >
        <Form layout="vertical">
          <Form.Item label="申请理由">
            <TextArea 
              rows={4} 
              placeholder="请简要说明申请加入班级的原因" 
              value={applicationMessage}
              onChange={e => setApplicationMessage(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ProfileCenter;