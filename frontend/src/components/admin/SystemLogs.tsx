import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Form, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Typography, 
  Descriptions, 
  message 
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  InfoCircleOutlined 
} from '@ant-design/icons';
import axios from '../../utils/axios';
import dayjs from 'dayjs';
import type { SortOrder } from 'antd/es/table/interface';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface SystemLog {
  id: number;
  operationType: string;
  operationDetail: string;
  user: {
    id: number;
    username: string;
    name: string;
    role: string;
  } | null;
  userRole: string;
  ipAddress: string;
  createdAt: string;
}

const operationTypeOptions = [
  { label: '用户登录', value: 'USER_LOGIN' },
  { label: '用户注册', value: 'USER_REGISTER' },
  { label: '用户更新', value: 'USER_UPDATE' },
  { label: '用户删除', value: 'USER_DELETE' },
  { label: '班级创建', value: 'CLASS_CREATE' },
  { label: '班级更新', value: 'CLASS_UPDATE' },
  { label: '班级删除', value: 'CLASS_DELETE' },
  { label: '班级添加学生', value: 'CLASS_ADD_STUDENT' },
  { label: '班级移除学生', value: 'CLASS_REMOVE_STUDENT' },
  { label: '活动创建', value: 'ACTIVITY_CREATE' },
  { label: '活动更新', value: 'ACTIVITY_UPDATE' },
  { label: '活动删除', value: 'ACTIVITY_DELETE' },
  { label: '系统配置', value: 'SYSTEM_CONFIG' },
];

const userRoleOptions = [
  { label: '管理员', value: 'ADMIN' },
  { label: '教师', value: 'TEACHER' },
  { label: '学生', value: 'STUDENT' },
];

const getOperationTypeLabel = (type: string) => {
  const option = operationTypeOptions.find(opt => opt.value === type);
  return option ? option.label : type;
};

const getOperationTypeColor = (type: string) => {
  if (type.includes('CREATE')) return 'success';
  if (type.includes('UPDATE')) return 'processing';
  if (type.includes('DELETE')) return 'error';
  if (type.includes('LOGIN')) return 'default';
  return 'default';
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'ADMIN': return 'red';
    case 'TEACHER': return 'blue';
    case 'STUDENT': return 'green';
    default: return 'default';
  }
};

const SystemLogs: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [currentLog, setCurrentLog] = useState<SystemLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async (filters?: any) => {
    setLoading(true);
    try {
      let url = '/api/admin/logs';
      
      if (filters) {
        const params = new URLSearchParams();
        
        if (filters.operationType) {
          params.append('operationType', filters.operationType);
        }
        
        if (filters.userRole) {
          params.append('userRole', filters.userRole);
        }
        
        if (filters.timeRange && filters.timeRange.length === 2) {
          params.append('startTime', filters.timeRange[0].toISOString());
          params.append('endTime', filters.timeRange[1].toISOString());
        }
        
        if (params.toString()) {
          url += '?' + params.toString();
        }
      }
      
      const response = await axios.get(url);
      
      setLogs(response.data);
    } catch (error) {
      console.error('获取系统日志失败:', error);
      message.error('获取系统日志失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const values = await form.validateFields();
      fetchLogs(values);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleReset = () => {
    form.resetFields();
    fetchLogs();
  };

  const handleViewDetail = (log: SystemLog) => {
    setCurrentLog(log);
    setIsModalVisible(true);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
      render: (text: string) => (
        <Tag color={getOperationTypeColor(text)}>
          {getOperationTypeLabel(text)}
        </Tag>
      ),
    },
    {
      title: '用户',
      dataIndex: ['user', 'name'],
      key: 'user',
      render: (text: string, record: SystemLog) => (
        <span>
          {record.user ? record.user.name : '未知用户'} 
          {record.userRole && (
            <Tag color={getRoleColor(record.userRole)} style={{ marginLeft: 8 }}>
              {record.userRole}
            </Tag>
          )}
        </span>
      ),
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: SystemLog, b: SystemLog) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      },
      defaultSortOrder: 'descend' as SortOrder,
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: SystemLog) => (
        <Button 
          type="link" 
          icon={<InfoCircleOutlined />} 
          onClick={() => handleViewDetail(record)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div className="system-logs">
      <Title level={2}>系统日志</Title>
      <Card>
        <Form
          form={form}
          layout="inline"
          style={{ marginBottom: 24 }}
        >
          <Form.Item name="operationType" label="操作类型">
            <Select 
              style={{ width: 200 }} 
              placeholder="选择操作类型"
              allowClear
            >
              {operationTypeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="userRole" label="用户角色">
            <Select 
              style={{ width: 150 }} 
              placeholder="选择角色"
              allowClear
            >
              {userRoleOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="timeRange" label="时间范围">
            <RangePicker 
              showTime
              style={{ width: 380 }} 
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={handleSearch}
              >
                搜索
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={handleReset}
              >
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
        
        <Table
          columns={columns}
          dataSource={logs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
      
      <Modal
        title="日志详情"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setIsModalVisible(false)}>
            关闭
          </Button>
        ]}
      >
        {currentLog && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="ID">{currentLog.id}</Descriptions.Item>
            <Descriptions.Item label="操作类型">
              <Tag color={getOperationTypeColor(currentLog.operationType)}>
                {getOperationTypeLabel(currentLog.operationType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="操作详情">
              {currentLog.operationDetail}
            </Descriptions.Item>
            <Descriptions.Item label="用户信息">
              {currentLog.user ? (
                <>
                  ID: {currentLog.user.id}<br />
                  用户名: {currentLog.user.username}<br />
                  姓名: {currentLog.user.name}<br />
                  角色: <Tag color={getRoleColor(currentLog.userRole)}>{currentLog.userRole}</Tag>
                </>
              ) : (
                '未知用户'
              )}
            </Descriptions.Item>
            <Descriptions.Item label="IP地址">{currentLog.ipAddress}</Descriptions.Item>
            <Descriptions.Item label="操作时间">{currentLog.createdAt}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default SystemLogs; 