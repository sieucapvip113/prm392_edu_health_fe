import  { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Tooltip, Typography, Space, DatePicker, Modal, Image } from 'antd'
import { EyeOutlined, CheckCircleOutlined, MinusCircleOutlined, MedicineBoxOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { medicalEventService } from '../../services/MedicalEventService'
import dayjs, { Dayjs } from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore'
import { useLocation, useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

interface EventType {
    id: number
    name: string
    class: string
    event: string
    solution: string
    callParent: string
    createdAt: string
    image?: string | null
    video?: string | null
}

dayjs.extend(isSameOrAfter)
dayjs.extend(isSameOrBefore)

const Event = () => {
    const [events, setEvents] = useState<EventType[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs())
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
    const [detailModal, setDetailModal] = useState<{ open: boolean, event?: EventType }>({ open: false })
    const location = useLocation()
    const navigate = useNavigate()

    function handleShowDetail(event: EventType) {
        setDetailModal({ open: true, event })
    }

    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const dateParam = params.get('date')
        if (dateParam && dayjs(dateParam, 'YYYY-MM-DD', true).isValid()) {
            setSelectedDate(dayjs(dateParam, 'YYYY-MM-DD'))
            navigate('/guardian/events', { replace: true })
        }
    }, [location.search])

    useEffect(() => {
        let intervalId: number

        const fetchEvents = async () => {
            setLoading(true)
            try {
                const userStr = localStorage.getItem('user')
                const userId = userStr ? JSON.parse(userStr).id : null
                if (!userId) return

                const apiData = await medicalEventService.getMedicalEventsByGuardian(userId)
                const mapped: EventType[] = (apiData || []).map((item: any) => ({
                    id: item.OrtherM_ID,
                    name: item.UserFullname || '',
                    class: item.Medical_record?.Class || '',
                    event: item.Decription,
                    solution: item.Handle,
                    callParent: item.Is_calLOb ? 'Có' : 'Không',
                    createdAt: item.history?.[0]?.Date_create
                        ? item.history[0].Date_create
                        : '',
                    image: item.Image || null,
                    video: item.Video || null
                }))
                setEvents(mapped)
            } catch (e) {
                setEvents([])
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
        intervalId = setInterval(fetchEvents, 5000)

        return () => {
            clearInterval(intervalId)
        }
    }, [])

    const filteredEvents = dateRange && dateRange[0] && dateRange[1]
        ? events.filter(ev =>
            ev.createdAt &&
            dayjs(ev.createdAt).isSameOrAfter(dateRange[0], 'day') &&
            dayjs(ev.createdAt).isSameOrBefore(dateRange[1], 'day')
        )
        : selectedDate
            ? events.filter(ev =>
                ev.createdAt && dayjs(ev.createdAt).isSame(selectedDate, 'day')
            )
            : events

    const columns: ColumnsType<EventType> = [
        {
            title: 'STT',
            key: 'stt',
            align: 'center',
            render: (_: any, __: any, idx: number) => idx + 1,
        },
        {
            title: 'TÊN HỌC SINH',
            dataIndex: 'name',
            key: 'name',
            align: 'center',
        },
        {
            title: 'LỚP',
            dataIndex: 'class',
            key: 'class',
            align: 'center',
        },
        {
            title: 'SỰ KIỆN Y TẾ',
            dataIndex: 'event',
            key: 'event',
            align: 'center',
        },
        {
            title: 'BIỆN PHÁP XỬ LÝ',
            dataIndex: 'solution',
            key: 'solution',
            align: 'center',
        },
        {
            title: 'GỌI BỐ MẸ',
            dataIndex: 'callParent',
            key: 'callParent',
            align: 'center',
            render: (val: string) =>
                val === 'Có' ? (
                    <Tag
                        color="#52c41a"
                        icon={<CheckCircleOutlined />}
                        style={{ fontWeight: 500, fontSize: 14, padding: '4px 16px', borderRadius: 8 }}
                    >
                        Đã gọi
                    </Tag>
                ) : (
                    <Tag
                        color="warning"
                        icon={<MinusCircleOutlined />}
                        style={{
                            fontWeight: 500,
                            fontSize: 13,
                            padding: '6px 12px',
                            borderRadius: 6,
                            border: 'none',
                            background: '#fff7e6',
                            color: '#d46b08'
                        }}
                    >
                        Không gọi
                    </Tag>
                ),
        },
        {
            title: 'NGÀY TẠO',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
        },
        {
            title: 'HÀNH ĐỘNG',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Space>
                    <Tooltip title="Xem chi tiết">
                        <Button type="text" icon={<EyeOutlined />} onClick={() => handleShowDetail(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ]

    return (
        <div style={{ padding: 24, background: '#f5f6fa', minHeight: '80vh' }}>
            <Card>
                <Title level={2} style={{ margin: 0 }}> <MedicineBoxOutlined /> Sự kiện y tế</Title>
                <Text type="secondary">Theo dõi các sự kiện y tế của học sinh.</Text>
            </Card>
            <Card style={{ marginTop: 24 }}>
                <Space style={{ marginBottom: 16 }}>
                    <DatePicker
                        format="DD/MM/YYYY"
                        placeholder={dayjs().format('DD/MM/YYYY')}
                        value={selectedDate}
                        onChange={date => {
                            setSelectedDate(date)
                            setDateRange(null)
                            if (location.search.includes('date=')) {
                                navigate('/guardian/event')
                            }
                        }}
                        allowClear
                    />
                    <DatePicker.RangePicker
                        format="DD/MM/YYYY"
                        value={dateRange}
                        onChange={range => {
                            setDateRange(range)
                            setSelectedDate(null)
                        }}
                        allowClear
                        placeholder={['Từ ngày', 'Đến ngày']}
                    />
                </Space>
                <Table
                    columns={columns}
                    dataSource={filteredEvents.map(ev => ({
                        ...ev,
                        createdAt: ev.createdAt ? dayjs(ev.createdAt).format('DD/MM/YYYY') : '',
                    }))}
                    rowKey="id"
                    loading={loading}
                    pagination={{ position: ['bottomRight'], pageSize: 5 }}
                    bordered
                />
            </Card>

            <Modal
                open={detailModal.open}
                title={
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: '#4f46e5',
                        color: 'white',
                        margin: '-24px -24px 0 -24px',
                        padding: '20px 24px',
                        borderRadius: '8px 8px 0 0'
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.15)',
                            padding: 8,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MedicineBoxOutlined style={{ fontSize: 20 }} />
                        </div>
                        <span style={{ fontSize: 20, fontWeight: 600 }}>Chi tiết sự kiện y tế</span>
                    </div>
                }
                onCancel={() => setDetailModal({ open: false })}
                footer={null}
                centered
                width={1000}
                styles={{
                    header: { padding: 0, border: 'none' },
                    body: { paddingTop: 32, background: '#f8f9fa' }
                }}
            >
                {detailModal.event && (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: detailModal.event.image ? '1fr 400px' : '1fr',
                        gap: 28,
                        minHeight: '400px'
                    }}>
                        <div style={{
                            background: 'white',
                            borderRadius: 12,
                            padding: 24,
                            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                            border: '1px solid #e2e8f0'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                marginBottom: 24,
                                paddingBottom: 16,
                                borderBottom: '2px solid #f1f5f9'
                            }}>
                                <div style={{
                                    background: '#6366f1',
                                    padding: 10,
                                    borderRadius: 8,
                                    color: 'white'
                                }}>
                                    📋
                                </div>
                                <Text strong style={{ fontSize: 18, color: '#1e293b' }}>
                                    Thông tin sự kiện
                                </Text>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <div style={{
                                    background: '#f8fafc',
                                    borderRadius: 8,
                                    padding: 16,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                                        Học sinh
                                    </Text>
                                    <Text strong style={{ fontSize: 16, color: '#374151' }}>
                                        {detailModal.event.name}
                                    </Text>
                                </div>

                                <div style={{
                                    background: '#f8fafc',
                                    borderRadius: 8,
                                    padding: 16,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>
                                        Lớp học
                                    </Text>
                                    <Tag
                                        color="blue"
                                        style={{
                                            fontSize: 14,
                                            padding: '4px 12px',
                                            borderRadius: 6,
                                            border: 'none'
                                        }}
                                    >
                                        {detailModal.event.class}
                                    </Tag>
                                </div>

                                <div style={{
                                    background: '#f8fafc',
                                    borderRadius: 8,
                                    padding: 16,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                                        Sự kiện y tế
                                    </Text>
                                    <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#374151' }}>
                                        {detailModal.event.event}
                                    </Text>
                                </div>

                                <div style={{
                                    background: '#f8fafc',
                                    borderRadius: 8,
                                    padding: 16,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                                        Biện pháp xử lý
                                    </Text>
                                    <Text style={{ fontSize: 14, lineHeight: 1.6, color: '#374151' }}>
                                        {detailModal.event.solution}
                                    </Text>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div style={{
                                        background: '#f8fafc',
                                        borderRadius: 8,
                                        padding: 16,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                                            Liên hệ phụ huynh
                                        </Text>
                                        {detailModal.event.callParent === 'Có' ? (
                                            <Tag
                                                color="success"
                                                icon={<CheckCircleOutlined />}
                                                style={{
                                                    fontWeight: 500,
                                                    fontSize: 13,
                                                    padding: '6px 12px',
                                                    borderRadius: 6,
                                                    border: 'none'
                                                }}
                                            >
                                                Đã gọi
                                            </Tag>
                                        ) : (
                                            <Tag
                                                color="warning"
                                                icon={<MinusCircleOutlined />}
                                                style={{
                                                    fontWeight: 500,
                                                    fontSize: 13,
                                                    padding: '6px 12px',
                                                    borderRadius: 6,
                                                    border: 'none',
                                                    background: '#fff7e6',
                                                    color: '#d46b08'
                                                }}
                                            >
                                                Không gọi
                                            </Tag>
                                        )}
                                    </div>

                                    <div style={{
                                        background: '#f8fafc',
                                        borderRadius: 8,
                                        padding: 16,
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
                                            Thời gian
                                        </Text>
                                        <Text style={{
                                            fontSize: 13,
                                            fontWeight: 500,
                                            color: '#6366f1',
                                            background: 'white',
                                            padding: '4px 8px',
                                            borderRadius: 4,
                                            display: 'inline-block',
                                            border: '1px solid #e5e7eb'
                                        }}>
                                            {detailModal.event.createdAt
                                                ? dayjs(detailModal.event.createdAt).isValid()
                                                    ? dayjs(detailModal.event.createdAt).format('DD/MM/YYYY')
                                                    : detailModal.event.createdAt
                                                : ''}
                                        </Text>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {(detailModal.event.image || detailModal.event.video) && (
                            <div style={{
                                background: 'white',
                                borderRadius: 12,
                                padding: 24,
                                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 24
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 12,
                                    marginBottom: 8,
                                    paddingBottom: 16,
                                    borderBottom: '2px solid #f1f5f9'
                                }}>
                                    <div style={{
                                        background: '#6b7280',
                                        padding: 10,
                                        borderRadius: 8,
                                        color: 'white'
                                    }}>
                                        📁
                                    </div>
                                    <Text strong style={{ fontSize: 18, color: '#1e293b' }}>
                                        Tư liệu minh họa
                                    </Text>
                                </div>

                                {detailModal.event.image && (
                                    <div style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#f8fafc',
                                        borderRadius: 8,
                                        padding: 16,
                                        border: '2px dashed #d1d5db'
                                    }}>
                                        <Image
                                            src={detailModal.event.image}
                                            alt="event"
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '250px',
                                                borderRadius: 6,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                            preview={{
                                                mask: (
                                                    <div style={{
                                                        background: 'rgba(0,0,0,0.6)',
                                                        color: 'white',
                                                        padding: '8px 16px',
                                                        borderRadius: 4,
                                                        fontSize: 14,
                                                        fontWeight: 500
                                                    }}>
                                                        <EyeOutlined style={{ marginRight: 6 }} /> Xem phóng to
                                                    </div>
                                                )
                                            }}
                                        />
                                    </div>
                                )}

                                {detailModal.event.video && (
                                    <div style={{
                                        flex: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: '#f8fafc',
                                        borderRadius: 8,
                                        padding: 16,
                                        border: '2px dashed #d1d5db'
                                    }}>
                                        <video
                                            src={detailModal.event.video}
                                            controls
                                            style={{
                                                maxWidth: '100%',
                                                maxHeight: '250px',
                                                borderRadius: 6,
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}


                    </div>
                )}
            </Modal>
        </div>
    )
}

export default Event