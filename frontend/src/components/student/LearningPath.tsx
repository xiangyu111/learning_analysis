import React, { useEffect, useState } from 'react';
import { Card, List, Typography, Progress, Tag } from 'antd';
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

    useEffect(() => {
        const fetchPaths = async () => {
            try {
                const response = await axios.get('/api/student/learning-paths');
                setPaths(response.data);
            } catch (error) {
                console.error('Error fetching learning paths:', error);
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