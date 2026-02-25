import React, { useState } from 'react';
import type { FormItemProps, FormProps } from 'antd'
import { 
  Checkbox,
  Button, 
  Drawer, 
  Form, 
  Input, 
  Select, 
  Space, 
  message 
} from 'antd';
import { register } from '../../services/authService';

const formItemLayout: FormProps = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout: FormItemProps = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

//抽屉展开组件
const App: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
//展开回调函数
  const showDrawer = () => {
    setOpen(true);
  };
//关闭回调函数
  const onClose = () => {
    setOpen(false);
  };

//注册组件
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      // 移除确认密码和协议字段，只发送后端需要的字段
      const { confirm, agreement, ...registerData } = values;
      const response = await register(registerData);
      message.success(response.message || '注册成功');
      // 关闭抽屉
      setOpen(false);
      // 重置表单
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || '注册失败，请重试');
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Button color="primary" variant="link" onClick={showDrawer}>
            去注册
          </Button>
      <Drawer
        title="注册"
        size={720}
        onClose={onClose}
        open={open}
        styles={{
          body: {
            paddingBottom: 80,
          },
        }}
      >
        <Form
          {...formItemLayout}
          form={form}
          onFinish={onFinish}
          initialValues={{ residence: ['zhejiang', 'hangzhou', 'xihu'], prefix: '86' }}
          style={{ maxWidth: 600 }}
          scrollToFirstError
        >
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              {
                type: 'email',
                message: '请输入有效的邮箱',
              },
              {
                required: true,
                message: '请输入邮箱',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="password"
            label="密码"
            rules={[
              {
                required: true,
                message: '请输入密码',
              },
            ]}
            hasFeedback
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="confirm"
            label="确认密码"
            dependencies={['password']}
            hasFeedback
            rules={[
              {
                required: true,
                message: '请确认密码',
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            name="username"
            label="用户名"
            tooltip="请输入用户名"
            rules={[{ required: true, message: '请输入用户名', whitespace: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { type: 'tel', message: '请输入有效的手机号' },
            ]}
          >
            {/* Demo only, real usage should wrap as custom component */}
            <Space.Compact block>
              <Input style={{ width: '100%' }} />
            </Space.Compact>
          </Form.Item>

          <Form.Item
            name="role"
            label="身份"
            rules={[{ required: true, message: '请选择身份' }]}
          >
            <Select
              placeholder="请选择身份"
              options={[
                { label: 'Admin', value: 'admin' },
                { label: 'Merchant', value: 'merchant' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
              },
            ]}
            {...tailFormItemLayout}
          >
            <Checkbox>
              我已阅读并同意 <a href="">注册协议</a>
            </Checkbox>
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button type="primary" htmlType="submit" loading={loading}>
              注册
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  );
};

export default App;