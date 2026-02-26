import React from 'react';
import { Flex, Layout, Menu } from 'antd';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { FileSearchOutlined,FileOutlined, FileProtectOutlined, LogoutOutlined } from '@ant-design/icons';
import styles from './admin.module.css';

const { Header, Sider, Content } = Layout;



const App: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // 导航菜单配置
  const menuItems = [
    {
      key: '/admin/showHotel',
      icon: <FileOutlined />,
      label: <Link to="/admin/showHotel">酒店总览</Link>,
    },
    {
      key: '/admin/pendHotel',
      icon: <FileSearchOutlined />,
      label: <Link to="/admin/pendHotel">审核酒店</Link>,
    },
    {
      key: '/admin/publishHotel',
      icon: <FileProtectOutlined />,
      label: <Link to="/admin/publishHotel">发布/下线酒店</Link>,
    },
    {
      key: '/login',
      icon: <LogoutOutlined />,
      label: <Link to="/Welcome">退出登录</Link>,
    },
  ];

  return (
    <div className={styles.container}>
      <Flex gap="middle" className={styles.flex}>
        <Layout className={styles.layout}>
          <Header className={styles.header}>
            <div className={styles.title}>易宿酒店管理系统</div>
          </Header>
          <Layout className={styles.subLayout}>
            <Sider width="20%" className={styles.sider}>
              <Menu
                className={styles.menu}
                mode="inline"
                selectedKeys={[currentPath]}
                items={menuItems}
              />
            </Sider>
            <Content className={styles.content}>
              {/* 路由出口，用于展示子路由内容 */}
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </Flex>
    </div>
  );
};
export default App;