import { DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import { vaccineService, VaccineEvent, VaccinePayload } from '../../services/Vaccineservice';
import VaccineCreateModal from './Modal/VaccineCreateModal';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const Manage_vaccine: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [vaccineEvents, setVaccineEvents] = useState<VaccineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchGrade, setSearchGrade] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    open: boolean;
    event?: VaccineEvent;
  }>({ open: false });
  const [undeletableEvents, setUndeletableEvents] = useState<Set<string>>(new Set());

  const pageSize = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        let events = await vaccineService.getVaccineEvents();
        events = events.sort((a, b) => new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime());
        setVaccineEvents(events);

        const undeletable = new Set<string>();
        await Promise.all(
          events.map(async (event) => {
            try {
              const students: VaccinePayload[] = await vaccineService.getVaccineByName(
                event.vaccineName,
                String(event.grade),
                event.eventdate
              );
              if (
                students.some(
                  s => s.Status === 'Đã tiêm' || (s.note_affter_injection && s.note_affter_injection.trim() !== '')
                )
              ) {
                undeletable.add(`${event.vaccineName}_${event.grade}_${event.eventdate}`);
              }
            } catch (e) {
            }
          })
        );
        setUndeletableEvents(undeletable);
      } catch (error) {
        setVaccineEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleCreateNewEvent = () => {
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (data: { Vaccine_name: string, Vaccince_type: string, Date_injection: string, batch_number: string, Grade: string }) => {
    try {
      setIsLoading(true);
      await vaccineService.createVaccine(data);

      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out';
      notification.textContent = 'Tạo đợt tiêm thành công!';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      const events = await vaccineService.getVaccineEvents();
      setVaccineEvents(events);

      setIsModalOpen(false);
      return true;
    } catch (error) {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out';
      notification.textContent = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo đợt tiêm';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (event: VaccineEvent) => {
    setDeleteModal({ open: true, event });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ open: false });
  };

  const handleDeleteVaccineEvent = async () => {
    const event = deleteModal.event;
    if (!event) return;
    setDeleteLoading(`${event.vaccineName}_${event.grade}_${event.eventdate}`);
    try {
      const payload = {
        vaccineName: event.vaccineName,
        dateInjection: event.eventdate
      };
      console.log('Delete vaccine event payload:', payload);
      const res = await vaccineService.deleteVaccineByNameDateGrade(payload);
      if (res?.data?.deletedCount > 0) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out';
        notification.textContent = 'Xóa đợt tiêm thành công!';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);

        const events = await vaccineService.getVaccineEvents();
        setVaccineEvents(events);
        closeDeleteModal();
      } else {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out';
        notification.textContent = 'Không tìm thấy đợt tiêm để xóa hoặc đã bị xóa trước đó.';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    } catch (error: any) {
      const notification = document.createElement('div');
      notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out';
      notification.textContent = error instanceof Error ? error.message : 'Có lỗi xảy ra khi xóa đợt tiêm';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    } finally {
      setDeleteLoading(null);
    }
  };

  const gradeOptions = Array.from(new Set(vaccineEvents.map(e => e.grade))).sort();

  const filteredEvents = vaccineEvents.filter(event => {
    const matchesName = event.vaccineName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = searchDate
      ? formatDate(event.eventdate) === formatDate(searchDate)
      : true;
    const matchesGrade = searchGrade
      ? String(event.grade) === searchGrade
      : true;
    return matchesName && matchesDate && matchesGrade;
  });
  const paginatedEvents = filteredEvents.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  useEffect(() => {
    if (!searchDate) {
      setSelectedDate(null);
    } else {
      const d = new Date(searchDate);
      if (!isNaN(d.getTime())) setSelectedDate(d);
    }
  }, [searchDate]);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý tiêm chủng</h1>
        <button
          onClick={handleCreateNewEvent}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
        >
          Tạo mới đợt tiêm
        </button>
      </div>

      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <label className="block text-gray-700 font-medium mb-1 sm:mb-0 sm:mr-4" htmlFor="search-vaccine-event">
            Tìm kiếm đợt tiêm:
          </label>
          <input
            id="search-vaccine-event"
            type="text"
            className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            placeholder="Nhập tên đợt tiêm..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <label className="block text-gray-700 font-medium mb-1 sm:mb-0 sm:ml-4" htmlFor="search-vaccine-date">
            Ngày tiêm:
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={(date: Date | null) => {
              setSelectedDate(date);
              if (date) {
                const year = date.getFullYear();
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                const day = date.getDate().toString().padStart(2, '0');
                setSearchDate(`${year}-${month}-${day}`);
              } else {
                setSearchDate('');
              }
              setCurrentPage(1);
            }}
            dateFormat="dd/MM/yyyy"
            className="min-w-[200px] border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            placeholderText="Chọn ngày tiêm"
            id="search-vaccine-date"
            isClearable
          />
          <label className="block text-gray-700 font-medium mb-1 sm:mb-0 sm:ml-4" htmlFor="search-vaccine-grade">
            Khối:
          </label>
          <select
            id="search-vaccine-grade"
            className="w-full sm:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
            value={searchGrade}
            onChange={e => {
              setSearchGrade(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Tất cả</option>
            {gradeOptions.map(grade => (
              <option key={grade} value={grade}>Khối {grade}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
          <thead>
            <tr className="bg-gray-50">
              <th className="w-[5%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th className="w-[25%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên đợt tiêm</th>
              <th className="w-[20%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại vaccine</th>
              <th className="w-[15%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số lô</th>
              <th className="w-[10%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khối</th>
              <th className="w-[15%] px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày tiêm</th>
              <th className="w-[10%] px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredEvents.length > 0 ? (
              paginatedEvents.map((event, index) => (
                <tr
                  key={event.vaccineName + event.grade + event.eventdate}
                  className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer group"
                  // onClick={() =>
                  //   navigate(
                  //     `/nurse/vaccine-events/${encodeURIComponent(event.vaccineName)}/${event.grade}/${event.eventdate}`,
                  //     { state: { vaccineName: event.vaccineName, grade: event.grade, eventDate: event.eventdate, batch_number: event.batch_number } }
                  //   )
                  // }
                  title="Xem danh sách học sinh"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{event.vaccineName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{event.vaccineType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{event.batch_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Khối {event.grade}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(event.eventdate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center flex gap-5 items-center justify-center">
                    {/* Nút xem danh sách học sinh */}
                    <button
                      onClick={() =>
                        navigate(
                          `/nurse/vaccine-events/${encodeURIComponent(event.vaccineName)}/${event.grade}/${event.eventdate}`,
                          {
                            state: {
                              vaccineName: event.vaccineName,
                              grade: event.grade,
                              eventDate: event.eventdate,
                              batch_number: event.batch_number
                            }
                          }
                        )
                      }
                      title="Xem danh sách học sinh"
                    // className="text-blue-500 hover:text-blue-700 transition"
                    >
                      <EyeOutlined />
                    </button>

                    {/* Nút xóa đợt tiêm */}
                    {!undeletableEvents.has(`${event.vaccineName}_${event.grade}_${event.eventdate}`) ? (
                      <button
                        className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                        disabled={deleteLoading === `${event.vaccineName}_${event.grade}_${event.eventdate}`}
                        onClick={e => {
                          e.stopPropagation();
                          openDeleteModal(event);
                        }}
                        title="Xóa đợt tiêm"
                      >
                        <DeleteOutlined spin={deleteLoading === `${event.vaccineName}_${event.grade}_${event.eventdate}`} />
                      </button>
                    ) : (
                      <span className="text-gray-300 cursor-not-allowed" title="Không thể xóa vì đã có học sinh đã tiêm hoặc đã có ghi chú">
                        <DeleteOutlined />
                      </span>
                    )}
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  Không có dữ liệu đợt tiêm
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredEvents.length > pageSize && (
          <div className="flex justify-end items-center px-6 py-4 space-x-2">
            <button
              className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === 1 ? 'border-gray-200 text-gray-300 bg-white' : 'border-gray-300 text-gray-600 bg-white hover:border-blue-400 hover:text-blue-600'} transition`}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Trang trước"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span
              className="w-8 h-8 flex items-center justify-center rounded border border-blue-500 text-blue-600 bg-white font-semibold"
            >
              {currentPage}
            </span>
            <button
              className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === totalPages ? 'border-gray-200 text-gray-300 bg-white' : 'border-gray-300 text-gray-600 bg-white hover:border-blue-400 hover:to-blue-600'} transition`}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Trang sau"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <VaccineCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        vaccineTypes={[]}
        selectedVaccine={''}
      />

      {deleteModal.open && deleteModal.event && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-8 py-8 max-w-md w-full border border-red-300 animate-fade-in flex flex-col items-center relative">
            <button
              className="absolute top-3 right-3 p-2 rounded-full hover:bg-gray-100 transition"
              onClick={closeDeleteModal}
              aria-label="Đóng"
              disabled={!!deleteLoading}
            >
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex flex-col items-center">
              <div className="bg-red-100 rounded-full p-4 mb-4 shadow">
                <DeleteOutlined className="text-red-500" style={{ fontSize: 32 }} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa đợt tiêm chủng</h2>
              <div className="text-gray-700 text-center mb-6 leading-relaxed">
                <div>
                  Bạn có chắc chắn muốn <span className="font-semibold text-red-600">xóa đợt tiêm</span> này không?
                </div>
                <div className="mt-2 text-base">
                  <span className="font-medium">Tên:</span> {deleteModal.event.vaccineName}<br />
                  <span className="font-medium">Khối:</span> {deleteModal.event.grade}<br />
                  <span className="font-medium">Ngày tiêm:</span> {formatDate(deleteModal.event.eventdate)}
                </div>
                <div className="text-sm text-gray-500 mt-4">Hành động này không thể hoàn tác.</div>
              </div>
              <div className="flex gap-4 w-full justify-center mt-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
                  disabled={!!deleteLoading}
                >
                  Hủy
                </button>
                <button
                  onClick={handleDeleteVaccineEvent}
                  disabled={!!deleteLoading}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading ? 'Đang xóa...' : 'Xác nhận xóa'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Manage_vaccine;