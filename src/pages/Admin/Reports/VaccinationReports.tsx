import React, { useEffect, useState } from 'react';
import { Table, Modal, Descriptions, Tag, Button, Card, message, Tooltip } from 'antd';
import { vaccineService, VaccineEvent, VaccinePayload } from '../../../services/Vaccineservice';
import { exportExcel } from '../../../services/ExportService';
import { saveAs } from 'file-saver';
import { EyeOutlined } from '@ant-design/icons';

const VaccinationReports: React.FC = () => {
    const [vaccineEvents, setVaccineEvents] = useState<VaccineEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<VaccineEvent | null>(null);
    const [students, setStudents] = useState<VaccinePayload[]>([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState<VaccinePayload | null>(null);
    const [studentModalVisible, setStudentModalVisible] = useState(false);

    // Lấy danh sách đợt tiêm
    useEffect(() => {
        const fetchEvents = async () => {
            setLoadingEvents(true);
            try {
                const events = await vaccineService.getVaccineEvents();
                setVaccineEvents(events);
            } catch (e) {
                setVaccineEvents([]);
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

    // Khi chọn 1 đợt tiêm, lấy danh sách học sinh và mở Modal
    const handleRowClick = async (event: VaccineEvent) => {
        setSelectedEvent(event);
        setLoadingStudents(true);
        setModalVisible(true);
        try {
            const res = await vaccineService.getVaccineByName(
                event.vaccineName,
                String(event.grade),
                event.eventdate
            );
            setStudents(res);
        } catch (e) {
            setStudents([]);
        } finally {
            setLoadingStudents(false);
        }
    };

    // Khi chọn 1 học sinh, mở modal xem chi tiết
    const handleStudentClick = (student: VaccinePayload) => {
        setSelectedStudent(student);
        setStudentModalVisible(true);
    };

    const eventColumns = [
        { title: 'STT', render: (_: any, __: any, idx: number) => idx + 1, width: 60 },
        { title: 'Tên vaccine', dataIndex: 'vaccineName' },
        { title: 'Khối/Lớp', dataIndex: 'grade' },
        {
            title: 'Ngày tiêm',
            render: (r: VaccineEvent) =>
                r.eventdate ? new Date(r.eventdate).toLocaleDateString() : ''
        },
        {
            title: 'Hành động',
            render: (_: unknown, record: VaccineEvent) => (
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
        { title: 'Họ và tên', dataIndex: 'PatientName' },
        { title: 'Lớp', dataIndex: ['MedicalRecord', 'Class'] },
        {
            title: 'Trạng thái tiêm',
            dataIndex: 'Status',
            render: (status: string) => {
                let color = 'orange',
                    text = status;
                if (status === 'Đã tiêm') color = 'green';
                else if (status === 'Cho phép tiêm') color = 'blue';
                else if (status === 'Không tiêm') color = 'red';
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: 'Ghi chú sau tiêm',
            dataIndex: 'note_affter_injection',
            render: (note: string | null | undefined) =>
                note && note.trim() ? note : 'Không có'
        },
        {
            title: 'Chi tiết',
            render: (r: VaccinePayload) => (
                <Button size="small" onClick={() => handleStudentClick(r)}>
                    Xem
                </Button>
            )
        }
    ];

    return (
        <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-[calc(100vh-64px)]">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">Tổng hợp đợt tiêm chủng</h1>
            <Table
                columns={eventColumns}
                dataSource={vaccineEvents}
                loading={loadingEvents}
                rowKey={r => `${r.vaccineName}_${r.grade}_${r.eventdate}`}
                // onRow={record => ({ onClick: () => handleRowClick(record) })}
                pagination={false}
                rowClassName={r =>
                    selectedEvent &&
                        r.vaccineName === selectedEvent.vaccineName &&
                        r.grade === selectedEvent.grade &&
                        r.eventdate === selectedEvent.eventdate
                        ? 'bg-blue-50'
                        : ''
                }
            />

            {/* Modal danh sách học sinh */}
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
                            {selectedEvent
                                ? `Danh sách học sinh - ${selectedEvent.vaccineName} - Khối ${selectedEvent.grade} - ${new Date(selectedEvent.eventdate).toLocaleDateString()}`
                                : 'Danh sách học sinh'}
                        </span>
                        {selectedEvent && (
                            <Button
                                className='mr-10'

                                onClick={() => {
                                    const eventId = students[0]?.Event_ID;
                                    if (eventId) {
                                        handleExport(eventId, 'vaccine');
                                    }
                                }}
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
                    rowKey="VH_ID"
                    pagination={false}
                />
            </Modal>


            {/* Modal chi tiết học sinh */}
            <Modal
                open={studentModalVisible}
                onCancel={() => {
                    setStudentModalVisible(false);
                    setSelectedStudent(null);
                }}
                title={
                    selectedStudent
                        ? `Phiếu tiêm: ${selectedStudent.PatientName}`
                        : 'Phiếu tiêm'
                }
                footer={null}
                centered
                width={500}
                bodyStyle={{ padding: 0 }}
            >
                {selectedStudent ? (
                    <Card bordered={false} style={{ boxShadow: 'none' }}>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Họ và tên">
                                {selectedStudent.PatientName}
                            </Descriptions.Item>
                            <Descriptions.Item label="Lớp">
                                {selectedStudent.MedicalRecord?.Class}
                            </Descriptions.Item>
                            <Descriptions.Item label="Tên vaccine">
                                {selectedStudent.Vaccine_name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Loại vaccine">
                                {selectedStudent.Vaccince_type}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ngày tiêm">
                                {selectedStudent.Date_injection
                                    ? new Date(
                                        selectedStudent.Date_injection
                                    ).toLocaleDateString()
                                    : ''}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái tiêm">
                                {selectedStudent.Status}
                            </Descriptions.Item>
                            <Descriptions.Item label="Ghi chú sau tiêm">
                                {selectedStudent.note_affter_injection &&
                                    selectedStudent.note_affter_injection.trim()
                                    ? selectedStudent.note_affter_injection
                                    : 'Không có'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                ) : (
                    <div style={{ padding: 24 }}>Không có dữ liệu</div>
                )}
            </Modal>
        </div>
    );
};

export default VaccinationReports;
