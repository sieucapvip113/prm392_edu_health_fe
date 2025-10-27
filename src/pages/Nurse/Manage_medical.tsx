import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import {
  getAllMedicalSents,
  getMedicalSentById,
  updateMedicalSent,
  MedicalSent,
  MedicalSentStatus,
  createMedicalSent,
} from '../../services/MedicalSentService';
import { Modal, Button, Spin, Table, Tag, Dropdown, Menu, message, Image, Form, Input, Upload, Select, Space, Tooltip, Row, Col } from 'antd';
import dayjs from 'dayjs';
import { DownOutlined, FileTextOutlined, MedicineBoxOutlined, PictureOutlined, UserOutlined, PlusOutlined, EyeOutlined, EditOutlined, SearchOutlined } from '@ant-design/icons';
import { getAllMedicalRecords, MedicalRecord } from '../../services/MedicalRecordService';
import { getAllGuardians, Guardian } from '../../services/AccountService';
import type { UploadFile } from 'antd/es/upload/interface';
import SearchMedicalRecordModal from './Modal/SearchMedicalRecordModal';
import { useLocation, useNavigate } from 'react-router-dom';

const statusColor: Record<string, string> = {
  pending: 'orange',
  received: 'blue',
  rejected: 'red',
  given: 'green',
};

const statusText: Record<string, string> = {
  pending: 'Chờ xử lý',
  received: 'Đã nhận',
  rejected: 'Từ chối',
  given: 'Đã cho uống',
};

