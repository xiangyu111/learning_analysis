import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Space, 
  Modal, 
  Form, 
  Select, 
  message, 
  Typography, 
  Tag, 
  Tooltip, 
  Avatar, 
  Row, 
  Col, 
  Divider 
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  EyeOutlined,
  TeamOutlined, 
  UserOutlined,
  DeleteOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

interface Teacher {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  managedClassCount: number;
  department?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

const TeacherManager: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState<string>('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/teachers');
      setTeachers(response.data || []);
    } catch (error) {
      console.error('获取教师列表失败:', error);
      message.error('获取教师列表失败');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchText.toLowerCase()) || 
    teacher.username.toLowerCase().includes(searchText.toLowerCase()) ||
    (teacher.email && teacher.email.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleCreateTeacher = () => {
    form.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleViewTeacher = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setIsViewModalVisible(true);
  };

  const handleEditTeacher = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    editForm.setFieldsValue({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      department: teacher.department,
      status: teacher.status
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteTeacher = (teacherId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此教师吗？删除后不可恢复。',
      onOk: async () => {
        try {
          await axios.delete(`/api/admin/teachers/${teacherId}`);
          message.success('教师已删除');
          fetchTeachers();
        } catch (error) {
          console.error('删除教师失败:', error);
          message.error('删除教师失败');
        }
      }
    });
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await axios.post('/api/admin/teachers', values);
      
      message.success('教师已创建');
      setIsCreateModalVisible(false);
      fetchTeachers();
    } catch (error) {
      console.error('创建教师失败:', error);
      message.error('创建教师失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      
      if (currentTeacher) {
        await axios.put(`/api/admin/teachers/${currentTeacher.id}`, values);
        
        message.success('教师信息已更新');
        setIsEditModalVisible(false);
        fetchTeachers();
      }
    } catch (error) {
      console.error('更新教师信息失败:', error);
      message.error('更新教师信息失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Teacher) => (
        <Space>
          <Avatar 
            src={record.avatarUrl} 
            icon={!record.avatarUrl ? <UserOutlined /> : undefined} 
            size="small"
          />
          <a onClick={() => handleViewTeacher(record)}>{text}</a>
        </Space>
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Text ellipsis={{ tooltip: email }}>
          {email}
        </Text>
      )
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
      render: (department: string) => (
        department || '-'
      )
    },
    {
      title: '班级数',
      dataIndex: 'managedClassCount',
      key: 'managedClassCount',
      render: (count: number) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>{count}</Tag>
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>
          {status === 'ACTIVE' ? '在职' : '离校'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Teacher) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewTeacher(record)} 
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditTeacher(record)} 
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteTeacher(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="teacher-manager">
      <Title level={2}>教师管理</Title>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="搜索教师姓名、用户名或邮箱"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTeacher}>
            添加教师
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredTeachers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 创建教师Modal */}
      <Modal
        title="添加教师"
        open={isCreateModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => setIsCreateModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入教师姓名' }]}
          >
            <Input placeholder="请输入教师姓名" />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 4, message: '用户名至少4个字符' }
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="department"
            label="部门"
          >
            <Input placeholder="请输入部门" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="ACTIVE"
          >
            <Select>
              <Option value="ACTIVE">在职</Option>
              <Option value="INACTIVE">离职</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看教师Modal */}
      <Modal
        title="教师详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentTeacher && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                src={currentTeacher.avatarUrl} 
                icon={!currentTeacher.avatarUrl ? <UserOutlined /> : undefined} 
                size={80}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                {currentTeacher.name}
              </Title>
              <Tag color={currentTeacher.status === 'ACTIVE' ? 'green' : 'red'}>
                {currentTeacher.status === 'ACTIVE' ? '在职' : '离职'}
              </Tag>
            </div>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={24}>
                <p>
                  <UserOutlined style={{ marginRight: 8 }} />
                  <Text strong>用户名：</Text> {currentTeacher.username}
                </p>
                <p>
                  <MailOutlined style={{ marginRight: 8 }} />
                  <Text strong>邮箱：</Text> {currentTeacher.email}
                </p>
                {currentTeacher.phone && (
                  <p>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    <Text strong>电话：</Text> {currentTeacher.phone}
                  </p>
                )}
                {currentTeacher.department && (
                  <p>
                    <IdcardOutlined style={{ marginRight: 8 }} />
                    <Text strong>部门：</Text> {currentTeacher.department}
                  </p>
                )}
                <p>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  <Text strong>管理班级数：</Text> {currentTeacher.managedClassCount}
                </p>
                <p>
                  <Text strong>创建时间：</Text> {currentTeacher.createdAt}
                </p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* 编辑教师Modal */}
      <Modal
        title="编辑教师信息"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入教师姓名' }]}
          >
            <Input placeholder="请输入教师姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="电话"
          >
            <Input placeholder="请输入电话" />
          </Form.Item>
          <Form.Item
            name="department"
            label="部门"
          >
            <Input placeholder="请输入部门" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select>
              <Option value="ACTIVE">在职</Option>
              <Option value="INACTIVE">离职</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherManager; 