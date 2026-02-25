import React, { useState } from 'react';
import { Button, Form, Input, InputNumber, Select, Upload, Drawer, Space, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/es/upload/interface';
import { addRoom } from '../../services/hotelService';

interface AddRoomProps {
  hotelId: number;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddRoom: React.FC<AddRoomProps> = ({ hotelId, open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // 处理文件上传事件
  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  // 上传配置
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

  // 处理房型表单提交
  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // 创建 FormData 对象
      const formData = new FormData();
      
      // 添加文本字段
      formData.append('type', values.type);
      formData.append('area', values.area.toString());
      formData.append('bedType', values.bedType);
      formData.append('maxOccupancy', values.maxOccupancy.toString());
      formData.append('price', values.price.toString());
      formData.append('totalRooms', values.totalRooms.toString());
      formData.append('available', values.available.toString());
      if (values.amenities && values.amenities.length > 0) {
        // 直接传递数组，不进行 JSON 序列化
        values.amenities.forEach((amenity: string) => {
          formData.append('amenities', amenity);
        });
      }
      
      // 添加文件 - 限制最多上传3张图片
      if (values.images && values.images.length > 0) {
        const validFiles = values.images.filter((file: any) => file.originFileObj);
        if (validFiles.length > 3) {
          message.error('最多只能上传3张图片！');
          setLoading(false);
          return;
        }
        
        validFiles.forEach((file: any, index: number) => {
          if (file.originFileObj) {
            // 确保文件类型正确
            const fileType = file.originFileObj.type;
            if (fileType === 'image/jpeg' || fileType === 'image/png') {
              // 限制文件大小为1MB
              if (file.originFileObj.size > 1024 * 1024) {
                message.error(`图片${index + 1}大小超过1MB，请重新选择！`);
                setLoading(false);
                return;
              }
              formData.append('files', file.originFileObj as Blob);
            }
          }
        });
      }
      
      // 输出请求体内容
      //console.log('=== 请求体内容 ===');
      //console.log('文本字段:');
      formData.forEach((value) => {
        if (typeof value === 'string') {
          //console.log(`${key}: ${value}`);
        } else if (value instanceof Blob) {
          //console.log(`${key}: 文件 (${value.type}, ${(value.size / 1024).toFixed(2)}KB)`);
        }
      });
      //console.log('==================');
      
      // 调用 API
      const result = await addRoom(hotelId, formData);
      
      if (result.code === 200) {
        message.success(result.message || '房型添加成功');
        onClose();
        onSuccess();
      } else {
        message.error(result.message || '添加房型失败');
      }
    } catch (error: any) {
      console.error('添加房型失败:', error);
      // 提供更详细的错误信息
      if (error.message.includes('HTTP error! status: 500')) {
        message.error('添加房型失败: 服务器内部错误，可能是图片格式或大小问题');
        // 建议用户先尝试不上传图片
        message.info('建议：请先尝试不上传图片，确认其他信息是否能正常提交');
      } else {
        message.error(error.message || '添加房型失败，请重试');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="添加房型"
      style={{ width: 700 }}
      onClose={onClose}
      open={open}
      footer={
        <Space>
          <Button onClick={onClose}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" form="roomForm" loading={loading}>
            提交
          </Button>
        </Space>
      }
    >
      <Form
        id="roomForm"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="type"
          label="房型名称"
          style={{ width: '300px' }}
          rules={[{ required: true, message: '请输入房型名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="area"
          label="面积 (㎡)"
          rules={[{ required: true, message: '请输入面积' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="bedType"
          label="床型"
          style={{ width: '300px' }}
          rules={[{ required: true, message: '请选择床型' }]}
        >
          <Select
            options={[
              { value: '大床 (1.8米)', label: '大床 (1.8米)' },
              { value: '双床 (1.2米)', label: '双床 (1.2米)' },
              { value: '套房', label: '套房' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="maxOccupancy"
          label="最大入住人数"
          rules={[{ required: true, message: '请输入最大入住人数' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="price"
          label="价格 (¥)"
          rules={[{ required: true, message: '请输入价格' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="totalRooms"
          label="总房间数"
          rules={[{ required: true, message: '请输入总房间数' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="available"
          label="可用房间数"
          rules={[{ required: true, message: '请输入可用房间数' }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item
          name="amenities"
          label="房间设施"
          style={{ width: '300px' }}
        >
          <Select
            mode="multiple"
            options={[
              { value: '浴缸', label: '浴缸' },
              { value: '迷你吧', label: '迷你吧' },
              { value: '冰箱', label: '冰箱' },
              { value: '保险箱', label: '保险箱' },
              { value: '空调', label: '空调' },
              { value: '电视', label: '电视' },
              { value: '免费WiFi', label: '免费WiFi' },
            ]}
          />
        </Form.Item>
        <Form.Item
          name="images"
          label="房型图片"
          style={{ width: '300px' }}
          valuePropName="fileList"
          getValueFromEvent={normFile}
        >
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>上传图片</Button>
          </Upload>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default AddRoom;