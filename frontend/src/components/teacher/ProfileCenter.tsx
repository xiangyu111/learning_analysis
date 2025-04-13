import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography, Form, Input, Button, Upload, message, Table, Modal, Space, Descriptions, Badge, Row, Col } from 'antd';
import { UserOutlined, UploadOutlined, TeamOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';
import type { UploadFile } from 'antd/es/upload/interface';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface ProfileProps {
  user: any;
  refreshUserInfo: () => void;
}

interface ClassItem {
  id: number;
  name: string;
  description: string;
  students: Array<any>;
  createdAt: string;
}

interface ApplicationItem {
  id: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message: string;
  createdAt: string;
  student: {
    id: number;
    name: string;
    username: string;
  };
  class: {
    id: number;
    name: string;
  };
}

const ProfileCenter: React.FC<ProfileProps> = ({ user, refreshUserInfo }) => {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [classForm] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [myClasses, setMyClasses] = useState<ClassItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [activeKey, setActiveKey] = useState('1');
  const [createClassModalVisible, setCreateClassModalVisible] = useState(false);
  const [editClassModalVisible, setEditClassModalVisible] = useState(false);
  const [currentClassId, setCurrentClassId] = useState<number | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentApplicationId, setCurrentApplicationId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [classStudentsModalVisible, setClassStudentsModalVisible] = useState(false);
  const [currentClassStudents, setCurrentClassStudents] = useState<any[]>([]);
  const [currentClassName, setCurrentClassName] = useState('');

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

  // 获取教师创建的班级
  useEffect(() => {
    const fetchMyClasses = async () => {
      try {
        const response = await axios.get('/api/classes/teacher');
        if (response.data) {
          setMyClasses(response.data);
        }
      } catch (error) {
        console.error('获取班级列表失败:', error);
        message.error('获取班级列表失败');
      }
    };

    if (user && user.role === 'TEACHER' && activeKey === '2') {
      fetchMyClasses();
    }
  }, [user, activeKey]);

  // 获取待处理的申请
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await axios.get('/api/classes/applications/teacher');
        if (response.data) {
          setApplications(response.data);
        }
      } catch (error) {
        console.error('获取申请列表失败:', error);
        message.error('获取申请列表失败');
      }
    };

    if (user && user.role === 'TEACHER' && activeKey === '3') {
      fetchApplications();
    }
  }, [user, activeKey]);

  // 创建新班级
  const createClass = async (values: any) => {
    setLoading(true);
    try {
      await axios.post('/api/classes', values);
      message.success('班级创建成功');
      setCreateClassModalVisible(false);
      classForm.resetFields();
      
      // 刷新班级列表
      const response = await axios.get('/api/classes/teacher');
      if (response.data) {
        setMyClasses(response.data);
      }
    } catch (error: any) {
      console.error('创建班级失败:', error);
      message.error(error.response?.data?.message || '创建班级失败');
    } finally {
      setLoading(false);
    }
  };

  // 编辑班级
  const editClass = async (values: any) => {
    if (!currentClassId) return;
    
    setLoading(true);
    try {
      await axios.put(`/api/classes/${currentClassId}`, values);
      message.success('班级信息更新成功');
      setEditClassModalVisible(false);
      
      // 刷新班级列表
      const response = await axios.get('/api/classes/teacher');
      if (response.data) {
        setMyClasses(response.data);
      }
    } catch (error: any) {
      console.error('编辑班级失败:', error);
      message.error(error.response?.data?.message || '编辑班级失败');
    } finally {
      setLoading(false);
    }
  };

  // 打开编辑班级对话框
  const openEditClassModal = (classItem: ClassItem) => {
    setCurrentClassId(classItem.id);
    classForm.setFieldsValue({
      name: classItem.name,
      description: classItem.description
    });
    setEditClassModalVisible(true);
  };

  // 查看班级学生列表
  const viewClassStudents = async (classItem: ClassItem) => {
    setCurrentClassName(classItem.name);
    setCurrentClassStudents(classItem.students || []);
    setClassStudentsModalVisible(true);
  };

  // 移除班级学生
  const removeStudent = async (classId: number, studentId: number) => {
    try {
      await axios.delete(`/api/classes/${classId}/students/${studentId}`);
      message.success('已将学生移出班级');
      
      // 更新当前显示的学生列表
      setCurrentClassStudents(prev => prev.filter(student => student.id !== studentId));
      
      // 刷新班级列表
      const response = await axios.get('/api/classes/teacher');
      if (response.data) {
        setMyClasses(response.data);
      }
    } catch (error: any) {
      console.error('移除学生失败:', error);
      message.error(error.response?.data?.message || '移除学生失败');
    }
  };

  // 处理申请（批准）
  const approveApplication = async (applicationId: number) => {
    try {
      await axios.post(`/api/classes/applications/${applicationId}/process`, {
        status: 'APPROVED'
      });
      message.success('已批准申请');
      
      // 刷新申请列表
      const response = await axios.get('/api/classes/applications/teacher');
      if (response.data) {
        setApplications(response.data);
      }
    } catch (error: any) {
      console.error('批准申请失败:', error);
      message.error(error.response?.data?.message || '批准申请失败');
    }
  };

  // 打开拒绝申请对话框
  const openRejectModal = (applicationId: number) => {
    setCurrentApplicationId(applicationId);
    setRejectReason('');
    setRejectModalVisible(true);
  };

  // 处理申请（拒绝）
  const rejectApplication = async () => {
    if (!currentApplicationId) return;
    
    try {
      await axios.post(`/api/classes/applications/${currentApplicationId}/process`, {
        status: 'REJECTED',
        rejectReason
      });
      message.success('已拒绝申请');
      setRejectModalVisible(false);
      
      // 刷新申请列表
      const response = await axios.get('/api/classes/applications/teacher');
      if (response.data) {
        setApplications(response.data);
      }
    } catch (error: any) {
      console.error('拒绝申请失败:', error);
      message.error(error.response?.data?.message || '拒绝申请失败');
    }
  };

  // 修改个人资料
  const updateProfile = async (values: any) => {
    setLoading(true);
    try {
      await axios.put(`/api/users/${user.id}/profile`, values);
      message.success('个人资料更新成功');
      refreshUserInfo();
    } catch (error: any) {
      console.error('更新个人资料失败:', error);
      message.error(error.response?.data?.message || '更新个人资料失败');
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

  // 班级表格列定义
  const classColumns = [
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '班级描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '学生人数',
      key: 'studentsCount',
      render: (text: any, record: ClassItem) => record.students?.length || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ClassItem) => (
        <Space>
          <Button 
            type="link" 
            icon={<TeamOutlined />} 
            onClick={() => viewClassStudents(record)}
          >
            学生
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => openEditClassModal(record)}
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  // 申请表格列定义
  const applicationColumns = [
    {
      title: '申请学生',
      dataIndex: ['student', 'name'],
      key: 'studentName',
      render: (text: string, record: ApplicationItem) => (
        <span>{text} ({record.student.username})</span>
      ),
    },
    {
      title: '班级',
      dataIndex: ['class', 'name'],
      key: 'className',
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '申请留言',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ApplicationItem) => (
        <Space>
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />} 
            onClick={() => approveApplication(record.id)}
          >
            批准
          </Button>
          <Button 
            danger 
            icon={<CloseCircleOutlined />} 
            onClick={() => openRejectModal(record.id)}
          >
            拒绝
          </Button>
        </Space>
      ),
    },
  ];

  // 班级学生表格列定义
  const classStudentsColumns = [
    {
      title: '学号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button 
          danger 
          size="small" 
          icon={<DeleteOutlined />} 
          onClick={() => removeStudent(currentClassId!, record.id)}
        >
          移出班级
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Title level={3}><UserOutlined /> 教师个人中心</Title>
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
        <TabPane tab="班级管理" key="2">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                classForm.resetFields();
                setCreateClassModalVisible(true);
              }}
            >
              创建新班级
            </Button>
          </div>
          <Card title="我创建的班级">
            <Table
              dataSource={myClasses}
              columns={classColumns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: '您还没有创建班级' }}
            />
          </Card>
        </TabPane>
        <TabPane tab="申请审批" key="3">
          <Card title="待处理的班级申请">
            <Table
              dataSource={applications}
              columns={applicationColumns}
              rowKey="id"
              pagination={false}
              locale={{ emptyText: '暂无待处理的申请' }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* 创建班级对话框 */}
      <Modal
        title="创建新班级"
        open={createClassModalVisible}
        onOk={() => classForm.submit()}
        onCancel={() => setCreateClassModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={classForm}
          layout="vertical"
          onFinish={createClass}
        >
          <Form.Item
            name="name"
            label="班级名称"
            rules={[{ required: true, message: '请输入班级名称' }]}
          >
            <Input placeholder="请输入班级名称，如：2022级软件工程1班" />
          </Form.Item>

          <Form.Item
            name="description"
            label="班级描述"
          >
            <TextArea 
              rows={4} 
              placeholder="请输入班级描述，可选填"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑班级对话框 */}
      <Modal
        title="编辑班级"
        open={editClassModalVisible}
        onOk={() => classForm.submit()}
        onCancel={() => setEditClassModalVisible(false)}
        confirmLoading={loading}
      >
        <Form
          form={classForm}
          layout="vertical"
          onFinish={editClass}
        >
          <Form.Item
            name="name"
            label="班级名称"
            rules={[{ required: true, message: '请输入班级名称' }]}
          >
            <Input placeholder="请输入班级名称，如：2022级软件工程1班" />
          </Form.Item>

          <Form.Item
            name="description"
            label="班级描述"
          >
            <TextArea 
              rows={4} 
              placeholder="请输入班级描述，可选填"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 拒绝申请对话框 */}
      <Modal
        title="拒绝申请"
        open={rejectModalVisible}
        onOk={rejectApplication}
        onCancel={() => setRejectModalVisible(false)}
      >
        <Form layout="vertical">
          <Form.Item label="拒绝原因">
            <TextArea 
              rows={4} 
              placeholder="请输入拒绝原因（选填）" 
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 班级学生列表对话框 */}
      <Modal
        title={`班级学生列表 - ${currentClassName}`}
        open={classStudentsModalVisible}
        onCancel={() => setClassStudentsModalVisible(false)}
        footer={null}
        width={700}
      >
        <Table
          dataSource={currentClassStudents}
          columns={classStudentsColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '班级中暂无学生' }}
        />
      </Modal>
    </Card>
  );
};

export default ProfileCenter;