import { useState, useEffect } from 'react';
import { Button, Space, message, Modal, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import HotelTable from '../HotelTable/HotelTable';
import { getAdminHotelList, auditHotel, type AdminHotel } from '../../../services/hotelService';
import styles from './pendHotel.module.css';

export default function pendHotel() {
  const [hotels, setHotels] = useState<AdminHotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentHotelId, setCurrentHotelId] = useState<number>(0);
  const [auditStatus, setAuditStatus] = useState<'approved' | 'rejected'>('approved');
  const [auditComment, setAuditComment] = useState('');
  const [auditLoading, setAuditLoading] = useState(false);
  const { TextArea } = Input;

  // 获取待审核酒店列表
  const fetchHotels = async () => {
    //console.log('获取待审核酒店列表:', { page, pageSize });
    setLoading(true);
    try {
      const result = await getAdminHotelList(page, pageSize, 'pending');
      //console.log('获取待审核酒店列表成功:', { total: result.total, itemsCount: result.items.length });
      setHotels(result.items);
      setTotal(result.total);
    } catch (error: any) {
      console.error('获取待审核酒店列表失败:', error);
      message.error(error.message || '获取待审核酒店列表失败');
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

  // 打开审核模态框
  const openAuditModal = (hotelId: number, status: 'approved' | 'rejected') => {
    setCurrentHotelId(hotelId);
    setAuditStatus(status);
    setAuditComment('');
    setModalVisible(true);
  };

  // 处理审核提交
  const handleAuditSubmit = async () => {
    if (auditStatus === 'rejected' && !auditComment.trim()) {
      message.error('驳回时必须填写审核意见');
      return;
    }

    setAuditLoading(true);
    try {
      await auditHotel(currentHotelId, {
        status: auditStatus,
        comment: auditComment,
      });
      message.success(auditStatus === 'approved' ? '审核通过' : '审核驳回');
      setModalVisible(false);
      // 重新获取数据
      fetchHotels();
    } catch (error: any) {
      console.error('审核酒店失败:', error);
      message.error(error.message || '审核酒店失败');
    } finally {
      setAuditLoading(false);
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
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: AdminHotel) => (
        <Space size="middle">
          <Button type="primary" size="small" onClick={() => openAuditModal(record.id, 'approved')}>
            通过
          </Button>
          <Button danger size="small" onClick={() => openAuditModal(record.id, 'rejected')}>
            驳回
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
        title="待审核酒店"
        filters={{
          status: 'pending',
        }}
        customColumns={actionColumn}
      />
      
      <Modal
        title={auditStatus === 'approved' ? '审核通过' : '审核驳回'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleAuditSubmit}
        okButtonProps={{ loading: auditLoading }}
        cancelButtonProps={{ disabled: auditLoading }}
      >
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>
            审核意见
          </label>
          <TextArea
            value={auditComment}
            onChange={(e) => setAuditComment(e.target.value)}
            placeholder={auditStatus === 'rejected' ? '请填写驳回原因（必填）' : '请填写审核意见'}
            rows={4}
            disabled={auditLoading}
          />
          {auditStatus === 'rejected' && !auditComment.trim() && (
            <div className={styles.errorMessage}>
              驳回时必须填写审核意见
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}