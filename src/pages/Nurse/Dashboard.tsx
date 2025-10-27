import React, { useEffect, useState } from 'react';
import {
    Card,
    Button,
    Row,
    Col,
    Statistic,
} from 'antd';
import {
    MedicineBoxOutlined,
    HeartOutlined,
    ExperimentOutlined,
    AlertOutlined,
} from '@ant-design/icons';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer
} from 'recharts';

import { getTotalMedicalSend, getTotalHealthCheck, getTotalEvents, getTotalVaccine, getTotalMedicalStatus, getOtherMedicalMonthly, getTotalVaccineStatus, getTotalHealthCheckStatus, getTotalMedicalRecord } from '../../services/DashboardService'
import { Link } from 'react-router-dom';

const NurseDashboard: React.FC = () => {
    const [medicalSendCount, setMedicalSendCount] = useState(0);
    const [healthCheckCount, setHealthCheckCount] = useState(0);
    const [vaccineCount, setVaccineCount] = useState(0);
    const [eventCount, setEventCount] = useState(0);
    const [medicalRecordCount, setMedicalRecordCount] = useState(0);

    type StatusItem = {
        name: string;
        value: number;
        color: string;
    };
    const [medicineStatusData, setMedicineStatusData] = useState<StatusItem[]>([]);
    const [vaccineStatusData, setVaccineStatusData] = useState<StatusItem[]>([]);
    const [healthCheckStatusData, setHealthCheckStatusData] = useState<StatusItem[]>([]);
    const [eventTypeData, setEventTypeData] = useState<{ name: string; value: number }[]>([]);
    console.log('eventTypeData', eventTypeData);
    useEffect(() => {
        async function fetchEventData() {
            try {
                const data = await getOtherMedicalMonthly();
                setEventTypeData(data.count); // Gán dữ liệu vào state
            } catch (error) {
                console.error('Lỗi lấy dữ liệu sự kiện y tế:', error);
            }
        }

        fetchEventData();
    }, []);

    useEffect(() => {
        async function fetchStatus() {
            try {
                const res = await getTotalMedicalStatus(); // 👈 gọi API bạn có sẵn
                const chartData = [
                    { name: 'Đang xử lý', value: res.countPending, color: '#faad14' },
                    { name: 'Đã nhận', value: res.countReceived, color: '#1890ff' },
                    { name: 'Đã cho uống', value: res.countGiven, color: '#52c41a' },
                    { name: 'Đã từ chối', value: res.countRejected, color: '#f5222d' }
                ];
                setMedicineStatusData(chartData);
            } catch (err) {
                console.error('Lỗi load trạng thái đơn thuốc:', err);
            }
        }

        fetchStatus();
    }, []);

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



    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [medicines, healthChecks, vaccines, events, medicalRecords] = await Promise.all([
                    getTotalMedicalSend(),
                    getTotalHealthCheck(),
                    getTotalVaccine(),
                    getTotalEvents(),
                    getTotalMedicalRecord()
                ]);
                console.log('✅ Dashboard data:', {
                    medicines,
                    healthChecks,
                    vaccines,
                    events,
                    medicalRecords
                });

                setMedicalSendCount(medicines.count);
                setHealthCheckCount(healthChecks.count);
                setVaccineCount(vaccines.count);
                setEventCount(events.count);
                setMedicalRecordCount(medicalRecords.count);
            } catch (error) {
                console.error('❌ Lỗi tải dữ liệu dashboard:', error);
            }
        }

        fetchDashboardData();
    }, []);
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard Y Tá</h1>

            {/* 1. Thống kê tổng quan */}
            <Row gutter={16} style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
                <Col flex="1">
                    <Card>
                        <Statistic
                            title="Đơn thuốc gửi đến"
                            value={medicalSendCount}
                            valueStyle={{ color: '#f5222d' }}
                            prefix={<MedicineBoxOutlined />}
                        />
                    </Card>
                </Col>
                <Col flex="1">
                    <Card>
                        <Statistic
                            title="Đợt khám sức khỏe"
                            value={healthCheckCount}
                            valueStyle={{ color: '#52c41a' }}
                            prefix={<HeartOutlined />}
                        />
                    </Card>
                </Col>
                <Col flex="1">
                    <Card>
                        <Statistic
                            title="Đợt tiêm vaccine"
                            value={vaccineCount}
                            valueStyle={{ color: '#1890ff' }}
                            prefix={<ExperimentOutlined />}
                        />
                    </Card>
                </Col>
                <Col flex="1">
                    <Card>
                        <Statistic
                            title="Sự kiện y tế mới"
                            value={eventCount}
                            valueStyle={{ color: '#fa8c16' }}
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>
                <Col flex="1">
                    <Card>
                        <Statistic
                            title="Hồ sơ y tế"
                            value={medicalRecordCount}
                            valueStyle={{ color: '#fa8c16' }}
                            prefix={<AlertOutlined />}
                        />
                    </Card>
                </Col>
            </Row>


            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card title="Trạng thái đơn thuốc" extra={<Button type="link"><Link to="/nurse/medical" style={{ textDecoration: 'none' }}>Chi tiết</Link></Button>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={medicineStatusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {medicineStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Trạng thái đợt tiêm" extra={<Button type="link"><Link to="/nurse/vaccine" style={{ textDecoration: 'none' }}>Chi tiết</Link></Button>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={vaccineStatusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {vaccineStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>

                <Col span={8}>
                    <Card title="Trạng thái khám sức khỏe" extra={<Button type="link"><Link to="/nurse/healthcheck" style={{ textDecoration: 'none' }}>Chi tiết</Link></Button>}>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={healthCheckStatusData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {healthCheckStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                            </PieChart>
                        </ResponsiveContainer>
                    </Card>
                </Col>
            </Row>


            <Card title="Thống kê sự kiện y tế theo tháng" extra={<Button type="link">Chi tiết</Button>}>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={eventTypeData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="value" name="Sự kiện" fill="#1890ff" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>

    );
};

export default NurseDashboard;