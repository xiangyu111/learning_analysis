import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Space, Table, Button, Tabs, Tag, Input, Form,
  Select, DatePicker, Modal, Typography, Rate, message, Empty
} from 'antd';
import {
  UserOutlined, EditOutlined, PlusOutlined,
  DeleteOutlined, SearchOutlined, TeamOutlined
} from '@ant-design/icons';
import axios from '../../utils/axios';
import moment from 'moment';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

interface Student {
  id: number;
  name: string;
  studentId: string;
  className?: string;
  avatar?: string;
}

interface Evaluation {
  id: number;
  studentId: number;
  title: string;
  content: string;
  createdAt: string;
  score: number;
  type: string;
  createdBy: string;
}

interface Activity {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
  participationStatus: string;
}

const StudentEvaluation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('evaluations');

  useEffect(() => {
    if (id) {
      fetchStudentDetails();
      fetchStudentEvaluations();
      fetchStudentActivities();
    } else {
      // 如果没有id，显示学生列表
      fetchStudentList();
    }
  }, [id]);

  const fetchStudentDetails = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/teacher/students/${id}`);
      setStudent(response.data);
    } catch (error) {
      console.error('获取学生详情失败:', error);
      message.error('获取学生详情失败');
      
      // 使用模拟数据
      setStudent({
        id: parseInt(id),
        name: '张三',
        studentId: '2020001',
        className: '计算机科学1班'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentEvaluations = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/teacher/students/${id}/evaluations`);
      setEvaluations(response.data);
    } catch (error) {
      console.error('获取学生评估记录失败:', error);
      message.error('获取学生评估记录失败，使用模拟数据');
      
      // 使用模拟数据
      setEvaluations([
        {
          id: 1,
          studentId: parseInt(id),
          title: '第一学期表现评估',
          content: '该学生在第一学期表现优秀，积极参与课堂讨论和课外活动。',
          createdAt: '2023-09-20',
          score: 4.5,
          type: 'SEMESTER',
          createdBy: '李老师'
        },
        {
          id: 2,
          studentId: parseInt(id),
          title: '科技创新大赛评价',
          content: '在科技创新大赛中展现出良好的团队协作能力和创新思维。',
          createdAt: '2023-10-15',
          score: 4.0,
          type: 'ACTIVITY',
          createdBy: '王老师'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentActivities = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const response = await axios.get(`/api/teacher/students/${id}/activities`);
      setActivities(response.data);
    } catch (error) {
      console.error('获取学生活动记录失败:', error);
      
      // 使用模拟数据
      setActivities([
        {
          id: 1,
          title: '科技创新大赛',
          type: 'COMPETITION',
          startTime: '2023-10-01',
          endTime: '2023-10-15',
          status: 'COMPLETED',
          participationStatus: 'COMPLETED'
        },
        {
          id: 2,
          title: '志愿服务活动',
          type: 'VOLUNTEER',
          startTime: '2023-10-05',
          endTime: '2023-10-06',
          status: 'COMPLETED',
          participationStatus: 'COMPLETED'
        },
        {
          id: 3,
          title: '学术讲座：人工智能前沿',
          type: 'LECTURE',
          startTime: '2023-10-10',
          endTime: '2023-10-10',
          status: 'COMPLETED',
          participationStatus: 'REGISTERED'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const [studentList, setStudentList] = useState<Student[]>([]);
  
  const fetchStudentList = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/teacher/students');
      setStudentList(response.data);
    } catch (error) {
      console.error('获取学生列表失败:', error);
      message.error('获取学生列表失败，使用模拟数据');
      
      // 使用模拟数据
      setStudentList([
        { id: 1, name: '张三', studentId: '2020001', className: '计算机科学1班' },
        { id: 2, name: '李四', studentId: '2020002', className: '计算机科学1班' },
        { id: 3, name: '王五', studentId: '2020003', className: '软件工程2班' },
        { id: 4, name: '赵六', studentId: '2020004', className: '软件工程2班' },
        { id: 5, name: '孙七', studentId: '2020005', className: '人工智能3班' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const filteredEvaluations = evaluations.filter(evaluation => 
    evaluation.title.toLowerCase().includes(searchText.toLowerCase()) ||
    evaluation.content.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredStudents = studentList.filter(student => 
    student.name.toLowerCase().includes(searchText.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
    (student.className && student.className.toLowerCase().includes(searchText.toLowerCase()))
  );

  const showCreateModal = () => {
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const handleCreateEvaluation = () => {
    form.validateFields().then(async (values) => {
      try {
        const evaluationData = {
          ...values,
          studentId: id,
          createdAt: moment().format('YYYY-MM-DD')
        };
        
        await axios.post('/api/teacher/evaluations/create', evaluationData);
        message.success('评估创建成功');
        setIsModalVisible(false);
        fetchStudentEvaluations();
      } catch (error) {
        console.error('创建评估失败:', error);
        message.error('创建失败，请重试');
      }
    });
  };

  const handleDeleteEvaluation = (evaluationId: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条评估记录吗？',
      onOk: async () => {
        try {
          await axios.delete(`/api/teacher/evaluations/${evaluationId}`);
          message.success('评估记录已删除');
          fetchStudentEvaluations();
        } catch (error) {
          console.error('删除评估记录失败:', error);
          message.error('删除失败，请重试');
        }
      }
    });
  };

  const handleViewStudent = (studentId: number) => {
    navigate(`/teacher/student/${studentId}`);
  };

  const studentColumns = [
    {
      title: '学号',
      dataIndex: 'studentId',
      key: 'studentId',
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Student) => (
        <Button 
          type="primary" 
          icon={<UserOutlined />} 
          onClick={() => handleViewStudent(record.id)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  const evaluationColumns = [
    {
      title: '评估标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '评估类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        let color = 'blue';
        let text = type;
        
        if (type === 'SEMESTER') {
          color = 'green';
          text = '学期评估';
        } else if (type === 'ACTIVITY') {
          color = 'blue';
          text = '活动评估';
        } else if (type === 'SPECIAL') {
          color = 'purple';
          text = '特殊评估';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '评分',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => <Rate disabled defaultValue={score} allowHalf />,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: string, record: Evaluation) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteEvaluation(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const activityColumns = [
    {
      title: '活动标题',
      dataIndex: 'title',
      key: 'title',
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
      title: '时间',
      key: 'time',
      render: (text: string, record: Activity) => (
        <span>{record.startTime} 至 {record.endTime}</span>
      ),
    },
    {
      title: '状态',
      key: 'participationStatus',
      render: (text: string, record: Activity) => {
        let color = 'default';
        let statusText = '';
        
        if (record.participationStatus === 'REGISTERED') {
          color = 'blue';
          statusText = '已报名';
        } else if (record.participationStatus === 'COMPLETED') {
          color = 'green';
          statusText = '已完成';
        } else if (record.participationStatus === 'CANCELLED') {
          color = 'red';
          statusText = '已取消';
        }
        
        return <Tag color={color}>{statusText}</Tag>;
      },
    },
  ];

  // 显示学生列表
  if (!id) {
    return (
      <div className="student-list">
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4}>学生列表</Title>
            <Input.Search
              placeholder="搜索学生姓名或学号"
              allowClear
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
          </div>
          
          <Table 
            columns={studentColumns} 
            dataSource={filteredStudents} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    );
  }

  // 显示学生详情
  return (
    <div className="student-evaluation">
      <Card loading={loading}>
        {student ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <Space>
                <UserOutlined style={{ fontSize: 24 }} />
                <Title level={3} style={{ margin: 0 }}>{student.name}</Title>
                <Text type="secondary">学号: {student.studentId}</Text>
                {student.className && <Text type="secondary">班级: {student.className}</Text>}
              </Space>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showCreateModal}
              >
                创建评估
              </Button>
            </div>
            
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="评估记录" key="evaluations">
                <div style={{ marginBottom: 16 }}>
                  <Input.Search
                    placeholder="搜索评估记录"
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 300 }}
                  />
                </div>
                
                <Table 
                  columns={evaluationColumns} 
                  dataSource={filteredEvaluations} 
                  rowKey="id" 
                  loading={loading}
                  expandable={{
                    expandedRowRender: record => (
                      <div style={{ margin: 0 }}>
                        <Paragraph>{record.content}</Paragraph>
                      </div>
                    ),
                  }}
                  pagination={{ pageSize: 5 }}
                />
              </TabPane>
              
              <TabPane tab="活动参与" key="activities">
                <Table 
                  columns={activityColumns} 
                  dataSource={activities} 
                  rowKey="id" 
                  loading={loading}
                  pagination={{ pageSize: 5 }}
                />
              </TabPane>
            </Tabs>
          </>
        ) : (
          <Empty description="未找到学生信息" />
        )}
      </Card>
      
      <Modal
        title="创建学生评估"
        open={isModalVisible}
        onOk={handleCreateEvaluation}
        onCancel={handleModalCancel}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="评估标题"
            rules={[{ required: true, message: '请输入评估标题' }]}
          >
            <Input placeholder="请输入评估标题" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="评估类型"
            rules={[{ required: true, message: '请选择评估类型' }]}
          >
            <Select placeholder="请选择评估类型">
              <Option value="SEMESTER">学期评估</Option>
              <Option value="ACTIVITY">活动评估</Option>
              <Option value="SPECIAL">特殊评估</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="score"
            label="评分"
            rules={[{ required: true, message: '请给出评分' }]}
          >
            <Rate allowHalf />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="评估内容"
            rules={[{ required: true, message: '请输入评估内容' }]}
          >
            <TextArea rows={4} placeholder="请输入评估内容" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StudentEvaluation; 