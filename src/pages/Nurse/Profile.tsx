import React, { useEffect, useState } from 'react';
import { Card, Avatar, Button, Form, Input, Spin, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getUserById, updateUser, User } from '../../services/AccountService';
import { notificationService } from '../../services/NotificationService';


const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();


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

  if (loading) return <div className="flex justify-center items-center h-96"><Spin size="large" /></div>;
  if (!user) return null;

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
      <Card className="w-full max-w-xl shadow-lg rounded-lg">
        <div className="flex flex-col items-center mb-6">
          <Avatar size={80} icon={<UserOutlined />} className="bg-blue-500" />
          <h2 className="mt-4 text-2xl font-bold text-blue-700">{user.fullname}</h2>
          <div className="text-gray-500">{user.Role?.name || 'Vai trò'}</div>
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

        </Form>
        <div className="flex justify-end gap-2 mt-4">
          {editMode ? (
            <>
              <Button onClick={handleCancel}>Hủy</Button>
              <Button type="primary" onClick={handleSave} loading={loading}>Lưu</Button>
            </>
          ) : (
            <Button type="primary" onClick={handleEdit}>Chỉnh sửa</Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile; 