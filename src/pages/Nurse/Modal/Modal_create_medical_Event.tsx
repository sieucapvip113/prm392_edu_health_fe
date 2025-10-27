import React, { useState, useEffect } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import SearchMedicalRecordModal from './SearchMedicalRecordModal';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

interface FormData {
  ID: string;
  Decription: string;
  Handle: string;
  Image: File | null;
  Video: File | null;
  Is_calLOb: boolean;
}

interface StudentGuardianInfo {
  ID: number;
  fullname: string;
  Class: string;
  height: number;
  weight: number;
  bloodType: string;
  chronicDiseases: string;
  allergies: string;
  pastIllnesses?: string;
  guardian?: {
    fullname: string;
    phoneNumber: string;
    roleInFamily: string;
    address: string;
    isCallFirst: boolean;
  };
}

const Modal_create_medical_Event: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<FormData>({
    ID: '',
    Decription: '',
    Handle: '',
    Image: null,
    Video: null,
    Is_calLOb: false
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState<StudentGuardianInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, Image: file }));

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const initialFormData = {
    ID: '',
    Decription: '',
    Handle: '',
    Image: null,
    Video: null,
    Is_calLOb: false
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.ID) {
      setErrorMessage('Vui lòng chọn một hồ sơ y tế học sinh.');
      return;
    }
    if (!formData.Decription.trim() || formData.Decription.trim().length < 10) {
      setErrorMessage('Vui lòng nhập mô tả sự kiện và đảm bảo có ít nhất 10 kí tự.');
      return;
    }
    if (/^\d+$/.test(formData.Decription.trim())) {
      setErrorMessage('Mô tả sự kiện không được chỉ chứa chữ số.');
      return;
    }
    if (!formData.Handle.trim() || formData.Handle.trim().length < 10) {
      setErrorMessage('Vui lòng nhập biện pháp xử lý và đảm bảo có ít nhất 10 kí tự.');
      return;
    }
    if (/^\d+$/.test(formData.Handle.trim())) {
      setErrorMessage('Biện pháp xử lý không được chỉ chứa chữ số.');
      return;
    }
    if (!formData.Image) {
      setErrorMessage('Vui lòng tải lên hình ảnh.');
      return;
    }
    if (formData.Video) {
      if (formData.Video.size > 50 * 1024 * 1024) {
        setErrorMessage('Video quá lớn. Vui lòng chọn file tối đa 50 MB.');
        return;
      }
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      resetForm();
    } catch (err: any) {
      const msg = err?.message || (err?.error && err.error.message) || 'Có lỗi xảy ra';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSelectRecord = (info: StudentGuardianInfo) => {
    setSelectedInfo(info);
    setFormData(prev => ({ ...prev, ID: info.ID.toString() }));
    setShowSearch(false);
  };

  useEffect(() => {
    if (isOpen) {
      setSelectedInfo(null);
      setFormData(initialFormData);
      setPreviewUrl(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-7xl mx-auto shadow-2xl transform transition-all max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-2xl font-bold text-gray-900">Tạo sự kiện y tế mới</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>


        <div className="flex flex-col lg:flex-row overflow-hidden">
          <div className="lg:w-2/5 w-full p-6 bg-gray-50/50 border-r border-gray-200">
            <div className="h-full flex flex-col">
              <label className="block text-lg font-semibold text-gray-800 mb-4">
                Thông tin học sinh & phụ huynh <span className="text-red-500">*</span>
              </label>

              {selectedInfo ? (
                <div className="border rounded-xl p-5 bg-gradient-to-br from-blue-50 to-white shadow-sm relative flex-1 overflow-y-auto max-h-[calc(90vh-200px)]">
                  <button
                    type="button"
                    onClick={() => { setSelectedInfo(null); setFormData(prev => ({ ...prev, ID: '' })); }}
                    className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm z-10"
                    title="Chọn lại hồ sơ"
                  >
                    <X size={16} />
                  </button>

                  <div className="space-y-4 pr-8">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-3 text-base border-b border-blue-200 pb-2">
                        Thông tin học sinh
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex flex-wrap">
                          <span className="font-medium text-gray-700 w-20 flex-shrink-0">Tên:</span>
                          <span className="text-gray-900 font-semibold flex-1">{selectedInfo.fullname}</span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="font-medium text-gray-700 w-20 flex-shrink-0">Lớp:</span>
                          <span className="text-gray-900 flex-1">{selectedInfo.Class}</span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="font-medium text-gray-700 w-20 flex-shrink-0">Chiều cao:</span>
                          <span className="text-gray-900 flex-1">{selectedInfo.height} cm</span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="font-medium text-gray-700 w-20 flex-shrink-0">Cân nặng:</span>
                          <span className="text-gray-900 flex-1">{selectedInfo.weight} kg</span>
                        </div>
                        <div className="flex flex-wrap">
                          <span className="font-medium text-gray-700 w-20 flex-shrink-0">Nhóm máu:</span>
                          <span className="text-gray-900 font-semibold text-red-600 flex-1">{selectedInfo.bloodType}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 block mb-1">Bệnh mãn tính:</span>
                          <p className="text-gray-900 bg-yellow-50 p-2 rounded border text-sm">{selectedInfo.chronicDiseases}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 block mb-1">Dị ứng:</span>
                          <p className="text-gray-900 bg-red-50 p-2 rounded border text-sm">{selectedInfo.allergies}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700 block mb-1">Tiền sử bệnh:</span>
                          <p className="text-gray-900 bg-blue-50 p-2 rounded border text-sm">{selectedInfo.pastIllnesses || 'Không'}</p>
                        </div>
                      </div>
                    </div>
                    {selectedInfo.guardian && (
                      <div>
                        <h4 className="font-semibold text-green-800 mb-3 text-base border-b border-green-200 pb-2">
                          Thông tin phụ huynh
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex flex-wrap">
                            <span className="font-medium text-gray-700 w-16 flex-shrink-0">Tên:</span>
                            <span className="text-gray-900 font-semibold flex-1">{selectedInfo.guardian.fullname}</span>
                          </div>
                          <div className="flex flex-wrap">
                            <span className="font-medium text-gray-700 w-16 flex-shrink-0">SĐT:</span>
                            <span className="text-gray-900 font-mono flex-1">{selectedInfo.guardian.phoneNumber}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 block mb-1">Địa chỉ:</span>
                            <p className="text-gray-900 break-words bg-gray-50 p-2 rounded border text-sm">{selectedInfo.guardian.address}</p>
                          </div>
                          <div className="flex flex-wrap">
                            <span className="font-medium text-gray-700 w-16 flex-shrink-0">Vai trò:</span>
                            <span className="text-gray-900 flex-1">{selectedInfo.guardian.roleInFamily}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="relative flex-1 flex items-center">
                  <div className="w-full">
                    <input
                      type="text"
                      value={formData.ID}
                      readOnly
                      placeholder="Nhấn để chọn hồ sơ y tế học sinh"
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer hover:border-blue-400 transition-colors text-center text-gray-500"
                      onClick={() => setShowSearch(true)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSearch(true)}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                      tabIndex={-1}
                    >
                      <Search className="w-6 h-6 text-gray-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="lg:w-3/5 w-full p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Mô tả sự kiện <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.Decription}
                    onChange={e => setFormData(prev => ({ ...prev, Decription: e.target.value }))}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[140px] resize-none transition-colors"
                    placeholder="Mô tả chi tiết về sự kiện y tế..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Biện pháp xử lý <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.Handle}
                    onChange={e => setFormData(prev => ({ ...prev, Handle: e.target.value }))}
                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[140px] resize-none transition-colors"
                    placeholder="Mô tả các biện pháp đã thực hiện..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Hình ảnh  <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-col items-center justify-center w-full">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-[250px] rounded-xl shadow-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewUrl(null);
                          setFormData(prev => ({ ...prev, Image: null }));
                        }}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Nhấn để tải ảnh lên</span>
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, JPEG (Tối đa 5MB)</p>
                      </div>
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">
                  Video minh họa (nếu có)
                </label>
                <div className="flex flex-col items-center justify-center w-full">
                  {formData.Video ? (
                    <div className="relative w-full max-w-full">
                      <video
                        controls
                        src={URL.createObjectURL(formData.Video)}
                        className="w-full max-h-[300px] rounded-xl shadow-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, Video: null }));
                        }}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Nhấn để tải video lên</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          MP4, MOV, AVI
                        </p>
                        <p className="text-xs text-red-500 font-semibold">
                          🔴 Tối đa 50 MB
                        </p>
                      </div>
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // if (file.size > 50 * 1024 * 1024) {
                          //   e.target.value = '';
                          //   setFormData(prev => ({ ...prev, Video: null }));
                          //   return;
                          // }

                          setFormData(prev => ({ ...prev, Video: file }));
                        }}
                        accept="video/*"
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>


              <div className="flex items-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                <input
                  type="checkbox"
                  checked={formData.Is_calLOb}
                  onChange={e => setFormData(prev => ({ ...prev, Is_calLOb: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Gọi điện thông báo cho phụ huynh
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo sự kiện'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {showSearch && (
        <SearchMedicalRecordModal
          isOpen={showSearch}
          onClose={() => setShowSearch(false)}
          onSelect={handleSelectRecord}
        />
      )}
    </div>
  );
};

export default Modal_create_medical_Event;
