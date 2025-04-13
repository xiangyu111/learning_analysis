import React, { useEffect, useState } from 'react';
import { Card, Row, Col, List, Typography, Progress, Tag, Statistic, Button, message } from 'antd';
import { BookOutlined, CalendarOutlined, FileTextOutlined, BarChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../../utils/axios';
import './Dashboard.css';

const { Title, Text } = Typography;

interface LearningGoal {
    id: number;
    title: string;
    progress: number;
    dueDate: string;
    status: string;
}

interface LearningActivity {
    id: number;
    title: string;
    dueDate: string;
    type: string;
}

interface Stats {
    goalCompletionRate: number;
    activityParticipationRate: number;
}

const Dashboard: React.FC = () => {
    const [goals, setGoals] = useState<LearningGoal[]>([]);
    const [activities, setActivities] = useState<LearningActivity[]>([]);
    const [stats, setStats] = useState<Stats>({
        goalCompletionRate: 0,
        activityParticipationRate: 0
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [goalsRes, activitiesRes, statsRes] = await Promise.all([
                    axios.get('/api/student/goals'),
                    axios.get('/api/student/activities'),
                    axios.get('/api/student/stats')
                ]);

                setGoals(goalsRes.data);
                setActivities(activitiesRes.data);
                setStats(statsRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                message.error('获取数据失败，请稍后重试');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS':
                return 'processing';
            case 'COMPLETED':
                return 'success';
            case 'PENDING_REVIEW':
                return 'warning';
            default:
                return 'default';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS':
                return '进行中';
            case 'COMPLETED':
                return '已完成';
            case 'PENDING_REVIEW':
                return '待审核';
            default:
                return '未开始';
        }
    };

    return (
        <div className="dashboard">
            <Title level={2}>学习仪表盘</Title>
            
            <Row gutter={[16, 16]}>
                {/* 统计卡片 */}
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="目标完成率"
                            value={stats.goalCompletionRate}
                            suffix="%"
                            prefix={<BarChartOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="活动参与率"
                            value={stats.activityParticipationRate}
                            suffix="%"
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>

                {/* 学习目标 */}
                <Col xs={24} md={12}>
                    <Card
                        title={
                            <span>
                                <BookOutlined /> 学习目标
                            </span>
                        }
                        className="dashboard-card"
                        loading={loading}
                    >
                        <List
                            dataSource={goals}
                            renderItem={goal => (
                                <List.Item>
                                    <div style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <Text strong>{goal.title}</Text>
                                            <Tag color={getStatusColor(goal.status)}>
                                                {getStatusText(goal.status)}
                                            </Tag>
                                        </div>
                                        <Progress percent={goal.progress} size="small" />
                                        <div style={{ marginTop: '8px', color: 'rgba(0,0,0,0.45)' }}>
                                            <CalendarOutlined /> 截止日期: {new Date(goal.dueDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                            locale={{ emptyText: '暂无学习目标' }}
                        />
                    </Card>
                </Col>

                {/* 近期活动 */}
                <Col xs={24} md={12}>
                    <Card
                        title={
                            <span>
                                <CalendarOutlined /> 近期活动
                            </span>
                        }
                        className="dashboard-card"
                        loading={loading}
                    >
                        <List
                            dataSource={activities}
                            renderItem={activity => (
                                <List.Item
                                    actions={[
                                        <Button 
                                            type="primary" 
                                            size="small"
                                            onClick={() => navigate(`/student/activity/${activity.id}`)}
                                        >
                                            查看详情
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        title={activity.title}
                                        description={
                                            <>
                                                <Tag color="blue">{activity.type}</Tag>
                                                <span style={{ marginLeft: '8px', color: 'rgba(0,0,0,0.45)' }}>
                                                    <CalendarOutlined /> {new Date(activity.dueDate).toLocaleDateString()}
                                                </span>
                                            </>
                                        }
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: '暂无近期活动' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard; 