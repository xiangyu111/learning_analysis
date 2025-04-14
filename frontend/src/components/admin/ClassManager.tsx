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
  UserOutlined 
} from '@ant-design/icons';
import axios from '../../utils/axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Option } = Select;

interface Teacher {
  id: number;
  name: string;
  username: string;
  email: string;
  avatarUrl: string;
  managedClassCount: number;
}

interface ClassInfo {
  id: number;
  name: string;
  description: string;
  studentCount: number;
  createdAt: string;
  teacher: {
    id: number;
    name: string;
    username: string;
    avatarUrl: string;
  };
}

interface ClassDetail {
  id: number;
  name: string;
  description: string;
  studentCount: number;
  createdAt: string;
  teacher: {
    id: number;
    name: string;
    username: string;
    avatarUrl: string;
  };
  students: Array<{
    id: number;
    name: string;
    username: string;
    email: string;
    avatarUrl: string;
  }>;
}

const ClassManager: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [unassignedTeachers, setUnassignedTeachers] = useState<Teacher[]>([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState<boolean>(false);
  const [isAssignModalVisible, setIsAssignModalVisible] = useState<boolean>(false);
  const [currentClass, setCurrentClass] = useState<ClassDetail | null>(null);
  const [currentTeacher, setCurrentTeacher] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();
  const [searchText, setSearchText] = useState<string>('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
    fetchUnassignedTeachers();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('获取班级列表失败:', error);
      message.error('获取班级列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/api/admin/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('获取教师列表失败:', error);
      message.error('获取教师列表失败');
    }
  };

  const fetchUnassignedTeachers = async () => {
    try {
      const response = await axios.get('/api/admin/teachers/unassigned');
      setUnassignedTeachers(response.data);
    } catch (error) {
      console.error('获取未分配教师列表失败:', error);
      message.error('获取未分配教师列表失败');
    }
  };

  const fetchClassDetail = async (classId: number) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/classes/${classId}`);
      setCurrentClass(response.data);
    } catch (error) {
      console.error('获取班级详情失败:', error);
      message.error('获取班级详情失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = () => {
    form.resetFields();
    setIsCreateModalVisible(true);
  };

  const handleViewClass = (classId: number) => {
    fetchClassDetail(classId);
    setIsViewModalVisible(true);
  };

  const handleAssignTeacher = (classInfo: ClassInfo) => {
    setCurrentClass(classInfo as any);
    setCurrentTeacher(classInfo.teacher?.id || null);
    assignForm.setFieldsValue({
      teacherId: classInfo.teacher?.id
    });
    setIsAssignModalVisible(true);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredClasses = classes.filter(cls => 
    cls.name.toLowerCase().includes(searchText.toLowerCase()) ||
    cls.teacher?.name?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      await axios.post('/api/admin/classes', {
        ...values,
        className: values.name
      });
      
      message.success('班级创建成功');
      setIsCreateModalVisible(false);
      fetchClasses();
    } catch (error) {
      console.error('创建班级失败:', error);
      message.error('创建班级失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubmit = async () => {
    try {
      const values = await assignForm.validateFields();
      setLoading(true);
      
      if (currentClass) {
        await axios.put(`/api/admin/classes/${currentClass.id}`, {
          ...values,
          name: currentClass.name,
          description: currentClass.description
        });
        
        message.success('教师分配成功');
        setIsAssignModalVisible(false);
        fetchClasses();
      }
    } catch (error) {
      console.error('分配教师失败:', error);
      message.error('分配教师失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '班级ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ClassInfo) => (
        <a onClick={() => handleViewClass(record.id)}>{text}</a>
      ),
    },
    {
      title: '班级描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '学生数量',
      dataIndex: 'studentCount',
      key: 'studentCount',
      width: 100,
      render: (count: number) => (
        <Tag color="blue">{count} 人</Tag>
      ),
    },
    {
      title: '班主任',
      dataIndex: ['teacher', 'name'],
      key: 'teacher',
      render: (text: string, record: ClassInfo) => (
        <Space>
          <Avatar 
            src={record.teacher?.avatarUrl} 
            icon={!record.teacher?.avatarUrl ? <UserOutlined /> : undefined} 
            size="small"
          />
          {text || '未分配'}
        </Space>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: ClassInfo) => (
        <Space>
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewClass(record.id)} 
            />
          </Tooltip>
          <Tooltip title="分配教师">
            <Button 
              type="text" 
              icon={<TeamOutlined />} 
              onClick={() => handleAssignTeacher(record)} 
            />
          </Tooltip>
          <Tooltip title="编辑班级">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => {
                // 实现编辑功能
              }} 
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const studentColumns = [
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
      render: (text: string, record: any) => (
        <Space>
          <Avatar 
            src={record.avatarUrl} 
            icon={!record.avatarUrl ? <UserOutlined /> : undefined} 
            size="small"
          />
          {text}
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
    },
  ];

  return (
    <div className="class-manager">
      <Title level={2}>班级管理</Title>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="搜索班级名称或教师"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateClass}>
            创建班级
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={filteredClasses}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 创建班级Modal */}
      <Modal
        title="创建新班级"
        open={isCreateModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => setIsCreateModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="班级名称"
            rules={[{ required: true, message: '请输入班级名称' }]}
          >
            <Input placeholder="请输入班级名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="班级描述"
          >
            <Input.TextArea rows={4} placeholder="请输入班级描述" />
          </Form.Item>
          <Form.Item
            name="teacherId"
            label="选择教师"
            rules={[{ required: true, message: '请选择教师' }]}
          >
            <Select placeholder="请选择教师">
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.managedClassCount > 0 ? `已有${teacher.managedClassCount}个班级` : '未分配班级'})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看班级详情Modal */}
      <Modal
        title="班级详情"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {currentClass && (
          <>
            <Row gutter={16}>
              <Col span={16}>
                <Title level={4}>{currentClass.name}</Title>
                <p>{currentClass.description || '暂无描述'}</p>
              </Col>
              <Col span={8} style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: 8 }}>
                  <Tag color="blue">学生: {currentClass.studentCount} 人</Tag>
                  <Tag color="green">创建于: {currentClass.createdAt}</Tag>
                </div>
                <Space>
                  <span>班主任:</span>
                  <Avatar 
                    src={currentClass.teacher?.avatarUrl} 
                    icon={!currentClass.teacher?.avatarUrl ? <UserOutlined /> : undefined}
                  />
                  {currentClass.teacher?.name || '未分配'}
                </Space>
              </Col>
            </Row>
            
            <Divider orientation="left">学生列表</Divider>
            
            <Table
              columns={studentColumns}
              dataSource={currentClass.students}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </>
        )}
      </Modal>

      {/* 分配教师Modal */}
      <Modal
        title="分配班级教师"
        open={isAssignModalVisible}
        onOk={handleAssignSubmit}
        onCancel={() => setIsAssignModalVisible(false)}
        confirmLoading={loading}
      >
        <Form form={assignForm} layout="vertical">
          <Form.Item
            label="班级"
          >
            <Input value={currentClass?.name} disabled />
          </Form.Item>
          <Form.Item
            name="teacherId"
            label="选择教师"
            rules={[{ required: true, message: '请选择教师' }]}
          >
            <Select placeholder="请选择教师">
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id}>
                  {teacher.name} ({teacher.managedClassCount > 0 ? `已有${teacher.managedClassCount}个班级` : '未分配班级'})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassManager; 