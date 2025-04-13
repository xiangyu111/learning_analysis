import React, { useState, useEffect } from 'react';
import {
  Card, Table, Tabs, Input, Button, Tag, Space, Modal, Form, 
  DatePicker, Select, message, Typography, Tooltip
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, 
  SearchOutlined, EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import moment from 'moment';

const { Title } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface LearningGoal {
  id: number;
  title: string;
  description: string;
  deadline: string;
  status: string;
  progress: number;
  assignedStudents?: number;
}

const LearningGoalManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      console.log('获取学习目标列表...');
      const response = await axios.get('/api/teacher/goals');
      console.log('获取到的学习目标数据:', response.data);
      setGoals(response.data || []);
    } catch (error) {
      console.error('获取学习目标列表失败:', error);
      message.error('获取学习目标列表失败，使用模拟数据');
      
      // 使用模拟数据
      setGoals([
        {
          id: 1,
          title: '完成科技创新项目',
          description: '设计并实现一个创新应用，解决实际问题',
          deadline: '2023-11-30',
          status: 'IN_PROGRESS',
          progress: 60,
          assignedStudents: 35
        },
        {
          id: 2,
          title: '参与志愿服务活动',
          description: '参与至少3次社区志愿服务活动',
          deadline: '2023-10-31',
          status: 'COMPLETED',
          progress: 100,
          assignedStudents: 28
        },
        {
          id: 3,
          title: '阅读专业文献',
          description: '阅读并总结5篇相关专业领域的学术论文',
          deadline: '2023-12-15',
          status: 'PENDING_REVIEW',
          progress: 80,
          assignedStudents: 42
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const showCreateModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'inProgress' && goal.status === 'IN_PROGRESS') ||
      (activeTab === 'completed' && goal.status === 'COMPLETED') ||
      (activeTab === 'pendingReview' && goal.status === 'PENDING_REVIEW');
    
    return matchesSearch && matchesTab;
  });

  const handleCreateGoal = () => {
    form.validateFields().then(async (values) => {
      try {
        const goalData = {
          ...values,
          deadline: values.deadline.format('YYYY-MM-DD')
        };
        
        console.log('创建学习目标数据:', goalData);
        const response = await axios.post('/api/teacher/goals/create', goalData);
        message.success('学习目标创建成功');
        setIsModalVisible(false);
        fetchGoals();
      } catch (error) {
        console.error('创建学习目标失败:', error);
        message.error('创建失败，请重试');
      }
    });
  };

  const handleEditGoal = (id: number) => {
    navigate(`/teacher/goal/edit/${id}`);
  };

  const handleViewGoal = (id: number) => {
    navigate(`/teacher/goal/${id}`);
  };

  const handleDeleteGoal = (id: number, title: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除学习目标 "${title}" 吗？`,
      onOk: async () => {
        try {
          await axios.delete(`/api/teacher/goals/${id}`);
          message.success('学习目标已删除');
          fetchGoals();
        } catch (error) {
          console.error('删除学习目标失败:', error);
          message.error('删除失败，请重试');
        }
      }
    });
  };

  const columns = [
    {
      title: '目标标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: LearningGoal) => (
        <a onClick={() => handleViewGoal(record.id)}>{text}</a>
      )
    },
    {
      title: '截止日期',
      dataIndex: 'deadline',
      key: 'deadline'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = status;
        
        if (status === 'IN_PROGRESS') {
          color = 'processing';
          text = '进行中';
        } else if (status === 'COMPLETED') {
          color = 'success';
          text = '已完成';
        } else if (status === 'PENDING_REVIEW') {
          color = 'warning';
          text = '待审核';
        }
        
        return <Tag color={color}>{text}</Tag>;
      }
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => `${progress}%`
    },
    {
      title: '指派学生',
      dataIndex: 'assignedStudents',
      key: 'assignedStudents',
      render: (count: number) => count || 0
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: LearningGoal) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => handleViewGoal(record.id)} 
            />
          </Tooltip>
          <Tooltip title="编辑">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditGoal(record.id)} 
            />
          </Tooltip>
          <Tooltip title="删除">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteGoal(record.id, record.title)} 
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="learning-goal-management">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Title level={4}>学习目标管理</Title>
          <Space>
            <Input
              placeholder="搜索目标"
              prefix={<SearchOutlined />}
              onChange={e => handleSearch(e.target.value)}
              style={{ width: 200 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={showCreateModal}
            >
              创建学习目标
            </Button>
          </Space>
        </div>
        
        <Tabs 
          defaultActiveKey="all" 
          onChange={key => setActiveTab(key)}
          tabBarStyle={{ marginBottom: 16 }}
        >
          <TabPane tab="全部" key="all" />
          <TabPane tab="进行中" key="inProgress" />
          <TabPane tab="已完成" key="completed" />
          <TabPane tab="待审核" key="pendingReview" />
        </Tabs>
        
        <Table 
          dataSource={filteredGoals} 
          columns={columns} 
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <Modal
        title="创建学习目标"
        visible={isModalVisible}
        onCancel={handleModalCancel}
        onOk={handleCreateGoal}
        okText="创建"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="目标标题"
            rules={[{ required: true, message: '请输入目标标题' }]}
          >
            <Input placeholder="请输入目标标题" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="目标描述"
            rules={[{ required: true, message: '请输入目标描述' }]}
          >
            <TextArea 
              placeholder="请描述学习目标的详细内容和要求" 
              rows={4} 
            />
          </Form.Item>
          
          <Form.Item
            name="deadline"
            label="截止日期"
            rules={[{ required: true, message: '请选择截止日期' }]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="YYYY-MM-DD" 
              placeholder="选择截止日期"
            />
          </Form.Item>
          
          <Form.Item
            name="classId"
            label="指派班级"
          >
            <Select placeholder="选择要指派的班级">
              <Option value={1}>计算机科学1班</Option>
              <Option value={2}>软件工程2班</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LearningGoalManagement; 