import { Table, Space, Input, Button, message, Tag, Popconfirm } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NewHotel from '../../../components/NewHotel/NewHotel';
import { deleteHotel, getHotelList } from '../../../services/hotelService';
import styles from './HotelManage.module.css';
const { Search } = Input;


interface HotelItem {
  id: number;
  key: React.Key;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'unpublished';
  createdAt: string;
  updatedAt: string;
  address?: string;
  starRating?: number;
  roomType?: string;
  price?: number;
}

const HotelTable: React.FC = () => {
  // 状态管理
  const navigate = useNavigate();
  const [data, setData] = useState<HotelItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined as string | undefined,
    searchKeyword: '',
  });

  // 状态标签颜色映射
  const statusColorMap: Record<string, string> = {
    pending: 'orange',    // 审核中
    approved: 'blue',     // 已通过
    rejected: 'red',      // 已驳回
    published: 'green',   // 已发布
    unpublished: 'gray',  // 未发布/已下线
  };

  // 状态标签文本映射
  const statusTextMap: Record<string, string> = {
    pending: '审核中',
    approved: '已通过',
    rejected: '已驳回',
    published: '已发布',
    unpublished: '未发布',
  };

  // 获取酒店数据
  const fetchHotelData = async () => {
    setLoading(true);
    try {
      // 构建查询参数
      const params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        status: filters.status,
        searchKeyword: filters.searchKeyword,
      };

      // 调用API
      const result = await getHotelList(params);

      // 直接使用处理后的数据
      setData(result.items.map(item => ({
        ...item,
        key: item.key ?? item.id, // 保证 key 不为 undefined
      })));
      setPagination(prev => ({
        ...prev,
        total: result.total,
        // 保持当前分页状态，不使用后端返回的 page，避免切换页码后被重置
      }));
    } catch (error: any) {
      message.error(error.message || '获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 表格列定义
  const columns: ColumnsType<HotelItem> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: '酒店名称',
      dataIndex: 'name',
      ellipsis: true,
      // 不设置固定宽度，让列自适应页面宽度
      minWidth: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className={styles.filterDropdown}>
          <Search
            placeholder="搜索酒店名称"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onSearch={() => {
              confirm();
              setFilters(prev => ({ ...prev, searchKeyword: selectedKeys[0] as string }));
            }}
            className={styles.filterSearch}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => {
                confirm();
                setFilters(prev => ({ ...prev, searchKeyword: selectedKeys[0] as string }));
              }}
              size="small"
              className={styles.filterButton}
            >
              搜索
            </Button>
            <Button
              onClick={() => {
                clearFilters?.();
                setFilters(prev => ({ ...prev, searchKeyword: '' }));
              }}
              size="small"
              className={styles.filterButton}
            >
              重置
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.name.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      filters: [
        { text: '审核中', value: 'pending' },
        { text: '已通过', value: 'approved' },
        { text: '已驳回', value: 'rejected' },
        { text: '已发布', value: 'published' },
        { text: '未发布', value: 'unpublished' },
      ],
      filterMultiple: false,
      onFilter: (value, record) => record.status === value,
      render: (status: string) => (
        <Tag color={statusColorMap[status]}>
          {statusTextMap[status] || status}
        </Tag>
      ),
    },
    {
      title: '地址',
      dataIndex: 'address',
      ellipsis: true,
    },
    {
      title: '星级',
      dataIndex: 'starRating',
      width: 100,
      sorter: (a, b) => (a.starRating || 0) - (b.starRating || 0),
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 120,
      sorter: (a, b) => (a.price || 0) - (b.price || 0),
      render: (price: number) => price ? `¥${price}` : '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      width: 180,
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
      render: (text: string) => new Date(text).toLocaleString(),
    },
    {
      title: '操作',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleView(record)}>
            查看
          </Button>
          <Popconfirm
            title="确认删除吗？"
            description="确认删除酒店吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button danger type="link" size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  // 操作处理函数
  const handleView = (record: HotelItem) => {
    //console.log('查看酒店:', record);
    // 跳转到酒店详情页面
    navigate(`/merchant/HotelDetail/${record.id}`);
  };

  const handleDelete = async (record: HotelItem) => {
    try {
      const response = await deleteHotel(record.id);
      message.success(response.message || '删除成功');
      // 重新获取数据
      fetchHotelData();
    } catch (error) {
      console.error('删除酒店失败:', error);
      message.error('删除失败，请重试');
    }
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, searchKeyword: value }));
  };

  // 重置过滤器
  const handleResetFilters = () => {
    setFilters({
      status: undefined,
      searchKeyword: '',
    });
  };

  // 表格变化处理
  const onChange: TableProps<HotelItem>['onChange'] = (paginationInfo, filters ) => {
    //console.log('params', paginationInfo, filters, sorter, extra);
    
    // 更新分页信息
    if (paginationInfo.current) {
      setPagination(prev => ({
        ...prev,
        current: paginationInfo.current || 1,
        pageSize: paginationInfo.pageSize || 10,
      }));
    }

    // 处理状态过滤
    if (filters.status && Array.isArray(filters.status) && filters.status.length > 0) {
      setFilters(prev => ({ ...prev, status: (filters.status && filters.status[0]) as string }));
    } else {
      setFilters(prev => ({ ...prev, status: undefined }));
    }
  };

  // 分页配置
  const paginationConfig = {
    ...pagination,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total: number) => `共 ${total} 条记录`,
    pageSizeOptions: ['5', '10', '20', '50'],
    onChange: (page: number, pageSize: number) => {
      setPagination(prev => ({ ...prev, current: page, pageSize }));
    },
    onShowSizeChange: (size: number) => {
      setPagination(prev => ({ ...prev, current: 1, pageSize: size }));
    },
  };

  // 监听过滤条件变化，重新获取数据
  useEffect(() => {
    fetchHotelData();
  }, [pagination.current, pagination.pageSize, filters.status, filters.searchKeyword]);

  // 前端搜索过滤
  const filteredData = data.filter(item => {
    if (filters.searchKeyword) {
      return item.name.toLowerCase().includes(filters.searchKeyword.toLowerCase());
    }
    return true;
  });

  return (
    <div className={styles.container}>
      {/* 过滤工具栏 */}
      <div className={styles.toolbar}>
        <Space wrap>
          <Search
            placeholder="搜索酒店名称"
            allowClear
            className={styles.mainSearch}
            onSearch={handleSearch}
          />

          <Button onClick={handleResetFilters}>重置过滤</Button>
          <Button type="primary" onClick={fetchHotelData} loading={loading}>
            刷新
          </Button>
          <NewHotel />
        </Space>
      </div>

      {/* 酒店表格 */}
      <Table<HotelItem>
        columns={columns}
        dataSource={filteredData}
        onChange={onChange}
        pagination={paginationConfig}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default HotelTable;