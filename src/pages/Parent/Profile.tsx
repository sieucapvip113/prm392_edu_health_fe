import React, { useEffect, useState } from 'react';
import { Card, Avatar, Button, Form, Input, Spin, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined, UserSwitchOutlined } from '@ant-design/icons';
import { getUserById, updateUser, User } from '../../services/AccountService';
import { changePassword } from '../../services/AuthServices';
import { notificationService } from '../../services/NotificationService';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) throw new Error('Vui lòng đăng nhập lại');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.userId || payload.id || payload.sub;
        const data = await getUserById(userId, token);
        setUser(data);
        form.setFieldsValue(data);
      } catch (err: any) {
        message.error(err.message || 'Không thể tải thông tin cá nhân');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [form]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    form.setFieldsValue(user!);
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token || !user) throw new Error('Vui lòng đăng nhập lại');
      const values = await form.validateFields();
      const updated = await updateUser(user.id, values, token);
      setUser(updated);
      setEditMode(false);
      notificationService.success('Cập nhật thành công!');
      // Fetch lại dữ liệu user thay vì reload trang
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.userId || payload.id || payload.sub;
      const freshData = await getUserById(userId, token);
      setUser(freshData);
      form.setFieldsValue(freshData);
    } catch (err: any) {
      notificationService.error(err.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    try {
      setPasswordLoading(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        notificationService.error('Vui lòng đăng nhập lại');
        return;
      }
      await changePassword(values.currentPassword, values.newPassword, token);
      notificationService.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại');
      passwordForm.resetFields();
      // Tự động logout sau khi đổi mật khẩu thành công
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate('/login');
    } catch (error: any) {
      notificationService.error(error.message || 'Đổi mật khẩu thất bại');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;
  if (!user) return null;

  const items = [
    {
      key: '1',
      label: (
        <span className="flex items-center">
          <UserOutlined className="mr-2" />
          Thông tin cá nhân
        </span>
      ),
      children: (
        <div className="p-6">
          <div className="flex flex-col items-center mb-6">
            <Avatar size={80} icon={<UserOutlined />} className="bg-blue-500 mb-4" />
            <h2 className="text-2xl font-bold text-blue-700 mb-2">{user.fullname}</h2>
            {/* <div className="text-gray-500 mb-4">{user.Role?.name || 'Vai trò'}</div> */}
          </div>
          
          <Form
            form={form}
            layout="vertical"
            disabled={!editMode}
            initialValues={user}
          >
            <Form.Item name="fullname" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: 'Email không hợp lệ' }]}>
              <Input disabled />
            </Form.Item>
            <Form.Item name="phoneNumber" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
              <Input />
            </Form.Item>
            <Form.Item name="address" label="Địa chỉ">
              <Input />
            </Form.Item>
          </Form>
          
          <div className="flex justify-end gap-2 mt-6">
            {editMode ? (
              <>
                <Button onClick={handleCancel}>Hủy</Button>
                <Button type="primary" onClick={handleSave} loading={loading}>Lưu</Button>
              </>
            ) : (
              <Button type="primary" onClick={handleEdit} icon={<UserSwitchOutlined />}>
                Chỉnh sửa
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: (
        <span className="flex items-center">
          <LockOutlined className="mr-2" />
          Đổi mật khẩu
        </span>
      ),
      children: (
        <div className="p-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <LockOutlined className="text-4xl text-blue-500 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Đổi mật khẩu</h3>
              <p className="text-gray-600">Vui lòng nhập mật khẩu hiện tại và mật khẩu mới</p>
            </div>
            
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handleChangePassword}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
              >
                <Input.Password size="large" />
              </Form.Item>
              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                ]}
              >
                <Input.Password size="large" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                    },
                  }),
                ]}
              >
                <Input.Password size="large" />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={passwordLoading} 
                  size="large"
                  block
                  icon={<LockOutlined />}
                >
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50 p-4">
      <Card className="w-full max-w-4xl shadow-lg rounded-lg">
        <Tabs 
          items={items} 
          defaultActiveKey="1"
          size="large"
          tabPosition="top"
          className="profile-tabs"
        />
      </Card>
    </div>
  );
};

export default Profile; 