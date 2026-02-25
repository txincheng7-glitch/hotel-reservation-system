import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Input, Select, DatePicker, InputNumber, message, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { createHotelWithFiles } from '../../services/hotelService';
import axios from 'axios';

interface Tag {
  id: number;
  name: string;
  category: string;
}

interface TagsResponse {
  code: number;
  data: Tag[];
}

interface HotelFormValues {
  name: string;
  address: string;
  description?: string;
  star?: number;
  openingDate: Dayjs;
  tagIds?: number[];
  images: UploadFile[];
}

const App: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm<HotelFormValues>();
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleCancel = () => {
    setOpen(false);
    form.resetFields();
  };

  // 获取标签列表
  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const response = await axios.get<TagsResponse>('/api/tags');
      if (response.data.code === 200) {
        setTags(response.data.data);
      } else {
        message.error('获取标签列表失败');
      }
    } catch (error) {
      console.error('获取标签列表失败:', error);
      message.error('网络请求失败');
    } finally {
      setTagsLoading(false);
    }
  };

  // 新增标签
  // const handleCreateTag = async (name: string) => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const response = await axios.post<TagsResponse>('/api/tags', {
  //       name,
  //       category: 'theme' // 默认分类，可根据实际需求调整
  //     }, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });
  //     if (response.data.code === 200) {
  //       // 重新获取标签列表
  //       fetchTags();
  //       message.success('标签创建成功');
  //     } else {
  //       message.error('标签创建失败');
  //     }
  //   } catch (error) {
  //     console.error('创建标签失败:', error);
  //     message.error('网络请求失败');
  //   }
  // };

  // 当模态框打开时获取标签列表
  useEffect(() => {
    if (open) {
      fetchTags();
    }
  }, [open]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSubmit = async (values: HotelFormValues) => {
    setConfirmLoading(true);
    try {
      // 发送请求
      const result = await createHotelWithFiles(
        values.name,
        values.address,
        values.description,
        values.star,
        values.openingDate,
        values.tagIds || [],
        values.images
      );

      if (result.code === 201) {
        message.success('酒店创建成功！');
        setOpen(false);
        form.resetFields();
      } else {
        message.error('创建酒店失败');
      }
    } catch (error) {
      console.error('创建酒店错误:', error);
      message.error('创建酒店失败，请检查网络或重试');
    } finally {
      setConfirmLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    listType: 'picture',
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('只能上传JPG/PNG图片！');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('图片大小不能超过2MB！');
      }
      return false; // 阻止自动上传，我们将在提交时一起上传
    },
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        新增酒店
      </Button>
      <Modal
        title="新增酒店"
        open={open}
        onOk={() => form.submit()}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="酒店名称"
            rules={[{ required: true, message: '请输入酒店名称' }]}
          >
            <Input placeholder="请输入酒店名称" />
          </Form.Item>
          <Form.Item
            name="address"
            label="酒店地址"
            rules={[{ required: true, message: '请输入酒店地址' }]}
          >
            <Input placeholder="请输入酒店地址" />
          </Form.Item>
          <Form.Item
            name="description"
            label="酒店描述"
          >
            <Input.TextArea rows={4} placeholder="请输入酒店描述" />
          </Form.Item>
          <Form.Item
            name="star"
            label="酒店星级"
          >
            <InputNumber min={1} max={5} placeholder="请输入酒店星级" />
          </Form.Item>
          <Form.Item
            name="openingDate"
            label="开业时间"
            rules={[{ required: true, message: '请选择开业时间' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="tagIds"
            label="酒店标签"
          >
            <Select
              mode="multiple"
              loading={tagsLoading}
              style={{ width: '100%' }}
              placeholder="请选择酒店标签"
              options={tags.map(tag => ({
                value: tag.id,
                label: tag.name
              }))}
              tokenSeparators={[',']}
            />
          </Form.Item>
          <Form.Item
            name="images"
            label="酒店图片"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Upload {...uploadProps}>
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default App;