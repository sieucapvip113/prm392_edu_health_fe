import { Card, Col, Row, Button, Statistic } from 'antd';
import {
    UserOutlined,
    FileTextOutlined,
    ExperimentOutlined,
    HeartOutlined,
} from '@ant-design/icons';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { getTotalHealthCheckStatus, getTotalVaccineStatus, getDashboardCounts } from '../../../services/DashboardService';
import { Link } from 'react-router-dom';

const HealthOverview = () => {

    const [dashboardStats, setDashboardStats] = useState({
        countUsers: 0,
        countBlog: 0,
        countVaccineRounds: 0,
        countHealthChecks: 0
    });


    const stats = [
        {
            title: 'Người dùng',
            value: dashboardStats.countUsers,
            icon: <UserOutlined />,
            color: '#1890ff'
        },
        {
            title: 'Bài blog',
            value: dashboardStats.countBlog,
            icon: <FileTextOutlined />,
            color: '#fa541c'
        },
        {
            title: 'Đợt tiêm',
            value: dashboardStats.countVaccineRounds,
            icon: <ExperimentOutlined />,
            color: '#52c41a'
        },
        {
            title: 'Đợt khám',
            value: dashboardStats.countHealthChecks,
            icon: <HeartOutlined />,
            color: '#eb2f96'
        }
    ];



    useEffect(() => {
        async function fetchDashboardStats() {
            try {
                const res = await getDashboardCounts();
                setDashboardStats(res);
            } catch (err) {
                console.error('Lỗi khi lấy dữ liệu dashboard:', err);
            }
        }

        fetchDashboardStats();
    }, []);


    // const vaccineStatusData = [
    //     { name: 'Chờ xử lý', value: 10, color: '#faad14' },
    //     { name: 'Đã tiêm', value: 18, color: '#52c41a' },
    //     { name: 'Đã từ chối', value: 2, color: '#f5222d' },
    // ];





    type StatusItem = {
        name: string;
        value: number;
        color: string;
    };

    const [healthCheckStatusData, setHealthCheckStatusData] = useState<StatusItem[]>([]);
    const [vaccineStatusData, setVaccineStatusData] = useState<StatusItem[]>([]);


    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await getTotalHealthCheckStatus(); // 👈 gọi API bạn có sẵn
                const chartData = [
                    { name: 'Đang xử lý', value: res.countInProgress, color: '#faad14' },
                    { name: 'Đã tạo', value: res.countCreated, color: '#1890ff' },
                    { name: 'Đã kiểm tra', value: res.countChecked, color: '#52c41a' },
                    { name: 'Đã gửi thông báo', value: res.countPending, color: '#f5222d' },
                ];
                setHealthCheckStatusData(chartData);
            } catch (err) {
                console.error('Lỗi load trạng thái khám sức khỏe:', err);
            }
        }

        fetchStatus();
    }, []);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await getTotalVaccineStatus(); // 👈 gọi API bạn có sẵn
                const chartData = [
                    { name: 'Đang chờ', value: res.countPending, color: '#faad14' },
                    { name: 'Đã cho phép', value: res.countAllowed, color: '#1890ff' },
                    { name: 'Đã tiêm', value: res.countInjected, color: '#52c41a' },
                    { name: 'Đã từ chối', value: res.countRejected, color: '#f5222d' }
                ];
                setVaccineStatusData(chartData);
            } catch (err) {
                console.error('Lỗi load trạng thái tiêm chủng:', err);
            }
        }

        fetchStatus();
    }, []);


    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Hiệu Trưởng</h1>

            {/* Statistics */}
            <Row gutter={16}>
                {stats.map((item, index) => (
                    <Col span={6} key={index}>
                        <Card>
                            <Statistic
                                title={item.title}
                                value={item.value}
                                valueStyle={{ color: item.color }}
                                prefix={item.icon}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* Pie Charts */}
            <Row gutter={16}>
                <Col span={12}>
                    <Card title="Trạng thái đợt tiêm" extra={<Button type="link"><Link to="/admin/reports/vaccination" style={{ textDecoration: 'none' }}>Chi tiết</Link></Button>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={vaccineStatusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {vaccineStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col span={12}>
                    <Card title="Trạng thái khám sức khỏe" extra={<Button type="link"><Link to="/admin/reports/health-events" style={{ textDecoration: 'none' }}>Chi tiết</Link></Button>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={healthCheckStatusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {healthCheckStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>


            {/* Table Recent Events */}
            {/* <Card title="Sự kiện gần đây">
                <Table dataSource={recentEvents} columns={columns} pagination={false} />
            </Card> */}
        </div>
    );
};

export default HealthOverview;
