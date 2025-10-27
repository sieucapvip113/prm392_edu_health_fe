import React, { useEffect, useState } from 'react';
import { Button, Select, Modal, Input } from 'antd';
import { getAllMedicalRecords, MedicalRecord } from '../../services/MedicalRecordService';
import { notificationService } from '../../services/NotificationService';
import { Eye, Stethoscope, Heart, UserCircle, Activity } from 'lucide-react';

const { Option } = Select;

const ManageHealthRecords: React.FC = () => {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('Tất cả');
  const [loading, setLoading] = useState(false);

  const [searchName, setSearchName] = useState<string>('');

  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const fetchMedicalRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const records = await getAllMedicalRecords(token);
      setMedicalRecords(records);
      const uniqueClasses = Array.from(
        new Set(records.map((record) => record.Class)),
      );
      setClasses(uniqueClasses);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu sổ sức khỏe:', error);
      notificationService.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const showViewModal = (record: MedicalRecord) => {
    setViewingRecord(record);
    setIsViewModalOpen(true);
  };

  const filteredRecords =
    selectedClass === 'Tất cả'
      ? medicalRecords
      : medicalRecords.filter((record) => record.Class === selectedClass);

  const nameFilteredRecords = filteredRecords.filter(record => {
    if (!searchName.trim()) return true;
    return record.fullname.toLowerCase().includes(searchName.toLowerCase().trim());
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý sổ sức khỏe</h1>
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Lớp:</span>
            <Select
              value={selectedClass}
              onChange={(val) => setSelectedClass(val)}
              style={{ width: 200 }}
              className="min-w-[200px]"
            >
              <Option value="Tất cả">Tất cả</Option>
              {classes.map((className) => (
                <Option key={className} value={className}>
                  {className}
                </Option>
              ))}
            </Select>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-700">Tên học sinh:</span>
            <div className="relative">
              <Input
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="Tìm kiếm theo tên học sinh..."
                className="min-w-[280px] pl-10"
                allowClear
                style={{
                  height: '40px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Họ và tên</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày sinh</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giới tính</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhóm máu</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chiều cao (cm)</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cân nặng (kg)</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">Đang tải dữ liệu...</td>
              </tr>
            ) : nameFilteredRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-8 text-gray-500">Không có dữ liệu</td>
              </tr>
            ) : (
              nameFilteredRecords.map((record, index) => (
                <tr
                  key={record.ID}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">
                      {record.fullname}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(record.dateOfBirth).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.Class}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.bloodType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.height}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.weight}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => showViewModal(record)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        title="Xem chi tiết"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={
          <div className="flex items-center space-x-3 border-b pb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Eye className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Chi tiết sổ sức khỏe</h3>
              <p className="text-sm text-gray-500">Thông tin chi tiết của học sinh</p>
            </div>
          </div>
        }
        open={isViewModalOpen}
        onCancel={() => setIsViewModalOpen(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setIsViewModalOpen(false)}
          // className="bg-gray-600 hover:bg-gray-700 border-gray-600 text-white"
          >
            Đóng
          </Button>
        ]}
        width={900}
        className="medical-record-modal"
      >
        {viewingRecord && (
          <div className="space-y-6 pt-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                  <UserCircle className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-blue-900">Thông tin cơ bản</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-24">Họ tên:</span>
                    <span className="text-gray-900 font-semibold">{viewingRecord.fullname}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-24">Giới tính:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${viewingRecord.gender === 'Nam'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-pink-100 text-pink-800'
                      }`}>
                      {viewingRecord.gender}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-24">Lớp:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {viewingRecord.Class}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-24">Ngày sinh:</span>
                    <span className="text-gray-900">{new Date(viewingRecord.dateOfBirth).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-24">Nhóm máu:</span>
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                      {viewingRecord.bloodType}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-green-900">Chỉ số cơ thể</h4>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{viewingRecord.height}</div>
                    <div className="text-sm text-gray-600">cm</div>
                    <div className="text-xs text-gray-500 mt-1">Chiều cao</div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{viewingRecord.weight}</div>
                    <div className="text-sm text-gray-600">kg</div>
                    <div className="text-xs text-gray-500 mt-1">Cân nặng</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mr-3">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-orange-900">Thông tin y tế</h4>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-32 flex-shrink-0">Bệnh mãn tính:</span>
                    <div className="flex-1">
                      {viewingRecord.chronicDiseases ? (
                        <div className="flex flex-wrap gap-2">
                          {viewingRecord.chronicDiseases.split(',').map((disease, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {disease.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Không có</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-32 flex-shrink-0">Dị ứng:</span>
                    <div className="flex-1">
                      {viewingRecord.allergies ? (
                        <div className="flex flex-wrap gap-2">
                          {viewingRecord.allergies.split(',').map((allergy, index) => (
                            <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                              {allergy.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Không có</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {viewingRecord.vaccines && viewingRecord.vaccines.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg p-6 border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-purple-900">Lịch sử tiêm chủng</h4>
                </div>
                <div className="bg-white rounded-lg border border-purple-200">
                  <div className="overflow-hidden">
                    <table className="min-w-full">
                      <thead className="bg-purple-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-800 uppercase">Tên vaccine</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-800 uppercase">Ngày tiêm</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-purple-800 uppercase">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-200">
                        {viewingRecord.vaccines.map((vaccine, index) => (
                          <tr key={index} className="hover:bg-purple-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{vaccine.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{vaccine.date}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${vaccine.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : vaccine.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                                }`}>
                                {vaccine.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {viewingRecord.guardian && (
              <div className="bg-gradient-to-r from-cyan-50 to-sky-50 rounded-lg p-6 border border-cyan-200">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center mr-3">
                    <UserCircle className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-cyan-900">Thông tin phụ huynh</h4>
                </div>
                <div className="bg-white rounded-lg p-4 border border-cyan-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-28">Họ tên:</span>
                        <span className="text-gray-900">{viewingRecord.guardian.fullname}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-28">Quan hệ:</span>
                        <span className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm">
                          {viewingRecord.guardian.roleInFamily}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-28">Điện thoại:</span>
                        <span className="text-gray-900 font-medium">{viewingRecord.guardian.phoneNumber}</span>
                      </div>
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 w-28">Địa chỉ:</span>
                        <span className="text-gray-900">{viewingRecord.guardian.address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageHealthRecords;