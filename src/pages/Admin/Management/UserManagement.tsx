import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Input, Space, Tooltip, Popconfirm, Modal, Form, Select } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined, UserOutlined, PhoneOutlined, MailOutlined, LockOutlined, IdcardOutlined, PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { User, getAllUsers, getRoleName, deleteUser, registerUser, RegisterUserDto, createGuardianWithStudents, deleteGuardianByObId, Guardian, getAllGuardians, importGuardiansToExcel } from '../../../services/AccountService';
import { notificationService } from '../../../services/NotificationService';

const UserManagement: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [isRegisterModalVisible, setIsRegisterModalVisible] = useState(false);
    const [registerForm] = Form.useForm();
    const [registerLoading, setRegisterLoading] = useState(false);
    const [isGuardianRegisterModalVisible, setIsGuardianRegisterModalVisible] = useState(false);
    const [guardianRegisterForm] = Form.useForm();
    const [guardianRegisterLoading, setGuardianRegisterLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<string>('All');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                notificationService.error('Vui lòng đăng nhập để tiếp tục');
                return;
            }
            const [usersData, guardiansData] = await Promise.all([
                getAllUsers(token),
                getAllGuardians(token)
            ]);

            const combinedUsers: User[] = usersData.map(user => {
                const guardian = guardiansData.find(g => g.userId === user.id);

                if (user.roleId === 4 || user.roleId === 3) {
                    return {
                        ...user,
                        students: guardian ? guardian.students : [],
                        obId: guardian ? guardian.obId : undefined,
                        roleInFamily: guardian ? guardian.roleInFamily : undefined
                    };
                } else if (user.roleId === 2 && guardian) {
                    return {
                        ...user,
                        roleId: 4,
                        students: guardian.students,
                        obId: guardian.obId,
                        roleInFamily: guardian.roleInFamily
                    };
                }
                return user;
            });

            setUsers(combinedUsers);
        } catch (error: any) {
            notificationService.error(error.message || 'Có lỗi xảy ra khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user => {
            if (user.roleId === 1) return false; // Ẩn user admin
            const matchesSearchText = (
                (user?.username?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
                (user?.fullname?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
                (user?.email?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
                (user?.phoneNumber && user.phoneNumber.includes(searchText)) ||
                (user?.roleId === 4 && user.students && user.students.some(student =>
                    (student.fullname?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
                    (student.username?.toLowerCase() || '').includes(searchText.toLowerCase())
                ))
            );

            let matchesRole = false;
            if (selectedRole === 'All') {
                matchesRole = user.roleId !== 3;
            } else {
                matchesRole = getRoleName(user.roleId) === selectedRole;
            }

            return matchesSearchText && matchesRole;
        });
        setFilteredUsers(filtered);
    }, [users, searchText, selectedRole]);

    const handleDelete = async (userId: number) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                notificationService.error('Vui lòng đăng nhập để tiếp tục');
                return;
            }

            const userToDelete = users.find(user => user.id === userId);

            if (!userToDelete) {
                notificationService.error('Không tìm thấy người dùng để xóa.');
                return;
            }

            if (userToDelete.roleId === 4) {
                try {
                    const allGuardians: Guardian[] = await getAllGuardians(token);
                    const guardian = allGuardians.find(g => g.userId === userId);
                    if (guardian) {
                        await deleteGuardianByObId(guardian.obId, token);
                        notificationService.success('Xóa người dùng thành công');
                    } else {
                        notificationService.error('Không tìm thấy thông tin phụ huynh để xóa.');
                    }
                } catch (guardianError: any) {
                    const message = guardianError.message === 'Cannot delete admin user'
                        ? 'Không thể xóa người dùng có vai trò admin'
                        : guardianError.message || 'Có lỗi xảy ra khi xóa người dùng';
                    notificationService.error(message);
                }
            } else {
                await deleteUser(userId, token);
                notificationService.success('Xóa người dùng thành công');
            }
            fetchUsers();
        } catch (error: any) {
            const message = error.message === 'Cannot delete admin user'
                ? 'Không thể xóa người dùng có vai trò admin'
                : error.message || 'Có lỗi xảy ra khi xóa người dùng';
            notificationService.error(message);
        }
    };

    const getRoleColor = (roleId: number): string => {
        switch (roleId) {
            case 1:
                return 'red';
            case 2:
                return 'green';
            case 3:
                return 'blue';
            case 4:
                return 'purple'
            default:
                return 'default';
        }
    };

    const columns: ColumnsType<User> = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
            render: (id: number) => (
                <span className="font-medium text-gray-600">#{id}</span>
            ),
        },
        {
            title: 'Thông tin người dùng',
            dataIndex: 'fullname',
            key: 'fullname',
            render: (_, record) => (
                <div className="flex flex-col">
                    <span className="font-medium text-gray-800">{record.fullname}</span>
                    <span className="text-sm text-gray-500">@{record.username}</span>
                </div>
            ),
        },
        {
            title: 'Liên hệ',
            key: 'contact',
            render: (_, record) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <MailOutlined className="text-blue-500" />
                        <span className="text-gray-600">{record.email}</span>
                    </div>
                    {record.roleId !== 3 && (  // Chỉ hiển thị số điện thoại nếu không phải Student
                        <div className="flex items-center gap-2">
                            <PhoneOutlined className="text-green-500" />
                            <span className="text-gray-600">{record.phoneNumber}</span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Vai trò',
            dataIndex: 'roleId',
            key: 'roleId',
            width: 120,
            render: (roleId: number) => {
                const roleStyles = {
                    minWidth: '90px',
                    textAlign: 'center',
                    padding: '4px 12px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '12px'
                } as React.CSSProperties;

                return (
                    <Tag
                        color={getRoleColor(roleId)}
                        style={roleStyles}
                    >
                        {getRoleName(roleId)}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 120,
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="text"
                            icon={<EyeOutlined className="text-blue-500 hover:text-blue-600" />}
                            onClick={() => navigate(`/admin/management/users/${record.id}`)}
                        />
                    </Tooltip>

                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa người dùng này?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Xóa"
                        cancelText="Hủy"
                        placement="topRight"
                    >
                        <Tooltip title="Xóa">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    const handleRegister = async (values: RegisterUserDto) => {
        try {
            setRegisterLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) {
                notificationService.error('Vui lòng đăng nhập để tiếp tục');
                return;
            }

            await registerUser(values, token);
            notificationService.success('Đăng ký người dùng thành công');
            setIsRegisterModalVisible(false);
            registerForm.resetFields();
            fetchUsers();
        } catch (error: any) {
            notificationService.error(error.message || 'Có lỗi xảy ra khi đăng ký người dùng');
        } finally {
            setRegisterLoading(false);
        }
    };

    const handleRegisterGuardian = async (values: any) => {
        try {
            setGuardianRegisterLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) {
                notificationService.error('Vui lòng đăng nhập để tiếp tục');
                return;
            }
            // Không gửi password lên BE
            const { password, ...guardianData } = values;
            // 1. Tạo phụ huynh
            await createGuardianWithStudents(guardianData, token);
            // 2. Gửi password ngẫu nhiên qua mail
            await fetch('http://localhost:3333/api/v1/auth/send-random-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ email: guardianData.email }),
            });
            notificationService.success('Đăng ký phụ huynh thành công, mật khẩu đã gửi qua email');
            setIsGuardianRegisterModalVisible(false);
            guardianRegisterForm.resetFields();
            fetchUsers();
        } catch (error: any) {
            notificationService.error(error.message || 'Có lỗi xảy ra khi đăng ký phụ huynh');
        } finally {
            setGuardianRegisterLoading(false);
        }
    };

    const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                notificationService.error('Vui lòng đăng nhập để tiếp tục');
                return;
            }

            await importGuardiansToExcel(formData, token);
            notificationService.success('Import phụ huynh thành công');
            fetchUsers(); // reload danh sách sau khi import
        } catch (error: any) {
            notificationService.error(error.message || 'Có lỗi khi import Excel');
        } finally {
            event.target.value = ''; // reset input để cho phép chọn lại file giống nhau sau này
        }
    };


    return (
        <Card className="shadow-md">
            <div className="mb-6 flex justify-between items-center h-14">
                <h1 className="text-2xl font-bold text-blue-600 m-0 leading-none flex items-center h-full">
                    Quản lý người dùng
                </h1>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Tìm kiếm"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        className="flex-grow"
                        style={{ width: 250 }}
                        allowClear
                    />
                    <Select
                        defaultValue="All"
                        style={{ width: 120 }}
                        onChange={(value) => setSelectedRole(value)}
                        value={selectedRole}
                    >
                        <Select.Option value="All">Tất cả</Select.Option>
                        <Select.Option value="Nurse">Y tá</Select.Option>
                        <Select.Option value="Guardian">Phụ huynh</Select.Option>
                    </Select>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ backgroundColor: '#28a745' }}
                        className="h-full flex items-center"
                        onClick={() => setIsRegisterModalVisible(true)}
                    >
                        Thêm y tá
                    </Button>
                    <Button
                        type="primary"
                        onClick={() => setIsGuardianRegisterModalVisible(true)}
                    >
                        Thêm phụ huynh
                    </Button>
                    <Button
                        type="default"
                        onClick={() => document.getElementById('excel-file-input')?.click()}
                    >
                        Tạo phụ huynh từ Excel
                    </Button>
                    <input
                        type="file"
                        id="excel-file-input"
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        onChange={handleExcelUpload}
                    />

                </div>
            </div>

            <Table
                columns={columns}
                dataSource={filteredUsers}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title="Thêm y tá mới"
                open={isRegisterModalVisible}
                onCancel={() => {
                    setIsRegisterModalVisible(false);
                    registerForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={registerForm}
                    layout="vertical"
                    onFinish={handleRegister}
                >
                    <Form.Item
                        name="username"
                        label="Tên đăng nhập"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
                            {
                                pattern: /^[a-zA-Z0-9_]+$/,
                                message: 'Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới (_)',
                            },
                        ]}
                    >
                        <Input prefix={<IdcardOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="fullname"
                        label="Họ và tên"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên' },
                            { min: 3, message: 'Họ và tên phải có ít nhất 3 ký tự' },
                            {
                                pattern: /^[a-zA-ZÀ-ỹ\s]+$/u,
                                message: 'Họ và tên không được chứa số hoặc ký tự đặc biệt',
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email' },
                            { type: 'email', message: 'Email không hợp lệ' }
                        ]}
                    >
                        <Input prefix={<MailOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Mật khẩu"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mật khẩu' },
                            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' },
                            {
                                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
                                message: 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
                            }
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại' },
                            { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }
                        ]}
                    >
                        <Input prefix={<PhoneOutlined />} />
                    </Form.Item>

                    <Form.Item className="mb-0 text-right">
                        <Button
                            onClick={() => {
                                setIsRegisterModalVisible(false);
                                registerForm.resetFields();
                            }}
                            style={{ marginRight: 8 }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={registerLoading}
                            style={{ backgroundColor: '#1890ff' }}
                        >
                            Thêm quản lý
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Thêm phụ huynh"
                open={isGuardianRegisterModalVisible}
                onCancel={() => {
                    setIsGuardianRegisterModalVisible(false);
                    guardianRegisterForm.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={guardianRegisterForm}
                    layout="vertical"
                    onFinish={handleRegisterGuardian}
                >
                    <Form.Item
                        name="fullname"
                        label="Họ và tên phụ huynh"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên' },
                            { min: 3, message: 'Họ và tên phải có ít nhất 3 ký tự' },
                            {
                                pattern: /^[a-zA-ZÀ-ỹ\s]+$/u,
                                message: 'Họ và tên không được chứa số hoặc ký tự đặc biệt',
                            },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="username"
                        label="Tên đăng nhập phụ huynh"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đăng nhập' },
                            { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' },
                            {
                                pattern: /^[a-zA-Z0-9_]+$/,
                                message: 'Tên đăng nhập chỉ được chứa chữ, số và dấu gạch dưới (_)',
                            },
                        ]}                    >
                        <Input prefix={<IdcardOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email phụ huynh"
                        rules={[{ required: true, message: 'Vui lòng nhập email phụ huynh' }, { type: 'email', message: 'Email không hợp lệ' }]}
                    >
                        <Input prefix={<MailOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại phụ huynh"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại phụ huynh' }, { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ' }]}
                    >
                        <Input prefix={<PhoneOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="roleInFamily"
                        label="Vai trò trong gia đình"
                        rules={[{ required: true, message: 'Vui lòng nhập vai trò trong gia đình' }]}
                    >
                        <Input placeholder="VD: Bố, Mẹ, Ông, Bà..." />
                    </Form.Item>

                    <Form.Item
                        name="isCallFirst"
                        label="Là người gọi đầu tiên khi khẩn cấp?"
                        valuePropName="checked"
                        initialValue={false}
                    >
                        <Select>
                            <Select.Option value={true}>Có</Select.Option>
                            <Select.Option value={false}>Không</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Địa chỉ"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                        <Input placeholder="Nhập địa chỉ phụ huynh" />
                    </Form.Item>

                    <Form.Item className="mb-0 text-right">
                        <Button
                            onClick={() => {
                                setIsGuardianRegisterModalVisible(false);
                                guardianRegisterForm.resetFields();
                            }}
                            style={{ marginRight: 8 }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={guardianRegisterLoading}
                            style={{ backgroundColor: '#28a745' }}
                        >
                            Thêm phụ huynh
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UserManagement; 