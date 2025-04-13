import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Button, Tag, message, Typography, Divider, Space, Row, Col } from 'antd';
import { CalendarOutlined, EnvironmentOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';

const { Title, Paragraph } = Typography;

interface Activity {
    id: number;
    title: string;
    type: string;
    status: string;
    startTime: string;
    endTime: string;
    location: string;
    description: string;
    organizer: string;
    maxParticipants: number;
    currentParticipants: number;
    participationStatus?: string;
}

const ActivityDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activity, setActivity] = useState<Activity | null>(null);
    const [loading, setLoading] = useState(false);

    // 获取用户角色
    const getUserRole = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return user.role || '';
    };

    // 获取API前缀
    const getApiPrefix = () => {
        const role = getUserRole();
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

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                setLoading(true);
                const apiPrefix = getApiPrefix();
                console.log(`正在请求活动详情: ${apiPrefix}/activities/${id}`);
                const response = await axios.get(`${apiPrefix}/activities/${id}`);
                setActivity(response.data);
            } catch (error) {
                console.error('获取活动详情失败:', error);
                message.error('获取活动详情失败');
            } finally {
                setLoading(false);
            }
        };

        fetchActivity();
    }, [id]);

    const handleRegister = async () => {
        try {
            setLoading(true);
            const apiPrefix = getApiPrefix();
            await axios.post(`${apiPrefix}/activities/${id}/register`);
            message.success('报名成功！');
            // 刷新活动状态
            const response = await axios.get(`${apiPrefix}/activities/${id}`);
            setActivity(response.data);
        } catch (error) {
            message.error('报名失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        try {
            setLoading(true);
            const apiPrefix = getApiPrefix();
            await axios.post(`${apiPrefix}/activities/${id}/cancel`);
            message.success('取消报名成功！');
            // 刷新活动状态
            const response = await axios.get(`${apiPrefix}/activities/${id}`);
            setActivity(response.data);
        } catch (error) {
            message.error('取消报名失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async () => {
        try {
            setLoading(true);
            const apiPrefix = getApiPrefix();
            await axios.post(`${apiPrefix}/activities/${id}/complete`);
            message.success('活动已完成！');
            // 刷新活动状态
            const response = await axios.get(`${apiPrefix}/activities/${id}`);
            setActivity(response.data);
        } catch (error) {
            message.error('操作失败，请重试');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !activity) {
        return <div>加载中...</div>;
    }

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

    const getParticipationStatusText = (status: string) => {
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

    return (
        <div style={{ padding: '24px' }}>
            <Card loading={loading} bordered={false}>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <Title level={2}>{activity.title}</Title>
                            <Space>
                                <Tag color={getTypeColor(activity.type)}>
                                    {activity.type === 'VOLUNTEER' ? '志愿服务' :
                                    activity.type === 'COMPETITION' ? '竞赛' : '讲座'}
                                </Tag>
                                <Tag color={getStatusColor(activity.status)}>
                                    {activity.status === 'ONGOING' ? '进行中' :
                                    activity.status === 'UPCOMING' ? '即将开始' : '已结束'}
                                </Tag>
                                {activity.participationStatus && getParticipationStatusText(activity.participationStatus)}
                            </Space>
                        </div>
                    </Col>

                    <Col span={24}>
                        <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                            <Descriptions.Item label={<><CalendarOutlined /> 开始时间</>}>{activity.startTime}</Descriptions.Item>
                            <Descriptions.Item label={<><ClockCircleOutlined /> 结束时间</>}>{activity.endTime}</Descriptions.Item>
                            <Descriptions.Item label={<><EnvironmentOutlined /> 活动地点</>}>{activity.location}</Descriptions.Item>
                            <Descriptions.Item label={<><TeamOutlined /> 主办方</>}>{activity.organizer}</Descriptions.Item>
                            <Descriptions.Item label="参与人数">{activity.currentParticipants}/{activity.maxParticipants}</Descriptions.Item>
                        </Descriptions>
                    </Col>

                    <Col span={24}>
                        <Divider orientation="left">活动描述</Divider>
                        <Paragraph>{activity.description}</Paragraph>
                    </Col>

                    <Col span={24}>
                        <Divider />
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                            {activity.status === 'UPCOMING' && !activity.participationStatus && getUserRole() === 'STUDENT' && (
                                <Button 
                                    type="primary" 
                                    onClick={handleRegister}
                                    disabled={activity.currentParticipants >= activity.maxParticipants}
                                >
                                    {activity.currentParticipants >= activity.maxParticipants 
                                    ? '报名已满' 
                                    : '立即报名'}
                                </Button>
                            )}
                            {activity.participationStatus === 'REGISTERED' && (
                                <>
                                    <Button danger onClick={handleCancel}>取消报名</Button>
                                    {activity.status === 'ENDED' && (
                                        <Button type="primary" onClick={handleComplete}>
                                            完成活动
                                        </Button>
                                    )}
                                </>
                            )}
                            <Button onClick={() => navigate(`${getBasePath()}/activities`)}>返回列表</Button>
                        </div>
                    </Col>
                </Row>
            </Card>
        </div>
    );
};

export default ActivityDetail; 