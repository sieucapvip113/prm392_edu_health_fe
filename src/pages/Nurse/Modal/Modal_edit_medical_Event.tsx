import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
  existingData: {
    OrtherM_ID: number;
    Decription: string;
    Handle: string;
    Image: string | null;
    Is_calLOb: boolean;
    history: {
      ID: number;
      OrtherM_ID: number;
      MR_ID: number;
      Date_create: string;
      Creater_by: string | null;
    }[];
    Medical_record: {
      ID: number;
      userId: number;
      Class: string;
      historyHealth: string;
    };
    UserFullname?: string;
  } | null;
}

interface FormData {
  MR_ID: string;
  Decription: string;
  Handle: string;
  Image: File | null;
  Is_calLOb: boolean;
}

const Modal_edit_medical_Event: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, existingData }) => {
  const [formData, setFormData] = useState<FormData>({
    MR_ID: '',
    Decription: '',
    Handle: '',
    Image: null,
    Is_calLOb: false
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (existingData) {
      setFormData({
        MR_ID: String(existingData.Medical_record.ID),
        Decription: existingData.Decription,
        Handle: existingData.Handle,
        Image: null,
        Is_calLOb: existingData.Is_calLOb
      });
      setPreviewUrl(existingData.Image);
      setErrors({});
    }
  }, [existingData]);

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
      if (previewUrl && previewUrl !== existingData?.Image) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, existingData]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.Decription.trim()) {
      newErrors.Decription = 'Vui lòng nhập mô tả sự kiện.';
    } else if (formData.Decription.trim().length < 10) {
      newErrors.Decription = 'Mô tả sự kiện phải có ít nhất 10 ký tự.';
    } else if (/^\d+$/.test(formData.Decription.trim())) {
      newErrors.Decription = 'Mô tả sự kiện không được chỉ chứa chữ số.';
    }

    if (!formData.Handle.trim()) {
      newErrors.Handle = 'Vui lòng nhập biện pháp xử lý.';
    } else if (formData.Handle.trim().length < 10) {
      newErrors.Handle = 'Biện pháp xử lý phải có ít nhất 10 ký tự.';
    } else if (/^\d+$/.test(formData.Handle.trim())) {
      newErrors.Handle = 'Biện pháp xử lý không được chỉ chứa chữ số.';
    }

    if (!previewUrl) {
      newErrors.Image = 'Vui lòng tải lên hình ảnh.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-2xl mx-4 shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa sự kiện y tế</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {Object.keys(errors).length > 0 && !errors.Decription && !errors.Handle && !errors.Image && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              Vui lòng sửa các lỗi dưới đây.
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ID Hồ sơ y tế
            </label>
            <input
              type="text"
              value={formData.MR_ID}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sự kiện <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.Decription}
                onChange={e => setFormData(prev => ({ ...prev, Decription: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] resize-none"
                placeholder="Nhập mô tả sự kiện..."
              />
              {errors.Decription && <p className="text-red-500 text-xs mt-1">{errors.Decription}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Biện pháp xử lý <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.Handle}
                onChange={e => setFormData(prev => ({ ...prev, Handle: e.target.value }))}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] resize-none"
                placeholder="Nhập biện pháp xử lý..."
              />
              {errors.Handle && <p className="text-red-500 text-xs mt-1">{errors.Handle}</p>}
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Hình ảnh <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col items-center justify-center w-full">
              {previewUrl ? (
                <div className="mb-4 relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-[300px] max-h-[200px] rounded-lg shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setFormData(prev => ({ ...prev, Image: null }));
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click để tải ảnh lên</span>
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG (MAX. 800x400px)</p>
                  </div>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              )}
              {errors.Image && <p className="text-red-500 text-xs mt-1">{errors.Image}</p>}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.Is_calLOb}
              onChange={e => setFormData(prev => ({ ...prev, Is_calLOb: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Gọi điện cho phụ huynh
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/30 font-medium"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal_edit_medical_Event;
