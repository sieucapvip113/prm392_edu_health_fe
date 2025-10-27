import React, { useState, useEffect } from 'react';
import {
    Button,
    Modal,
    Space,
    Card,
    Tag,
    Row,
    Col,
    Typography,
    message,
    List,
    Avatar,
    Badge,
    Image
} from 'antd';
import {
    UserOutlined,
    MedicineBoxOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,

    ExclamationCircleOutlined,
    ExclamationCircleFilled
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { vaccineService } from '../../services/Vaccineservice';
import { useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;




interface VaccineRecord {
    vaccineId: string;
    isVaccinated: boolean;
    status: string;
    vaccineName: string;
    vaccineType: string;
    vaccinatedDate?: string;
    location?: string;
    notes?: string;
    batchNumber?: string;
    image_after_injection?: string | null;
}

interface Student {
    id: string;
    name: string;
    dateOfBirth: Date;
    class: string;
    studentCode: string;
    vaccineRecords: VaccineRecord[];
    totalVaccinated: number;
    totalNeedConfirm: number;
}

const Vaccine: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedVaccine, setSelectedVaccine] = useState<VaccineRecord | null>(null);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);

    const fetchVaccineData = async () => {
        let intervalId: ReturnType<typeof setInterval>;
        try {

            const response = await vaccineService.getVaccinesByGuardian();

            const transformedStudents: Student[] = response.histories.map(history => ({
                id: history.medicalRecord.ID.toString(),
                name: history.user.fullname,
                dateOfBirth: history.user.dateOfBirth,
                class: history.medicalRecord.Class,
                studentCode: history.medicalRecord.ID.toString(),
                totalVaccinated: history.vaccineHistory.filter(v => v.Status === 'Đã tiêm').length,
                totalNeedConfirm: history.vaccineHistory.filter(v => v.Status === 'Chờ xác nhận').length,
                vaccineRecords: history.vaccineHistory.map(vh => ({
                    vaccineId: vh.VH_ID.toString(),
                    isVaccinated: vh.Status === 'Đã tiêm',
                    status: vh.Status || 'Chưa tiêm',
                    vaccineName: vh.Vaccine_name || '',
                    vaccineType: vh.Vaccince_type || '',
                    vaccinatedDate: vh.Date_injection,
                    location: '',
                    notes: vh.note_affter_injection || '',
                    batchNumber: vh.batch_number,
                    image_after_injection: vh.image_after_injection,
                }))
            }));

            setStudents(transformedStudents);

            if (selectedStudent) {
                const updatedSelectedStudent = transformedStudents.find(s => s.id === selectedStudent.id);
                if (updatedSelectedStudent) {
                    setSelectedStudent(updatedSelectedStudent);
                }
            }
        } catch (error) {
            message.error('Failed to fetch vaccine data');
            console.error(error);
        }

        intervalId = setInterval(fetchVaccineData, 5000);

        return () => {
            clearInterval(intervalId);
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const shouldOpenModal = searchParams.get('openModal') === 'true';
                const studentNameParam = searchParams.get('studentName');

                const response = await vaccineService.getVaccinesByGuardian();
                const transformedStudents = response.histories.map(history => ({
                    id: history.medicalRecord.ID.toString(),
                    name: history.user.fullname,
                    dateOfBirth: history.user.dateOfBirth,
                    class: history.medicalRecord.Class,
                    studentCode: history.medicalRecord.ID.toString(),
                    totalVaccinated: history.vaccineHistory.filter(v => v.Status === 'Đã tiêm').length,
                    totalNeedConfirm: history.vaccineHistory.filter(v => v.Status === 'Chờ xác nhận').length,
                    vaccineRecords: history.vaccineHistory.map(vh => ({
                        vaccineId: vh.VH_ID.toString(),
                        isVaccinated: vh.Status === 'Đã tiêm',
                        status: vh.Status || 'Chưa tiêm',
                        vaccineName: vh.Vaccine_name || '',
                        vaccineType: vh.Vaccince_type || '',
                        vaccinatedDate: vh.Date_injection,
                        location: '',
                        notes: vh.note_affter_injection || '',
                        batchNumber: vh.batch_number,
                        image_after_injection: vh.image_after_injection,
                    }))
                }));

                setStudents(transformedStudents);

                if (shouldOpenModal && transformedStudents.length > 0) {
                    let studentToOpen = transformedStudents[0];
                    if (studentNameParam) {
                        const decodedName = decodeURIComponent(studentNameParam).toLowerCase();
                        const found = transformedStudents.find(s => s.name.toLowerCase() === decodedName);
                        if (found) studentToOpen = found;
                    }
                    setSelectedStudent(studentToOpen);
                    setTimeout(() => {
                        setDetailModalVisible(true);
                        const params = new URLSearchParams(searchParams);
                        params.delete('openModal');
                        params.delete('studentName');
                        window.history.replaceState(
                            {},
                            '',
                            `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`
                        );
                    }, 100);
                }
            } catch (error) {
                message.error('Failed to fetch vaccine data');
                console.error(error);
            }
        };

        fetchData();
    }, [searchParams]);

    const handleViewDetail = (student: Student) => {
        setSelectedStudent(student);
        setDetailModalVisible(true);

    };


    const handleVaccineClick = (record: VaccineRecord) => {
        setSelectedVaccine(record);
        setConfirmModalVisible(true);
    };

    const handleConfirmVaccine = async (approved: boolean) => {
        if (!selectedVaccine) return;

        setLoading(true);
        try {
            await vaccineService.confirmVaccine(selectedVaccine.vaccineId, approved);

            await fetchVaccineData();
            message.success(`Đã ${approved ? 'cho phép' : 'từ chối'} tiêm vaccine`);
            setConfirmModalVisible(false);
        } catch (error: any) {
            if (error.message !== "Validation error") {
                message.error('Có lỗi xảy ra khi xác nhận vaccine');
                console.error('Error confirming vaccine:', error);
            } else {
                await fetchVaccineData();
                setConfirmModalVisible(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Đã tiêm': return 'success';
            case 'Cho phép tiêm': return '#faad14';
            case 'Không tiêm': return '#ff4d4f';
            case 'Chờ xác nhận': return '#fa8c16';
            default: return '#d9d9d9';
        }
    };

    const getTagColor = (status: string) => {
        switch (status) {
            case 'Đã tiêm': return 'success';
            case 'Cho phép tiêm': return 'warning';
            case 'Không tiêm': return 'error';
            case 'Chờ xác nhận': return 'processing';
            default: return 'default';
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Card>
                <Row justify="space-between" align="middle">
                    <Col>
                        <Title level={2} style={{ margin: 0, color: '#52c41a' }}>
                            <MedicineBoxOutlined /> Quản lý tiêm chủng
                        </Title>
                        <Text type="secondary">
                            Theo dõi tình hình tiêm vaccine của học sinh
                        </Text>
                    </Col>
                </Row>
            </Card>

            <Row className='mt-4' gutter={[16, 16]}>
                {students.map(student => {
                    return (
                        <Col xs={24} md={12} lg={8} key={student.id}>
                            <Card
                                title={<Text strong>{student.name}</Text>}
                                extra={<Text type="secondary">Mã sổ sức khỏe: {student.studentCode}</Text>}
                                actions={[
                                    <Button type="link" onClick={() => handleViewDetail(student)}>
                                        Chi tiết
                                    </Button>
                                ]}
                            >
                                <p><Text type="secondary">Lớp:</Text> {student.class}</p>
                                <p><Text type="secondary">Ngày sinh:</Text> {dayjs(student.dateOfBirth).format('DD/MM/YYYY')}</p>
                                <p><Text type="secondary">Tổng vaccine đã tiêm:</Text> {student.totalVaccinated}</p>
                                <p><Text type="secondary">Vaccine đang chờ xác nhận:</Text> {student.totalNeedConfirm}</p>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            <Modal
                title={
                    <Space>
                        <UserOutlined />
                        Chi tiết tiêm chủng - {selectedStudent?.name}
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => {
                    setDetailModalVisible(false);
                }}
                footer={null}
                width={900}
            >
                {selectedStudent && (
                    <div>
                        <Card size="small" style={{ marginBottom: 16 }}>
                            <Row gutter={16}>
                                <Col span={6}>
                                    <Text strong>Mã sổ sức khỏe:</Text> {selectedStudent.studentCode}
                                </Col>
                                <Col span={6}>
                                    <Text strong>Lớp:</Text> {selectedStudent.class}
                                </Col>
                                <Col span={6}>
                                    <Text strong>Ngày sinh:</Text> {dayjs(selectedStudent.dateOfBirth).format('DD/MM/YYYY')}
                                </Col>
                                <Col span={6}>
                                    <Text strong>Số vaccine đã tiêm:</Text> {selectedStudent.totalVaccinated}
                                </Col>
                            </Row>
                        </Card>
                        <List
                            itemLayout="horizontal"
                            dataSource={selectedStudent.vaccineRecords}
                            pagination={{
                                pageSize: 5,
                                showSizeChanger: false
                            }}
                            renderItem={(vaccineRecord) => {
                                const getBackgroundColor = () => {
                                    switch (vaccineRecord.status) {
                                        case 'Đã tiêm': return '#f6ffed';
                                        case 'Chờ xác nhận': return '#fff2e8';
                                        case 'Cho phép tiêm': return '#fffbe6';
                                        case 'Không tiêm': return '#fff1f0';
                                        default: return '#fafafa';
                                    }
                                };

                                const getBorderColor = () => {
                                    switch (vaccineRecord.status) {
                                        case 'Đã tiêm': return '#b7eb8f';
                                        case 'Chờ xác nhận': return '#ffbb96';
                                        case 'Cho phép tiêm': return '#ffd591';
                                        case 'Không tiêm': return '#ffa39e';
                                        default: return '#d9d9d9';
                                    }
                                };
                                return (
                                    <List.Item
                                        style={{
                                            backgroundColor: getBackgroundColor(),
                                            marginBottom: 8,
                                            padding: 16,
                                            borderRadius: 8,
                                            border: `1px solid ${getBorderColor()}`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleVaccineClick(vaccineRecord)}
                                    >
                                        <List.Item.Meta
                                            avatar={
                                                <Badge
                                                    count={
                                                        vaccineRecord.status === 'Đã tiêm' ?
                                                            <CheckCircleOutlined style={{ color: '#52c41a' }} /> :
                                                            vaccineRecord.status === 'Chờ xác nhận' || vaccineRecord.status === 'Cho phép tiêm' ?
                                                                <ExclamationCircleOutlined style={{ color: '#fa8c16' }} /> :
                                                                <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                                                    }
                                                >
                                                    <Avatar
                                                        style={{
                                                            backgroundColor:
                                                                vaccineRecord.status === 'Đã tiêm'
                                                                    ? '#f6ffed'
                                                                    : vaccineRecord.status === 'Không tiêm'
                                                                        ? '#fff1f0'
                                                                        : vaccineRecord.status === 'Chờ xác nhận' || vaccineRecord.status === 'Cho phép tiêm'
                                                                            ? '#fffbe6'
                                                                            : '#d9d9d9',
                                                            border: vaccineRecord.status === 'Đã tiêm'
                                                                ? '1.5px solid #52c41a'
                                                                : vaccineRecord.status === 'Không tiêm'
                                                                    ? '1.5px solid #ff4d4f'
                                                                    : undefined
                                                        }}
                                                    >
                                                        <MedicineBoxOutlined
                                                            style={{
                                                                color:
                                                                    vaccineRecord.status === 'Đã tiêm'
                                                                        ? '#52c41a'
                                                                        : vaccineRecord.status === 'Không tiêm'
                                                                            ? '#ff4d4f'
                                                                            : '#faad14',
                                                                fontSize: 20
                                                            }}
                                                        />
                                                    </Avatar>
                                                </Badge>
                                            }
                                            title={
                                                <Space align="center">
                                                    <Text strong style={{
                                                        color: getStatusColor(vaccineRecord.status)
                                                    }}>
                                                        {vaccineRecord.vaccineName}
                                                    </Text>
                                                    <Tag color={getTagColor(vaccineRecord.status)}>
                                                        {vaccineRecord.status}
                                                    </Tag>
                                                </Space>
                                            }
                                            description={
                                                <div>
                                                    <Tag color="blue" style={{ marginBottom: 8 }}>{vaccineRecord.vaccineType}</Tag>
                                                    {vaccineRecord.vaccinatedDate && (
                                                        <div>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                Ngày tiêm: {dayjs(vaccineRecord.vaccinatedDate).format('DD/MM/YYYY')}
                                                            </Text>
                                                        </div>
                                                    )}
                                                    {/* {(vaccineRecord.status === 'Đã tiêm' || vaccineRecord.status === 'Không tiêm') && (
                                                        <div style={{ marginTop: 4 }}>
                                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                                Ghi chú: {vaccineRecord.notes || 'Không có ghi chú'}
                                                            </Text>
                                                        </div>
                                                    )} */}
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                );
                            }}
                        />
                    </div>
                )}
            </Modal>

            <Modal
                title={
                    <Space>
                        <MedicineBoxOutlined />
                        {selectedVaccine?.status === 'Chờ xác nhận' ? 'Xác nhận tiêm vaccine' : 'Chi tiết vaccine'}
                    </Space>
                }
                open={confirmModalVisible}
                onCancel={() => setConfirmModalVisible(false)}
                footer={
                    selectedVaccine?.status === 'Chờ xác nhận' ? (
                        <Space>
                            <Button
                                onClick={() => handleConfirmVaccine(false)}
                                danger
                                loading={loading}
                            >
                                Không tiêm
                            </Button>
                            <Button
                                type="primary"
                                onClick={() => handleConfirmVaccine(true)}
                                loading={loading}
                            >
                                Cho phép tiêm
                            </Button>
                        </Space>
                    ) : null
                }
                width={600}
            >
                {selectedVaccine && selectedStudent && (
                    <div >
                        <Row gutter={[0, 24]}>
                            <Col span={24}>
                                <Card
                                    style={{
                                        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                                        borderRadius: 12,
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                        overflow: 'hidden'
                                    }}
                                    bodyStyle={{ padding: 0 }}
                                >
                                    <div style={{
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                        padding: '20px 24px',
                                        color: 'white'
                                    }}>
                                        <Row gutter={20} align="middle">
                                            <Col>
                                                <div style={{
                                                    background: 'rgba(255,255,255,0.15)',
                                                    borderRadius: '50%',
                                                    padding: 12,
                                                    backdropFilter: 'blur(10px)'
                                                }}>
                                                    <Avatar
                                                        style={{
                                                            background: "rgba(255,255,255,0.9)",
                                                            color: "#3b82f6"
                                                        }}
                                                        size={44}
                                                        icon={<UserOutlined style={{ fontSize: 20 }} />}
                                                    />
                                                </div>
                                            </Col>
                                            <Col flex={1}>
                                                <Text strong style={{ fontSize: 20, color: "white", display: 'block', marginBottom: 6 }}>
                                                    {selectedStudent.name}
                                                </Text>
                                                <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>
                                                    Lớp {selectedStudent.class} • Ngày sinh {dayjs(selectedStudent.dateOfBirth).format('DD/MM/YYYY')} • Mã sổ sức khỏe {selectedStudent.studentCode}
                                                </Text>
                                            </Col>
                                        </Row>
                                    </div>
                                </Card>
                            </Col>

                            <Col span={24}>
                                <Card
                                    style={{
                                        borderRadius: 12,
                                        border: "1px solid #e2e8f0",
                                        boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                                        background: 'white'
                                    }}
                                    bodyStyle={{ padding: 24 }}
                                >
                                    <div style={{ marginBottom: 24 }}>
                                        <Row gutter={16} align="middle">
                                            <Col>
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    borderRadius: 10,
                                                    padding: 12,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                                }}>
                                                    <MedicineBoxOutlined style={{ color: "white", fontSize: 22 }} />
                                                </div>
                                            </Col>
                                            <Col flex={1}>
                                                <Text strong style={{ fontSize: 18, color: "#1e293b", display: 'block', marginBottom: 4 }}>
                                                    {selectedVaccine.vaccineName}
                                                </Text>
                                                <Tag
                                                    style={{
                                                        fontSize: 12,
                                                        padding: '4px 12px',
                                                        borderRadius: 16,
                                                        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                                                        color: '#1e40af',
                                                        border: 'none'
                                                    }}
                                                >
                                                    {selectedVaccine.vaccineType}
                                                </Tag>
                                                {selectedVaccine.batchNumber && (
                                                    <Tag
                                                        style={{
                                                            fontSize: 12,
                                                            padding: '4px 12px',
                                                            borderRadius: 16,
                                                            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                                                            color: '#3730a3',
                                                            border: 'none'
                                                        }}
                                                    >
                                                        Số lô: {selectedVaccine.batchNumber}
                                                    </Tag>
                                                )}
                                            </Col>
                                        </Row>
                                    </div>

                                    <Row gutter={[20, 20]}>
                                        <Col xs={24} sm={12}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                                borderRadius: 10,
                                                padding: 18,
                                                border: '1px solid #bbf7d0',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: -10,
                                                    right: -10,
                                                    width: 40,
                                                    height: 40,
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    borderRadius: '50%'
                                                }} />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative' }}>
                                                    <Text strong style={{ color: '#15803d', fontSize: 14 }}>Trạng thái</Text>
                                                </div>
                                                <Tag
                                                    style={{
                                                        fontSize: 13,
                                                        padding: "6px 14px",
                                                        borderRadius: 20,
                                                        border: 'none',
                                                        fontWeight: 500,
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                                        position: 'relative'
                                                    }}
                                                    color={
                                                        selectedVaccine.status === 'Đã tiêm' ? 'success' :
                                                            selectedVaccine.status === 'Chờ xác nhận' ? 'orange' :
                                                                selectedVaccine.status === 'Không tiêm' ? 'red' :
                                                                    selectedVaccine.status === 'Cho phép tiêm' ? 'blue' : 'default'
                                                    }
                                                >
                                                    {selectedVaccine.status}
                                                </Tag>
                                            </div>
                                        </Col>

                                        <Col xs={24} sm={12}>
                                            <div style={{
                                                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                                                borderRadius: 10,
                                                padding: 18,
                                                border: '1px solid #fcd34d',
                                                position: 'relative',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    position: 'absolute',
                                                    top: -10,
                                                    right: -10,
                                                    width: 40,
                                                    height: 40,
                                                    background: 'rgba(245, 158, 11, 0.1)',
                                                    borderRadius: '50%'
                                                }} />
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, position: 'relative' }}>
                                                    <Text strong style={{ color: '#d97706', fontSize: 14 }}>Ngày tiêm</Text>
                                                </div>
                                                <div style={{
                                                    background: 'rgba(255,255,255,0.8)',
                                                    borderRadius: 8,
                                                    padding: '10px 12px',
                                                    backdropFilter: 'blur(4px)',
                                                    position: 'relative'
                                                }}>
                                                    <Text style={{ fontSize: 14, fontWeight: 500, color: '#92400e' }}>
                                                        {selectedVaccine.vaccinatedDate ?
                                                            dayjs(selectedVaccine.vaccinatedDate).format('DD/MM/YYYY') :
                                                            <span style={{ color: "#9ca3af", fontStyle: 'italic' }}>Chưa có thông tin</span>}
                                                    </Text>
                                                </div>
                                            </div>
                                        </Col>

                                        {selectedVaccine.notes && (
                                            <Col span={24}>
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%)',
                                                    borderRadius: 10,
                                                    padding: 20,
                                                    border: '1px solid #d8b4fe',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                                        <Text strong style={{ color: '#7c3aed', fontSize: 15 }}>Ghi chú</Text>
                                                    </div>
                                                    <div style={{
                                                        background: 'rgba(255,255,255,0.7)',
                                                        borderRadius: 8,
                                                        padding: '12px 16px',
                                                        backdropFilter: 'blur(4px)'
                                                    }}>
                                                        <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#581c87' }}>
                                                            {selectedVaccine.notes}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </Col>
                                        )}

                                        {selectedVaccine.image_after_injection && (
                                            <Col span={24}>
                                                <div style={{
                                                    background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                                    borderRadius: 10,
                                                    padding: 20,
                                                    border: '1px solid #bae6fd',
                                                    position: 'relative'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                                        <Text strong style={{ color: '#0369a1', fontSize: 15 }}>Hình ảnh sau tiêm</Text>
                                                    </div>
                                                    <Image
                                                        width={100}
                                                        src={selectedVaccine.image_after_injection}
                                                        style={{ borderRadius: 8 }}
                                                    />
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                </Card>
                            </Col>

                            {selectedVaccine.status === 'Chờ xác nhận' && (
                                <Col span={24}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)',
                                        borderRadius: 12,
                                        padding: 20,
                                        border: '2px solid #fb923c',
                                        boxShadow: '0 4px 16px rgba(251, 146, 60, 0.2)',
                                        position: 'relative',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: -5,
                                            right: -5,
                                            width: 60,
                                            height: 60,
                                            background: 'rgba(251, 146, 60, 0.1)',
                                            borderRadius: '50%'
                                        }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, position: 'relative' }}>
                                            <div style={{
                                                background: '#fb923c',
                                                borderRadius: '50%',
                                                padding: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 8px rgba(251, 146, 60, 0.3)'
                                            }}>
                                                <ExclamationCircleFilled style={{ color: 'white', fontSize: 18 }} />
                                            </div>
                                            <Text strong style={{ fontSize: 16, color: '#9a3412' }}>
                                                Cần xác nhận tiêm vaccine
                                            </Text>
                                        </div>
                                        <Text style={{ fontSize: 14, color: '#7c2d12', lineHeight: 1.5, position: 'relative' }}>
                                            Vui lòng xem xét thông tin vaccine và quyết định cho phép tiêm vaccine này cho học sinh.
                                        </Text>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default Vaccine;