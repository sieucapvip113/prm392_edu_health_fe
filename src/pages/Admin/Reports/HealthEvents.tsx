import React, { useEffect, useState } from 'react';
import { Table, Modal, Descriptions, Tag, Button, Card, message, Tooltip, Image } from 'antd';
import {
    healthCheckService,
    HealthCheckEvent,
    HealthCheckForm,
    HealthCheckResult,
    Guardian
} from '../../../services/Healthcheck';
import { exportExcel } from '../../../services/ExportService';
import { saveAs } from 'file-saver';
import { EyeOutlined } from '@ant-design/icons';

const HealthEvents: React.FC = () => {
    const [healthEvents, setHealthEvents] = useState<HealthCheckEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);

    const [selectedEvent, setSelectedEvent] = useState<HealthCheckEvent | null>(null);
    const [students, setStudents] = useState<HealthCheckForm[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<HealthCheckForm | null>(null);
    const [studentResult, setStudentResult] = useState<HealthCheckResult | null>(null);
    const [modalResultVisible, setModalResultVisible] = useState(false);
    const [loadingResult, setLoadingResult] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoadingEvents(true);
            try {
                const events = await healthCheckService.getAllHealthChecks();
                setHealthEvents(events);
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingEvents(false);
            }
        };
        fetchEvents();
    }, []);

    const handleExport = async (eventId: number, type: 'vaccine' | 'health') => {
        try {
            const blob = await exportExcel(eventId, type);
            const fileName = `Danh-sach-${type}-${eventId}.xlsx`;
            saveAs(blob, fileName);
        } catch (error) {
            console.error('Lỗi xuất Excel:', error);
            message.error('Xuất danh sách thất bại');
        }
    };


    const handleRowClick = async (event: HealthCheckEvent) => {
        setSelectedEvent(event);
        setLoadingStudents(true);
        setModalVisible(true);
        try {
            const res = await healthCheckService.getStudentsByHealthCheck(event.HC_ID);
            setStudents(res.data);
        } catch (e) {
            setStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleStudentClick = async (student: HealthCheckForm) => {
        setSelectedStudent(student);
        setLoadingResult(true);
        setModalResultVisible(true);
        try {
            const result = await healthCheckService.getHealthCheckResult(student.HC_ID, student.Student_ID);
            setStudentResult(result);
        } catch (e) {
            setStudentResult(null);
        } finally {
            setLoadingResult(false);
        }
    };

    const eventColumns = [
        { title: 'STT', render: (_: any, __: any, idx: number) => idx + 1, width: 60 },
        { title: 'Tên đợt khám', dataIndex: 'title' },
        { title: 'Năm học', dataIndex: 'School_year' },
        {
            title: 'Ngày khám',
            render: (r: HealthCheckEvent) =>
                r.Event?.dateEvent ? new Date(r.Event.dateEvent).toLocaleDateString() : ''
        },
        { title: 'Loại', render: (r: HealthCheckEvent) => r.Event?.type },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            render: (text: string) => (
                <Tooltip title={text}>
                    <div style={{
                        maxWidth: 80,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {text}
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Hành động',
            render: (_: unknown, record: HealthCheckEvent) => (
                <div className="flex gap-2">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(record);
                            }}
                        />
                    </Tooltip>

                </div>
            )
        }



    ];

    const studentColumns = [
        { title: 'STT', render: (_: any, __: any, idx: number) => idx + 1, width: 60 },
        { title: 'Họ và tên', dataIndex: ['Student', 'fullname'] },
        { title: 'Lớp', dataIndex: ['Student', 'Class'] },
        { title: 'Ngày sinh', dataIndex: ['Student', 'dateOfBirth'] },
        { title: 'Giới tính', dataIndex: ['Student', 'gender'] },
        {
            title: 'Phụ huynh',
            render: (r: HealthCheckForm) =>
                r.Student.Guardians?.map((g: Guardian, i: number) => (
                    <div key={i}>
                        {g.roleInFamily}: {g.phoneNumber}
                    </div>
                ))
        },
        {
            title: 'Trạng thái xác nhận',
            render: (r: HealthCheckForm) => {
                let color = 'orange';
                let text = 'Chờ xác nhận';

                if (r.status === 'approved') {
                    color = 'green';
                    text = 'Đã xác nhận';
                } else if (r.status === 'checked') {
                    color = 'blue';
                    text = 'Đã khám';
                } else if (r.status === 'rejected') {
                    color = 'red';
                    text = 'Từ chối';
                }

                return <Tag color={color}>{text}</Tag>;
            }

        },
        {
            title: 'Cần gặp',
            render: (r: HealthCheckForm) =>
                r.Is_need_meet ? <Tag color="red">Cần gặp</Tag> : <Tag>Bình thường</Tag>
        },
        {
            title: 'Kết quả khám',
            render: (r: HealthCheckForm) =>
                r.Height || r.Weight || r.Blood_Pressure ? <Tag color="blue">Đã khám</Tag> : <Tag>Chưa khám</Tag>
        },
        {
            title: 'Ngày tạo',
            render: (r: HealthCheckForm) =>
                r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''
        },
        {
            title: 'Chi tiết',
            render: (r: HealthCheckForm) => (
                <Button size="small" onClick={() => handleStudentClick(r)}>
                    Xem
                </Button>
            )
        }
    ];

    return (
        <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-[calc(100vh-64px)]">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">Tổng hợp đợt khám sức khỏe</h1>
            <Table
                columns={eventColumns}
                dataSource={healthEvents}
                loading={loadingEvents}
                rowKey="HC_ID"
                // onRow={record => ({ onClick: () => handleRowClick(record) })}
                pagination={false}
                rowClassName={r => (selectedEvent && r.HC_ID === selectedEvent.HC_ID ? 'bg-blue-50' : '')}
            />

            {/* Modal hiển thị danh sách học sinh */}
            <Modal
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setSelectedEvent(null);
                    setStudents([]);
                }}
                title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>
                            {selectedEvent ? `Danh sách học sinh - ${selectedEvent.title}` : 'Danh sách học sinh'}
                        </span>
                        {selectedEvent && (
                            <Button
                                className='mr-10'
                                onClick={() => handleExport(selectedEvent.HC_ID, 'health')}
                            >
                                Xuất danh sách học sinh
                            </Button>
                        )}
                    </div>
                }
                footer={null}
                centered
                width={1000}
            >
                <Table
                    columns={studentColumns}
                    dataSource={students}
                    loading={loadingStudents}
                    rowKey="Form_ID"
                    pagination={false}
                />
            </Modal>


            {/* Modal hiển thị kết quả khám */}
            <Modal
                open={modalResultVisible}
                onCancel={() => {
                    setModalResultVisible(false);
                    setSelectedStudent(null);
                    setStudentResult(null);
                }}
                title={selectedStudent ? `Phiếu khám: ${selectedStudent.Student.fullname}` : 'Phiếu khám'}
                footer={null}
                centered
                width={500}
                bodyStyle={{ padding: 0 }}
            >
                {loadingResult ? (
                    <div style={{ padding: 24 }}>Đang tải...</div>
                ) : studentResult ? (
                    <Card bordered={false} style={{ boxShadow: 'none' }}>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Chiều cao">{studentResult.Height} cm</Descriptions.Item>
                            <Descriptions.Item label="Cân nặng">{studentResult.Weight} kg</Descriptions.Item>
                            <Descriptions.Item label="Huyết áp">{studentResult.Blood_Pressure}</Descriptions.Item>
                            <Descriptions.Item label="Thị lực trái">{studentResult.Vision_Left}</Descriptions.Item>
                            <Descriptions.Item label="Thị lực phải">{studentResult.Vision_Right}</Descriptions.Item>
                            <Descriptions.Item label="Răng hàm mặt">{studentResult.Dental_Status}</Descriptions.Item>
                            <Descriptions.Item label="Tai mũi họng">{studentResult.ENT_Status}</Descriptions.Item>
                            <Descriptions.Item label="Da liễu">{studentResult.Skin_Status}</Descriptions.Item>
                            <Descriptions.Item label="Kết luận">{studentResult.General_Conclusion}</Descriptions.Item>
                            <Descriptions.Item label="Cần gặp">{studentResult.Is_need_meet ? 'Có' : 'Không'}</Descriptions.Item>
                            {studentResult.image && (
                                <Descriptions.Item label="Ảnh khám">
                                    <Image src={studentResult.image} alt="Ảnh khám" style={{ maxWidth: 200 }} />
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Card>
                ) : (
                    <div style={{ padding: 24 }}>Không có dữ liệu</div>
                )}
            </Modal>
        </div>
    );
};

export default HealthEvents;
