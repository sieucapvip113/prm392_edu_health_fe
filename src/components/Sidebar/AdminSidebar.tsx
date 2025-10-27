import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    HomeOutlined,
    BarChartOutlined,
    UserOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DownOutlined
} from '@ant-design/icons';
import logo from '../../assets/images/medical-book.png';
import { logout } from '../../services/AuthServices';
import { notificationService } from '../../services/NotificationService';


const menuConfig = [
    {
        key: 'health-overview',
        icon: <HomeOutlined className="w-5 h-5" />,
        label: 'Tình hình y tế học đường',
        path: '/admin/health-overview'
    },
    {
        key: 'reports',
        icon: <BarChartOutlined className="text-lg" />,
        label: 'Báo cáo & Thống kê',
        children: [
            { key: 'health-events', label: 'Báo cáo sức khỏe', path: '/admin/reports/health-events' },
            { key: 'vaccination-reports', label: 'Báo cáo tiêm chủng', path: '/admin/reports/vaccination' },
        ]
    },
    {
        key: 'management',
        icon: <UserOutlined className="text-lg" />,
        label: 'Quản lý',
        children: [
            { key: 'user-management', label: 'Quản lý người dùng', path: '/admin/management/users' },
            { key: 'content-management', label: 'Cập nhật tài liệu & bài viết', path: '/admin/management/content' },
        ]
    },
];

interface AdminSidebarProps {
    collapsed: boolean;
    onCollapse: (collapsed: boolean) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ collapsed, onCollapse }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [openGroups, setOpenGroups] = useState<string[]>([]);

    useEffect(() => {
        const foundParent = menuConfig.find(group =>
            group.children?.some(item => location.pathname.startsWith(item.path))
        );

        if (foundParent && !openGroups.includes(foundParent.key)) {
            setOpenGroups(prev => [...prev, foundParent.key]);
        }

    }, [location.pathname]);

    const isActive = (path: string) => location.pathname.startsWith(path);

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

    const handleToggleGroup = (key: string) => {
        setOpenGroups(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
    };

    return (
        <aside
            className="shadow-md"
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                background: 'linear-gradient(to right, #2563eb, #06b6d4)',
                borderRight: 'none',
                zIndex: 999,
                width: collapsed ? 80 : 260,
                transition: 'width 0.2s',
            }}
        >
            {/* Header - Chỉ hiển thị icon 3 gạch khi collapsed */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} p-4`}>
                {!collapsed && (
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                            <img src={logo} alt="EduHealth Logo" className="w-6 h-6 object-contain" />
                        </div>
                        <div className="ml-3 flex items-center">
                            <span className="text-xl font-bold text-white">EduHealth</span>
                        </div>
                    </div>
                )}
                <div
                    onClick={() => onCollapse(!collapsed)}
                    className={`cursor-pointer p-1 hover:bg-white/20 rounded-lg text-white ${collapsed ? 'mx-auto' : 'ml-auto'}`}
                    style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    {collapsed ? <MenuUnfoldOutlined className="text-lg" /> : <MenuFoldOutlined className="text-lg" />}
                </div>
            </div>

            {/* Menu */}
            <nav className="flex flex-col h-[calc(100vh-64px)]">
                <div className="flex-1 overflow-y-auto px-2 py-2">
                    {menuConfig.map((group) => (
                        <div key={group.key} className="mb-2">
                            {collapsed ? (
                                <button
                                    type="button"
                                    onClick={() => handleToggleGroup(group.key)}
                                    className="w-full flex items-center justify-center text-white/80 font-semibold text-sm mb-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200"
                                >
                                    {group.icon}
                                </button>
                            ) : (
                                group.children ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleGroup(group.key)}
                                            className={`w-full flex items-center text-white/80 font-semibold text-sm mb-1 px-3 py-2 rounded-lg transition-all duration-200
                                            ${openGroups.includes(group.key) ? 'bg-white/10' : 'hover:bg-white/10'}
                                        `}
                                        >
                                            <span className="mr-2">{group.icon}</span>
                                            <span>{group.label}</span>
                                            <DownOutlined
                                                className="w-4 h-4 ml-auto text-white/70 transition-transform duration-200"
                                                style={{ transform: openGroups.includes(group.key) ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                                            />
                                        </button>
                                        {openGroups.includes(group.key) && !collapsed && (
                                            <div className="flex flex-col space-y-1">
                                                {group.children.map((item) => (
                                                    <Link
                                                        key={item.key}
                                                        to={item.path}
                                                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 pl-8
                                                        ${isActive(item.path)
                                                                ? 'bg-white/20 text-white font-bold shadow border border-white/30'
                                                                : 'text-white hover:bg-white/10 hover:text-white font-normal'}
                                                    `}
                                                    >
                                                        <span>{item.label}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        key={group.key}
                                        to={group.path}
                                        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                            ${isActive(group.path)
                                                ? 'bg-white/20 text-white font-bold shadow border border-white/30'
                                                : 'text-white hover:bg-white/10 hover:text-white font-normal'}
                                        `}
                                    >
                                        <span className="mr-2">{group.icon}</span>
                                        <span>{group.label}</span>
                                    </Link>
                                )
                            )}
                        </div>
                    ))}
                </div>
                {/* Logout */}
                <div className="border-t border-white/20 bg-transparent p-2">
                    <button
                        onClick={handleLogout}
                        className={`w-full flex items-center ${collapsed ? 'justify-center' : 'px-3'} py-2 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 hover:text-white transition-all duration-200`}
                    >
                        <LogoutOutlined className="text-lg" />
                        {!collapsed && <span className="ml-2">Đăng xuất</span>}
                    </button>
                </div>
            </nav>
        </aside>
    );
};

export default AdminSidebar;