const MedicineManagement: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [medicineRecords, setMedicineRecords] = useState<MedicalSent[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [guardians, setGuardians] = useState<Guardian[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState<{ open: boolean; record: MedicalSent | null }>({ open: false, record: null });
  const token = localStorage.getItem('accessToken') || '';
  const [createModal, setCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [nurseForm] = Form.useForm();
  const timeOptions = ['Sau ăn sáng', 'Trước ăn trưa', 'Sau ăn trưa', 'Trước ăn chiều', 'Sau ăn chiều'];
  const [fileList, setFileList] = useState<UploadFile<any>[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [detailPreviewVisible, setDetailPreviewVisible] = useState(false);
  const [detailPreviewImage, setDetailPreviewImage] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalSent | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState('');

  const medicalRecordMap = React.useMemo(() => {
    const map: Record<number, MedicalRecord> = {};
    // console.log('Medical records:', medicalRecords);
    medicalRecords.forEach((rec) => {
      map[rec.userId] = rec;
    });
    return map;
  }, [medicalRecords]);

  const guardianMap = React.useMemo(() => {
    const map: Record<string, Guardian> = {};
    guardians.forEach((g) => {
      map[g.phoneNumber] = g;
    });
    return map;
  }, [guardians]);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [medicalSents, medicalRecordsRes, guardiansRes] = await Promise.all([
          getAllMedicalSents(token),
          getAllMedicalRecords(token),
          getAllGuardians(token),
        ]);
        const sorted = medicalSents.sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix());
        setMedicineRecords(sorted);
        setMedicalRecords(medicalRecordsRes);
        setGuardians(guardiansRes);
      } catch (err) {
        console.error('Lỗi lấy dữ liệu:', err);
        message.error('Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [token]);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const dateParam = urlParams.get('date');

    if (dateParam) {
      const date = new Date(dateParam);
      if (!isNaN(date.getTime())) {
        setFromDate(date);
        const timer = setTimeout(() => {
          setFromDate(null);
          setToDate(null);
          navigate('/nurse/medical', { replace: true });
        }, 10000);

        return () => clearTimeout(timer);
      }
    }
  }, [location.search, navigate]);

  const filteredRecords = medicineRecords.filter(record => {
    const recordDate = dayjs(record.createdAt).startOf('day');
    const from = fromDate ? dayjs(fromDate).startOf('day') : null;
    const to = toDate ? dayjs(toDate).startOf('day') : null;
    if (from && to) {
      return recordDate.isSameOrAfter(from) && recordDate.isSameOrBefore(to);
    }
    if (from) {
      return recordDate.isSameOrAfter(from);
    }
    if (to) {
      return recordDate.isSameOrBefore(to);
    }
    return true;
  });
  // console.log('Filtered records:', filteredRecords);
  const handleViewDetail = async (record: MedicalSent) => {
    setLoading(true);
    try {
      const detail = await getMedicalSentById(record.id, token);
      setDetailModal({ open: true, record: detail });
    } catch (err) {
      console.error('Lỗi lấy chi tiết đơn thuốc:', err);
      message.error('Lỗi khi tải chi tiết đơn thuốc.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (record: MedicalSent, newStatus: MedicalSentStatus) => {
    console.log('Changing status for record:', record);
    try {
      const formData = new FormData();
      formData.append('Status', newStatus);
      formData.append('Guardian_phone', record.Guardian_phone);
      formData.append('Class', record.Class);
      formData.append('Medications', record.Medications);
      formData.append('Delivery_time', record.Delivery_time);
      formData.append('Image_prescription', record.Image_prescription);
      if (record.Notes) {
        formData.append('Notes', record.Notes);
      }

      console.log('Updating record with formData:', formData);

      await updateMedicalSent(record.id, formData, token);

      setMedicineRecords((prevRecords) =>
        prevRecords.map((rec) => (rec.id === record.id ? { ...rec, Status: newStatus } : rec))
      );

      message.success('Cập nhật trạng thái thành công!');
    } catch (error) {
      message.error('Cập nhật trạng thái thất bại.');
      console.error('Lỗi cập nhật trạng thái:', error);
    }
  };

  const getNextStatuses = (current: MedicalSentStatus): MedicalSentStatus[] => {
    if (current === 'pending') return ['received', 'rejected'];
    if (current === 'received') return ['given'];
    return [];
  };

  // const handleDelete = async (id: number) => {
  //   setLoading(true);
  //   try {
  //     await deleteMedicalSent(id, token);
  //     message.success('Xóa đơn thuốc thành công!');
  //     const medicalSents = await getAllMedicalSents(token);
  //     setMedicineRecords(medicalSents.sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix()));
  //   } catch (err) {
  //     message.error('Lỗi khi xóa đơn thuốc.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handlePreview = async (file: UploadFile<any>) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj!);
        reader.onload = () => resolve(reader.result as string);
      });
    }
    setPreviewImage(file.url || file.preview || '');
    setPreviewVisible(true);
  };

  const handleEdit = (record: MedicalSent) => {
    setEditingRecord(record);
    const student = medicalRecords.find(s => s.userId === record.User_ID);
    nurseForm.setFieldsValue({
      selectedStudentId: record.User_ID,
      className: student?.Class || record.Class,
      guardianPhone: student?.guardian?.phoneNumber || record.Guardian_phone,
      deliveryTimeNote: record.Delivery_time?.split(' - ')[1],
      prescriptionImage: record.Image_prescription
        ? [
          {
            uid: '-1',
            name: 'prescription.jpg',
            status: 'done',
            url: record.Image_prescription,
          },
        ]
        : [],
      notes: record.Notes || '',
    });
    setFileList(
      record.Image_prescription
        ? [
          {
            uid: '-1',
            name: 'prescription.jpg',
            status: 'done',
            url: record.Image_prescription,
          },
        ]
        : []
    );
    setEditModal(true);
  };

  const handleStudentSelect = (student: MedicalRecord) => {
    nurseForm.setFieldsValue({
      selectedStudentId: student.userId,
      className: student.Class,
      guardianPhone: student.guardian?.phoneNumber,
    });
    setSelectedStudentName(student.fullname);
    setIsSearchModalOpen(false);
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      render: (_: any, __: any, idx: number) => idx + 1,
      width: 60,
    },
    {
      title: 'Ngày gửi',
      dataIndex: 'createdAt',
      key: 'ngaygui',
      render: (createdAt: string) => dayjs(createdAt).format('DD/MM/YYYY'),
    },
    {
      title: 'Tên học sinh',
      dataIndex: 'patientName',
      key: 'patientName',
      render: (_: any, record: MedicalSent) => medicalRecordMap[record.User_ID]?.fullname || '',
    },
    {
      title: 'Lớp',
      dataIndex: 'Class',
      key: 'Class',
      render: (_: any, record: MedicalSent) => {
        const className = medicalRecordMap[record.User_ID]?.Class || '';
        // console.log('User_ID:', record.User_ID, '→ Class:', className);
        return className;
      }
    },

    {
      title: 'SĐT Phụ huynh',
      dataIndex: 'Guardian_phone',
      key: 'Guardian_phone',
      render: (_: any, record: MedicalSent) => record.Guardian_phone || 'Không có',
    },
    {
      title: 'Thời gian uống thuốc',
      dataIndex: 'Delivery_time',
      key: 'Delivery_time',
      render: (time: string) => time ? (time.split(' - ')[1] || time) : '',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'Status',
      key: 'Status',
      render: (status: string, record: MedicalSent) => {
        const nextStatuses = getNextStatuses(status as MedicalSentStatus);
        if (nextStatuses.length === 0) {
          return <Tag color={statusColor[status]}>{statusText[status]}</Tag>;
        }
        const menu = (
          <Menu
            onClick={({ key }) => handleStatusChange(record, key as MedicalSentStatus)}
            items={nextStatuses.map((s) => ({
              key: s,
              label: <Tag color={statusColor[s]}>{statusText[s]}</Tag>,
            }))}
          />
        );
        return (
          <Dropdown overlay={menu} trigger={['click']}>
            <Tag color={statusColor[status]} style={{ cursor: 'pointer' }}>
              {statusText[status]} <DownOutlined />
            </Tag>
          </Dropdown>
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: MedicalSent) => {
        const isGiven = record.Status === 'given';
        return (
          <Space>
            <Tooltip title="Xem chi tiết"><Button type="text" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} /></Tooltip>
            <Tooltip title="Sửa"><Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} disabled={isGiven} /></Tooltip>
            {/* <Popconfirm
              title="Xác nhận xóa"
              description="Bạn chắc chắn muốn xóa đơn thuốc này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
              placement="topRight"
              disabled={isGiven}
            >
              <Tooltip title="Xóa"><Button type="text" danger icon={<DeleteOutlined />} disabled={isGiven} /></Tooltip>
            </Popconfirm> */}
          </Space>
        );
      }
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý đơn thuốc</h1>
        <Button type="primary" onClick={() => { nurseForm.resetFields(); setCreateModal(true); setSelectedStudentName(''); }}>
          + Tạo đơn
        </Button>
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày:</label>
            <DatePicker
              selected={fromDate}
              onChange={(date: Date | null) => setFromDate(date)}
              dateFormat="dd/MM/yyyy"
              className="min-w-[140px] border border-gray-300 rounded-lg p-2.5"
              isClearable
              placeholderText="Từ ngày"
              maxDate={toDate || undefined}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày:</label>
            <DatePicker
              selected={toDate}
              onChange={(date: Date | null) => setToDate(date)}
              dateFormat="dd/MM/yyyy"
              className="min-w-[140px] border border-gray-300 rounded-lg p-2.5"
              isClearable
              placeholderText="Đến ngày"
              minDate={fromDate || undefined}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredRecords}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </div>

      <Modal
        open={detailModal.open}
        onCancel={() => setDetailModal({ open: false, record: null })}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailModal({ open: false, record: null })}>
            Đóng
          </Button>
        ]}
        width={800}
        centered
        title={
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <MedicineBoxOutlined className="text-blue-600 text-xl" />
            </div>
            <div>
              <div className="text-lg font-semibold">Chi Tiết Đơn Thuốc</div>
              <div className="text-sm text-gray-500 font-normal">Thông tin giao thuốc cho học sinh</div>
            </div>
          </div>
        }
        className="medicine-detail-modal"
      >
        {detailModal.record && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-2">
            {/* Thông tin học sinh */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <UserOutlined className="text-blue-600" />
                <span className="text-blue-800 font-semibold">Thông Tin Học Sinh</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                <div><span className="font-semibold">Tên học sinh:</span> {medicalRecordMap[detailModal.record.User_ID]?.fullname || ''}</div>
                <div><span className="font-semibold">Lớp:</span> {medicalRecordMap[detailModal.record.User_ID]?.Class || ''}</div>
                <div><span className="font-semibold">Thời gian uống:</span> {detailModal.record.Delivery_time?.split(' - ')[1]}</div>
                <div><span className="font-semibold">Tình trạng:</span>
                  <Tag color={statusColor[detailModal.record.Status]}>
                    {statusText[detailModal.record.Status]}
                  </Tag>
                </div>
                <div><span className="font-semibold">Thời gian tạo:</span> {dayjs(detailModal.record.createdAt).format('HH:mm DD/MM/YYYY')}</div>
              </div>
            </div>

            {/* Thông tin phụ huynh */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <UserOutlined className="text-green-600" />
                <span className="text-green-800 font-semibold">Thông Tin Phụ Huynh</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-700">
                <div><span className="font-semibold">Họ tên:</span> {guardianMap[detailModal.record.Guardian_phone]?.fullname || ''}</div>
                <div><span className="font-semibold">SĐT:</span> {guardianMap[detailModal.record.Guardian_phone]?.phoneNumber || detailModal.record.Guardian_phone || ''}</div>
                <div><span className="font-semibold">Vai trò:</span> {guardianMap[detailModal.record.Guardian_phone]?.roleInFamily || ''}</div>
                <div><span className="font-semibold">Địa chỉ:</span> {guardianMap[detailModal.record.Guardian_phone]?.address || ''}</div>
              </div>
            </div>

            {/* Ảnh toa thuốc */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-3">
                <PictureOutlined className="text-indigo-600" />
                <span className="text-indigo-800 font-semibold">Ảnh Toa Thuốc</span>
              </div>
              {detailModal.record?.Image_prescription ? (
                <div className="flex justify-center">
                  <Image
                    width={220}
                    style={{ maxWidth: 220, height: 'auto', display: 'block', margin: '0 auto', cursor: 'pointer' }}
                    src={detailModal.record.Image_prescription}
                    alt="Toa thuốc"
                    className="rounded-lg border border-gray-200 shadow-sm object-contain"
                    preview={false}
                    onClick={() => {
                      if (detailModal.record?.Image_prescription) {
                        setDetailPreviewImage(detailModal.record.Image_prescription);
                        setDetailPreviewVisible(true);
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <PictureOutlined className="text-4xl mb-2" />
                  <p>Không có ảnh toa thuốc</p>
                </div>
              )}
            </div>

            {/* Ghi chú */}
            {detailModal.record.Notes && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4 shadow-sm">
                <div className="flex items-center space-x-2 mb-3">
                  <FileTextOutlined className="text-orange-600" />
                  <span className="text-orange-800 font-semibold">Ghi Chú Đặc Biệt</span>
                </div>
                <div className="bg-white border border-orange-100 rounded-lg p-4 text-gray-700">
                  {detailModal.record.Notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={createModal}
        onCancel={() => { setCreateModal(false); setFileList([]); }}
        title="Tạo đơn gửi thuốc mới"
        footer={null}
        destroyOnClose
        width={1000}
      >
        <Form
          form={nurseForm}
          layout="vertical"
          onFinish={async (values) => {
            setCreateLoading(true);
            try {
              const { selectedStudentId, deliveryTimeNote, prescriptionImage, notes } = values;
              if (!selectedStudentId || !prescriptionImage || !deliveryTimeNote) {
                message.error('Vui lòng nhập đầy đủ thông tin!');
                setCreateLoading(false);
                return;
              }
              const student = medicalRecords.find(s => s.userId === selectedStudentId);
              const formData = new FormData();
              formData.append('userId', String(selectedStudentId));
              formData.append('Class', student?.Class || '');
              formData.append('guardianPhone', student?.guardian?.phoneNumber || '');
              formData.append('deliveryTime', `${dayjs().format('YYYY-MM-DD')} - ${deliveryTimeNote}`);
              formData.append('status', 'received');
              formData.append('notes', notes || '');
              formData.append('prescriptionImage', prescriptionImage[0].originFileObj);
              formData.append('create_by', 'nurse');
              await createMedicalSent(formData, token);
              message.success('Tạo đơn gửi thuốc thành công!');
              setCreateModal(false);
              setFileList([]);
              nurseForm.resetFields();
              const medicalSents = await getAllMedicalSents(token);
              setMedicineRecords(medicalSents.sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix()));
            } catch (err) {
              message.error('Có lỗi xảy ra, vui lòng thử lại!');
            } finally {
              setCreateLoading(false);
            }
          }}
        >
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Form.Item label="Chọn học sinh" required style={{ marginBottom: 24 }}>
                <Form.Item
                  name="selectedStudentId"
                  noStyle
                  rules={[{ required: true, message: 'Vui lòng chọn học sinh!' }]}
                >
                  <Input style={{ display: 'none' }} />
                </Form.Item>
                <Input.Group compact>
                  <Input
                    style={{ width: 'calc(100% - 40px)', fontSize: 16 }}
                    placeholder="Nhấn nút tìm kiếm để chọn học sinh"
                    value={selectedStudentName}
                    readOnly
                  />
                  <Button icon={<SearchOutlined />} onClick={() => setIsSearchModalOpen(true)} />
                </Input.Group>
              </Form.Item>
              <Form.Item label="Lớp" name="className" style={{ marginBottom: 24 }}>
                <Input readOnly disabled style={{ fontSize: 16 }} />
              </Form.Item>
              <Form.Item label="SĐT phụ huynh" name="guardianPhone" style={{ marginBottom: 24 }}>
                <Input readOnly disabled style={{ fontSize: 16 }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="deliveryTimeNote"
                label="Buổi uống"
                rules={[{ required: true, message: 'Vui lòng chọn buổi uống!' }]}
                style={{ marginBottom: 24 }}
              >
                <Select placeholder="Chọn buổi" style={{ width: '100%', fontSize: 16 }}>
                  {timeOptions.map((time) => (<Select.Option key={time} value={time}>{time}</Select.Option>))}
                </Select>
              </Form.Item>
              <Form.Item
                name="prescriptionImage"
                label="Hình ảnh toa thuốc"
                valuePropName="fileList"
                getValueFromEvent={e => (Array.isArray(e) ? e : e?.fileList)}
                rules={[
                  { required: true, message: 'Vui lòng tải lên hình ảnh toa thuốc' }
                ]}
                style={{ marginBottom: 24 }}
              >
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  beforeUpload={file => {
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      message.error('Chỉ cho phép upload file ảnh!');
                    }
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error('Ảnh phải nhỏ hơn 5MB!');
                    }
                    return isImage && isLt5M ? false : Upload.LIST_IGNORE;
                  }}
                  maxCount={1}
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  onPreview={handlePreview}
                  style={{ width: '100%' }}
                >
                  {fileList.length >= 1 ? null : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PlusOutlined />
                      <span>Upload</span>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
              </Modal>
              <Form.Item name="notes" label="Ghi chú" style={{ marginBottom: 24 }} >
                <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" style={{ fontSize: 16 }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => setCreateModal(false)} style={{ marginRight: 8, fontSize: 16 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createLoading} style={{ fontSize: 16 }}>Tạo đơn</Button>
          </Form.Item>
        </Form>
      </Modal>

      <SearchMedicalRecordModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelect={handleStudentSelect}
      />

      <Modal
        open={editModal}
        onCancel={() => { setEditModal(false); setEditingRecord(null); nurseForm.resetFields(); setFileList([]); }}
        title="Sửa đơn gửi thuốc"
        footer={null}
        destroyOnClose
        width={1000}
      >
        <Form
          form={nurseForm}
          layout="vertical"
          onFinish={async (values) => {
            if (!editingRecord) return;
            setCreateLoading(true);
            try {
              const { deliveryTimeNote, prescriptionImage, notes } = values;
              if (!deliveryTimeNote || !prescriptionImage) {
                message.error('Vui lòng nhập đầy đủ thông tin!');
                setCreateLoading(false);
                return;
              }
              const formData = new FormData();
              formData.append('Delivery_time', `${dayjs().format('YYYY-MM-DD')} - ${deliveryTimeNote}`);
              formData.append('Notes', notes || '');
              if (prescriptionImage[0]?.originFileObj) {
                formData.append('prescriptionImage', prescriptionImage[0].originFileObj);
              }
              await updateMedicalSent(editingRecord.id, formData, token);
              message.success('Cập nhật đơn thuốc thành công!');
              setEditModal(false);
              setEditingRecord(null);
              nurseForm.resetFields();
              setFileList([]);
              const medicalSents = await getAllMedicalSents(token);
              setMedicineRecords(medicalSents.sort((a, b) => dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix()));
            } catch (err) {
              message.error('Có lỗi xảy ra, vui lòng thử lại!');
            } finally {
              setCreateLoading(false);
            }
          }}
        >
          <Row gutter={32}>
            <Col xs={24} md={12}>
              <Form.Item name="selectedStudentId" label="Học sinh">
                <Select disabled>
                  {medicalRecords.map(s => (
                    <Select.Option key={s.userId} value={s.userId}>
                      {s.fullname}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="Lớp" name="className">
                <Input readOnly disabled />
              </Form.Item>
              <Form.Item label="SĐT phụ huynh" name="guardianPhone">
                <Input readOnly disabled />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="deliveryTimeNote"
                label="Buổi uống"
                rules={[{ required: true, message: 'Vui lòng chọn buổi uống!' }]}
              >
                <Select placeholder="Chọn buổi">
                  {timeOptions.map((time) => (<Select.Option key={time} value={time}>{time}</Select.Option>))}
                </Select>
              </Form.Item>
              <Form.Item
                name="prescriptionImage"
                label="Hình ảnh toa thuốc"
                valuePropName="fileList"
                getValueFromEvent={e => (Array.isArray(e) ? e : e?.fileList)}
                rules={[
                  { required: true, message: 'Vui lòng tải lên hình ảnh toa thuốc' }
                ]}
              >
                <Upload
                  listType="picture-card"
                  accept="image/*"
                  beforeUpload={file => {
                    const isImage = file.type.startsWith('image/');
                    if (!isImage) {
                      message.error('Chỉ cho phép upload file ảnh!');
                    }
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error('Ảnh phải nhỏ hơn 5MB!');
                    }
                    return isImage && isLt5M ? false : Upload.LIST_IGNORE;
                  }}
                  maxCount={1}
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  onPreview={handlePreview}
                >
                  {fileList.length >= 1 ? null : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <PlusOutlined />
                      <span>Upload</span>
                    </div>
                  )}
                </Upload>
              </Form.Item>
              <Modal open={previewVisible} footer={null} onCancel={() => setPreviewVisible(false)}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
              </Modal>
              <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button onClick={() => { setEditModal(false); setEditingRecord(null); nurseForm.resetFields(); setFileList([]); }} style={{ marginRight: 8 }}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={createLoading}>Cập nhật</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal open={detailPreviewVisible} footer={null} onCancel={() => setDetailPreviewVisible(false)}>
        <img alt="preview" style={{ width: '100%' }} src={detailPreviewImage} />
      </Modal>

    </div>
  );
};

export default MedicineManagement;