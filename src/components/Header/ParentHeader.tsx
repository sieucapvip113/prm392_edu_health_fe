import { useState, useEffect } from 'react';
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Menu, Badge, Modal, Form, Input, Button } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import Noti from "../../pages/Noti/Noti";
import { logout, changePassword } from "../../services/AuthServices";
import { notificationService } from "../../services/NotificationService";
import { getUserById, User } from "../../services/AccountService";

const Header = () => {
  const baseClass = "font-medium px-2 py-1 transition";
  const activeClass = "text-blue-600";
  const inactiveClass = "text-gray-700 hover:text-blue-600";
  const userInfo = localStorage.getItem("user");
  console.log('User info from localStorage:', userInfo ? JSON.parse(userInfo) : null);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

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

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId || payload.id || payload.sub;
        const userData = await getUserById(userId, token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user info:', error);
      }
    };
    fetchUserInfo();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      notificationService.success('Đăng xuất thành công');
      navigate('/login');
    } catch (error: any) {
      notificationService.error(error.message || 'Có lỗi xảy ra khi đăng xuất');
    }
  };

  const menu = (
    <Menu>
      <Menu.Item key="profile">
        <button className="w-full text-left" onClick={() => navigate('/guardian/profile')}>Hồ sơ cá nhân</button>
      </Menu.Item>
      <Menu.Item key="logout">
        <button onClick={handleLogout} className="w-full text-left">Đăng xuất</button>
      </Menu.Item>
    </Menu>
  );

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="-ml-20 flex items-center space-x-2">
          <img
            src="/src/assets/images/medical-book.png"
            alt="Logo"
            className="w-10 h-10 object-cover"
          />
          <span className="text-xl font-bold text-blue-600">EduHealth</span>
        </div>

        <nav className="hidden md:flex space-x-6 ml-20">
          {[
            { to: "/guardian", label: "Trang chủ" },
            { to: "/guardian/children", label: "Hồ sơ con" },
            { to: "/guardian/medications", label: "Gửi thuốc" },
            { to: "/guardian/vaccines", label: "Tiêm chủng" },
            { to: "/guardian/checkups", label: "Khám sức khỏe" },
            { to: "/guardian/events", label: "Sự kiện" },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/guardian"}
              className={({ isActive }) =>
                `${baseClass} ${isActive ? activeClass : inactiveClass}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center space-x-4 -mr-20">
          <div className="ml-4">
            <Badge count={unreadCount}>
              <Noti />
            </Badge>
          </div>

          <Dropdown overlay={menu} trigger={['hover']} arrow placement="bottomRight">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="text-left">
                <p className="font-bold">
                  {user ? user.fullname : 'Người dùng'}
                </p>
                <p className="text-sm">
                  {user ? user.email : 'Người dùng'}
                </p>
              </div>
              <Avatar style={{ backgroundColor: '#155dfc', width: 40, height: 40 }} icon={<UserOutlined />} />
            </div>
          </Dropdown>
        </div>
      </div>

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
    </header>
  );
};

export default Header;
