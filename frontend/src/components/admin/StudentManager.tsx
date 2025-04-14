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
  Divider,
  Badge
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
  HomeOutlined,
  BookOutlined
} from '@ant-design/icons';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;

interface Student {
  id: number;
  name: string;
  username: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  classCount: number;
  majorName?: string;
  grade?: string;
  status: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED';
  createdAt: string;
}

interface ClassInfo {
  id: number;
  name: string;
  teacherName: string;
}

const StudentManager: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [searchText, setSearchText] = useState<string>('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('获取学生列表失败:', error);
      message.error('获取学生列表失败');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/api/admin/classes/simple');
      setClasses(response.data || []);
    } catch (error) {
      console.error('获取班级列表失败:', error);
      message.error('获取班级列表失败');
      setClasses([]);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchText.toLowerCase()) || 
    student.username.toLowerCase().includes(searchText.toLowerCase()) ||
    (student.email && student.email.toLowerCase().includes(searchText.toLowerCase())) ||
    (student.majorName && student.majorName.toLowerCase().includes(searchText.toLowerCase()))
  );

  const handleCreateStudent = () => {
    form.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleViewStudent = (student: Student) => {
    setCurrentStudent(student);
    setIsViewModalVisible(true);
  };

  const handleEditStudent = (student: Student) => {
    setCurrentStudent(student);
    editForm.setFieldsValue({
      name: student.name,
      email: student.email,
      phone: student.phone,
      majorName: student.majorName,
      grade: student.grade,
      status: student.status
    });
    setIsEditModalVisible(true);
  };

  const handleDeleteStudent = (studentId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此学生吗？删除后不可恢复。',
      onOk: async () => {
        try {
          await axios.delete(`/api/admin/students/${studentId}`);
          message.success('学生已删除');
          fetchStudents();
        } catch (error) {
          console.error('删除学生失败:', error);
          message.error('删除学生失败');
        }
      }
    });
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await axios.post('/api/admin/students', values);
      
      message.success('学生已创建');
      setIsCreateModalVisible(false);
      fetchStudents();
    } catch (error) {
      console.error('创建学生失败:', error);
      message.error('创建学生失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      setLoading(true);
      
      if (currentStudent) {
        await axios.put(`/api/admin/students/${currentStudent.id}`, values);
        
        message.success('学生信息已更新');
        setIsEditModalVisible(false);
        fetchStudents();
      }
    } catch (error) {
      console.error('更新学生信息失败:', error);
      message.error('更新学生信息失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Tag color="green">在读</Tag>;
      case 'GRADUATED':
        return <Tag color="blue">已毕业</Tag>;
      case 'SUSPENDED':
        return <Tag color="red">休学</Tag>;
      default:
        return <Tag>未知</Tag>;
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
      render: (text: string, record: Student) => (
        <Space>
          <Avatar 
            src={record.avatarUrl} 
            icon={!record.avatarUrl ? <UserOutlined /> : undefined} 
            size="small"
          />
          <a onClick={() => handleViewStudent(record)}>{text}</a>
        </Space>
      ),
    },
    {
      title: '学号',
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
      title: '专业',
      dataIndex: 'majorName',
      key: 'majorName',
      render: (major: string) => (
        major || '-'
      )
    },
    {
      title: '年级',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade: string) => (
        grade || '-'
      )
    },
    {
      title: '班级数',
      dataIndex: 'classCount',
      key: 'classCount',
      render: (count: number) => (
        <Badge count={count} showZero color={count > 0 ? 'blue' : 'default'} />
      )
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Student) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewStudent(record)} 
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditStudent(record)} 
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteStudent(record.id)} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="student-manager">
      <Title level={2}>学生管理</Title>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="搜索学生姓名、学号、邮箱或专业"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateStudent}>
            添加学生
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredStudents}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 创建学生Modal */}
      <Modal
        title="添加学生"
        open={isCreateModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => setIsCreateModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入学生姓名' }]}
          >
            <Input placeholder="请输入学生姓名" />
          </Form.Item>
          <Form.Item
            name="username"
            label="学号"
            rules={[
              { required: true, message: '请输入学号' },
              { min: 4, message: '学号至少4个字符' }
            ]}
          >
            <Input placeholder="请输入学号" />
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
            name="majorName"
            label="专业"
          >
            <Input placeholder="请输入专业" />
          </Form.Item>
          <Form.Item
            name="grade"
            label="年级"
          >
            <Input placeholder="请输入年级，例如：2025级" />
          </Form.Item>
          <Form.Item
            name="classIds"
            label="选择班级"
          >
            <Select 
              mode="multiple" 
              placeholder="选择班级" 
              optionFilterProp="children"
            >
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name} (教师: {cls.teacherName})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue="ACTIVE"
          >
            <Select>
              <Option value="ACTIVE">在读</Option>
              <Option value="GRADUATED">已毕业</Option>
              <Option value="SUSPENDED">休学</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看学生Modal */}
      <Modal
        title="学生详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentStudent && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                src={currentStudent.avatarUrl} 
                icon={!currentStudent.avatarUrl ? <UserOutlined /> : undefined} 
                size={80}
              />
              <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                {currentStudent.name}
              </Title>
              {getStatusTag(currentStudent.status)}
            </div>
            
            <Divider />
            
            <Row gutter={16}>
              <Col span={24}>
                <p>
                  <UserOutlined style={{ marginRight: 8 }} />
                  <Text strong>学号：</Text> {currentStudent.username}
                </p>
                <p>
                  <MailOutlined style={{ marginRight: 8 }} />
                  <Text strong>邮箱：</Text> {currentStudent.email}
                </p>
                {currentStudent.phone && (
                  <p>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    <Text strong>电话：</Text> {currentStudent.phone}
                  </p>
                )}
                {currentStudent.majorName && (
                  <p>
                    <BookOutlined style={{ marginRight: 8 }} />
                    <Text strong>专业：</Text> {currentStudent.majorName}
                  </p>
                )}
                {currentStudent.grade && (
                  <p>
                    <HomeOutlined style={{ marginRight: 8 }} />
                    <Text strong>年级：</Text> {currentStudent.grade}
                  </p>
                )}
                <p>
                  <TeamOutlined style={{ marginRight: 8 }} />
                  <Text strong>班级数：</Text> {currentStudent.classCount}
                </p>
                <p>
                  <Text strong>创建时间：</Text> {currentStudent.createdAt}
                </p>
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* 编辑学生Modal */}
      <Modal
        title="编辑学生信息"
        open={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => setIsEditModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入学生姓名' }]}
          >
            <Input placeholder="请输入学生姓名" />
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
            name="majorName"
            label="专业"
          >
            <Input placeholder="请输入专业" />
          </Form.Item>
          <Form.Item
            name="grade"
            label="年级"
          >
            <Input placeholder="请输入年级，例如：2025级" />
          </Form.Item>
          <Form.Item
            name="classIds"
            label="选择班级"
          >
            <Select 
              mode="multiple" 
              placeholder="选择班级" 
              optionFilterProp="children"
            >
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name} (教师: {cls.teacherName})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
          >
            <Select>
              <Option value="ACTIVE">在读</Option>
              <Option value="GRADUATED">已毕业</Option>
              <Option value="SUSPENDED">休学</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentManager; 