// ...existing code...
import React, { useState, useEffect } from 'react';
import { ExclamationCircleOutlined, HomeOutlined, SettingOutlined, LogoutOutlined, UnorderedListOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Menu, Button } from 'antd';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import logo from '../../../common/image/Logo.png';
import { logout } from '../../../services/authService';
import styles from './Merchant.module.css';


type MenuItem = Required<MenuProps>['items'][number];

// 退出登录处理函数
const handleLogout = async () => {
  try {
    // 调用退出登录 API
    await logout();
  } catch (error) {
    console.error('退出登录失败:', error);
  } finally {
    // 清除本地存储中的 token
    localStorage.removeItem('token');
    // 导航到登录页面
    window.location.href = '/Welcome';
  }
};



const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [current, setCurrent] = useState<string>(location.pathname || 'test');

  useEffect(() => {
    setCurrent(location.pathname);
  }, [location.pathname]);

  // 检查当前路径是否是酒店详情页面
  const isHotelDetailPage = location.pathname.startsWith('/merchant/HotelDetail/');

  // 动态生成菜单项
  const items: MenuItem[] = [
    {
        label: (
            <img
                src={logo}
                alt="Logo"
                className={styles.logo}
            />
        ),
        key: '#',
        disabled: true,
        className: styles.logoMenuItem,
    },
    {
        label: '首页',
        key: '/merchant/MerchantHome',
        icon: <HomeOutlined />,
    },
    {
        label: '酒店管理',
        key: '/merchant/HotelManage',
        icon: <SettingOutlined />,
    },
    {
        label: '酒店详情',
        key: '/merchant/HotelDetail',
        icon: <UnorderedListOutlined />,
        disabled: true, 
    },
    {
        label: '消息通知',
        key: '/merchant/Notice',
        icon: <ExclamationCircleOutlined />
    },
    {
        label: (
            <Button
                className={styles.logoutButton}
                type="text"
                danger
                icon={<LogoutOutlined />}
                onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                }}
            >
                退出登录
            </Button>
        ),
        key: '/welcome',
        className: styles.logoutMenuItem,
    },
];


  const onClick: MenuProps['onClick'] = (e) => {
    const path = String(e.key);
    // 外部链接保持原样（以 http 开头）
    if (/^https?:\/\//.test(path)) return;
    navigate(path);
    setCurrent(path);
  };

  return (
    <>
        <div className={styles.container}>
            <Menu 
                onClick={onClick} 
                selectedKeys={[isHotelDetailPage ? '/merchant/HotelDetail' : current]} 
                mode="horizontal" 
                items={items}
                className={styles.menu}
            />
            <div className={styles.content}>
                <Outlet></Outlet>
            </div>
        </div>
    </>
  );
};

export default App;