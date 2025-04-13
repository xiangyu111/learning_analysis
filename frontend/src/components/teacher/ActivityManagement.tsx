import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Modal, Typography, Card, 
  Tag, Badge, Tabs, Input, Select, Form, Upload, 
  DatePicker, message
} from 'antd';
import { 
  PlusOutlined, UploadOutlined, SearchOutlined, 
  EyeOutlined, EditOutlined, DeleteOutlined,
  CalendarOutlined, TeamOutlined, FileOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';
import type { UploadFile } from 'antd/es/upload/interface';
import moment from 'moment';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface Activity {
  id: number;
  title: string;
  type: string;
  description?: string;
  location: string;
  startTime: string;
  endTime: string;
  status: string;
  maxParticipants: number;
  currentParticipants: number;
  organizer?: string;
  creatorName?: string;
}

const ActivityManagement: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      // 此处应改为实际API接口
      const response = await axios.get('/api/teacher/activities');
      setActivities(response.data || []);
    } catch (error) {
      console.error('获取活动列表失败:', error);
      // 使用模拟数据进行演示
      setActivities([
        { 
          id: 1, 
          title: '科技创新大赛', 
          type: 'COMPETITION', 
          location: '大学体育馆', 
          startTime: '2023-10-01 08:00:00', 
          endTime: '2023-10-15 18:00:00', 
          status: 'UPCOMING',
          currentParticipants: 45,
          maxParticipants: 100,
          organizer: '计算机科学学院'
        },
        { 
          id: 2, 
          title: '志愿服务活动', 
          type: 'VOLUNTEER', 
          location: '社区中心', 
          startTime: '2023-10-05 09:00:00', 
          endTime: '2023-10-06 17:00:00', 
          status: 'ONGOING',
          currentParticipants: 30,
          maxParticipants: 50,
          organizer: '学生会'
        },
        { 
          id: 3, 
          title: '学术讲座：人工智能前沿', 
          type: 'LECTURE', 
          location: '图书馆报告厅', 
          startTime: '2023-10-10 14:00:00', 
          endTime: '2023-10-10 16:00:00', 
          status: 'COMPLETED',
          currentParticipants: 120,
          maxParticipants: 200,
          organizer: '人工智能研究所'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesTab = 
      activeTab === 'all' || 
      (activeTab === 'upcoming' && activity.status === 'UPCOMING') ||
      (activeTab === 'ongoing' && activity.status === 'ONGOING') ||
      (activeTab === 'completed' && activity.status === 'COMPLETED');
    
    return matchesSearch && matchesTab;
  });

  const handleCreateActivity = () => {
    navigate('/teacher/activity/create');
  };

  const handleEditActivity = (id: number) => {
    navigate(`/teacher/activity/edit/${id}`);
  };

  const handleViewActivity = (id: number) => {
    navigate(`/teacher/activity/${id}`);
  };

  const handleDeleteActivity = (id: number, title: string) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除活动 "${title}" 吗？`,
      onOk: async () => {
        try {
          // 此处应改为实际API接口
          const response = await axios.delete(`/api/teacher/activities/${id}`);
          if (response.data && response.data.deleted) {
            message.success('活动已成功删除');
            fetchActivities();
          }
        } catch (error) {
          console.error('删除活动失败:', error);
          message.error('删除失败，请重试');
          // 即使失败也刷新列表，因为后端可能已经返回了模拟数据
          fetchActivities();
        }
      }
    });
  };

  const showCreateModal = () => {
    form.resetFields();
    setFileList([]);
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleModalOk = () => {
    form.submit();
  };

  const onFinish = async (values: any) => {
    try {
      const [startTime, endTime] = values.timeRange;
      
      // 准备提交数据
      const activityData = {
        ...values,
        startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
        endTime: endTime.format('YYYY-MM-DD HH:mm:ss')
      };
      
      // 移除不需要的字段
      delete activityData.timeRange;
      delete activityData.attachments;
      
      // 创建FormData用于文件上传
      const formData = new FormData();
      // 添加活动基本信息
      formData.append('activity', JSON.stringify(activityData));
      
      // 添加附件
      fileList.forEach(file => {
        if (file.originFileObj) {
          formData.append('attachments', file.originFileObj);
        }
      });
      
      // 此处应改为实际API接口
      await axios.post('/api/teacher/activities/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      message.success('活动创建成功');
      setIsModalVisible(false);
      fetchActivities();
    } catch (error) {
      console.error('创建活动失败:', error);
      message.error('创建失败，请重试');
    }
  };

  const columns = [
    {
      title: '活动标题',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Activity) => (
        <a onClick={() => handleViewActivity(record.id)}>{text}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = 'blue';
        let text = type;
        
        if (type === 'COMPETITION') {
          color = 'geekblue';
          text = '竞赛';
        } else if (type === 'VOLUNTEER') {
          color = 'green';
          text = '志愿服务';
        } else if (type === 'LECTURE') {
          color = 'purple';
          text = '讲座';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '地点',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '时间',
      key: 'time',
      render: (text: string, record: Activity) => (
        <>
          <div>{record.startTime}</div>
          <div>至</div>
          <div>{record.endTime}</div>
        </>
      ),
    },
    {
      title: '状态',
      key: 'status',
      dataIndex: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = '';
        
        if (status === 'upcoming') {
          color = 'warning';
          text = '即将开始';
        } else if (status === 'ongoing') {
          color = 'processing';
          text = '进行中';
        } else if (status === 'completed') {
          color = 'success';
          text = '已结束';
        }
        
        return <Badge status={color as any} text={text} />;
      },
    },
    {
      title: '参与人数',
      key: 'participants',
      render: (text: string, record: Activity) => (
        <div>{record.currentParticipants}/{record.maxParticipants}</div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Activity) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewActivity(record.id)}
          >
            查看
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditActivity(record.id)}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteActivity(record.id, record.title)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="activity-management">
      <Title level={2}>学习活动管理</Title>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="全部活动" key="all" />
        <TabPane 
          tab={<span><Badge status="warning" />即将开始</span>} 
          key="upcoming" 
        />
        <TabPane 
          tab={<span><Badge status="processing" />进行中</span>} 
          key="ongoing" 
        />
        <TabPane 
          tab={<span><Badge status="success" />已结束</span>} 
          key="completed" 
        />
      </Tabs>
      
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input.Search
            placeholder="搜索活动标题"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleCreateActivity}
          >
            创建活动
          </Button>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={filteredActivities} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <Modal
        title="快速创建活动"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="title"
            label="活动标题"
            rules={[{ required: true, message: '请输入活动标题' }]}
          >
            <Input placeholder="请输入活动标题" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="活动类型"
            rules={[{ required: true, message: '请选择活动类型' }]}
          >
            <Select placeholder="请选择活动类型">
              <Option value="COMPETITION">竞赛</Option>
              <Option value="VOLUNTEER">志愿服务</Option>
              <Option value="LECTURE">讲座</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="timeRange"
            label="活动时间"
            rules={[{ required: true, message: '请选择活动时间' }]}
          >
            <RangePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }}
            />
          </Form.Item>
          
          <Form.Item
            name="location"
            label="活动地点"
            rules={[{ required: true, message: '请输入活动地点' }]}
          >
            <Input placeholder="请输入活动地点" />
          </Form.Item>
          
          <Form.Item
            name="maxParticipants"
            label="最大参与人数"
            rules={[{ required: true, message: '请输入最大参与人数' }]}
          >
            <Input type="number" min={1} placeholder="请输入最大参与人数" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="活动描述"
            rules={[{ required: true, message: '请输入活动描述' }]}
          >
            <TextArea rows={4} placeholder="请输入活动描述" />
          </Form.Item>
          
          <Form.Item
            name="attachments"
            label="附件上传"
            help="支持PDF文件、图片等资料，大小不超过10MB"
          >
            <Upload
              listType="picture"
              maxCount={5}
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<UploadOutlined />}>上传附件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ActivityManagement; 