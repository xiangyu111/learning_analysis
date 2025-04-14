import React, { useState, useEffect } from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Typography, Button, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  UserOutlined, 
  BookOutlined, 
  FileTextOutlined, 
  LogoutOutlined,
  CalendarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TeamOutlined,
  AimOutlined,
  ReadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import axios from '../utils/axios';
import './Layout.css';
import type { MenuProps } from 'antd';

const { Header, Content, Sider } = AntLayout;
const { Text } = Typography;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 检查用户登录状态
    if (!user || !user.id) {
      navigate('/login');
      return;
    }
    
    // 根据角色确保用户在正确的路径
    const basePath = getBasePath();
    if (!location.pathname.startsWith(basePath)) {
      navigate(basePath + '/dashboard');
    }
  }, [user, navigate, location.pathname]);

  const getBasePath = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    
    if (role === 'TEACHER') {
      return '/teacher';
    } else if (role === 'STUDENT') {
      return '/student';
    } else if (role === 'ADMIN') {
      return '/admin';
    } else {
      return '';
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/logout');
      message.success('退出登录成功');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('退出登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const getMenuItems = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role;
    
    if (role === 'TEACHER') {
      return [
        {
          key: '/teacher/dashboard',
          icon: <DashboardOutlined />,
          label: '教师工作台'
        },
        {
          key: '/teacher/classes',
          icon: <TeamOutlined />,
          label: '班级管理'
        },
        {
          key: '/teacher/activities',
          icon: <CalendarOutlined />,
          label: '活动管理'
        },
        {
          key: '/teacher/targets',
          icon: <AimOutlined />,
          label: '学习目标'
        },
        {
          key: '/teacher/student',
          icon: <UserOutlined />,
          label: '学生评估'
        }
      ];
    } else if (role === 'STUDENT') {
      return [
        {
          key: '/student/dashboard',
          icon: <DashboardOutlined />,
          label: '学习仪表盘'
        },
        {
          key: '/student/learning-path',
          icon: <ReadOutlined />,
          label: '学习路径'
        },
        {
          key: '/student/activities',
          icon: <CalendarOutlined />,
          label: '学习活动'
        },
        {
          key: '/student/feedback',
          icon: <FileTextOutlined />,
          label: '反馈提交'
        }
      ];
    } else if (role === 'ADMIN') {
      return [
        {
          key: '/admin/dashboard',
          icon: <DashboardOutlined />,
          label: '系统概览'
        },
        {
          key: '/admin/classes',
          icon: <TeamOutlined />,
          label: '班级管理'
        },
        {
          key: '/admin/teachers',
          icon: <UserOutlined />,
          label: '教师管理'
        },
        {
          key: '/admin/students',
          icon: <UserOutlined />,
          label: '学生管理'
        },
        {
          key: '/admin/logs',
          icon: <FileTextOutlined />,
          label: '系统日志'
        },
        {
          key: '/admin/settings',
          icon: <SettingOutlined />,
          label: '系统设置'
        }
      ];
    } else {
      return [
        {
          key: '/dashboard',
          icon: <DashboardOutlined />,
          label: '仪表盘'
        },
        {
          key: '/learning-path',
          icon: <ReadOutlined />,
          label: '学习路径'
        },
        {
          key: '/activities',
          icon: <CalendarOutlined />,
          label: '活动'
        },
        {
          key: '/feedback',
          icon: <FileTextOutlined />,
          label: '反馈'
        }
      ];
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser.role === 'STUDENT') {
          navigate('/student/profile');
        } else if (currentUser.role === 'TEACHER') {
          navigate('/teacher/profile');
        } else {
          navigate('/profile');
        }
      }
    },
    {
      type: 'divider',
      key: 'divider'
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      disabled: loading,
      onClick: handleLogout
    }
  ];

  const menuItems = getMenuItems();

  const handleMenuClick = (info: { key: string }) => {
    if (info.key === 'logout') {
      handleLogout();
    } else {
      navigate(info.key);
    }
  };

  return (
    <AntLayout className="layout">
      <Header className="header">
        <div className="header-left">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-btn"
          />
          <div className="logo" onClick={() => navigate(getBasePath())}>
            大学生课外学情记录分析系统
          </div>
        </div>
        <div className="user-info">
          <Dropdown 
            menu={{ items: userMenuItems }} 
            placement="bottomRight" 
            trigger={['click']}
          >
            <div className="user-dropdown">
              <Avatar 
                size="large" 
                icon={<UserOutlined />} 
                src={user.avatarUrl || './public/assets/images/default-avatar.png'}
                className="user-avatar"
              />
              <Text className="user-name">{user.name || '未登录'}</Text>
            </div>
          </Dropdown>
        </div>
      </Header>
      <AntLayout>
        <Sider 
          width={200} 
          className="sider"
          collapsed={collapsed}
          collapsedWidth={0}
          trigger={null}
        >
          <Menu
            mode="inline"
            selectedKeys={[location.pathname]}
            className="menu"
            onClick={handleMenuClick}
            items={menuItems}
          />
        </Sider>
        <Content className={`content-layout ${collapsed ? 'collapsed' : ''}`}>
          <div className="content">
            <div className="content-wrapper">
              <Outlet />
            </div>
          </div>
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout; 