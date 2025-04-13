import React, { useState } from 'react';
import { Form, Input, Button, Select, message, Card, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import axios from '../../utils/axios';

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface FeedbackForm {
    type: string;
    content: string;
}

const Feedback: React.FC = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: FeedbackForm) => {
        setLoading(true);
        try {
            await axios.post('/api/student/feedback', values);
            message.success('反馈提交成功');
            form.resetFields();
        } catch (error) {
            message.error('反馈提交失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={2}>反馈提交</Title>
            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="type"
                        label="反馈类型"
                        rules={[{ required: true, message: '请选择反馈类型' }]}
                    >
                        <Select placeholder="请选择反馈类型">
                            <Option value="SUGGESTION">建议</Option>
                            <Option value="QUESTION">问题</Option>
                            <Option value="COMPLAINT">投诉</Option>
                            <Option value="OTHER">其他</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="content"
                        label="反馈内容"
                        rules={[{ required: true, message: '请输入反馈内容' }]}
                    >
                        <TextArea rows={6} placeholder="请输入您的反馈内容..." />
                    </Form.Item>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading}
                            icon={<FileTextOutlined />}
                        >
                            提交反馈
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Feedback; 