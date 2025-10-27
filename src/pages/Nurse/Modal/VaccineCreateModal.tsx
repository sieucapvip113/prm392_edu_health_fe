import React, { useState } from 'react';

interface VaccineCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { Vaccine_name: string, Vaccince_type: string, Date_injection: string, batch_number: string, Grade: string }) => boolean | Promise<boolean>;
  vaccineTypes: string[];
  selectedVaccine: string;
  resetTrigger?: number;
}

const VaccineCreateModal: React.FC<VaccineCreateModalProps> = ({
  isOpen,
  onClose,
  onSubmit,

  resetTrigger = 0
}) => {
  const [date, setDate] = useState('');
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineType, setVaccineType] = useState('');
  const [grade, setGrade] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  React.useEffect(() => {
    if (resetTrigger > 0 && !isOpen) {
      setVaccineName('');
      setVaccineType('');
      setDate('');
      setGrade('');
      setBatchNumber('');
    }
  }, [resetTrigger, isOpen]);



  const handleClose = () => {
    setShowWarning(false);
    onClose();
    setErrors({});
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!vaccineName) {
      newErrors.vaccineName = 'Tên vaccine không được để trống.';
    } else if (!vaccineName.toLowerCase().includes('vaccine')) {
      newErrors.vaccineName = 'Tên vaccine phải chứa từ "Vaccine".';
    } else if (vaccineName.length < 5) {
      newErrors.vaccineName = 'Tên vaccine phải có ít nhất 5 kí tự.';
    } else if (/^\d+$/.test(vaccineName)) {
      newErrors.vaccineName = 'Tên vaccine không được chỉ chứa chữ số.';
    }

    if (!vaccineType) {
      newErrors.vaccineType = 'Loại vaccine không được để trống.';
    } else if (vaccineType.length < 5) {
      newErrors.vaccineType = 'Loại vaccine phải có ít nhất 5 kí tự.';
    } else if (/^\d+$/.test(vaccineType)) {
      newErrors.vaccineType = 'Loại vaccine không được chỉ chứa chữ số.';
    }

    if (!batchNumber) {
      newErrors.batchNumber = 'Số lô không được để trống.';
    } else if (batchNumber.length < 5) {
      newErrors.batchNumber = 'Số lô phải có ít nhất 5 kí tự.';
    } else if (/^\d+$/.test(batchNumber)) {
      newErrors.batchNumber = 'Số lô không được chỉ chứa chữ số.';
    }
    if (!date) {
      newErrors.date = 'Ngày tiêm không được để trống.';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      if (selectedDate < today) {
        newErrors.date = 'Không được chọn ngày trong quá khứ.';
      }
    }
    if (!grade) newErrors.grade = 'Khối lớp không được để trống.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      setShowWarning(true);
    }
  };

  const handleConfirmCreate = async () => {
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        Vaccine_name: vaccineName,
        Vaccince_type: vaccineType,
        Date_injection: new Date(date).toISOString(),
        batch_number: batchNumber,
        Grade: grade
      });

      if (success) {
        setShowWarning(false);
      } else {
        setShowWarning(false);
      }
    } catch (error) {
      setShowWarning(false);
      console.error('Error creating vaccine:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
        onClick={handleClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">
              Tạo mới đợt tiêm chủng
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Vaccine <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vaccineName}
                onChange={(e) => setVaccineName(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                placeholder="Nhập tên vaccine (chứa từ 'Vaccine')"
                required
                disabled={isSubmitting}
              />
              {errors.vaccineName && <p className="text-red-500 text-xs mt-1">{errors.vaccineName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại Vaccine <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vaccineType}
                onChange={(e) => setVaccineType(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                placeholder="Nhập loại vaccine"
                required
                disabled={isSubmitting}
              />
              {errors.vaccineType && <p className="text-red-500 text-xs mt-1">{errors.vaccineType}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lô <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                placeholder="Nhập số lô vaccine"
                required
                disabled={isSubmitting}
              />
              {errors.batchNumber && <p className="text-red-500 text-xs mt-1">{errors.batchNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày tiêm <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={isSubmitting}
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Khối lớp <span className="text-red-500">*</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                required
                disabled={isSubmitting}
              >
                <option value="" disabled>Chọn khối lớp</option>
                <option value="1">Khối 1</option>
                <option value="2">Khối 2</option>
                <option value="3">Khối 3</option>
                <option value="4">Khối 4</option>
                <option value="5">Khối 5</option>
              </select>
              {errors.grade && <p className="text-red-500 text-xs mt-1">{errors.grade}</p>}
            </div>
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Tạo mới'}
            </button>
          </div>
        </div>
      </div>
      {showWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl px-13 py-10 max-w-lg w-full border border-red-300 animate-fade-in flex flex-col items-center relative">
            <div className="absolute top-3 right-3">
              <button
                onClick={() => setShowWarning(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition"
                aria-label="Đóng"
                disabled={isSubmitting}
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-red-100 rounded-full p-4 mb-4 shadow">
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Xác nhận tạo đợt tiêm chủng</h2>
              <div className="text-gray-700 text-center mb-6 leading-relaxed">
                <div style={{ whiteSpace: 'nowrap' }}>
                  Bạn có chắc chắn muốn <span className="font-semibold text-red-600">tạo mới đợt tiêm chủng</span> này không?
                </div>
                <div style={{ marginTop: "10px" }}>Hành động này sẽ gửi thông báo đến các học sinh thuộc khối lớp đã chọn.</div>
                <div className="text-sm text-gray-500" style={{ marginTop: "10px" }}>Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.</div>
              </div>
              <div className="flex gap-4 w-full justify-center mt-2">
                <button
                  onClick={() => setShowWarning(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
                  disabled={isSubmitting}
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmCreate}
                  disabled={isSubmitting}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow hover:from-red-600 hover:to-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VaccineCreateModal;