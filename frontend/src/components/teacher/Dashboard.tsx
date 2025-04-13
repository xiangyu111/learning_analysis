import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Typography, Statistic, Table, 
  Button, List, Avatar, Tag, Divider, Progress
} from 'antd';
import { 
  TeamOutlined, CalendarOutlined, FlagOutlined, 
  RiseOutlined, FileOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axios';

const { Title, Text } = Typography;

interface ClassStatistic {
  id: number;
  name: string;
  studentCount: number;
  completionRate: number;
}

interface ActiveTarget {
  id: number;
  title: string;
  deadline: string;
  affectedStudents: number;
  completionRate: number;
}

interface RecentActivity {
  id: number;
  title: string;
  type: string;
  date: string;
  participantsCount: number;
}

const TeacherDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [classStats, setClassStats] = useState<ClassStatistic[]>([]);
  const [activeTargets, setActiveTargets] = useState<ActiveTarget[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 此处应改为实际API接口
      const statsResponse = await axios.get('/api/teacher/dashboard/stats');
      const classStatsResponse = await axios.get('/api/teacher/dashboard/classes');
      const targetsResponse = await axios.get('/api/teacher/dashboard/targets');
      const activitiesResponse = await axios.get('/api/teacher/dashboard/activities');
      
      // 设置统计数据
      setStudentCount(statsResponse.data?.studentCount || 0);
      setActivityCount(statsResponse.data?.activityCount || 0);
      setTargetCount(statsResponse.data?.targetCount || 0);
      
      // 设置班级统计
      setClassStats(classStatsResponse.data || []);
      
      // 设置目标统计
      setActiveTargets(targetsResponse.data || []);
      
      // 设置活动统计
      setRecentActivities(activitiesResponse.data || []);
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      // 使用模拟数据
      setStudentCount(103);
      setActivityCount(15);
      setTargetCount(8);
      
      setClassStats([
        { id: 1, name: '计算机科学1班', studentCount: 35, completionRate: 85 },
        { id: 2, name: '软件工程2班', studentCount: 40, completionRate: 76 },
        { id: 3, name: '人工智能实验班', studentCount: 28, completionRate: 92 },
      ]);
      
      setActiveTargets([
        { id: 1, title: '完成科技创新项目', deadline: '2023-11-30', affectedStudents: 35, completionRate: 60 },
        { id: 2, title: '参加志愿服务活动', deadline: '2023-10-31', affectedStudents: 75, completionRate: 85 },
        { id: 3, title: '撰写学术报告', deadline: '2023-11-15', affectedStudents: 28, completionRate: 40 },
      ]);
      
      setRecentActivities([
        { id: 1, title: '科技创新大赛', type: '竞赛', date: '2023-10-15', participantsCount: 45 },
        { id: 2, title: '志愿服务活动', type: '志愿服务', date: '2023-10-06', participantsCount: 30 },
        { id: 3, title: '学术讲座：人工智能前沿', type: '讲座', date: '2023-10-10', participantsCount: 120 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClassClick = (classId: number) => {
    navigate(`/teacher/class/${classId}`);
  };

  const handleTargetClick = (targetId: number) => {
    navigate(`/teacher/target/${targetId}`);
  };

  const handleActivityClick = (activityId: number) => {
    navigate(`/teacher/activity/${activityId}`);
  };

  const handleCreateActivity = () => {
    navigate('/teacher/activity/create');
  };

  const handleCreateTarget = () => {
    navigate('/teacher/target/create');
  };

  const classColumns = [
    {
      title: '班级名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ClassStatistic) => (
        <a onClick={() => handleClassClick(record.id)}>{text}</a>
      ),
    },
    {
      title: '学生数量',
      dataIndex: 'studentCount',
      key: 'studentCount',
    },
    {
      title: '目标完成率',
      dataIndex: 'completionRate',
      key: 'completionRate',
      render: (value: number) => (
        <Progress percent={value} size="small" />
      ),
    },
  ];

  return (
    <div className="teacher-dashboard">
      <Title level={2}>教师工作台</Title>
      
      <Row gutter={16}>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic 
              title="管理学生总数" 
              value={studentCount} 
              prefix={<TeamOutlined />} 
            />
            <div style={{ marginTop: 8 }}>
              <Button type="link" onClick={() => navigate('/teacher/classes')}>
                查看所有学生
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic 
              title="已发布活动" 
              value={activityCount} 
              prefix={<CalendarOutlined />} 
            />
            <div style={{ marginTop: 8 }}>
              <Button type="link" onClick={() => navigate('/teacher/activities')}>
                管理活动
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card loading={loading}>
            <Statistic 
              title="学习目标" 
              value={targetCount} 
              prefix={<FlagOutlined />} 
            />
            <div style={{ marginTop: 8 }}>
              <Button type="link" onClick={() => navigate('/teacher/targets')}>
                查看所有目标
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card 
            title="班级概览" 
            loading={loading}
            extra={<Button type="link" onClick={() => navigate('/teacher/classes')}>查看全部</Button>}
          >
            <Table 
              columns={classColumns} 
              dataSource={classStats} 
              rowKey="id" 
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card 
            title="活跃学习目标" 
            loading={loading}
            extra={
              <Button type="primary" size="small" onClick={handleCreateTarget}>
                新建目标
              </Button>
            }
          >
            <List
              size="small"
              dataSource={activeTargets}
              renderItem={item => (
                <List.Item
                  key={item.id}
                  actions={[
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => handleTargetClick(item.id)}
                    >
                      查看
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={<a onClick={() => handleTargetClick(item.id)}>{item.title}</a>}
                    description={
                      <>
                        <Text type="secondary">截止日期: {item.deadline}</Text>
                        <br />
                        <Text type="secondary">影响学生: {item.affectedStudents}人</Text>
                        <Progress percent={item.completionRate} size="small" />
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="近期活动" 
        style={{ marginTop: 16 }}
        loading={loading}
        extra={
          <Button type="primary" onClick={handleCreateActivity}>
            发布新活动
          </Button>
        }
      >
        <List
          itemLayout="horizontal"
          dataSource={recentActivities}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                <Button 
                  type="link" 
                  onClick={() => handleActivityClick(item.id)}
                >
                  查看详情
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<CalendarOutlined />} />}
                title={<a onClick={() => handleActivityClick(item.id)}>{item.title}</a>}
                description={
                  <>
                    <Tag color="blue">{item.type}</Tag>
                    <Text style={{ marginLeft: 8 }}>{item.date}</Text>
                    <Text style={{ marginLeft: 8 }}>
                      <TeamOutlined /> {item.participantsCount}人参与
                    </Text>
                  </>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default TeacherDashboard; 