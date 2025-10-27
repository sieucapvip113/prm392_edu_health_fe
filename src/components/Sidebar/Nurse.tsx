import { useEffect, useState } from 'react';
import {
  Heart,
  Activity,
  Bell,
  Pill,
  Stethoscope,
  ChevronRight,
  Home,
  ChevronLeft,
  FileText
} from 'lucide-react';
import medicalLogo from '../../assets/images/medical-book.png';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { notificationService } from '../../services/NotificationService';
import { Avatar, Badge, Button, Dropdown, Form, Input, Modal, Menu } from 'antd';
import Noti from "../../pages/Noti/Noti";
import { logout, changePassword } from "../../services/AuthServices";
import { UserOutlined } from '@ant-design/icons';

function Nurse() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const userInfo = localStorage.getItem("user");


  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchNotifications = async () => {
      try {
        const response = await notificationService.getNotificationsForCurrentUser();
        setUnreadCount(response.unreadCount);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
    intervalId = setInterval(fetchNotifications, 5000);

    return () => clearInterval(intervalId);
  }, []);


  const menuItems = [
    {
      key: 'dashboard',
      title: 'Dashboard',
      path: '/nurse/dashboard',
      icon: Home,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100'
    },
    {
      key: 'medical',
      title: 'Quản lý thuốc gửi đến',
      path: '/nurse/medical',
      icon: Pill,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      key: 'healthcheck',
      title: 'Quản lý khám sức khỏe',
      path: '/nurse/healthcheck',
      icon: Stethoscope,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    },
    {
      key: 'health-records',
      title: 'Quản lý sổ sức khỏe',
      path: '/nurse/health-records',
      icon: FileText,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      key: 'vaccine',
      title: 'Quản lý sự kiện tiêm',
      path: '/nurse/vaccine',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      key: 'medical-events',
      title: 'Sự kiện y tế khác',
      path: '/nurse/medical-events',
      icon: Heart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    },

  ];

  const bottomItems = [
    { title: 'Thông báo', icon: Bell },
  ];

  const isActive = (path: string) => {
    if (path === '/nurse' && location.pathname === '/nurse') {
      return true;
    }
    if (path === '/nurse/medical') {
      return location.pathname.startsWith(path) && !location.pathname.includes('medical-events');
    }
    return location.pathname.startsWith(path) && path !== '/nurse';
  };

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      notificationService.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error: any) {
      notificationService.error(error.message || 'Có lỗi xảy ra khi đăng xuất');
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">
        <button className="w-full text-left" onClick={() => navigate('/nurse/profile')}>Hồ sơ cá nhân</button>
      </Menu.Item>

      <Menu.Item key="logout">
        <button onClick={handleLogout} className="w-full text-left">Đăng xuất</button>
      </Menu.Item>
    </Menu>
  );

  <Modal
    title="Đổi mật khẩu"
    open={isModalVisible}
    onCancel={() => setIsModalVisible(false)}
    footer={null}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={async (values) => {
        try {
          setLoading(true);
          const token = localStorage.getItem('accessToken');
          if (!token) {
            notificationService.error('Vui lòng đăng nhập lại');
            return;
          }
          await changePassword(values.currentPassword, values.newPassword, token);
          notificationService.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại');
          setIsModalVisible(false);
          localStorage.removeItem("user");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate('/login');
        } catch (error: any) {
          notificationService.error(error.message || 'Đổi mật khẩu thất bại');
        } finally {
          setLoading(false);
        }
      }}
    >
      <Form.Item
        name="currentPassword"
        label="Mật khẩu hiện tại"
        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label="Mật khẩu mới"
        rules={[
          { required: true, message: 'Vui lòng nhập mật khẩu mới' },
          { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          Đổi mật khẩu
        </Button>
      </Form.Item>
    </Form>
  </Modal>

  return (
    <div className="flex h-screen bg-gray-100">
      <div className={`bg-gradient-to-b from-blue-600 via-cyan-600 to-teal-600 opacity-90 text-white transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'} flex flex-col`}>
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center">
                <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <img src={medicalLogo} alt="Medical Logo" className="w-5 h-5 object-contain" />
                </div>
                <span className="ml-3 text-lg font-semibold">EduHealth</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
        </div>


        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to={item.path}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                  ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg border border-white/30'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
              >
                <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} ${isActive(item.path) ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
                {!isCollapsed && (
                  <span className="ml-3 text-left">{item.title}</span>
                )}
                {!isCollapsed && isActive(item.path) && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/20 space-y-2">
          {bottomItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 group"
              >
                <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} text-white/70 group-hover:text-white`} />
                {!isCollapsed && (
                  <span className="ml-3">{item.title}</span>
                )}
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200 group"
          >
            <span className="w-4 h-4 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H9m0 0l3-3m-3 3l3 3" />
              </svg>
            </span>
            {!isCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {menuItems.find(item => isActive(item.path))?.title || 'Profile'}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Chào mừng bạn đến với hệ thống quản lý y tế
              </p>
            </div>
            <div className="flex items-center space-x-4 ">
              <div className="ml-4">
                <Badge count={unreadCount}>
                  <Noti />
                </Badge>
              </div>

              <Dropdown overlay={menu} trigger={['hover']} arrow placement="bottomRight">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="text-left">
                    <p className="font-bold">
                      {userInfo ? JSON.parse(userInfo).username : 'Người dùng'}
                    </p>
                    <p className="text-sm">
                      {userInfo ? JSON.parse(userInfo).email : 'Người dùng'}
                    </p>
                  </div>
                  <Avatar style={{ backgroundColor: '#155dfc', width: 40, height: 40 }} icon={<UserOutlined />} />
                </div>
              </Dropdown>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>


  );
}

export default Nurse;