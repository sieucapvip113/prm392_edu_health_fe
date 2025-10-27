import React, { useEffect, useState } from 'react';
import {
    Button,
    Modal,
    Card,
    Tag,
    Row,
    Col,
    Typography,
    List,
    Alert,
    Space,
    Divider,
    Empty,
    Skeleton,
    Spin,
    Image
} from 'antd';
import {
    UserOutlined,
    MedicineBoxOutlined,
    ExclamationCircleFilled,
    FileTextOutlined,
    CalendarOutlined,
    InfoCircleOutlined,
    HeartOutlined,
    TeamOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getStudentsByGuardianUserId } from '../../services/AccountService';
import { getHealthCheckFormsByStudent, healthCheckService } from '../../services/Healthcheck';
import { notificationService } from '../../services/NotificationService';
import { User, getUserById } from '../../services/AccountService';


const { Title, Text } = Typography;



const Checkup: React.FC = () => {
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [selectedCheckup, setSelectedCheckup] = useState<any>(null);
    const [checkupModalVisible, setCheckupModalVisible] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [studentForms, setStudentForms] = useState<any[]>([]);
    const [formsLoading, setFormsLoading] = useState(false);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [resultModalVisible, setResultModalVisible] = useState(false);
    const [selectedResult, setSelectedResult] = useState<any>(null);
    const [resultLoading, setResultLoading] = useState(false);
    const [studentInfo, setStudentInfo] = useState<User | null>(null);
    const [nurseInfo, setNurseInfo] = useState<User | null>(null);
    console.log("Student Info:", selectedResult);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const userStr = localStorage.getItem('user');
                const token = localStorage.getItem('accessToken') as string;
                if (!userStr || !token) {
                    setLoading(false);
                    return;
                }
                const userId = JSON.parse(userStr).id;
                const data = await getStudentsByGuardianUserId(userId, token);
                setStudents(data.students || []);
            } catch (error) {
                setStudents([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || '';

        if (selectedResult?.Student_ID) {
            getUserById(selectedResult.Student_ID, token)
                .then((res) => setStudentInfo(res))
                .catch((err) => {
                    console.error('Lỗi khi lấy thông tin học sinh:', err);
                    setStudentInfo(null);
                });
        } else {
            setStudentInfo(null);
        }
    }, [selectedResult?.Student_ID]);

    useEffect(() => {
        const token = localStorage.getItem('accessToken') || '';

        if (selectedResult?.Created_By) {
            getUserById(selectedResult.Created_By, token)
                .then((res) => setNurseInfo(res))
                .catch((err) => {
                    console.error('Lỗi khi lấy thông tin y tá:', err);
                    setNurseInfo(null);
                });
        } else {
            setNurseInfo(null);
        }
    }, [selectedResult?.Created_By]);


    const handleViewDetail = async (student: any) => {
        setSelectedStudent(student);
        setDetailModalVisible(true);
        setFormsLoading(true);
        setStudentForms([]);
        try {
            const res = await getHealthCheckFormsByStudent(student.id);
            setStudentForms(res.data || []);
            setFormsLoading(false);

        } catch (e) {
            setStudentForms([]);
        } finally {
            setFormsLoading(false);
        }
    };

    // const handleCheckupClick = (record: any) => {
    //     setSelectedCheckup(record);
    //     setCheckupModalVisible(true);
    // };

    const userInfo = localStorage.getItem("user");

    const handleViewResult = async (form: any) => {
        // console.log('Fetching health check result for form:', form);
        setResultLoading(true);
        try {
            const result = await healthCheckService.getHealthCheckResult(form.healthCheckId, form.studentId);
            setSelectedResult(result);
            setResultModalVisible(true);
        } catch (error) {
            console.error('Error fetching health check result:', error);
            notificationService.error('Có lỗi xảy ra khi tải kết quả khám');
        } finally {
            setResultLoading(false);
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                            <MedicineBoxOutlined /> Quản lý khám sức khỏe
                        </Title>
                        <Text type="secondary">
                            Theo dõi lịch sử khám sức khỏe của học sinh
                        </Text>
                    </Col>
                </Row>
            </Card>

            <Row className='mt-4' gutter={[16, 16]}>
                {loading ? (
                    <Col span={24}><Text>Đang tải danh sách học sinh...</Text></Col>
                ) : students.length === 0 ? (
                    <Col span={24}><Text type="secondary">Không có học sinh nào.</Text></Col>
                ) : (
                    students.map(student => (
                        <Col xs={24} md={12} lg={8} key={student.id}>
                            <Card
                                title={<Text strong>{student.fullname}</Text>}
                                // extra={<Text type="secondary">Mã học sinh: {student.username}</Text>}
                                actions={[
                                    <Button type="link" onClick={() => handleViewDetail(student)}>
                                        Chi tiết
                                    </Button>
                                ]}
                            >
                                <p><Text type="secondary">Lớp:</Text> {student.className || '-'}</p>
                                <p><Text type="secondary">Ngày sinh:</Text> {student.dateOfBirth ? dayjs(student.dateOfBirth).format('DD/MM/YYYY') : '-'}</p>
                                {/* Có thể bổ sung thêm các trường khác nếu cần */}
                            </Card>
                        </Col>
                    ))
                )}
            </Row>

            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        Chi tiết khám sức khỏe - {selectedStudent?.fullname}
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={900}
            >
                {selectedStudent && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                {/* <Col span={6}>
                                    <Text strong>Mã học sinh:</Text> {selectedStudent.username}
                                </Col> */}
                                <Col span={6}>
                                    <Text strong>Lớp:</Text> {selectedStudent.className || '-'}
                                </Col>
                                <Col span={6}>
                                    <Text strong>Ngày sinh:</Text> {selectedStudent.dateOfBirth ? dayjs(selectedStudent.dateOfBirth).format('DD/MM/YYYY') : '-'}
                                </Col>
                            </Row>
                        </Card>
                        <div style={{ marginBottom: 16 }}>
                            <Title level={5}>Danh sách form khám sức khỏe</Title>
                            {formsLoading ? (
                                <Skeleton active paragraph={{ rows: 3 }} />
                            ) : studentForms.length === 0 ? (
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={<span>Không có form khám sức khỏe nào.</span>}
                                />
                            ) : (
                                <List
                                    itemLayout="vertical"
                                    // Lọc các form có title (tức là chưa bị xoá)
                                    dataSource={[...studentForms]
                                        .filter(form => form.title) // Ẩn form đã xoá (không có title)
                                        .sort((a, b) => new Date(b.dateEvent).getTime() - new Date(a.dateEvent).getTime())
                                    }
                                    renderItem={(form: any) => {
                                        let tagColor = 'default';
                                        let displayStatus = form.status;
                                        // Nếu là 'created' thì hiển thị như 'pending' và cho phép xác nhận
                                        if (form.status === 'created') {
                                            tagColor = 'orange';
                                            displayStatus = 'pending';
                                        } else {
                                            switch (form.status) {
                                                case 'pending': tagColor = 'orange'; break;
                                                case 'approved': tagColor = 'green'; break;
                                                case 'checked': tagColor = 'yellow'; break;
                                                case 'rejected': tagColor = 'red'; break;
                                                default: tagColor = 'default';
                                            }
                                        }
                                        return (
                                            <List.Item key={form.formId} style={{ padding: 0, border: 'none', cursor: 'pointer' }}
                                                onClick={() => {
                                                    if (form.status === 'checked') {
                                                        // Hiển thị kết quả khám thay vì modal xác nhận
                                                        handleViewResult(form);
                                                    } else {
                                                        setSelectedForm(form);
                                                        setConfirmModalVisible(true);
                                                    }
                                                }}
                                            >
                                                <Card
                                                    size="small"
                                                    style={{ marginBottom: 12, borderLeft: `4px solid #1890ff`, boxShadow: '0 2px 8px #f0f1f2' }}
                                                    bodyStyle={{ padding: 16 }}
                                                >
                                                    <Row gutter={[8, 8]} align="middle">
                                                        <Col xs={24} md={16}>
                                                            <Space direction="vertical" size={2}>
                                                                <Space>
                                                                    <FileTextOutlined style={{ color: '#1890ff' }} />
                                                                    <Text strong>{form.title}</Text>
                                                                </Space>
                                                                <Space>
                                                                    <InfoCircleOutlined />
                                                                    <Text type="secondary">{form.description}</Text>
                                                                </Space>
                                                            </Space>
                                                        </Col>
                                                        <Col xs={12} md={4}>
                                                            <Space>
                                                                <Tag color={tagColor} style={{ fontWeight: 500, fontSize: 14, padding: '2px 10px' }}>
                                                                    {displayStatus === 'pending' ? 'Chờ xác nhận' :
                                                                        displayStatus === 'approved' ? 'Đã xác nhận' :
                                                                            displayStatus === 'checked' ? 'Đã có kết quả khám' :
                                                                                displayStatus === 'rejected' ? 'Từ chối' : form.status}
                                                                </Tag>
                                                            </Space>
                                                        </Col>
                                                        <Col xs={12} md={4} style={{ textAlign: 'right' }}>
                                                            <Space direction="vertical" size={0}>
                                                                <Space>
                                                                    <CalendarOutlined />
                                                                    <Text>{form.dateEvent ? dayjs(form.dateEvent).format('DD/MM/YYYY') : '-'}</Text>
                                                                </Space>
                                                                <Text type="secondary" style={{ fontSize: 12 }}>{form.schoolYear}</Text>
                                                                <Tag color="blue" style={{ marginTop: 2 }}>{form.type}</Tag>
                                                            </Space>
                                                        </Col>
                                                    </Row>
                                                </Card>
                                            </List.Item>
                                        );
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <Modal
                title={
                    <Space>
                        <MedicineBoxOutlined />
                        Chi tiết lần khám sức khỏe
                    </Space>
                }
                open={checkupModalVisible}
                onCancel={() => setCheckupModalVisible(false)}
                footer={null}
                width={600}
            >
                {selectedCheckup && (
                    <div>
                        <Row gutter={[0, 16]}>
                            <Col span={24}>
                                <Card
                                    size="small"
                                    title={
                                        <Space>
                                            <Text strong>{selectedCheckup.checkupType}</Text>
                                            <Tag color="blue">{selectedCheckup.status}</Tag>
                                        </Space>
                                    }
                                >
                                    <Row gutter={[16, 8]}>
                                        <Col span={12}>
                                            <Text type="secondary">Trạng thái:</Text>
                                            <br />
                                            <Tag color={
                                                selectedCheckup.status === 'Đã khám' ? 'success' :
                                                    selectedCheckup.status === 'Chờ xác nhận' ? 'warning' : 'default'
                                            }>
                                                {selectedCheckup.status}
                                            </Tag>
                                        </Col>
                                        <Col span={12}>
                                            <Text type="secondary">Ngày khám:</Text>
                                            <br />
                                            <Text>{selectedCheckup.checkupDate ?
                                                dayjs(selectedCheckup.checkupDate).format('DD/MM/YYYY') :
                                                'Chưa có'}</Text>
                                        </Col>
                                        {selectedCheckup.status === 'Đã khám' && (
                                            <>
                                                <Col span={24}>
                                                    <Divider style={{ margin: '12px 0' }} />
                                                    <Text type="secondary">Ghi chú:</Text>
                                                    <br />
                                                    <Text>{selectedCheckup.notes || 'Không có ghi chú'}</Text>
                                                </Col>
                                                {selectedCheckup.location && (
                                                    <Col span={24}>
                                                        <Text type="secondary">Địa điểm khám:</Text>
                                                        <br />
                                                        <Text>{selectedCheckup.location}</Text>
                                                    </Col>
                                                )}
                                            </>
                                        )}
                                    </Row>
                                </Card>
                            </Col>

                            {selectedCheckup.status === 'Chờ xác nhận' && (
                                <Col span={24}>
                                    <Alert
                                        message="Xác nhận khám sức khỏe"
                                        description="Vui lòng xem xét thông tin và xác nhận lần khám này."
                                        type="warning"
                                        showIcon
                                        icon={<ExclamationCircleFilled />}
                                    />
                                </Col>
                            )}
                        </Row>
                    </div>
                )}
            </Modal>

            <Modal
                title={<Space><FileTextOutlined /> Xác nhận khám sức khỏe</Space>}
                open={confirmModalVisible}
                onCancel={() => setConfirmModalVisible(false)}
                footer={null}
                width={500}
            >
                {selectedForm && (
                    <div>
                        <Row gutter={[8, 8]}>
                            <Col span={24}><Text strong>Tiêu đề:</Text> {selectedForm.title}</Col>
                            <Col span={24}><Text strong>Ngày khám:</Text> {selectedForm.dateEvent ? dayjs(selectedForm.dateEvent).format('DD/MM/YYYY') : '-'}</Col>
                            <Col span={24}><Text strong>Mô tả:</Text> {selectedForm.description}</Col>
                            <Col span={24}><Text strong>Trạng thái hiện tại:</Text> <Tag color={
                                selectedForm.status === 'created' || selectedForm.status === 'pending' ? 'orange' :
                                    selectedForm.status === 'approved' ? 'green' :
                                        selectedForm.status === 'checked' ? 'yellow' :
                                            selectedForm.status === 'rejected' ? 'red' : 'default'
                            }>
                                {(selectedForm.status === 'created' || selectedForm.status === 'pending') ? 'Chờ xác nhận' :
                                    selectedForm.status === 'approved' ? 'Đã xác nhận' :
                                        selectedForm.status === 'checked' ? 'Đã có kết quả khám' :
                                            selectedForm.status === 'rejected' ? 'Từ chối' : selectedForm.status}
                            </Tag></Col>
                        </Row>
                        <Divider />
                        <Space style={{ width: '100%', justifyContent: 'center' }}>
                            {(selectedForm.status === 'pending' || selectedForm.status === 'created') && (
                                <>
                                    <Button
                                        type="primary"
                                        loading={confirmLoading}
                                        onClick={async () => {
                                            setConfirmLoading(true);
                                            try {
                                                await healthCheckService.confirmHealthCheckForm(selectedForm.formId, 'approve');
                                                setConfirmModalVisible(false);
                                                // reload lại danh sách form
                                                if (selectedStudent) {
                                                    setFormsLoading(true);
                                                    const res = await getHealthCheckFormsByStudent(selectedStudent.id);
                                                    setStudentForms(res.data || []);
                                                    setFormsLoading(false);
                                                }
                                                setConfirmLoading(false);
                                            } catch (e) {
                                                setConfirmLoading(false);
                                            }
                                        }}
                                    >Đồng ý khám</Button>
                                    <Button
                                        danger
                                        loading={confirmLoading}
                                        onClick={async () => {
                                            setConfirmLoading(true);
                                            try {
                                                await healthCheckService.confirmHealthCheckForm(selectedForm.formId, 'reject');
                                                setConfirmModalVisible(false);
                                                // reload lại danh sách form
                                                if (selectedStudent) {
                                                    setFormsLoading(true);
                                                    const res = await getHealthCheckFormsByStudent(selectedStudent.id);
                                                    setStudentForms(res.data || []);
                                                    setFormsLoading(false);
                                                }
                                                setConfirmLoading(false);
                                            } catch (e) {
                                                setConfirmLoading(false);
                                            }
                                        }}
                                    >Từ chối khám</Button>
                                </>
                            )}
                        </Space>
                    </div>
                )}
            </Modal>

            <Modal
                title={
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <FileTextOutlined className="text-blue-500" />
                        Kết quả khám sức khỏe
                    </div>
                }
                open={resultModalVisible}
                onCancel={() => setResultModalVisible(false)}
                footer={null}
                width={700}
                className="health-check-modal"
            >
                {resultLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Spin size="large" />
                        <div className="mt-4 text-gray-600">Đang tải kết quả khám...</div>
                    </div>
                ) : selectedResult ? (
                    <div className="space-y-6">
                        {/* Thông tin học sinh */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <UserOutlined /> Thông tin học sinh
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-600 block">Họ tên học sinh</span>
                                    <span className="font-medium">{studentInfo?.fullname || '---'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 block">Ngày sinh</span>
                                    <span className="font-medium">{studentInfo?.dateOfBirth || '---'}</span>

                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 block">Giới tính</span>
                                    <span className="font-medium">{studentInfo?.gender || '---'}</span>

                                </div>
                            </div>
                        </div>

                        {/* Thông tin phụ huynh */}
                        <div className="bg-green-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                                <TeamOutlined /> Thông tin phụ huynh
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-600 block">Họ tên phụ huynh</span>
                                    <span className="font-medium">{userInfo ? JSON.parse(userInfo).username : '---'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 block">Số điện thoại</span>
                                    <span className="font-medium">{userInfo ? JSON.parse(userInfo).phone : '---'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 block">Email phụ huynh</span>
                                    <span className="font-medium">{userInfo ? JSON.parse(userInfo).email : '---'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin y tá */}
                        <div className="bg-purple-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                                <MedicineBoxOutlined /> Y tá phụ trách
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="text-sm text-gray-600 block">Họ tên y tá</span>
                                    <span className="font-medium">{nurseInfo?.fullname || 'Chưa cập nhật'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 block">Số điện thoại y tá</span>
                                    <span className="font-medium">{nurseInfo?.phoneNumber || 'Chưa cập nhật'}</span>
                                </div>
                                <div>
                                    <span className="text-sm text-gray-600 block">Email y tá</span>
                                    <span className="font-medium">{nurseInfo?.email || 'Chưa cập nhật'}</span>
                                </div>




                            </div>
                        </div>

                        {/* Kết quả khám */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <HeartOutlined /> Kết quả khám sức khỏe
                            </h3>

                            {/* Chỉ số cơ bản */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-white rounded-lg p-3 text-center border">
                                    <div className="text-2xl font-bold text-blue-600">{selectedResult.Height}</div>
                                    <div className="text-sm text-gray-600">Chiều cao (cm)</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 text-center border">
                                    <div className="text-2xl font-bold text-green-600">{selectedResult.Weight}</div>
                                    <div className="text-sm text-gray-600">Cân nặng (kg)</div>
                                </div>
                                <div className="bg-white rounded-lg p-3 text-center border">
                                    <div className="text-lg font-bold text-red-600">{selectedResult.Blood_Pressure}</div>
                                    <div className="text-sm text-gray-600">Huyết áp</div>
                                </div>
                            </div>

                            {/* Các chỉ số khác */}
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-3 border">
                                        <span className="text-sm text-gray-600 block">Thị lực mắt trái</span>
                                        <span className="font-semibold text-lg">{selectedResult.Vision_Left}/10</span>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border">
                                        <span className="text-sm text-gray-600 block">Thị lực mắt phải</span>
                                        <span className="font-semibold text-lg">{selectedResult.Vision_Right}/10</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white rounded-lg p-3 border">
                                        <span className="text-sm text-gray-600 block">Tình trạng răng</span>
                                        <span className="font-medium">{selectedResult.Dental_Status}</span>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border">
                                        <span className="text-sm text-gray-600 block">Tai mũi họng</span>
                                        <span className="font-medium">{selectedResult.ENT_Status}</span>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-3 border">
                                    <span className="text-sm text-gray-600 block">Tình trạng da</span>
                                    <span className="font-medium">{selectedResult.Skin_Status}</span>
                                </div>
                                <div className="bg-white rounded-lg p-3 border">
                                    <span className="text-sm text-gray-600 block mb-2">Hình ảnh kết quả khám</span>

                                    {selectedResult.image ? (
                                        <div className="flex justify-center">
                                            <Image
                                                src={selectedResult.image}
                                                alt="Kết quả khám"
                                                className="rounded-lg border object-cover"
                                                style={{ maxHeight: '240px', objectFit: 'cover' }}
                                                width={240}
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-sm text-red-500">Không có hình ảnh</span>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Kết luận */}
                        <div className="bg-amber-50 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
                                <FileTextOutlined /> Kết luận
                            </h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm text-gray-600 block">Kết luận chung</span>
                                    <div className="font-medium bg-white rounded p-3 mt-1">
                                        {selectedResult.General_Conclusion}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Cần gặp phụ huynh:</span>
                                    <Tag
                                        color={selectedResult.Is_need_meet ? 'red' : 'green'}
                                        className="text-sm font-medium"
                                    >
                                        {selectedResult.Is_need_meet ? 'Có' : 'Không'}
                                    </Tag>
                                </div>
                            </div>
                        </div>

                        {/* Thông tin ngày khám */}
                        <div className="text-center text-gray-500 text-sm border-t pt-4">
                            <CalendarOutlined className="mr-2" />
                            Ngày khám: {selectedResult.createdAt
                                ? dayjs(selectedResult.createdAt).format('DD/MM/YYYY HH:mm')
                                : '---'}
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">
                            <FileTextOutlined />
                        </div>
                        <span className="text-gray-500">Không tìm thấy kết quả khám</span>
                    </div>
                )}
            </Modal>

        </div>
    );
};

export default Checkup;