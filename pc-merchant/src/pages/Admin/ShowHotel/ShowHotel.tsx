import React, { useState, useEffect } from 'react';
import { message, } from 'antd';

import { getAdminHotelList, type AdminHotel } from '../../../services/hotelService';
import HotelTable from '../HotelTable/HotelTable';
import styles from './ShowHotel.module.css';

const ShowHotel: React.FC = () => {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取酒店列表
  const fetchHotels = async () => {
    //console.log('获取酒店列表:', { page: pagination.current, pageSize: pagination.pageSize });
    setLoading(true);
    try {
      const result = await getAdminHotelList(pagination.current, pagination.pageSize);
      //console.log("---------------------------",pagination);
      //console.log('获取酒店列表成功:', { total: result.total, itemsCount: result.items.length });
      setHotels(result.items);
      setPagination(prev => ({
        ...prev,
        total: result.total,
      }));
    } catch (error: any) {
      console.error('获取酒店列表失败:', error);
      message.error(error.message || '获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };


  // 处理分页变化
  const handlePaginationChange = (current: number, size: number) => {
    //console.log('分页变化:', { current, size });
    setPagination(prev => ({ ...prev, current, pageSize: size }));
  };

  // 当分页变化时，重新获取数据
  useEffect(() => {
    fetchHotels();
  }, [pagination.current, pagination.pageSize]);


  return (
    <div className={styles.container}>
      <HotelTable
        hotels={hotels}
        loading={loading}
        total={pagination.total}
        page={pagination.current}
        pageSize={pagination.pageSize}
        onPaginationChange={handlePaginationChange}
        title="酒店总览"
      />
    </div>
  );
};

export default ShowHotel;