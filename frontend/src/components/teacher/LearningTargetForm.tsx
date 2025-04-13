import React, { useState, useEffect } from 'react';
import { 
  Form, Input, Button, DatePicker, Select, 
  Card, Typography, message, Divider, 
  Transfer, Table, Tag
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import type { TransferItem } from 'antd/es/transfer';
import axios from '../../utils/axios';
import { PlusOutlined, SaveOutlined, RollbackOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface Student {
  key: string;
  id: number;
  name: string;
  username: string;
  className: string;
}

interface Activity {
  id: number;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
}

interface TableTransferProps {
  dataSource: Student[];
  targetKeys: string[];
  onChange: (targetKeys: string[]) => void;
}

// 表格穿梭框组件用于选择学生
const TableTransfer: React.FC<TableTransferProps> = ({ dataSource, targetKeys, onChange }) => {
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '学号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '班级',
      dataIndex: 'className',
      key: 'className',
    },
  ];

  return (
    <Transfer<TransferItem & { name?: string; username?: string }>
      dataSource={dataSource as any}
      targetKeys={targetKeys}
      onChange={(newTargetKeys) => onChange(newTargetKeys as string[])}
      showSearch
      filterOption={(inputValue, item: any) => 
        item.name?.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1 ||
        item.username?.toLowerCase().indexOf(inputValue.toLowerCase()) !== -1
      }
      listStyle={{ width: '100%', height: 300 }}
      operationStyle={{ width: 60 }}
      titles={['未选学生', '已选学生']}
      render={(item: any) => `${item.name} (${item.username})`}
    >
      {({ direction, filteredItems, onItemSelect, selectedKeys }) => (
        <Table
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys: selectedKeys,
            onSelect: (record: any, selected) => {
              onItemSelect(record.key, selected);
            },
          }}
          columns={columns}
          dataSource={filteredItems as any}
          size="small"
          pagination={{ pageSize: 5 }}
          style={{ pointerEvents: 'auto' }}
        />
      )}
    </Transfer>
  );
};

const LearningTargetForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [targetType, setTargetType] = useState<'class' | 'student'>('student');
  const [classes, setClasses] = useState<any[]>([]);
  const [recommendedActivities, setRecommendedActivities] = useState<Activity[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);

  useEffect(() => {
    // 解析URL参数中的学生ID列表
    const searchParams = new URLSearchParams(location.search);
    const studentIds = searchParams.get('students');
    
    if (studentIds) {
      const studentIdArray = studentIds.split(',');
      setTargetKeys(studentIdArray);
    }
    
    // 获取学生列表、班级列表和推荐活动
    fetchStudents();
    fetchClasses();
    fetchRecommendedActivities();
  }, [location.search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // 此处应改为实际API接口
      const response = await axios.get('/api/teacher/students/all');
      
      // 转换数据格式以适配Transfer组件
      const formattedStudents = (response.data || []).map((student: any) => ({
        key: student.id.toString(),
        id: student.id,
        name: student.name,
        username: student.username,
        className: student.className || '未分配班级'
      }));
      
      setStudents(formattedStudents);
    } catch (error) {
      console.error('获取学生列表失败:', error);
      // 使用模拟数据
      const mockStudents = [
        { key: '1', id: 1, name: '张三', username: 'student1', className: '计算机科学1班' },
        { key: '2', id: 2, name: '李四', username: 'student2', className: '计算机科学1班' },
        { key: '3', id: 3, name: '王五', username: 'student3', className: '软件工程2班' },
        { key: '4', id: 4, name: '赵六', username: 'student4', className: '软件工程2班' },
        { key: '5', id: 5, name: '钱七', username: 'student5', className: '人工智能实验班' },
      ];
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      // 此处应改为实际API接口
      const response = await axios.get('/api/teacher/classes');
      setClasses(response.data || []);
    } catch (error) {
      console.error('获取班级列表失败:', error);
      // 使用模拟数据
      setClasses([
        { id: 1, name: '计算机科学1班' },
        { id: 2, name: '软件工程2班' },
        { id: 3, name: '人工智能实验班' },
      ]);
    }
  };

  const fetchRecommendedActivities = async () => {
    try {
      // 此处应改为实际API接口
      const response = await axios.get('/api/teacher/activities/recommended');
      setRecommendedActivities(response.data || []);
    } catch (error) {
      console.error('获取推荐活动失败:', error);
      // 使用模拟数据
      setRecommendedActivities([
        { id: 1, title: '科技创新大赛', type: '竞赛', startTime: '2023-10-01', endTime: '2023-10-15' },
        { id: 2, title: '志愿服务活动', type: '志愿服务', startTime: '2023-10-05', endTime: '2023-10-06' },
        { id: 3, title: '学术讲座：人工智能前沿', type: '讲座', startTime: '2023-10-10', endTime: '2023-10-10' },
      ]);
    }
  };

  const handleTransferChange = (newTargetKeys: string[]) => {
    setTargetKeys(newTargetKeys);
  };

  const handleTargetTypeChange = (value: 'class' | 'student') => {
    setTargetType(value);
    if (value === 'class') {
      setTargetKeys([]);
    }
  };

  const handleClassChange = (classIds: number[]) => {
    if (classIds.length > 0) {
      // 根据选中的班级自动选择学生
      const studentsInSelectedClasses = students.filter(student => 
        classIds.some(classId => 
          // 假设每个学生数据中有className属性
          // 实际应用中可能需要更复杂的匹配逻辑
          classes.find(c => c.id === classId)?.name === student.className
        )
      );
      
      setTargetKeys(studentsInSelectedClasses.map(student => student.key));
    } else {
      setTargetKeys([]);
    }
  };

  const handleActivitySelect = (activityId: number) => {
    if (selectedActivities.includes(activityId)) {
      setSelectedActivities(selectedActivities.filter(id => id !== activityId));
    } else {
      setSelectedActivities([...selectedActivities, activityId]);
    }
  };

  const onFinish = async (values: any) => {
    if (targetKeys.length === 0) {
      message.warning('请至少选择一名学生');
      return;
    }

    setLoading(true);
    try {
      // 准备提交数据
      const targetData = {
        ...values,
        deadline: values.deadline?.format('YYYY-MM-DD HH:mm:ss'),
        students: targetKeys.map(key => parseInt(key)),
        activities: selectedActivities
      };
      
      // 此处应改为实际API接口
      await axios.post('/api/teacher/targets/create', targetData);
      
      message.success('学习目标创建成功');
      navigate('/teacher/targets');
    } catch (error) {
      console.error('创建学习目标失败:', error);
      message.error('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="learning-target-form">
      <Card>
        <Title level={2}>制定学习目标</Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ targetType: 'student' }}
        >
          <Divider orientation="left">目标对象</Divider>
          
          <Form.Item name="targetType" label="目标类型">
            <Select onChange={(value) => handleTargetTypeChange(value as 'class' | 'student')}>
              <Option value="student">按学生选择</Option>
              <Option value="class">按班级选择</Option>
            </Select>
          </Form.Item>
          
          {targetType === 'class' ? (
            <Form.Item 
              name="classes" 
              label="选择班级"
              rules={[{ required: true, message: '请选择至少一个班级' }]}
            >
              <Select
                mode="multiple"
                placeholder="请选择班级"
                onChange={(values) => handleClassChange(values as number[])}
              >
                {classes.map(cls => (
                  <Option key={cls.id} value={cls.id}>{cls.name}</Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item 
              label="选择学生"
              required
              help="从左侧表格中选择学生，添加到右侧"
            >
              <TableTransfer
                dataSource={students}
                targetKeys={targetKeys}
                onChange={handleTransferChange}
              />
            </Form.Item>
          )}
          
          <Text type="secondary">
            已选择 {targetKeys.length} 名学生
          </Text>
          
          <Divider orientation="left">目标内容</Divider>
          
          <Form.Item
            name="title"
            label="目标标题"
            rules={[{ required: true, message: '请输入目标标题' }]}
          >
            <Input placeholder="例如：完成科技创新项目" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="目标描述"
            rules={[{ required: true, message: '请输入目标描述' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="详细描述学习目标要求和期望达成的效果" 
            />
          </Form.Item>
          
          <Form.Item
            name="deadline"
            label="截止时间"
            rules={[{ required: true, message: '请选择截止时间' }]}
          >
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss" 
              style={{ width: '100%' }}
              placeholder="选择目标完成截止时间"
            />
          </Form.Item>
          
          <Divider orientation="left">相关活动</Divider>
          
          <Form.Item label="推荐活动">
            <div className="recommended-activities">
              {recommendedActivities.length > 0 ? (
                recommendedActivities.map(activity => (
                  <Card
                    key={activity.id}
                    size="small"
                    style={{ 
                      marginBottom: 10, 
                      cursor: 'pointer',
                      borderColor: selectedActivities.includes(activity.id) ? '#1890ff' : '#d9d9d9'
                    }}
                    onClick={() => handleActivitySelect(activity.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div><strong>{activity.title}</strong></div>
                        <div>
                          <Tag color="blue">{activity.type}</Tag>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {activity.startTime} ~ {activity.endTime}
                          </Text>
                        </div>
                      </div>
                      {selectedActivities.includes(activity.id) && (
                        <Tag color="green">已选择</Tag>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <Text type="secondary">暂无推荐活动</Text>
              )}
            </div>
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<SaveOutlined />}
              loading={loading}
              style={{ marginRight: 8 }}
            >
              创建目标
            </Button>
            <Button 
              icon={<RollbackOutlined />} 
              onClick={() => navigate('/teacher/dashboard')}
            >
              取消
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LearningTargetForm; 