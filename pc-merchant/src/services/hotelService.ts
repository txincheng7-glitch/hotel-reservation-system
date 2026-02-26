import type { Dayjs } from 'dayjs';
import type { UploadFile } from 'antd/es/upload/interface';
import axios from 'axios';
import type React from 'react';

// 酒店类型定义
export interface HotelItem {
  id: number;
  key?: React.Key;
  name: string;
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'unpublished';
  createdAt: string;
  updatedAt: string;
  address?: string;
  auditComment?: string | null;
  description?: string;
  isDeleted?: number;
  merchantId?: number;
  openingDate?: string;
  rating?: string;
  star?: number;
  starRating?: number;
  roomType?: string;
  price?: number;
}

// 创建酒店响应类型
export interface CreateHotelResponse {
  code: number;
  message?: string;
  data?: {
    id: number;
    name?: string;
    address?: string;
    description?: string;
    star?: number;
    openingDate?: string;
    merchantId?: number;
    status?: 'pending' | 'approved' | 'rejected' | 'published' | 'unpublished' | string;
    createdAt?: string;
    updatedAt?: string;
    tagIds?: number[];
  };
}

// 酒店详情类型定义
export interface HotelDetail {
  id: number;
  name: string;
  address: string;
  description: string;
  star: number;
  rating: number;
  openingDate: string;
  merchantId: number;
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'unpublished';
  auditComment: string;
  images: Array<{
    id: number;
    url: string;
    type: string;
  }>;
  tags: string[];
  rooms: Array<{
    id: number;
    type: string;
    area: number;
    bedType: string;
    maxOccupancy: number;
    price: number;
    totalRooms: number;
    available: number;
    images: string[];
    amenities: string[];
  }>;
  createdAt: string;
  updatedAt: string;
}

// 酒店列表响应
export interface HotelResponse {
  code: number;
  data: {
    total: number;
    page: number;
    pageSize: number;
    items: HotelItem[];
  };
}

// 创建酒店接口
export const createHotelWithFiles = async (
  name: string,
  address: string,
  description: string | undefined,
  star: number | undefined,
  openingDate: Dayjs,
  tagIds: number[],
  files: UploadFile[]
): Promise<CreateHotelResponse> => {
  // 获取token
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('未找到认证令牌');
  }

  // 创建 FormData 对象
  const formData = new FormData();
  
  // 添加文本字段
  formData.append('name', name);
  formData.append('address', address);
  if (description) {
    formData.append('description', description);
  }
  if (star) {
    formData.append('star', star.toString());
  }
  formData.append('openingDate', openingDate.format('YYYY-MM-DD'));
  if (tagIds) {
    // 为数组中的每个元素单独添加一个同名字段
    tagIds.forEach(tagId => {
      formData.append('tagIds', tagId.toString());
    });
    //console.log(formData);
  }
  
  // 添加文件
  files.forEach((file) => {
    if (file.originFileObj) {
      formData.append('files', file.originFileObj as Blob);
    }
  });

  // 发送请求
  try {
    const response = await fetch('/api/merchant/hotels/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 注意：不要设置 Content-Type，让浏览器自动设置
      },
      body: formData
    });

    if (!response.ok) {
      // 尝试获取错误信息
      try {
        const errorData = await response.json();
        throw new Error(`创建酒店失败: ${errorData.message || `状态码 ${response.status}`}`);
      } catch (jsonError) {
        throw new Error(`创建酒店失败: 状态码 ${response.status}`);
      }
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('创建酒店请求失败:', error);
    throw new Error(`创建酒店失败: ${error.message || '未知错误'}`);
  }
};

