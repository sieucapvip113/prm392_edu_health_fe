import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout,
    Card,
    Button,
    Avatar,
    Row,
    Col,
    Statistic,
    Badge,
    List,
    Tag,
    Space,
    Typography,

    Timeline,
    Table,
    Modal,
    Divider
} from 'antd';
import {
    UserOutlined,
    BellOutlined,


    MedicineBoxOutlined,

} from '@ant-design/icons';
import { notificationService } from '../../services/NotificationService';
import { getStudentsByGuardianUserId, Student } from '../../services/AccountService';
import { getHealthCheckFormsByStudent } from '../../services/Healthcheck';
import { vaccineService, GuardianVaccineResponse } from '../../services/Vaccineservice';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;




interface Notification {
    notiId: number;
    title: string;
    mess: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    userId: number;
}

const Parent: React.FC = () => {
    const [children, setChildren] = useState<Student[]>([]);
    const [selectedChild, setSelectedChild] = useState<number>(1);
    const [modalVisible, setModalVisible] = useState(false);
    const [noti, setNoti] = useState<Notification[]>([]);
    const [healthRecords, setHealthRecords] = useState<any[]>([]);
    const [vaccineHistories, setVaccineHistories] = useState<GuardianVaccineResponse>();

    const navigate = useNavigate();


    console.log('vaccineHistories:', vaccineHistories);


    const currentChild = children.find(child => child.id === selectedChild) || children[0];

    console.log('Current Child:', currentChild);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const userStr = localStorage.getItem('user');
                const token = localStorage.getItem('accessToken') as string;

                if (!userStr || !token) return;

                const userId = JSON.parse(userStr).id;


                const data = await getStudentsByGuardianUserId(userId, token);
                setChildren(data.students);
            } catch (err) {
                console.error('Lỗi khi lấy danh sách học sinh:', err);
            }
        };

        fetchChildren();
    }, []);


    useEffect(() => {
        const fetchHealthRecords = async () => {
            if (!currentChild?.id) return;

            try {
                const res = await getHealthCheckFormsByStudent(currentChild.id);
                if (res.success) {
                    setHealthRecords(res?.data || []);
                }
            } catch (err) {
                console.error('Lỗi lấy lịch sử khám:', err);
            }
        };

        fetchHealthRecords();
    }, [currentChild]);

    const handleViewHealthRecord = () => {
        setModalVisible(true);
    };

    useEffect(() => {
        const fetchVaccines = async () => {
            const data = await vaccineService.getVaccinesByGuardian();
            console.log('Fetched vaccine histories:', data);
            setVaccineHistories(data);
        };
        fetchVaccines();
    }, []);





    const healthRecordColumns = [
        {
            title: 'Ngày khám',
            dataIndex: 'dateEvent',
            key: 'date',
        },
        {
            title: 'Tên đợt khám',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Loại khám',
            dataIndex: 'type',
            key: 'type',
        },

        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',

        },

    ];

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await notificationService.getNotificationsForCurrentUser();
                if (response && response.notifications) {
                    setNoti(response.notifications);
                }
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
                setNoti([]);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div style={{ padding: '24px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <Content>
                {/* Header với thông tin phụ huynh */}
                <Card style={{ marginBottom: '24px' }}>
                    <Row align="middle" justify="space-between">
                        <Col>
                            <Space size="large">
                                <Avatar size={64} icon={<UserOutlined />} />
                                <div>
                                    <Title level={3} style={{ margin: 0 }}>Chào mừng, Phụ huynh!</Title>
                                    <Text type="secondary">Theo dõi sức khỏe con em một cách toàn diện</Text>
                                </div>
                            </Space>
                        </Col>

                    </Row>
                </Card>

                {/* Chọn con */}
                <Card title="Chọn con em" style={{ marginBottom: '24px' }}>
                    <Row gutter={16}>
                        {children.map(child => (
                            <Col key={child.id} xs={12} sm={8} md={6}>
                                <Card
                                    hoverable
                                    onClick={() => setSelectedChild(child.id)}
                                    style={{
                                        border: selectedChild === child.id ? '2px solid #1677ff' : '1px solid #d9d9d9'
                                    }}
                                >
                                    <div style={{ textAlign: 'center' }}>
                                        <Avatar size={48} icon={<UserOutlined />} />
                                        <div style={{ marginTop: '8px' }}>
                                            <Text strong>{child.fullname}</Text>
                                            <br />
                                            <Text type="secondary">{child.className}</Text>
                                            <br />

                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>

                <Row gutter={24}>
                    {/* Cột trái - Thông tin tổng quan */}
                    <Col xs={24} lg={16}>
                        {/* Tình trạng sức khỏe tổng quan */}
                        <Card title={`Tiêm chủng - ${currentChild?.fullname}`} style={{ marginBottom: '24px' }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Statistic title="Tổng số mũi đã tiêm" value={vaccineHistories?.totalVaccine} />
                                </Col>
                                <Col span={12}>
                                    <Statistic title="Chờ xác nhận" value={vaccineHistories?.totalNeedConfirm} suffix="mũi" valueStyle={{ color: '#faad14' }} />
                                </Col>


                            </Row>

                            <Divider />

                            <List
                                header={<Text strong>Các mũi tiêm gần đây</Text>}
                                dataSource={vaccineHistories?.histories?.[0]?.vaccineHistory || []}
                                locale={{ emptyText: 'Chưa có dữ liệu tiêm chủng' }}
                                renderItem={(item) => (
                                    <List.Item>
                                        <List.Item.Meta
                                            title={
                                                <Text>
                                                    💉 {item.Vaccine_name} <Tag color={item.Status === 'Chờ xác nhận' ? 'orange' : 'green'}>{item.Status}</Tag>
                                                </Text>
                                            }
                                            description={
                                                <>
                                                    <div>Loại vaccine: {item.Vaccince_type}</div>
                                                    <div>Ngày tiêm: {new Date(item.Date_injection).toLocaleDateString('vi-VN')}</div>
                                                    {item.note_affter_injection && <div>Ghi chú: {item.note_affter_injection}</div>}
                                                </>
                                            }
                                        />
                                    </List.Item>

                                )}
                            />
                            <Button type="link" onClick={() => navigate(`/guardian/vaccines`)}>
                                Xem tất cả đợt tiêm →
                            </Button>
                        </Card>


                        {/* Lịch sử khám gần đây */}
                        <Card title="Lịch sử khám gần đây" style={{ marginBottom: '24px' }}>
                            <Timeline>
                                {healthRecords.slice(0, 3).map((record) => (
                                    <Timeline.Item
                                        key={record.formId}
                                        color={
                                            record.status === 'normal'
                                                ? 'green'
                                                : record.status === 'follow-up'
                                                    ? 'orange'
                                                    : 'red'
                                        }
                                        dot={<MedicineBoxOutlined />}
                                    >
                                        <div>
                                            <Text strong>{record.title}</Text>
                                            <br />
                                            <Text>{record.description}</Text>
                                            <br />
                                            <Text type="secondary">
                                                Ngày khám: {new Date(record.dateEvent).toLocaleDateString('vi-VN')}
                                            </Text>
                                        </div>
                                    </Timeline.Item>
                                ))}
                            </Timeline>
                            <Button type="link" onClick={handleViewHealthRecord}>
                                Xem tất cả đợt khám →
                            </Button>
                        </Card>


                    </Col>

                    {/* Cột phải - Thông báo và tiện ích */}
                    <Col xs={24} lg={8}>
                        {/* Thông báo */}
                        <Card title="Thông báo mới" style={{ marginBottom: '24px' }}>
                            <List
                                dataSource={noti}
                                renderItem={(item) => (
                                    <List.Item
                                        onClick={() => {
                                            setNoti((prev) =>
                                                prev.map((n) =>
                                                    n.notiId === item.notiId ? { ...n, isRead: true } : n
                                                )
                                            );
                                        }}
                                        style={{
                                            backgroundColor: !item.isRead ? '#f6ffed' : 'transparent',
                                            padding: '12px',
                                            borderRadius: '6px',
                                            marginBottom: '8px'
                                        }}>
                                        <List.Item.Meta
                                            avatar={
                                                <Badge dot={!item.isRead}>
                                                    <Avatar icon={<BellOutlined />} style={{ backgroundColor: '#1677ff' }} />
                                                </Badge>
                                            }
                                            title={<Text strong={!item.isRead}>{item.title}</Text>}
                                            description={
                                                <div>
                                                    <Paragraph ellipsis={{ rows: 2 }}>{item.mess}</Paragraph>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        {new Date(item.createdAt).toLocaleString()}
                                                    </Text>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Card>


                    </Col>
                </Row>

                {/* Modal xem hồ sơ sức khỏe */}
                <Modal
                    title={`Hồ sơ sức khỏe - ${currentChild?.fullname}`}
                    open={modalVisible}
                    onCancel={() => setModalVisible(false)}
                    footer={null}
                    width={800}
                >
                    <Table
                        dataSource={healthRecords}
                        columns={healthRecordColumns}
                        rowKey="id"
                        pagination={{ pageSize: 5 }}
                    />
                </Modal>
            </Content>
        </div>
    );
};

export default Parent;