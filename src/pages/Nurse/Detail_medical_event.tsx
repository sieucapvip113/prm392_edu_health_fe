import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Image, Button, Card, Row, Col, Descriptions, Tag, Spin, Alert, Divider } from 'antd';
import { ArrowLeft, Pencil, User, Stethoscope, Image as ImageIcon, FileText, PhoneCall, VideoIcon } from 'lucide-react';
import Modal_edit_medical_Event from './Modal/Modal_edit_medical_Event';
import { notificationService } from '../../services/NotificationService';
import { medicalEventService } from '../../services/MedicalEventService';

interface MedicalEventDetail {
  OrtherM_ID: number;
  Decription: string;
  Handle: string;
  Image: string | null;
  Video?: string | null;
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
    height: number;
    weight: number;
    bloodType: string;
    chronicDiseases: string;
    allergies: string;
    pastIllnesses?: string;
    historyHealth: string;
  };
  UserFullname?: string;
  guardian?: {
    fullname: string;
    phoneNumber: string;
    roleInFamily: string;
    address: string;
    isCallFirst: boolean;
  };
}

const Detail_medical_event: React.FC = () => {
  const [eventDetail, setEventDetail] = useState<MedicalEventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('updated') === 'true') {
      notificationService.success('Cập nhật sự kiện thành công', { autoClose: 3000 });
      setTimeout(() => {
        navigate(`/nurse/medical-events/detail/${id}`, { replace: true });
      }, 3000);
    }

    const fetchEventDetail = async () => {
      try {
        if (!id) return;
        const data = await medicalEventService.getMedicalEventById(id);
        const transformedData = {
          ...data,
          Medical_record: {
            ID: data.Medical_record.ID,
            userId: data.Medical_record.userId,
            Class: data.Medical_record.Class ?? '',
            height: data.Medical_record.height ?? 0,
            weight: data.Medical_record.weight ?? 0,
            bloodType: data.Medical_record.bloodType ?? '',
            chronicDiseases: data.Medical_record.chronicDiseases ?? '',
            allergies: data.Medical_record.allergies ?? '',
            pastIllnesses: data.Medical_record.pastIllnesses ?? '',
            historyHealth: data.Medical_record.historyHealth ?? '',
          },
        };
        setEventDetail(transformedData);
      } catch (error) {
        notificationService.error('Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };
    function fetchEventDetailWrapper() {
      fetchEventDetail();
    }
    fetchEventDetailWrapper();
  }, [id, navigate]);

  const handleGoBack = () => {
    navigate('/nurse/medical-events', { state: { from: 'medical-events' }, replace: true });
  };

  const handleEditSubmit = async (formData: any) => {
    try {
      if (!id) return;
      const response = await medicalEventService.updateMedicalEvent(id, formData);
      if (response.success) {
        setIsEditModalOpen(false);
        navigate(`/nurse/medical-events/detail/${id}?updated=true`, { replace: true });
        window.location.reload();
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error: any) {
      notificationService.error(error.message || 'Có lỗi xảy ra khi cập nhật sự kiện');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!eventDetail) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          message="Lỗi"
          description="Không tìm thấy thông tin sự kiện y tế."
          type="error"
          showIcon
          action={
            <Button onClick={() => navigate('/nurse/medical-events')}>
              Quay về danh sách
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50/50 min-h-screen">
      <header className="flex items-center justify-between mb-8">
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={handleGoBack}
        >
          Quay lại
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          Chi tiết sự kiện y tế
        </h1>
        <Button
          type="primary"
          icon={<Pencil size={16} />}
          onClick={() => setIsEditModalOpen(true)}
        >
          Chỉnh sửa
        </Button>
      </header>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={14}>
          <Card bordered={false} className="shadow-lg rounded-xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-blue-100 p-3 rounded-full">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">{eventDetail.UserFullname}</h2>
                <p className="text-gray-500">{eventDetail.Medical_record.Class}</p>
              </div>
            </div>

            <Divider orientation="left" className="text-gray-600 font-semibold">Thông tin phụ huynh</Divider>
            {eventDetail.guardian ? (
              <Descriptions bordered size="small" column={1}>
                <Descriptions.Item label="Họ tên">{eventDetail.guardian.fullname}</Descriptions.Item>
                <Descriptions.Item label="SĐT">{eventDetail.guardian.phoneNumber}</Descriptions.Item>
                <Descriptions.Item label="Vai trò">{eventDetail.guardian.roleInFamily}</Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">{eventDetail.guardian.address}</Descriptions.Item>
              </Descriptions>
            ) : <p className="text-gray-500 italic">Không có thông tin phụ huynh.</p>}

            <Divider orientation="left" className="text-gray-600 font-semibold mt-8">Tiền sử bệnh</Divider>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="Bệnh mãn tính">{eventDetail.Medical_record.chronicDiseases || 'Không có'}</Descriptions.Item>
              <Descriptions.Item label="Dị ứng">{eventDetail.Medical_record.allergies || 'Không có'}</Descriptions.Item>
              <Descriptions.Item label="Bệnh đã mắc">{eventDetail.Medical_record.pastIllnesses || 'Không có'}</Descriptions.Item>
            </Descriptions>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3 mt-8">
              <Stethoscope className="text-green-600" />
              Chi tiết sự kiện
            </h2>
            <Descriptions layout="vertical" bordered size="small">
              <Descriptions.Item label="Mô tả sự kiện" span={2}>{eventDetail.Decription}</Descriptions.Item>
              <Descriptions.Item label="Biện pháp xử lý" span={2}>{eventDetail.Handle}</Descriptions.Item>
              <Descriptions.Item label="Thời gian">
                {new Date(eventDetail.history[0].Date_create).toLocaleString('vi-VN')}
              </Descriptions.Item>
              <Descriptions.Item label="Gọi cho phụ huynh">
                <Tag
                  icon={<PhoneCall size={14} />}
                  color={eventDetail.Is_calLOb ? 'success' : 'error'}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  {eventDetail.Is_calLOb ? 'Đã gọi' : 'Không gọi'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>
          </Card>


        </Col>

        <Col xs={24} lg={10}>
          <Card bordered={false} className="shadow-lg rounded-xl ">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3">
              <ImageIcon className="text-purple-600" />
              Hình ảnh minh họa
            </h2>
            <div className="flex items-center justify-center w-full bg-gray-50 rounded-lg p-4 min-h-[400px]">
              {eventDetail.Image ? (
                <Image
                  src={eventDetail.Image}
                  alt="Event"
                  className="max-w-full max-h-[500px] object-contain rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="font-medium">Không có hình ảnh</p>
                </div>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3 mt-8">
              <VideoIcon className="text-red-500" />
              Video minh họa
            </h2>
            <div className="flex items-center justify-center w-full bg-gray-50 rounded-lg p-4 min-h-[300px]">
              {eventDetail.Video ? (
                <video
                  src={eventDetail.Video}
                  controls
                  className="w-full max-h-[400px] rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <FileText size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="font-medium">Không có video</p>
                </div>
              )}
            </div>
          </Card>

        </Col>
      </Row>

      <Modal_edit_medical_Event
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        existingData={eventDetail}
      />
    </div>
  );
};

export default Detail_medical_event;
