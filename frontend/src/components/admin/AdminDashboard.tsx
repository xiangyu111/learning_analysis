import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Spin, List, Avatar } from 'antd';
import { UserOutlined, TeamOutlined, BookOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';

const { Title } = Typography;

interface SystemStats {
  userCount: {
    total: number;
    admin: number;
    teacher: number;
    student: number;
  };
  classCount: number;
  activityCount: number;
  recentLogs: Array<{
    id: number;
    operationType: string;
    operationDetail: string;
    createdAt: string;
    user: {
      name: string;
      role: string;
    }
  }>;
}

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<SystemStats>({
    userCount: {
      total: 0,
      admin: 0,
      teacher: 0,
      student: 0
    },
    classCount: 0,
    activityCount: 0,
    recentLogs: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // 在实际环境中应当从后端API获取统计数据
        // 这里使用模拟数据
        const mockStats: SystemStats = {
          userCount: {
            total: 125,
            admin: 3,
            teacher: 22,
            student: 100
          },
          classCount: 15,
          activityCount: 48,
          recentLogs: [
            {
              id: 1,
              operationType: 'USER_LOGIN',
              operationDetail: '用户登录成功',
              createdAt: '2025-04-14 10:45:12',
              user: {
                name: '张老师',
                role: 'TEACHER'
              }
            },
            {
              id: 2,
              operationType: 'CLASS_CREATE',
              operationDetail: '创建了新班级：高三(1)班',
              createdAt: '2025-04-14 09:30:05',
              user: {
                name: '系统管理员',
                role: 'ADMIN'
              }
            },
            {
              id: 3,
              operationType: 'ACTIVITY_CREATE',
              operationDetail: '创建了新活动：数学竞赛',
              createdAt: '2025-04-13 16:15:22',
              user: {
                name: '李老师',
                role: 'TEACHER'
              }
            }
          ]
        };
        
        setStats(mockStats);
      } catch (error) {
        console.error('获取仪表盘数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <UserOutlined style={{ color: '#ff4d4f' }} />;
      case 'TEACHER':
        return <UserOutlined style={{ color: '#1890ff' }} />;
      case 'STUDENT':
        return <UserOutlined style={{ color: '#52c41a' }} />;
      default:
        return <UserOutlined />;
    }
  };

  const getOperationTypeIcon = (type: string) => {
    if (type.includes('USER')) return <UserOutlined />;
    if (type.includes('CLASS')) return <TeamOutlined />;
    if (type.includes('ACTIVITY')) return <BookOutlined />;
    return <CheckCircleOutlined />;
  };

  return (
    <div className="admin-dashboard">
      <Title level={2}>系统概览</Title>
      
      <Spin spinning={loading}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总用户数"
                value={stats.userCount.total}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="教师数量"
                value={stats.userCount.teacher}
                prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="学生数量"
                value={stats.userCount.student}
                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="班级数量"
                value={stats.classCount}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>
        
        <Row gutter={16}>
          <Col span={24}>
            <Card title="最近系统操作日志">
              <List
                dataSource={stats.recentLogs}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar icon={getOperationTypeIcon(item.operationType)} />
                      }
                      title={`${item.user.name} (${item.user.role}) - ${item.operationType}`}
                      description={`${item.operationDetail} - ${item.createdAt}`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default AdminDashboard; 