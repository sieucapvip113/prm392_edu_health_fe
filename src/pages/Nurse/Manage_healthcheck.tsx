import React, { useEffect, useState } from 'react';
import { Button, Select, Space, Modal, Form, Input, Tooltip } from 'antd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import { healthCheckService, HealthCheckEvent, CreateHealthCheckRequest } from '../../services/Healthcheck';
import { notificationService } from '../../services/NotificationService';
import { Send, Check, Edit, Trash2 } from 'lucide-react';
import { EyeOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

function formatDate(date: Date | null) {
  if (!date) return '';
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

// Hàm kiểm tra ngày hợp lệ (chỉ cho chọn ngày lớn hơn hôm nay)
const isFutureDate = (date: Date | null) => {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
};

const ManageHealthcheck: React.FC = () => {
  const [healthEvents, setHealthEvents] = useState<HealthCheckEvent[]>([]);
  const [schoolYears, setSchoolYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('Tất cả');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingConfirmation, setSendingConfirmation] = useState<number | null>(null);
  const navigate = useNavigate();

  const [sentStatus, setSentStatus] = useState<{ [key: number]: boolean }>({});
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [editingEvent, setEditingEvent] = useState<HealthCheckEvent | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<HealthCheckEvent | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [createDate, setCreateDate] = useState<Date | null>(null);
  const [editDate, setEditDate] = useState<Date | null>(null);

  // Hàm kiểm tra trạng thái gửi form cho từng đợt khám
  const checkSentStatus = async (events: HealthCheckEvent[]) => {
    const statusObj: { [key: number]: boolean } = {};
    await Promise.all(
      events.map(async (event) => {
        try {
          const res = await healthCheckService.getStudentsByHealthCheck(event.HC_ID);
          statusObj[event.HC_ID] = Array.isArray(res.data) && res.data.length > 0;
        } catch {
          statusObj[event.HC_ID] = false;
        }
      })
    );
    setSentStatus(statusObj);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const events = await healthCheckService.getAllHealthChecks();
      setHealthEvents(events);
      const uniqueYears = Array.from(
        new Set(events.map((e) => e.School_year)),
      );
      setSchoolYears(uniqueYears);
      await checkSentStatus(events);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu khám sức khỏe:', error);
      notificationService.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreatePhase = () => {
    form.resetFields();
    setCreateDate(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    const payload: CreateHealthCheckRequest = {
      title: values.title,
      type: values.type,
      description: values.description,
      dateEvent: formatDate(createDate),
      schoolYear: values.schoolYear,
    };
    setIsLoading(true);
    try {
      await healthCheckService.createHealthCheck(payload);
      await fetchEvents();
      notificationService.success('Tạo đợt khám thành công!');
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating health check:', error);
      notificationService.error(
        'Có lỗi xảy ra khi tạo đợt khám sức khỏe',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendConfirmation = async (hcId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSendingConfirmation(hcId);
    try {
      const result = await healthCheckService.sendConfirmationForm(hcId);
      console.log('Send confirmation result:', hcId, result);
      if (result.success) {
        notificationService.success(result.message || 'Đã gửi form xác nhận thành công!');
        // Gửi xong thì cập nhật lại trạng thái gửi form
        await checkSentStatus(healthEvents);
      } else {
        throw new Error(result.message || 'Có lỗi xảy ra khi gửi form xác nhận');
      }
    } catch (error: any) {
      console.error('Error sending confirmation form:', error);
      notificationService.error(error.message || 'Có lỗi xảy ra khi gửi form xác nhận');
    } finally {
      setSendingConfirmation(null);
    }
  };

  const handleRowClick = (event: HealthCheckEvent) => {
    navigate(`/nurse/healthcheck/students/${event.HC_ID}`);
  };

  const showEditModal = (event: HealthCheckEvent) => {
    setEditingEvent(event);
    editForm.setFieldsValue({
      title: event.title,
      type: event.Event?.type,
      description: event.description,
      schoolYear: event.School_year,
    });
    setEditDate(event.Event?.dateEvent ? new Date(event.Event.dateEvent) : null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingEvent) return;
    setEditLoading(true);
    try {
      await healthCheckService.updateHealthCheck(editingEvent.HC_ID, {
        title: values.title,
        type: values.type,
        description: values.description,
        dateEvent: formatDate(editDate),
        schoolYear: values.schoolYear,
      });
      await fetchEvents();
      notificationService.success('Cập nhật đợt khám thành công!');
      setIsEditModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      notificationService.error('Có lỗi xảy ra khi cập nhật đợt khám');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = (event: HealthCheckEvent) => {
    setDeletingEvent(event);
  };

  const confirmDelete = async () => {
    if (!deletingEvent) return;
    setDeleteLoading(true);
    try {
      await healthCheckService.deleteHealthCheck(deletingEvent.HC_ID);
      await fetchEvents();
      notificationService.success('Xoá đợt khám thành công!');
      setDeletingEvent(null);
    } catch (error) {
      notificationService.error('Có lỗi xảy ra khi xoá đợt khám');
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setDeletingEvent(null);
  };

  const filteredEvents =
    selectedYear === 'Tất cả'
      ? healthEvents
      : healthEvents.filter((e) => e.School_year === selectedYear);

  const dateFilteredEvents = filteredEvents.filter(event => {
    const eventDate = event.Event?.dateEvent ? new Date(event.Event.dateEvent) : null;
    if (!eventDate) return false;
    const from = fromDate ? new Date(fromDate.setHours(0, 0, 0, 0)) : null;
    const to = toDate ? new Date(toDate.setHours(0, 0, 0, 0)) : null;
    if (from && to) {
      return eventDate >= from && eventDate <= to;
    }
    if (from) {
      return eventDate >= from;
    }
    if (to) {
      return eventDate <= to;
    }
    return true;
  });
  console.log('Filtered Events:', filteredEvents);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý đợt khám sức khỏe</h1>
        <button
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/30"
          type="button"
          onClick={handleCreatePhase}>
          + Thêm đợt khám
        </button>
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Năm học:</span>
          <Select
            value={selectedYear}
            onChange={(val) => setSelectedYear(val)}
            style={{ width: 200 }}
            className="min-w-[200px]"
          >
            <Option value="Tất cả">Tất cả</Option>
            {schoolYears.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
          <div className="flex gap-2 items-center ml-8">
            <span className="text-sm font-medium text-gray-700">Từ ngày:</span>
            <DatePicker
              selected={fromDate}
              onChange={(date: Date | null) => setFromDate(date)}
              dateFormat="dd/MM/yyyy"
              className="min-w-[120px] border border-gray-300 rounded-lg p-2.5"
              isClearable
              placeholderText="Từ ngày"
              maxDate={toDate || undefined}
            />
            <span className="text-sm font-medium text-gray-700">Đến ngày:</span>
            <DatePicker
              selected={toDate}
              onChange={(date: Date | null) => setToDate(date)}
              dateFormat="dd/MM/yyyy"
              className="min-w-[120px] border border-gray-300 rounded-lg p-2.5"
              isClearable
              placeholderText="Đến ngày"
              minDate={fromDate || undefined}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đợt khám</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm học</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày khám</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : dateFilteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">Không có dữ liệu</td>
              </tr>
            ) : (
              dateFilteredEvents.map((event, index) => {
                const isSent = sentStatus[event.HC_ID];
                const isSending = sendingConfirmation === event.HC_ID;

                return (
                  <tr
                    key={event.HC_ID}
                    className="hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                  // onClick={() => handleRowClick(event)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{event.School_year}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {event.Event?.dateEvent ? new Date(event.Event.dateEvent).toLocaleDateString() : ''}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{event.Event?.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {/* Trạng thái đợt khám */}
                      {(() => {
                        let color = '';
                        let label = '';
                        switch (event.status) {
                          case 'created':
                            color = 'bg-gray-400 text-white';
                            label = 'Chờ gửi';
                            break;
                          case 'pending':
                            color = 'bg-orange-400 text-white';
                            label = 'Chờ xác nhận';
                            break;
                          case 'in progress':
                            color = 'bg-blue-500 text-white';
                            label = 'Đang diễn ra';
                            break;
                          case 'checked':
                            color = 'bg-green-500 text-white';
                            label = 'Kết thúc';
                            break;
                          default:
                            color = 'bg-gray-200 text-gray-700';
                            label = event.status || '';
                        }
                        return (
                          <span className={`inline-block px-3 py-1 rounded-full font-semibold text-xs ${color}`}>{label}</span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 max-w-28">
                      <Tooltip title={event.description}>
                        <div className="truncate w-full">{event.description}</div>
                      </Tooltip>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center space-x-3">
                        {/* Nút luôn hiển thị để gọi handleRowClick */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(event);
                          }}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          title="Xem danh sách học sinh"
                        >
                          <EyeOutlined />
                        </button>

                        {/* Các nút chỉ hiển thị khi không phải đang diễn ra hoặc đã kiểm tra */}
                        {!(event.status === 'in progress' || event.status === 'checked') && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                showEditModal(event);
                              }}
                              className="inline-flex items-center px-3 py-1.5 bg-yellow-400 text-white text-sm rounded-lg hover:bg-yellow-500 transition-colors duration-200"
                              title="Sửa đợt khám"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(event);
                              }}
                              className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors duration-200"
                              title="Xoá đợt khám"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}

                        {/* Gửi xác nhận hoặc đã gửi */}
                        {isSent ? (
                          <div className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-800 text-sm rounded-lg border border-green-200">
                            <Check className="h-4 w-4 mr-1" />
                            Đã gửi
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleSendConfirmation(event.Event_ID, e)}
                            disabled={isSending}
                            className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Gửi form xác nhận cho phụ huynh"
                          >
                            {isSending ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <Send className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title="Tạo đợt khám mới"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{}}
        >
          <Form.Item
            name="title"
            label="Tên đợt khám"
            rules={[{ required: true, message: 'Vui lòng nhập tên đợt khám' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại khám"
            rules={[{ required: true, message: 'Vui lòng nhập loại khám' }]}
          >
            <Input placeholder="VD: Khám sức khỏe định kỳ" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[
              { required: true, message: 'Vui lòng nhập mô tả' },
              { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự' },
              { max: 1000, message: 'Mô tả tối đa 1000 ký tự' }
            ]}
          >
            <TextArea rows={3} maxLength={1000} />
          </Form.Item>


          <Form.Item
            name="schoolYear"
            label={<span><span style={{ color: 'red' }}>*</span> Năm học</span>}
            rules={[
              {
                validator: (_, value) => {
                  const now = new Date();
                  const currentYear = now.getFullYear();
                  const expected = `${currentYear}-${currentYear + 1}`;
                  if (!value || value.trim() === '') {
                    return Promise.reject('Năm học không được để trống.');
                  }
                  if (!/^\d{4}-\d{4}$/.test(value)) {
                    return Promise.reject('Năm học phải có định dạng YYYY-YYYY (ví dụ: 2025-2026).');
                  }
                  const [start, end] = value.split('-').map(Number);
                  if (isNaN(start) || isNaN(end)) {
                    return Promise.reject('Năm học phải có định dạng YYYY-YYYY (ví dụ: 2025-2026).');
                  }
                  if (value !== expected) {
                    return Promise.reject(`Chỉ được nhập đúng năm học hiện tại: ${expected}`);
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input placeholder="VD: 2025-2026" />
          </Form.Item>


          <Form.Item
            name="dateEvent"
            label={<span><span style={{ color: 'red' }}>*</span> Ngày khám</span>}
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.reject('Vui lòng chọn ngày khám');
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const selectedDate = new Date(value);
                  if (selectedDate < today) {
                    return Promise.reject('Chỉ được chọn ngày hôm nay hoặc lớn hơn');
                  }
                  // Lấy giá trị năm học
                  const schoolYear = form.getFieldValue('schoolYear');
                  if (!schoolYear || !/^\d{4}-\d{4}$/.test(schoolYear)) {
                    return Promise.reject('Vui lòng nhập năm học hợp lệ trước');
                  }
                  const [startYear, endYear] = schoolYear.split('-').map(Number);
                  const minDate = new Date(`${startYear}-01-01T00:00:00`);
                  const maxDate = new Date(`${endYear}-12-31T23:59:59`);
                  if (selectedDate < minDate || selectedDate > maxDate) {
                    return Promise.reject(`Ngày khám phải nằm trong khoảng từ 01/01/${startYear} đến 31/12/${endYear}`);
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >


            <DatePicker
              selected={createDate}
              onChange={date => setCreateDate(date)}
              dateFormat="yyyy-MM-dd"
              minDate={(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })()}
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholderText="Chọn ngày khám"
            />
          </Form.Item>



          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setIsModalOpen(false)}
                style={{ marginRight: 8 }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
              >
                Tạo đợt khám
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Chỉnh sửa đợt khám"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditSubmit}
          initialValues={{}}
        >
          <Form.Item
            name="title"
            label="Tên đợt khám"
            rules={[{ required: true, message: 'Vui lòng nhập tên đợt khám' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Loại khám"
            rules={[{ required: true, message: 'Vui lòng nhập loại khám' }]}
          >
            <Input placeholder="VD: Khám sức khỏe định kỳ" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <TextArea rows={3} />
          </Form.Item>
          <Form.Item
            name="dateEvent"
            label="Ngày khám"
            rules={[
              {
                validator: (_, value) => {
                  if (!value) return Promise.reject('Vui lòng chọn ngày khám');
                  if (!isFutureDate(value)) return Promise.reject('Chỉ được chọn ngày lớn hơn ngày hôm nay');
                  return Promise.resolve();
                }
              }
            ]}
          >
            <DatePicker
              selected={editDate}
              onChange={date => setEditDate(date)}
              dateFormat="yyyy-MM-dd"
              className="w-full border border-gray-300 rounded px-3 py-2"
              placeholderText="Chọn ngày khám"
              minDate={(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d; })()}
            />
          </Form.Item>
          <Form.Item
            name="schoolYear"
            label="Năm học"
            rules={[
              {
                validator: (_, value) => {
                  const now = new Date();
                  const currentYear = now.getFullYear();
                  const maxYear = currentYear + 1;
                  const maxSchoolYear = `${maxYear}-${maxYear + 1}`;
                  if (!value || value.trim() === '') {
                    return Promise.reject('Năm học không được để trống.');
                  }
                  // Định dạng phải là YYYY-YYYY
                  if (!/^\d{4}-\d{4}$/.test(value)) {
                    return Promise.reject('Năm học phải có định dạng YYYY-YYYY (ví dụ: 2025-2026).');
                  }
                  const [start, end] = value.split('-').map(Number);
                  if (isNaN(start) || isNaN(end)) {
                    return Promise.reject('Năm học phải có định dạng YYYY-YYYY (ví dụ: 2025-2026).');
                  }
                  if (end !== start + 1) {
                    return Promise.reject('Năm học phải cách nhau đúng 1 năm (VD: 2025-2026).');
                  }
                  if (start > maxYear) {
                    return Promise.reject(`Năm học không được vượt quá ${maxSchoolYear}.`);
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input placeholder="VD: 2025-2026" />
          </Form.Item>
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setIsEditModalOpen(false)}
                style={{ marginRight: 8 }}
              >
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={editLoading}
              >
                Lưu thay đổi
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        visible={!!deletingEvent}
        title="Xác nhận xoá đợt khám"
        onCancel={cancelDelete}
        footer={null}
        centered
      >
        <p>Bạn có chắc chắn muốn xoá đợt khám <b>{deletingEvent?.title}</b> không?</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
          <Button onClick={cancelDelete} style={{ marginRight: 8 }}>
            Huỷ
          </Button>
          <Button type="primary" danger loading={deleteLoading} onClick={confirmDelete}>
            Xoá
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default ManageHealthcheck;