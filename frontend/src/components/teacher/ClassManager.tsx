import React, { useState, useEffect } from 'react';
import { 
  Table, Card, Input, Button, Space, Tabs, Modal, message, Form,
  Typography, Tag, Dropdown, Avatar, Menu, Checkbox, Row, Col, Divider, Tooltip, Alert 
} from 'antd';
import { 
  SearchOutlined, UserOutlined, PlusOutlined, 
  DownloadOutlined, MoreOutlined, DeleteOutlined,
  TeamOutlined, EditOutlined, EyeOutlined, CopyOutlined,
  CheckOutlined, CloseOutlined
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

interface Student {
  id: number;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  joinDate: string;
  status: string;
}

interface StudentApplication {
  id: number;
  studentId: number;
  studentName: string;
  studentUsername: string;
  classId: number;
  className: string;
  applyDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  message?: string;
}

interface Class {
  id: number;
  name: string;
  studentCount: number;
  createdAt: string;
  description: string;
  classCode?: string;
}

const ClassManager: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedApplicationKeys, setSelectedApplicationKeys] = useState<React.Key[]>([]);
  const [activeTab, setActiveTab] = useState('1');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [form] = Form.useForm();
  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const navigate = useNavigate();

  // 获取班级列表
  useEffect(() => {
    fetchClasses();
  }, []);

  // 获取学生列表和申请列表
  useEffect(() => {
    if (activeTab === '2') {
      fetchStudents();
    } else if (activeTab === '3') {
      fetchApplications();
    }
  }, [activeTab]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/teacher/classes');
      setClasses(response.data || []);
    } catch (error) {
      console.error('获取班级列表失败:', error);
      message.error('获取班级列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/teacher/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('获取学生列表失败:', error);
      message.error('获取学生列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/classes/applications/teacher');
      console.log('获取到的申请数据:', response.data);
      
      // 处理API返回的数据，确保有正确的字段名称
      const formattedApplications = response.data.map((app: any) => ({
        id: app.id,
        studentId: app.student?.id,
        studentName: app.student?.name,
        studentUsername: app.student?.username,
        classId: app.class?.id,
        className: app.class?.name,
        applyDate: app.createdAt,
        message: app.message,
        status: app.status
      }));
      
      setApplications(formattedApplications || []);
    } catch (error) {
      console.error('获取申请列表失败:', error);
      message.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchText.toLowerCase()) || 
    student.username.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setSelectedRowKeys([]);
    setSelectedApplicationKeys([]);
  };

  const handleStudentDetail = (studentId: number) => {
    navigate(`/teacher/student/${studentId}`);
  };

  const handleEditClass = (record: Class) => {
    setCurrentClass(record);
    setModalTitle('编辑班级');
    form.setFieldsValue({
      name: record.name,
      description: record.description
    });
    setIsModalVisible(true);
  };

  const handleBatchAction = (action: string) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先选择学生');
      return;
    }

    if (action === 'assignTarget') {
      navigate(`/teacher/target/create?students=${selectedRowKeys.join(',')}`);
    } else if (action === 'removeFromClass') {
      Modal.confirm({
        title: '确定要将所选学生从班级中移除吗？',
        content: '此操作不可撤销',
        onOk() {
          // 此处应调用API删除学生
          message.success('已成功移除所选学生');
          setSelectedRowKeys([]);
        }
      });
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      if (currentClass) {
        // 更新班级
        await axios.put(`/api/teacher/class/${currentClass.id}`, values);
        message.success('班级已更新');
      }
      
      // 刷新班级列表
      fetchClasses();
      setIsModalVisible(false);
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = (classId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除此班级吗？此操作不可撤销。',
      onOk: async () => {
        try {
          await axios.delete(`/api/teacher/class/${classId}`);
          message.success('班级已删除');
          fetchClasses();
        } catch (error) {
          console.error('删除班级失败:', error);
          message.error('删除班级失败');
        }
      }
    });
  };

  const handleRemoveStudent = (classId: number, studentId: number, studentName: string) => {
    Modal.confirm({
      title: '确认移出班级',
      content: `确定要将学生 ${studentName} 移出班级吗？`,
      onOk: async () => {
        try {
          await axios.delete(`/api/teacher/class/${classId}/student/${studentId}`);
          message.success(`已移出学生 ${studentName}`);
          // 如果在学生详情页，刷新学生列表
          if (activeTab === '2') {
            fetchStudents();
          }
        } catch (error) {
          console.error('移出学生失败:', error);
          message.error('移出学生失败');
        }
      }
    });
  };

  const handleApplicationAction = async (ids: number[], action: 'approve' | 'reject') => {
    if (ids.length === 0) {
      message.warning('请先选择申请');
      return;
    }

    setLoading(true);
    try {
      // 确保ids是Long类型，而不是Integer
      const longIds = ids.map(id => Number(id));
      
      await axios.post('/api/classes/applications/process', {
        applicationIds: longIds,
        action: action
      });
      
      if (action === 'approve') {
        message.success(`已批准 ${ids.length} 个申请`);
      } else {
        message.success(`已拒绝 ${ids.length} 个申请`);
      }
      
      fetchApplications();
      setSelectedApplicationKeys([]);
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const classColumns = [
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Class) => (
        <a onClick={() => navigate(`/teacher/class/${record.id}`)}>{text}</a>
      )
    },
    {
      title: '学生数量',
      dataIndex: 'studentCount',
      key: 'studentCount',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '班级码',
      dataIndex: 'classCode',
      key: 'classCode',
      render: (text: string) => (
        text ? (
          <Tooltip title="点击复制">
            <Tag color="blue" style={{ cursor: 'pointer' }} onClick={() => {
              navigator.clipboard.writeText(text);
              message.success('班级码已复制到剪贴板');
            }}>
              <Space>
                {text}
                <CopyOutlined />
              </Space>
            </Tag>
          </Tooltip>
        ) : <Tag color="red">无班级码</Tag>
      )
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
      render: (_: any, record: Class) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/teacher/class/${record.id}`)}>
            查看
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditClass(record)}>
            编辑
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteClass(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const studentColumns = [
    {
      title: '学生姓名',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Student) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={record.avatarUrl} 
            icon={<UserOutlined />} 
            style={{ marginRight: 8, cursor: 'pointer' }}
            onClick={() => handleStudentDetail(record.id)}
          />
          <a onClick={() => handleStudentDetail(record.id)}>{text}</a>
        </div>
      )
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
    {
      title: '加入时间',
      dataIndex: 'joinDate',
      key: 'joinDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '已激活' : '未激活'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Student) => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleStudentDetail(record.id)}>
            查看
          </Button>
          <Dropdown menu={{ 
            items: [
              { key: '1', label: '分配学习目标', icon: <PlusOutlined /> },
              { key: '2', label: '移出班级', icon: <DeleteOutlined />, danger: true }
            ] as MenuProps['items'],
            onClick: ({ key }) => {
              if (key === '1') navigate(`/teacher/target/create?students=${record.id}`);
              else if (key === '2') {
                Modal.confirm({
                  title: '确认移出班级',
                  content: `确定要将学生 ${record.name} 移出班级吗？`,
                  onOk() {
                    handleRemoveStudent(1, record.id, record.name); // 此处应传入实际班级ID
                  }
                });
              }
            }
          }}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  const applicationColumns = [
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text: string, record: StudentApplication) => (
        <a onClick={() => navigate(`/teacher/student/${record.studentId}`)}>{text}</a>
      )
    },
    {
      title: '学号',
      dataIndex: 'studentUsername',
      key: 'studentUsername',
    },
    {
      title: '申请班级',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: '申请消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text || '无申请消息'}>
          <span>{text || '-'}</span>
        </Tooltip>
      )
    },
    {
      title: '申请时间',
      dataIndex: 'applyDate',
      key: 'applyDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'PENDING') return <Tag color="gold">待审核</Tag>;
        if (status === 'APPROVED') return <Tag color="green">已通过</Tag>;
        if (status === 'REJECTED') return <Tag color="red">已拒绝</Tag>;
        return <Tag>未知</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: StudentApplication) => (
        record.status === 'PENDING' ? (
          <Space size="small">
            <Button type="link" icon={<CheckOutlined />} onClick={() => handleApplicationAction([record.id], 'approve')}>
              通过
            </Button>
            <Button type="link" danger icon={<CloseOutlined />} onClick={() => handleApplicationAction([record.id], 'reject')}>
              拒绝
            </Button>
          </Space>
        ) : <Text type="secondary">已处理</Text>
      )
    }
  ];

  // 渲染操作栏
  const renderActions = () => {
    return (
      <Space size="middle">
        <Input.Search
          placeholder="搜索班级或学生"
          allowClear
          style={{ width: 250 }}
          onSearch={handleSearch}
        />
        {activeTab === '2' && selectedRowKeys.length > 0 && (
          <Dropdown menu={{ 
            items: [
              {
                key: 'assignTarget',
                label: '分配学习目标',
                onClick: () => handleBatchAction('assignTarget')
              },
              {
                key: 'removeFromClass',
                label: '从班级移除',
                danger: true,
                onClick: () => handleBatchAction('removeFromClass')
              }
            ]
          }} trigger={['click']}>
            <Button>
              批量操作 <DownloadOutlined />
            </Button>
          </Dropdown>
        )}
      </Space>
    );
  };

  const renderApplicationActions = () => {
    return (
      <Space size="middle">
        <Input.Search
          placeholder="搜索学生或班级"
          allowClear
          style={{ width: 250 }}
          onSearch={handleSearch}
        />
        {selectedApplicationKeys.length > 0 && (
          <>
            <Button 
              type="primary" 
              icon={<CheckOutlined />}
              onClick={() => handleApplicationAction(selectedApplicationKeys as number[], 'approve')}
            >
              批量通过
            </Button>
            <Button 
              danger 
              icon={<CloseOutlined />}
              onClick={() => handleApplicationAction(selectedApplicationKeys as number[], 'reject')}
            >
              批量拒绝
            </Button>
          </>
        )}
      </Space>
    );
  };

  return (
    <div className="class-manager">
      <Title level={2}>班级管理</Title>
      <Tabs defaultActiveKey="1" onChange={handleTabChange}>
        <TabPane tab={<span><TeamOutlined />班级列表</span>} key="1">
          <Card>
            <div className="table-header" style={{ marginBottom: 16 }}>
              {renderActions()}
            </div>
            <Table 
              columns={classColumns} 
              dataSource={classes} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        <TabPane tab={<span><UserOutlined />学生管理</span>} key="2">
          <Card>
            <div className="table-header" style={{ marginBottom: 16 }}>
              {renderActions()}
            </div>
            <Table 
              rowSelection={rowSelection}
              columns={studentColumns} 
              dataSource={filteredStudents} 
              rowKey="id" 
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
        <TabPane tab="加入申请" key="3">
          <Card>
            <div className="table-header" style={{ marginBottom: 16 }}>
              {renderApplicationActions()}
            </div>
            <Table 
              columns={applicationColumns}
              dataSource={applications.filter(app => 
                (app.studentName?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
                (app.className?.toLowerCase() || '').includes(searchText.toLowerCase())
              )}
              loading={loading}
              rowKey="id"
              rowSelection={{
                type: 'checkbox',
                selectedRowKeys: selectedApplicationKeys,
                onChange: (keys) => setSelectedApplicationKeys(keys),
                getCheckboxProps: (record) => ({
                  disabled: record.status !== 'PENDING',
                }),
              }}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      <Modal
        title={modalTitle}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        confirmLoading={loading}
      >
        <Form 
          form={form}
          layout="vertical"
        >
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
            <Input.TextArea placeholder="请输入班级描述" rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ClassManager; 