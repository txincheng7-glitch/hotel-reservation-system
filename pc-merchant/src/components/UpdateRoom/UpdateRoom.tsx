import React from 'react';
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Button,
  message,
} from 'antd';
import { updateRoom } from '../../services/hotelService';

interface UpdateRoomProps {
  visible: boolean;
  room: any;
  onClose: () => void;
  onSuccess: () => void;
}

const UpdateRoom: React.FC<UpdateRoomProps> = ({
  visible,
  room,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (room && visible) {
      form.setFieldsValue({
        type: room.type,
        price: room.price,
        area: room.area,
        bedType: room.bedType,
        maxOccupancy: room.maxOccupancy,
        totalRooms: room.totalRooms,
        available: room.available,
      });
    }
  }, [room, visible, form]);

  const handleSubmit = async (values: any) => {
    if (!room) return;

    setLoading(true);
    try {
      // 过滤掉空值，只发送有变化的字段
      const updateData = Object.entries(values).reduce((acc: any, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = value;
        }
        return acc;
      }, {});

      const result = await updateRoom(room.id, updateData);
      if (result.code === 200) {
        message.success('房型更新成功！');
        onClose();
        onSuccess();
      } else {
        message.error('更新房型失败');
      }
    } catch (error: any) {
      console.error('更新房型错误:', error);
      message.error(error.message || '更新房型失败，请检查网络或重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="更新房型"
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={() => form.submit()}
          loading={loading}
        >
          确认更新
        </Button>,
      ]}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="type"
          label="房型名称"
        >
          <Input placeholder="请输入房型名称" />
        </Form.Item>
        <Form.Item
          name="price"
          label="价格"
        >
          <InputNumber min={0} placeholder="请输入价格" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="area"
          label="面积"
        >
          <InputNumber min={0} placeholder="请输入面积" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="bedType"
          label="床型"
        >
          <Input placeholder="请输入床型" />
        </Form.Item>
        <Form.Item
          name="maxOccupancy"
          label="最大入住"
        >
          <InputNumber min={1} placeholder="请输入最大入住人数" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="totalRooms"
          label="总房间数"
        >
          <InputNumber min={0} placeholder="请输入总房间数" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          name="available"
          label="可用房间数"
        >
          <InputNumber min={0} placeholder="请输入可用房间数" style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UpdateRoom;