// 获取酒店列表
export const getHotelList = async (params: {
  page: number;
  pageSize: number;
  status?: string;
  searchKeyword?: string;
}): Promise<{
  items: HotelItem[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  const token = localStorage.getItem('token');
  // 构建实际的查询参数，只包含后端需要的字段
  const apiParams: any = {
    page: params.page,
    pageSize: params.pageSize,
  };
  
  // 只添加后端支持的参数
  if (params.status) {
    apiParams.status = params.status;
  }
  
  try {
    const response = await axios.get<HotelResponse>('/api/merchant/hotels', {
      params: apiParams,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // //console.log('API Response:', response.data);
    if (response.data.code === 200) {
      const { total, page, pageSize, items } = response.data.data;
      
      // 格式化数据，添加key属性并转换字段名
      const formattedItems = items.map((item: any) => ({
        id: item.id,
        name: item.name,
        status: item.status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        address: item.address,
        auditComment: item.audit_comment,
        description: item.description,
        isDeleted: item.is_deleted,
        merchantId: item.merchant_id,
        openingDate: item.opening_date,
        rating: item.rating,
        star: item.star,
        starRating: item.star, // 将 star 映射到 starRating 以保持一致性
        key: item.id,
      }));
      
      return {
        items: formattedItems,
        total,
        page,
        pageSize,
      };
    } else {
      throw new Error('获取数据失败: 未知错误');
    }
  } catch (error: any) {
    console.error('获取酒店数据失败:', error);
    console.error('错误详情:', error.response?.data);
    throw new Error(`网络请求失败: ${error.message || '未知错误'}`);
  }
};

// 删除酒店
export const deleteHotel = async (hotelId: number): Promise<{ code: number; message: string }> => {
  const token = localStorage.getItem('token');
  const response = await axios.delete<{ code: number; message: string }>(
    `/api/merchant/hotels/${hotelId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

// 获取酒店详情
export const getHotelDetail = async (hotelId: number): Promise<HotelDetail> => {
  const token = localStorage.getItem('token');
  const response = await axios.get<{ code: number; data: HotelDetail }>(
    `/api/merchant/hotels/${hotelId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  
  if (response.data.code === 200) {
    //console.log('API Response:', response.data);
    return response.data.data;
  } else {
    throw new Error('获取酒店详情失败');
  }
};

// 更新酒店信息
export const updateHotelInfo = async (
  hotelId: number,
  name: string,
  address: string,
  description: string | undefined,
  star: number | undefined,
  images: Array<{ url: string; type: string }> = [],
  facilityIds: number[] = [],
  tagIds: number[]
): Promise<{ code: number; data: { id: number; status: string; updatedAt: string } }> => {
  // 获取token
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('未找到认证令牌');
  }

  // 创建请求体
  const requestBody: any = {
    name,
    address,
    description,
    star,
    images,
    facilityIds,
    tagIds
  };

  Object.keys(requestBody).forEach((k) => {
    if (requestBody[k] === undefined) delete requestBody[k];
  });

  // 发送请求
  try {
    const response = await axios.put<{ code: number; data: { id: number; status: string; updatedAt: string } }>(
      `/api/merchant/hotels/${hotelId}`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error: any) {
    console.error('更新酒店信息请求失败:', error);
    throw new Error(`更新酒店信息失败: ${error.message || '未知错误'}`);
  }
};

// 添加房型
export const addRoom = async (hotelId: number, formData: FormData): Promise<{ code: number; message: string; data?: any }> => {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`/api/merchant/hotels/${hotelId}/rooms/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 注意：不要设置 Content-Type，让浏览器自动设置
      },
      body: formData
    });
    
    if (!response.ok) {
      // 尝试获取错误信息
      try {
        const errorData = await response.json();
        throw new Error(`添加房型失败: ${errorData.message || `状态码 ${response.status}`}`);
      } catch (jsonError) {
        throw new Error(`添加房型失败: 状态码 ${response.status}`);
      }
    }
    
    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('添加房型请求失败:', error);
    throw new Error(`添加房型失败: ${error.message || '未知错误'}`);
  }
};

// 删除房型
export const deleteRoom = async (hotelId: number, roomId: number): Promise<{ code: number; message: string }> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.delete<{ code: number; message: string }>(
      `/api/merchant/hotels/${hotelId}/${roomId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    // console.error('删除房型请求失败:', error);
    throw new Error(`删除房型失败: ${error.message || '未知错误'}`);
  }
};

// 更新房型
export const updateRoom = async (roomId: number, roomData: Partial<{
  type: string;
  area: number;
  bedType: string;
  maxOccupancy: number;
  price: number;
  totalRooms: number;
  available: number;
  images: string[];
  amenities: string[];
}>): Promise<{ code: number; data: any }> => {
  const token = localStorage.getItem('token');
  try {
    const response = await axios.put<{ code: number; data: any }>(
      `/api/merchant/rooms/${roomId}`,
      roomData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('更新房型请求失败:', error);
    throw new Error(`更新房型失败: ${error.message || '未知错误'}`);
  }
};

// 管理员获取酒店列表
export interface AdminHotel {
  images: any;
  id: number;
  name: string;
  address: string;
  star: number;
  rating: number;
  priceRange: { min: number; max: number };
  coverImage: string;
  status: string;
  auditStatus: string;
  auditComment: string;
  merchant: {
    id: number;
    username: string;
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AdminHotelResponse {
  code: number;
  data: {
    total: number;
    page: number;
    pageSize: number;
    items: AdminHotel[];
  };
}

export const getAdminHotelList = async (
  page: number = 1,
  pageSize: number = 10,
  status: string = '',
  merchantId: string = ''
): Promise<AdminHotelResponse['data']> => {
  const token = localStorage.getItem('token');
  console.log('请求参数:', { page, pageSize, status, merchantId });
  const response = await axios.post<AdminHotelResponse>('/api/admin/hotels', {
      page,
      pageSize,
      status,
      merchantId,
    },{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (response.data.code === 200) {
    // //console.log('获取酒店列表成功:', response.data.data);
    return response.data.data;
  } else {
    throw new Error('获取酒店列表失败');
  }
};

// 审核酒店
export interface AuditHotelRequest {
  status: 'approved' | 'rejected';
  comment: string;
}

export interface AuditHotelResponse {
  code: number;
  message: string;
}

export const auditHotel = async (
  hotelId: number,
  auditData: AuditHotelRequest
): Promise<AuditHotelResponse> => {
  const token = localStorage.getItem('token');
  /*console.log('审核酒店请求:', {
    hotelId,
    auditData,
    token: token ? '存在' : '不存在',
    url: `/api/admin/hotels/${hotelId}/audit`
  });*/
  try {
    const response = await axios.post<AuditHotelResponse>(
      `/api/admin/hotels/${hotelId}/audit`,
      auditData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    //console.log('审核酒店响应:', response.data);
    if (response.data.code === 200) {
      //console.log('审核酒店成功:', response.data);
      return response.data;
    } else {
      throw new Error('审核酒店失败');
    }
  } catch (error: any) {
    console.error('审核酒店错误:', error);
    console.error('错误响应:', error.response);
    throw error;
  }
};

// 发布/下线酒店

export interface PublishHotelRequest {
  action: 'publish' | 'unpublish';
}
export interface PublishHotelResponse {
  code: number;
  data: {
    id: number;
    status: 'published' | 'unpublished';
  };
}
export const publishHotel = async (
  hotelId: number,
  action: 'publish' | 'unpublish'
): Promise<PublishHotelResponse['data']> => {
  const token = localStorage.getItem('token');
  /*console.log('发布酒店请求:', {
    hotelId,
    action,
    token: token ? '存在' : '不存在',
    url: `/api/admin/hotels/${hotelId}/publish`
  });*/
  try {
    const response = await axios.post<PublishHotelResponse>(
      `/api/admin/hotels/${hotelId}/publish`,
      { action },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    //console.log('发布酒店响应:', response.data);
    if (response.data.code === 200) {
      //console.log('发布酒店成功:', response.data.data);
      return response.data.data;
    } else {
      throw new Error('发布酒店失败');
    }
  } catch (error: any) {
    console.error('发布酒店错误:', error);
    console.error('错误响应:', error.response);
    throw error;
  }
};