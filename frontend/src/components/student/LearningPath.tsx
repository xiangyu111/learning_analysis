import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Progress, Tag, message, Empty, Spin } from 'antd';
import { BookOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';

const { Title, Text } = Typography;

interface LearningPath {
    id: number;
    title: string;
    description: string;
    progress: number;
    goals: LearningGoal[];
    activities: LearningActivity[];
}

interface LearningGoal {
    id: number;
    title: string;
    progress: number;
    status: string;
}

interface LearningActivity {
    id: number;
    title: string;
    type: string;
    dueDate: string;
}

const LearningPath: React.FC = () => {
    const [paths, setPaths] = useState<LearningPath[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPaths = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // 获取当前用户信息
                const userInfo = JSON.parse(localStorage.getItem('user') || '{}');
                console.log('当前用户信息:', userInfo);
                
                if (!userInfo.id) {
                    throw new Error('用户未登录或用户信息不完整');
                }
                
                console.log('请求学习路径, URL: /api/student/learning-paths');
                const response = await axios.get('/api/student/learning-paths');
                console.log('学习路径响应:', response.data);
                setPaths(response.data);
            } catch (error: any) {
                console.error('Error fetching learning paths:', error);
                setError(error.response?.data?.message || '获取学习路径失败');
                message.error('获取学习路径失败: ' + (error.response?.data?.message || error.message));
            } finally {
                setLoading(false);
            }
        };

        fetchPaths();
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

    if (loading) {
        return <Spin tip="加载中..." size="large" style={{ display: 'flex', justifyContent: 'center', margin: '50px 0' }} />;
    }

    if (error) {
        return (
            <div>
                <Title level={2}>学习路径</Title>
                <Empty 
                    description={`加载失败: ${error}`} 
                    image={Empty.PRESENTED_IMAGE_SIMPLE} 
                />
            </div>
        );
    }

    if (paths.length === 0) {
        return (
            <div>
                <Title level={2}>学习路径</Title>
                <Empty description="暂无学习路径" />
            </div>
        );
    }

    return (
        <div>
            <Title level={2}>学习路径</Title>
            <List
                grid={{ gutter: 16, column: 2 }}
                dataSource={paths}
                renderItem={path => (
                    <List.Item>
                        <Card
                            title={path.title}
                            extra={<Progress percent={path.progress} size="small" />}
                        >
                            <Text>{path.description}</Text>
                            
                            <div style={{ marginTop: '16px' }}>
                                <Title level={4}>学习目标</Title>
                                <List
                                    dataSource={path.goals}
                                    renderItem={goal => (
                                        <List.Item>
                                            <div style={{ width: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Text>{goal.title}</Text>
                                                    <Tag color={getStatusColor(goal.status)}>
                                                        {goal.status}
                                                    </Tag>
                                                </div>
                                                <Progress percent={goal.progress} size="small" />
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>

                            <div style={{ marginTop: '16px' }}>
                                <Title level={4}>学习活动</Title>
                                <List
                                    dataSource={path.activities}
                                    renderItem={activity => (
                                        <List.Item>
                                            <div style={{ width: '100%' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Text>{activity.title}</Text>
                                                    <Tag>{activity.type}</Tag>
                                                </div>
                                                <div>
                                                    <CalendarOutlined /> 截止日期: {new Date(activity.dueDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </List.Item>
                                    )}
                                />
                            </div>
                        </Card>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default LearningPath; 