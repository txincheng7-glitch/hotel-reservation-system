import { useState, useEffect } from 'react';
import { Button, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import HotelTable from '../HotelTable/HotelTable';
import { getAdminHotelList, publishHotel, type AdminHotel } from '../../../services/hotelService';
import styles from './PublishHotel.module.css';

export default function PublishHotelPage() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [publishLoading, setPublishLoading] = useState(false);

  // 获取待发布酒店列表
  const fetchHotels = async () => {
    //console.log('获取待发布酒店列表:', { page, pageSize });
    setLoading(true);
    try {
      // 获取所有酒店（包括已发布和未发布的）
      const result = await getAdminHotelList(page, pageSize);
      //console.log('获取待发布酒店列表成功:', { total: result.total, itemsCount: result.items.length });
      
      // 根据筛选条件过滤酒店
      const filteredHotels = result.items.filter(hotel => {
        return ['approved', 'published'].includes(hotel.status);
      });
      
      setHotels(filteredHotels);
      setTotal(filteredHotels.length);
    } catch (error: any) {
      console.error('获取待发布酒店列表失败:', error);
      message.error(error.message || '获取待发布酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理分页变化
  const handlePaginationChange = (current: number, size?: number) => {
    //console.log('分页变化:', { current, size });
    setPage(current);
    if (size !== undefined) {
      setPageSize(size);
    }
  };

  // 处理发布酒店
  const handlePublish = async (hotelId: number) => {
    setPublishLoading(true);
    try {
      await publishHotel(hotelId, 'publish');
      message.success('酒店已发布');
      // 重新获取数据
      fetchHotels();
    } catch (error: any) {
      console.error('发布酒店失败:', error);
      message.error(error.message || '发布酒店失败');
    } finally {
      setPublishLoading(false);
    }
  };

  // 处理下线酒店
  const handleUnpublish = async (hotelId: number) => {
    setPublishLoading(true);
    try {
      await publishHotel(hotelId, 'unpublish');
      message.success('酒店已下线');
      // 重新获取数据
      fetchHotels();
    } catch (error: any) {
      console.error('下线酒店失败:', error);
      message.error(error.message || '下线酒店失败');
    } finally {
      setPublishLoading(false);
    }
  };

  // 当分页变化时，重新获取数据
  useEffect(() => {
    fetchHotels();
  }, [page, pageSize]);

  // 操作列定义
  const actionColumn: ColumnsType<AdminHotel> = [
    {
      title: '操作',
      key: 'action',
      width: 180,
      fixed: 'right' as const,
      render: (_: any, record: AdminHotel) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small" 
            onClick={() => handlePublish(record.id)}
            loading={publishLoading}
            disabled={record.status === 'published'}
          >
            发布
          </Button>
          <Button 
            danger 
            size="small" 
            onClick={() => handleUnpublish(record.id)}
            loading={publishLoading}
            disabled={record.status === 'unpublished'}
          >
            下线
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <HotelTable
        hotels={hotels}
        loading={loading}
        total={total}
        page={page}
        pageSize={pageSize}
        onPaginationChange={handlePaginationChange}
        title="酒店发布管理"
        filters={{
          status: ['approved', 'published'],
        }}
        customColumns={actionColumn}
      />
    </div>
  );
}