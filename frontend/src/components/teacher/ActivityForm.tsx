import React, { useState, useEffect } from 'react';
import { Form, Input, Button, DatePicker, Select, InputNumber, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axios';
import moment from 'moment';

const { Option } = Select;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface ActivityFormProps {
  mode: 'create' | 'edit';
}

const ActivityForm: React.FC<ActivityFormProps> = ({ mode }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState<any>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchActivityDetails(id);
    }
  }, [mode, id]);

  const fetchActivityDetails = async (activityId: string) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/teacher/activities/${activityId}`);
      
      const activity = response.data;
      
      // 转换日期格式以适应表单控件
      const startTime = moment(activity.startTime, 'YYYY-MM-DD HH:mm:ss');
      const endTime = moment(activity.endTime, 'YYYY-MM-DD HH:mm:ss');
      
      setInitialValues({
        ...activity,
        timeRange: [startTime, endTime]
      });
      
      form.setFieldsValue({
        title: activity.title,
        type: activity.type,
        location: activity.location,
        maxParticipants: activity.maxParticipants,
        description: activity.description,
        organizer: activity.organizer,
        timeRange: [startTime, endTime]
      });
      
    } catch (error) {
      message.error('获取活动详情失败');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      
      // 处理日期范围
      const [start, end] = values.timeRange;
      const startTime = start.format('YYYY-MM-DD HH:mm:ss');
      const endTime = end.format('YYYY-MM-DD HH:mm:ss');
      
      // 准备提交的数据
      const activityData = {
        ...values,
        startTime,
        endTime
      };
      
      // 删除timeRange字段，因为后端不需要
      delete activityData.timeRange;
      
      if (mode === 'create') {
        // 创建新活动
        await axios.post('/api/teacher/activities/create', activityData);
        message.success('活动创建成功');
      } else if (mode === 'edit' && id) {
        // 更新现有活动
        await axios.put(`/api/teacher/activities/${id}`, activityData);
        message.success('活动更新成功');
      }
      
      // 成功后返回活动列表
      navigate('/teacher/activities');
      
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h2>{mode === 'create' ? '创建新活动' : '编辑活动'}</h2>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={initialValues}
        disabled={loading}
      >
        <Form.Item
          name="title"
          label="活动标题"
          rules={[{ required: true, message: '请输入活动标题' }]}
        >
          <Input placeholder="请输入活动标题" />
        </Form.Item>
        
        <Form.Item
          name="type"
          label="活动类型"
          rules={[{ required: true, message: '请选择活动类型' }]}
        >
          <Select placeholder="请选择活动类型">
            <Option value="VOLUNTEER">志愿服务</Option>
            <Option value="COMPETITION">竞赛</Option>
            <Option value="LECTURE">讲座</Option>
          </Select>
        </Form.Item>
        
        <Form.Item
          name="timeRange"
          label="活动时间"
          rules={[{ required: true, message: '请选择活动时间' }]}
        >
          <RangePicker 
            showTime 
            format="YYYY-MM-DD HH:mm:ss"
            placeholder={['开始时间', '结束时间']}
          />
        </Form.Item>
        
        <Form.Item
          name="location"
          label="活动地点"
          rules={[{ required: true, message: '请输入活动地点' }]}
        >
          <Input placeholder="请输入活动地点" />
        </Form.Item>
        
        <Form.Item
          name="maxParticipants"
          label="最大参与人数"
          rules={[{ required: true, message: '请输入最大参与人数' }]}
        >
          <InputNumber min={1} max={1000} placeholder="请输入最大参与人数" style={{ width: '100%' }} />
        </Form.Item>
        
        <Form.Item
          name="organizer"
          label="主办方"
          rules={[{ required: true, message: '请输入主办方名称' }]}
        >
          <Input placeholder="请输入主办方名称" />
        </Form.Item>
        
        <Form.Item
          name="description"
          label="活动描述"
          rules={[{ required: true, message: '请输入活动描述' }]}
        >
          <TextArea rows={6} placeholder="请输入活动描述" />
        </Form.Item>
        
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 16 }}>
            {mode === 'create' ? '创建活动' : '保存修改'}
          </Button>
          <Button onClick={() => navigate('/teacher/activities')}>
            取消
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ActivityForm; 