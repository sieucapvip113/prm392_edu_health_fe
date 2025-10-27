import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../Sidebar/AdminSidebar';

const { Content } = Layout;

const AdminLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AdminSidebar collapsed={collapsed} onCollapse={setCollapsed} />
            <Layout style={{
                marginLeft: collapsed ? 80 : 260,
                transition: 'margin-left 0.2s'
            }}>
                <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout; 