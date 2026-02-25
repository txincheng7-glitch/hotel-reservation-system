import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Image,
  Tag,
  Space,
  Button,
  Typography,
  Divider,
  Spin,
  message,
  Carousel,
  Form,
  Input,
  InputNumber,
  Select,
  Popconfirm,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getHotelDetail, updateHotelInfo, deleteRoom, type HotelDetail as HotelDetailType } from '../../../services/hotelService';
import AddRoom from '../../../components/AddRoom/AddRoom';
import UpdateRoom from '../../../components/UpdateRoom/UpdateRoom';

import axios from 'axios';
import styles from './HotelDetail.module.css';

const { Title, Text, Paragraph } = Typography;

interface HotelFormNewValues {
  name: string;
  address: string;
  description?: string;
  star?: number;
  openingDate?: string;
  facilityIds?: number[];
  tagIds?: number[];
}

interface Tag {
  id: number;
  name: string;
  category: string;
}

interface TagsResponse {
  code: number;
  data: Tag[];
}

const HotelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hotelDetail, setHotelDetail] = useState<HotelDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [roomDrawerOpen, setRoomDrawerOpen] = useState(false);
  const [form] = Form.useForm();
  const [tags, setTags] = useState<Tag[]>([]);
  const [, setTagsLoading] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<any>(null);
  

  // 当酒店详情加载完成或编辑模式切换时，设置表单值
  useEffect(() => {
    if (hotelDetail && editing) {
      const tagIdsFromDetail =
        tags.length > 0
          ? tags
              .filter((t) => hotelDetail.tags.includes(t.name))
              .map((t) => t.id)
          : [];

      form.setFieldsValue({
        name: hotelDetail.name,
        address: hotelDetail.address,
        description: hotelDetail.description,
        star: hotelDetail.star,
        openingDate: hotelDetail.openingDate,
        tagIds: tagIdsFromDetail,
        facilityIds: [] // 暂无设施数据源时保持空
      });
      //console.log(hotelDetail.tags);
    }
  }, [hotelDetail, editing, form, tags]);

  const handleBack = () => {
    navigate('/merchant/HotelManage');
  };

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

  const fetchHotelDetail = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const detail = await getHotelDetail(parseInt(id));
      setHotelDetail(detail);
    } catch (error: any) {
      console.error('获取酒店详情失败:', error);
      message.error(error.message || '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotelDetail();
    fetchTags();
  }, [id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <div className={styles.loadingText}>加载中...</div>
      </div>
    );
  }

  if (!hotelDetail) {
    return (
      <div className={styles.errorContainer}>
        <Text type="danger">未找到酒店信息</Text>
        <Button type="primary" onClick={handleBack} className={styles.backButton}>
          返回列表
        </Button>
      </div>
    );
  }

  // 处理修改提交
  const handleSubmit = async (values: HotelFormNewValues) => {
    if (!id) return;
    
    try {
      const result = await updateHotelInfo(
        hotelDetail.id,
        values.name,
        values.address,
        values.description,
        values.star ?? hotelDetail.star,
        hotelDetail.images.map(img => ({ url: img.url, type: img.type })),
        values.facilityIds || [],
        values.tagIds || []
      );
      if (result.code === 200) {
        message.success('酒店信息修改成功！');
        setEditing(false);
        // 重新获取酒店详情
        fetchHotelDetail();
      } else {
        message.error('修改酒店信息失败');
      }
    } catch (error) {
      console.error('修改酒店信息错误:', error);
      message.error('修改酒店信息失败，请检查网络或重试');
    } 
  };

  // 处理添加房型
  const handleAddRoom = () => {
    setRoomDrawerOpen(true);
  };

  // 处理房型添加成功
  const handleRoomAddSuccess = () => {
    // 重新获取酒店详情
    fetchHotelDetail();
  };

  // 处理更新房型
  const handleUpdateRoom = (room: any) => {
    setCurrentRoom(room);
    setUpdateModalVisible(true);
  };

  // 处理删除房型
  const handleDeleteRoom = async (roomId: number) => {
    if (!id) return;
    
    try {
      const result = await deleteRoom(parseInt(id), roomId);
      if (result.code === 204) {
        message.success('删除房型成功！');
        // 刷新页面
        window.location.reload();
      } else {
        message.error(result.message || '删除房型失败');
      }
    } catch (error: any) {
      console.error('删除房型错误:', error);
      message.error(error.message || '删除房型失败，请检查网络或重试');
    }
  };

  // 状态标签颜色映射
  const statusColorMap: Record<string, string> = {
    pending: 'orange',
    approved: 'blue',
    rejected: 'red',
    published: 'green',
    unpublished: 'gray',
  };

  // 状态标签文本映射
  const statusTextMap: Record<string, string> = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已驳回',
    published: '已发布',
    unpublished: '未发布',
  };

  return (
    <div className={styles.container}>
      {/* 头部导航 */}
      <div className={styles.header}>
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          返回列表
        </Button>
      </div>

      {/* 酒店基本信息 */}
      <Card
        title={
          <Space size="middle">
            <Title level={3}>{hotelDetail.name}</Title>
            <Tag color={statusColorMap[hotelDetail.status]}>
              {statusTextMap[hotelDetail.status]}
            </Tag>
          </Space>
        }
        className={styles.hotelCard}
      >
        {/* 酒店图片 */}
        <div className={styles.imagesSection}>
          <Title level={4}>酒店图片</Title>
          <Carousel autoplay className={styles.mainCarousel} draggable={true}>
            {hotelDetail.images.map((image) => (
              <div key={image.id} className={styles.carouselItem}>
                <Image
                  width={700}
                  src={image.url}
                  alt={`${hotelDetail.name} - ${image.type}`}
                  loading="lazy"
                />
                <div className={styles.imageType}>
                  <Tag>{image.type === 'main' ? '主图' : '设施图'}</Tag>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
        {/* 酒店基本信息、描述和标签 - 编辑模式 */}
        {editing ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            className={styles.editForm}
          >
            <Title level={4}>基本信息</Title>
            <Form.Item
              name="name"
              label="酒店名称"
              rules={[{ required: true, message: '请输入酒店名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="address"
              label="酒店地址"
              rules={[{ required: true, message: '请输入酒店地址' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="star"
              label="酒店星级"
            >
              <InputNumber min={1} max={5} />
            </Form.Item>
            <Form.Item
              name="description"
              label="酒店描述"
            >
              <Input.TextArea rows={4} />
            </Form.Item>
            <Form.Item
              name="facilityIds"
              label="设施"
            >
              <Select
                mode="multiple"
                placeholder="选择设施"
                style={{ width: '100%' }}
              >
                {/* 后续可从API获取设施列表 */}
              </Select>
            </Form.Item>
            <Form.Item
              name="tagIds"
              label="标签"
            >
              <Select
                mode="multiple"
                placeholder="选择标签"
                style={{ width: '100%' }}
                options={tags.map(tag => ({
                  value: tag.id,
                  label: tag.name
                }))}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit">
                  确认修改
                </Button>
                <Button onClick={() => setEditing(false)}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        ) : (
          <>
            {/* 酒店基本信息 */}
            <div className={styles.infoSection}>
              <div className={styles.sectionHeader}>
                <Title level={4}>基本信息</Title>
                <Button type="primary" size="small" onClick={() => setEditing(true)}>
                  修改信息
                </Button>
              </div>
              <Descriptions bordered column={{ xs: 1, sm: 2, md: 3 }}>
                <Descriptions.Item label="酒店地址">{hotelDetail.address}</Descriptions.Item>
                <Descriptions.Item label="酒店星级">
                  {Array.from({ length: hotelDetail.star }).map((_, index) => (
                    <span key={index} className={styles.star}>★</span>
                  ))}
                </Descriptions.Item>
                <Descriptions.Item label="评分">{hotelDetail.rating}</Descriptions.Item>
                <Descriptions.Item label="开业时间">{hotelDetail.openingDate}</Descriptions.Item>
                <Descriptions.Item label="审核意见">{hotelDetail.auditComment}</Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {new Date(hotelDetail.createdAt).toLocaleString()}
                </Descriptions.Item>
                <Descriptions.Item label="更新时间">
                  {new Date(hotelDetail.updatedAt).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </div>

            {/* 酒店描述 */}
            <div className={styles.descriptionSection}>
              <Title level={4}>酒店描述</Title>
              <Paragraph>{hotelDetail.description}</Paragraph>
            </div>

            {/* 酒店标签 */}
            <div className={styles.tagsSection}>
              <Title level={4}>酒店标签</Title>
              <Space wrap>
                {hotelDetail.tags.map((tag, index) => (
                  <Tag key={index} color="blue">
                    {tag}
                  </Tag>
                ))}
              </Space>
            </div>
          </>
        )}

        <Divider />

        {/* 房型信息 */}
        <div className={styles.roomsSection}>
          <div className={styles.sectionHeader}>
            <Title level={4}>房型信息</Title>
            <Button type="primary" size="small" onClick={handleAddRoom}>
              添加房型
            </Button>
          </div>
          <div>
            {hotelDetail.rooms.map((room) => (
              <Card
                key={room.id}
                title={room.type}
                className={styles.roomCard}
                extra={
                  <Text strong className={styles.roomPrice}>
                    ¥{room.price}
                  </Text>
                }
              >
                <Descriptions column={{ xs: 1, sm: 2, md: 4 }}>
                  <Descriptions.Item label="面积">{room.area}㎡</Descriptions.Item>
                  <Descriptions.Item label="床型">{room.bedType}</Descriptions.Item>
                  <Descriptions.Item label="最大入住">{room.maxOccupancy}人</Descriptions.Item>
                  <Descriptions.Item label="总房间数">{room.totalRooms}间</Descriptions.Item>
                  <Descriptions.Item label="可用房间数">{room.available}间</Descriptions.Item>
                </Descriptions>

                {/* 房型图片 */}
                {room.images.length > 0 && (
                  <div className={styles.roomImages}>
                    <Text strong>房型图片：</Text>
                    <Carousel autoplay className={styles.roomCarousel}>
                      {room.images.map((img, index) => (
                        <div key={index} className={styles.roomCarouselItem}>
                          <Image
                            width={300}
                            height={200}
                            src={img}
                            alt={`${room.type} - 图片${index + 1}`}
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </Carousel>
                  </div>
                )}

                {/* 房间设施 */}
                <div className={styles.roomAmenities}>
                  <Text strong>房间设施：</Text>
                  <Space wrap className={styles.amenitiesList}>
                    {room.amenities.map((amenity, index) => (
                      <Tag key={index}>{amenity}</Tag>
                    ))}
                  </Space>
                </div>

                {/* 操作按钮 */}
                <div className={styles.roomActions}>
                  <Space size="small">
                    <Button type="primary" size="small" onClick={() => handleUpdateRoom(room)}>
                      更新
                    </Button>
                    <Popconfirm
                      title="确认删除"
                      description="确定要删除这个房型吗？此操作不可恢复。"
                      onConfirm={() => handleDeleteRoom(room.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button danger size="small">
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 添加房型组件 */}
        {id && (
          <AddRoom
            hotelId={parseInt(id)}
            open={roomDrawerOpen}
            onClose={() => setRoomDrawerOpen(false)}
            onSuccess={handleRoomAddSuccess}
          />
        )}

        {/* 更新房型组件 */}
        {currentRoom && (
          <UpdateRoom
            visible={updateModalVisible}
            room={currentRoom}
            onClose={() => setUpdateModalVisible(false)}
            onSuccess={fetchHotelDetail}
          />
        )}
      </Card>
    </div>
  );
};

export default HotelDetail;