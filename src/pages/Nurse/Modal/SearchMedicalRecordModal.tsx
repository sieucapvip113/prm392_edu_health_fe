import React, { useState, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { getAllMedicalRecords, MedicalRecord as APIMedicalRecord } from '../../../services/MedicalRecordService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (info: APIMedicalRecord) => void; 
}

const SearchMedicalRecordModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<APIMedicalRecord[]>([]);
  const [allRecords, setAllRecords] = useState<APIMedicalRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    if (!isOpen) return;
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        const apiRecords = await getAllMedicalRecords(token);
        setAllRecords(apiRecords);
        setRecords(apiRecords);
        setCurrentPage(1); 
      } catch (err) {
        setAllRecords([]);
        setRecords([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, [isOpen]);

  const searchRecords = (term: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const filtered = allRecords.filter(record =>
        record.fullname.toLowerCase().includes(term.toLowerCase()) ||
        record.ID.toString().includes(term) ||
        record.Class.toLowerCase().includes(term.toLowerCase())
      );
      setRecords(filtered);
      setCurrentPage(1); 
      setIsLoading(false);
    }, 200); 
  };


  const totalPages = Math.ceil(records.length / rowsPerPage);
  const pagedRecords = records.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[1100]">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-900">Tìm kiếm hồ sơ y tế</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-6">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tìm theo tên học sinh, ID hồ sơ hoặc lớp..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              searchRecords(e.target.value);
            }}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Không tìm thấy kết quả
            </div>
          ) : (
            <div className="grid gap-2">
              {pagedRecords.map((record) => (
                <button
                  key={record.ID}
                  onClick={() => {
                    onSelect(record); 
                    onClose();
                  }}
                  className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors w-full text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900">{record.fullname}</p>
                    <p className="text-sm text-gray-500">Lớp: {record.Class}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-600">ID: {record.ID}</p>
                </button>
              ))}
            </div>
          )}
        </div>
        {records.length > 0 && (
          <div className="flex justify-center items-center gap-2 mt-4">
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Trước
            </button>
            <span className="text-sm">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded border text-sm disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchMedicalRecordModal;
