import React, { useState, useEffect } from 'react';
import { Card, List, Button, Tag, Space, Tabs, message, Select, Empty } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import axios from '../../../utils/axios';

const { TabPane } = Tabs;
const { Option } = Select;

interface Activity {
  id: number;
  title: string;
  type: 'VOLUNTEER' | 'COMPETITION' | 'LECTURE';
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  status: 'ONGOING' | 'UPCOMING' | 'ENDED';
  participationStatus?: 'REGISTERED' | 'COMPLETED' | 'CANCELLED';
  maxParticipants: number;
  currentParticipants: number;
  organizer: string;
}

const StudentActivityList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // 获取用户角色
  const getUserRole = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('当前用户信息:', user);
    return user.role || '';
  };

  // 获取API前缀
  const getApiPrefix = () => {
    const role = getUserRole();
    console.log('当前用户角色:', role);
    
    if (role === 'STUDENT') {
      return '/api/student';
    } else if (role === 'TEACHER') {
      return '/api/teacher';
    } else {
      return '/api';
    }
  };

  // 获取基础路径前缀
  const getBasePath = () => {
    const role = getUserRole();
    
    if (role === 'STUDENT') {
      return '/student';
    } else if (role === 'TEACHER') {
      return '/teacher';
    } else {
      return '/dashboard';
    }
  };

  // 判断是否为教师
  const isTeacher = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'TEACHER';
  };

  useEffect(() => {
    // 检查用户登录状态
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id || !user.role) {
      setError('用户未登录或权限不足');
      setLoading(false);
      return;
    }
    
    if (user.role !== 'STUDENT' && user.role !== 'TEACHER') {
      setError('没有访问权限');
      setLoading(false);
      return;
    }
    
    setError(null);
    fetchActivities();
  }, [activeTab, filterType]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      let response;
      const apiPrefix = getApiPrefix();
      console.log(`请求活动列表: ${apiPrefix}, 当前Tab=${activeTab}, 过滤类型=${filterType || '无'}`);
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('使用Token:', localStorage.getItem('token'));
      
      if (!user.id) {
        throw new Error('用户未登录或会话已过期');
      }

      if (filterType) {
        console.log(`请求特定类型活动: ${apiPrefix}/activities/type/${filterType}`);
        response = await axios.get(`${apiPrefix}/activities/type/${filterType}`);
      } else if (activeTab === 'my') {
        console.log(`获取我的活动列表: ${apiPrefix}/activities/my`);
        response = await axios.get(`${apiPrefix}/activities/my`);
      } else {
        console.log(`获取全部活动列表: ${apiPrefix}/activities`);
        response = await axios.get(`${apiPrefix}/activities`);
      }
      
      console.log('获取活动列表成功:', response.data);
      setActivities(response.data || []);
      setError(null);
    } catch (error: any) {
      console.error('获取活动列表失败:', error);
      const errorMessage = error.response?.data?.message || error.message || '获取活动列表失败，请重新登录后重试';
      setError(errorMessage);
      message.error(errorMessage);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'VOLUNTEER':
        return 'green';
      case 'COMPETITION':
        return 'blue';
      case 'LECTURE':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONGOING':
        return 'processing';
      case 'UPCOMING':
        return 'warning';
      case 'ENDED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getParticipationStatus = (status: string) => {
    switch (status) {
      case 'REGISTERED':
        return <Tag color="blue">已报名</Tag>;
      case 'COMPLETED':
        return <Tag color="green">已完成</Tag>;
      case 'CANCELLED':
        return <Tag color="red">已取消</Tag>;
      default:
        return null;
    }
  };

  const handleRegister = async (activityId: number) => {
    try {
      const apiPrefix = getApiPrefix();
      const response = await axios.post(`${apiPrefix}/activities/${activityId}/register`);
      console.log('报名成功:', response.data);
      message.success('报名成功！');
      
      // 直接更新本地状态，避免重新请求
      const updatedActivities = activities.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            participationStatus: 'REGISTERED' as 'REGISTERED',
            currentParticipants: activity.currentParticipants + 1
          };
        }
        return activity;
      });
      setActivities(updatedActivities);
      
      // 然后再刷新数据
      fetchActivities();
    } catch (error: any) {
      console.error('报名失败:', error);
      message.error(error.response?.data?.message || '报名失败，请重试');
    }
  };

  const handleCancel = async (activityId: number) => {
    try {
      const apiPrefix = getApiPrefix();
      const response = await axios.post(`${apiPrefix}/activities/${activityId}/cancel`);
      console.log('取消报名成功:', response.data);
      message.success('取消报名成功！');
      
      // 直接更新本地状态，避免重新请求
      const updatedActivities = activities.map(activity => {
        if (activity.id === activityId) {
          return {
            ...activity,
            participationStatus: 'CANCELLED' as 'CANCELLED',
            currentParticipants: Math.max(0, activity.currentParticipants - 1)
          };
        }
        return activity;
      });
      setActivities(updatedActivities);
      
      // 然后再刷新数据
      fetchActivities();
    } catch (error: any) {
      console.error('取消报名失败:', error);
      message.error(error.response?.data?.message || '取消报名失败，请重试');
    }
  };

  const handleComplete = async (activityId: number) => {
    try {
      const apiPrefix = getApiPrefix();
      const response = await axios.post(`${apiPrefix}/activities/${activityId}/complete`);
      console.log('活动完成成功:', response.data);
      message.success('活动已完成！');
      fetchActivities();
    } catch (error: any) {
      console.error('操作失败:', error);
      message.error(error.response?.data?.message || '操作失败，请重试');
    }
  };

  const filteredActivities = activities.filter(activity => {
    if (filterType && activity.type !== filterType) return false;
    if (activeTab === 'my') {
      return activity.participationStatus !== undefined;
    }
    return true;
  });

  return (
    <Card 
      title="学习活动" 
      extra={
        <Space>
          {isTeacher() && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => navigate('/teacher/activity/create')}
            >
              添加活动
            </Button>
          )}
          <Select
            placeholder="活动类型"
            allowClear
            style={{ width: 120 }}
            onChange={setFilterType}
            value={filterType}
          >
            <Option value="VOLUNTEER">志愿服务</Option>
            <Option value="COMPETITION">竞赛</Option>
            <Option value="LECTURE">讲座</Option>
          </Select>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="全部活动" key="all">
          {error ? (
            <Empty 
              description={
                <span style={{ color: 'red' }}>{error}</span>
              }
            />
          ) : (
            <List
              loading={loading}
              itemLayout="vertical"
              dataSource={filteredActivities}
              locale={{ emptyText: '暂无活动数据' }}
              renderItem={(activity) => (
                <List.Item
                  extra={
                    <Space>
                      <Tag color={getTypeColor(activity.type)}>
                        {activity.type === 'VOLUNTEER' ? '志愿服务' :
                         activity.type === 'COMPETITION' ? '竞赛' : '讲座'}
                      </Tag>
                      <Tag color={getStatusColor(activity.status)}>
                        {activity.status === 'ONGOING' ? '进行中' :
                         activity.status === 'UPCOMING' ? '即将开始' : '已结束'}
                      </Tag>
                      {activity.participationStatus && getParticipationStatus(activity.participationStatus)}
                    </Space>
                  }
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <Link to={`${getBasePath()}/activity/${activity.id}`}>{activity.title}</Link>
                        {isTeacher() && (
                          <Button size="small" type="link" onClick={() => navigate(`/teacher/activity/edit/${activity.id}`)}>
                            编辑
                          </Button>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical">
                        <div>时间：{activity.startTime} - {activity.endTime}</div>
                        <div>地点：{activity.location}</div>
                        <div>主办方：{activity.organizer}</div>
                        <div>参与人数：{activity.currentParticipants}/{activity.maxParticipants}</div>
                        <div>{activity.description}</div>
                      </Space>
                    }
                  />
                  {activity.status === 'UPCOMING' && (
                    <>
                      {(!activity.participationStatus || activity.participationStatus === 'CANCELLED') && (
                        <Button 
                          type="primary" 
                          style={{ marginTop: 16 }}
                          onClick={() => handleRegister(activity.id)}
                          disabled={activity.currentParticipants >= activity.maxParticipants}
                        >
                          {activity.currentParticipants >= activity.maxParticipants 
                            ? '报名已满' 
                            : activity.participationStatus === 'CANCELLED' ? '重新报名' : '立即报名'}
                        </Button>
                      )}
                      {activity.participationStatus === 'REGISTERED' && (
                        <Space style={{ marginTop: 16 }}>
                          <Button onClick={() => handleCancel(activity.id)}>取消报名</Button>
                        </Space>
                      )}
                    </>
                  )}
                  {activity.status === 'ENDED' && activity.participationStatus === 'REGISTERED' && (
                    <Button type="primary" style={{ marginTop: 16 }} onClick={() => handleComplete(activity.id)}>
                      完成活动
                    </Button>
                  )}
                </List.Item>
              )}
            />
          )}
        </TabPane>
        <TabPane tab="我的活动" key="my">
          {error ? (
            <Empty 
              description={
                <span style={{ color: 'red' }}>{error}</span>
              }
            />
          ) : (
            <List
              loading={loading}
              itemLayout="vertical"
              dataSource={filteredActivities.filter(a => a.participationStatus)}
              locale={{ emptyText: '暂无我的活动记录' }}
              renderItem={(activity) => (
                <List.Item
                  extra={
                    <Space>
                      <Tag color={getTypeColor(activity.type)}>
                        {activity.type === 'VOLUNTEER' ? '志愿服务' :
                         activity.type === 'COMPETITION' ? '竞赛' : '讲座'}
                      </Tag>
                      {getParticipationStatus(activity.participationStatus!)}
                    </Space>
                  }
                >
                  <List.Item.Meta
                    title={<Link to={`${getBasePath()}/activity/${activity.id}`}>{activity.title}</Link>}
                    description={
                      <Space direction="vertical">
                        <div>时间：{activity.startTime} - {activity.endTime}</div>
                        <div>地点：{activity.location}</div>
                        <div>主办方：{activity.organizer}</div>
                      </Space>
                    }
                  />
                  {activity.participationStatus === 'REGISTERED' && (
                    <Space style={{ marginTop: 16 }}>
                      <Button onClick={() => handleCancel(activity.id)}>取消报名</Button>
                    </Space>
                  )}
                  {activity.participationStatus === 'CANCELLED' && activity.status === 'UPCOMING' && (
                    <Button 
                      type="primary" 
                      style={{ marginTop: 16 }}
                      onClick={() => handleRegister(activity.id)}
                      disabled={activity.currentParticipants >= activity.maxParticipants}
                    >
                      {activity.currentParticipants >= activity.maxParticipants ? '报名已满' : '重新报名'}
                    </Button>
                  )}
                  {activity.participationStatus === 'REGISTERED' && activity.status === 'ENDED' && (
                    <Button type="primary" style={{ marginTop: 16 }} onClick={() => handleComplete(activity.id)}>
                      完成活动
                    </Button>
                  )}
                </List.Item>
              )}
            />
          )}
        </TabPane>
      </Tabs>
    </Card>
  );
};

export default StudentActivityList; 