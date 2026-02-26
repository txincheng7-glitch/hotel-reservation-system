import React, { useState, useCallback, useMemo } from 'react';
import { Table, Tag, Flex, Button, Modal, Image, Carousel } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { AdminHotel } from '../../../services/hotelService';
import { EyeOutlined } from '@ant-design/icons';
import styles from './HotelTable.module.css';



// 状态颜色映射
const statusColorMap: Record<string, string> = {
  pending: 'orange',
  approved: 'blue',
  rejected: 'red',
  published: 'green',
  unpublished: 'gray',
};

// 状态文本映射
const statusTextMap: Record<string, string> = {
  pending: '审核中',
  approved: '已通过',
  rejected: '已驳回',
  published: '已发布',
  unpublished: '未发布',
};

// 表格列定义
const columns: ColumnsType<AdminHotel> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 80,
    sorter: (a: { id: number; }, b: { id: number; }) => a.id - b.id,
    fixed: 'left' as const,
  },
  {
    title: '酒店名称',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
    sorter: (a: { name: string; }, b: { name: any; }) => a.name.localeCompare(b.name),
    fixed: 'left' as const,
  },
  {
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    ellipsis: true,
  },
  {
    title: '星级',
    dataIndex: 'star',
    key: 'star',
    width: 80,
    sorter: (a: { star: number; }, b: { star: number; }) => a.star - b.star,
    render: (star: number) => {
      return Array.from({ length: star }).map((_, index) => (
        <span key={index} className={styles.star}>★</span>
      ));
    },
  },
  {
    title: '评分',
    dataIndex: 'rating',
    key: 'rating',
    width: 80,
    sorter: (a: { rating: number; }, b: { rating: number; }) => a.rating - b.rating,
  },
  {
    title: '最低价格',
    key: 'minPrice',
    width: 100,
    sorter: (a: { priceRange: { min: number; }; }, b: { priceRange: { min: number; }; }) => a.priceRange.min - b.priceRange.min,
    render: (_: any, hotel: AdminHotel) => {
      return `¥${hotel.priceRange.min}`;
    },
  },
  {
    title: '最高价格',
    key: 'maxPrice',
    width: 100,
    sorter: (a: { priceRange: { max: number; }; }, b: { priceRange: { max: number; }; }) => a.priceRange.max - b.priceRange.max,
    render: (_: any, hotel: AdminHotel) => {
      return `¥${hotel.priceRange.max}`;
    },
  },
  {
    title: '审核状态',
    dataIndex: 'auditStatus',
    key: 'auditStatus',
    width: 100,
    render: (auditStatus: string) => (
      <Tag color={statusColorMap[auditStatus]}>
        {statusTextMap[auditStatus] || auditStatus}
      </Tag>
    ),
  },
  {
    title: '发布状态',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    render: (status: string) => (
      <Tag color={statusColorMap[status]}>
        {statusTextMap[status] || status}
      </Tag>
    ),
  },
  {
    title: '审核意见',
    dataIndex: 'auditComment',
    key: 'auditComment',
    ellipsis: true,
    width: 150,
  },
  {
    title: '商户名称',
    key: 'merchantName',
    width: 120,
    render: (_: any, hotel: AdminHotel) => {
      return hotel.merchant.username;
    },
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    width: 150,
    sorter: (a: { createdAt: string | number | Date; }, b: { createdAt: string | number | Date; }) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    render: (createdAt: string) => {
      return new Date(createdAt).toLocaleString();
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    key: 'updatedAt',
    width: 150,
    sorter: (a: { updatedAt: string | number | Date; }, b: { updatedAt: string | number | Date; }) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    render: (updatedAt: string) => {
      return new Date(updatedAt).toLocaleString();
    },
  },

];



interface HotelTableProps {
  hotels: AdminHotel[];
  loading: boolean;
  total: number;
  page: number;
  pageSize: number;
  onPaginationChange: (current: number, size: number) => void;
  title?: string;
  customColumns?: ColumnsType<AdminHotel>;
  // 过滤参数
  filters?: {
    status?: string | string[];
    auditStatus?: string;
    merchantId?: string;
    searchKeyword?: string;
  };
}

const HotelTable: React.FC<HotelTableProps> = ({
  hotels,
  loading,
  total,
  page,
  pageSize,
  onPaginationChange,
  title = '酒店总览',
  customColumns = [],
  filters = {},
}) => {
  // 根据过滤参数处理数据
  const filteredHotels = hotels.filter(hotel => {
    // 状态过滤 - 支持单个状态或状态数组
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        if (!filters.status.includes(hotel.status)) {
          return false;
        }
      } else {
        if (hotel.status !== filters.status) {
          return false;
        }
      }
    }
    
    // 审核状态过滤
    if (filters.auditStatus && hotel.auditStatus !== filters.auditStatus) {
      return false;
    }
    
    // 商户ID过滤
    if (filters.merchantId && hotel.merchant.id.toString() !== filters.merchantId) {
      return false;
    }
    
    // 关键词搜索
    if (filters.searchKeyword) {
      const keyword = filters.searchKeyword.toLowerCase();
      return (
        hotel.name.toLowerCase().includes(keyword) ||
        hotel.address.toLowerCase().includes(keyword) ||
        hotel.merchant.username.toLowerCase().includes(keyword)
      );
    }
    
    return true;
  });
  // 状态管理
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<AdminHotel | null>(null);
  
  // 处理查看图片
  const handleViewImages = useCallback((hotel: AdminHotel) => {
    setCurrentHotel(hotel);
    setImageModalVisible(true);
  }, []);
  
  // Combine default columns with custom columns and add view images column
  const combinedColumns = useMemo(() => {
    // 添加查看图片列
    const viewImagesColumn = {
      title: '查看图片',
      key: 'viewImages',
      width: 100,
      render: (_: any, hotel: AdminHotel) => {
        return (
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewImages(hotel);
            }}
          >
            查看
          </Button>
        );
      },
    };
    return [...columns, viewImagesColumn, ...customColumns];
  }, [customColumns, handleViewImages]);

  return (
    <Flex vertical gap="middle">
      <Table
        loading={loading}
        dataSource={filteredHotels}
        columns={combinedColumns}
        rowKey="id"
        title={() => title}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: onPaginationChange,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total) => `共 ${total} 条数据`,
          showQuickJumper: true,
        }}
        scroll={{
          x: 1700, // Increased width to accommodate view images column
          y: 600, // 设置最大高度，确保表格有纵向滚动条
        }}
        size="middle"
      />
      
      {/* 图片查看弹窗 */}
      <Modal
        title={currentHotel?.name || '酒店图片'}
        open={imageModalVisible}
        onCancel={() => setImageModalVisible(false)}
        footer={null}
        width={800}
      >
        {currentHotel?.coverImage ? (
          <Carousel autoplay={false} dots={true} className={styles.carousel}>
            <div>
              <Image
                src={currentHotel.coverImage}
                alt={`${currentHotel.name} 封面图片`}
                className={styles.carouselImage}
                preview={false}
              />
              <p className={styles.imageCaption}>酒店封面图片</p>
            </div>
            {currentHotel.images && currentHotel.images.map((image: string | undefined, index: number) => (
              <div key={index}>
                <Image
                  src={image}
                  alt={`${currentHotel.name} 图片 ${index + 1}`}
                  className={styles.carouselImage}
                  preview={false}
                />
                <p className={styles.imageCaption}>图片 {index + 1}</p>
              </div>
            ))}
          </Carousel>
        ) : (
          <div className={styles.noImage}>
            暂无图片
          </div>
        )}
      </Modal>
    </Flex>
  );
};

export default HotelTable;