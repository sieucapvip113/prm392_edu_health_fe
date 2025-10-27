import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Table, Card, Row, Col, Statistic, Spin, Tag, Modal, Form, Input, Switch, Space, Upload } from 'antd';
import { ArrowLeft, Users, CheckCircle, Clock, AlertCircle, Edit } from 'lucide-react';
import { healthCheckService, HealthCheckForm, SubmitHealthCheckResultRequest } from '../../services/Healthcheck';
import { notificationService } from '../../services/NotificationService';
import { UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;

declare global {
  interface Window {
    __healthCheckCheckedNotified?: boolean;
  }
}

const HealthCheckStudents: React.FC = () => {
  const { hcId } = useParams<{ hcId: string }>();
  const navigate = useNavigate();
  const { Dragger } = Upload;

  const [students, setStudents] = useState<HealthCheckForm[]>([]);
  const [healthEventDetail, setHealthEventDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    confirmed: 0,
    pending: 0,
    reject: 0
  });

  // Modal states
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<HealthCheckForm | null>(null);
  const [resultForm] = Form.useForm();
  const [submittingResult, setSubmittingResult] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sendAllModalVisible, setSendAllModalVisible] = useState(false);
  const [studentsNotCompleted, setStudentsNotCompleted] = useState<HealthCheckForm[]>([]);
  const [sendingAll, setSendingAll] = useState(false);
  const [viewOnly, setViewOnly] = useState(false);


  useEffect(() => {
    if (hcId) {
      fetchData();
    }
  }, [hcId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsData, healthEventDetailRes] = await Promise.all([
        healthCheckService.getStudentsByHealthCheck(parseInt(hcId!)),
        healthCheckService.getHealthCheckById(parseInt(hcId!))
      ]);

      setStudents(studentsData.data);
      setHealthEventDetail(healthEventDetailRes.data);
      // Calculate stats
      const total = studentsData.data.length;
      const confirmed = studentsData.data.filter(s => s.status === 'approved').length;
      const pending = studentsData.data.filter(s => s.status === 'pending' || !s.status).length;
      const reject = studentsData.data.filter(s => s.status === 'rejected').length;

      setStats({
        total,
        confirmed,
        pending,
        reject
      });

      // Nếu trạng thái đã là 'checked', chỉ thông báo một lần khi vào detail
      if (
        healthEventDetailRes.data &&
        typeof healthEventDetailRes.data === 'object' &&
        'status' in healthEventDetailRes.data &&
        (healthEventDetailRes.data as any).status === 'checked' &&
        !window.__healthCheckCheckedNotified
      ) {
        notificationService.success('Tất cả học sinh đã được nhập kết quả. Đợt khám đã kết thúc!');
        window.__healthCheckCheckedNotified = true;
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      notificationService.error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputResult = async (student: HealthCheckForm, viewOnly = false) => {
    setSelectedStudent(student);
    setViewOnly(viewOnly);
    setIsEditMode(false);

    try {
      // Check if result already exists
      const existingResult = await healthCheckService.getHealthCheckResult(parseInt(hcId!), student.Student_ID);
      // Kiểm tra thực sự có dữ liệu kết quả khám
      const hasResult =
        existingResult &&
        (
          existingResult.Height !== null ||
          existingResult.Weight !== null ||
          !!existingResult.Blood_Pressure ||
          existingResult.Vision_Left !== null ||
          existingResult.Vision_Right !== null ||
          !!existingResult.Dental_Status ||
          !!existingResult.ENT_Status ||
          !!existingResult.Skin_Status ||
          !!existingResult.General_Conclusion
        );
      resultForm.setFieldsValue({
        height: existingResult.Height,
        weight: existingResult.Weight,
        blood_pressure: existingResult.Blood_Pressure,
        vision_left: existingResult.Vision_Left,
        vision_right: existingResult.Vision_Right,
        dental_status: existingResult.Dental_Status,
        ent_status: existingResult.ENT_Status,
        skin_status: existingResult.Skin_Status,
        general_conclusion: existingResult.General_Conclusion,
        is_need_meet: existingResult.Is_need_meet,
        image: existingResult?.image
          ? [{
            uid: '-1',
            name: 'ảnh khám',
            status: 'done',
            url: existingResult.image
          }]
          : []
      });
      setIsEditMode(!!hasResult);
    } catch (error) {
      // Không có kết quả cũ, giữ nguyên isEditMode=false
      resultForm.setFieldsValue({
        height: undefined,
        weight: undefined,
        blood_pressure: '',
        vision_left: undefined,
        vision_right: undefined,
        dental_status: '',
        ent_status: '',
        skin_status: '',
        general_conclusion: '',
        is_need_meet: false,
        image: undefined
      });
      setIsEditMode(false);
    }

    setResultModalVisible(true);
  };

  const handleSubmitResult = async (values: any) => {
    if (!selectedStudent || !hcId) return;
    console.log('Existing result found:', values.image);

    const fileList = values.image as any[];
    const file: File = fileList[0].originFileObj;

    setSubmittingResult(true);
    try {
      const payload: SubmitHealthCheckResultRequest = {
        student_id: selectedStudent.Student_ID,
        height: values.height,
        weight: values.weight,
        blood_pressure: values.blood_pressure,
        vision_left: values.vision_left,
        vision_right: values.vision_right,
        dental_status: values.dental_status,
        ent_status: values.ent_status,
        skin_status: values.skin_status,
        general_conclusion: values.general_conclusion,
        is_need_meet: values.is_need_meet,
        image: file,

      };
      console.log('Submitting health check result:', payload);

      if (isEditMode) {
        await healthCheckService.updateHealthCheckResult(parseInt(hcId), selectedStudent.Student_ID, payload);
        notificationService.success('Cập nhật kết quả khám thành công!');
        // Reset sent status when updating
      } else {
        await healthCheckService.submitHealthCheckResult(parseInt(hcId), payload);
        notificationService.success('Nhập kết quả khám thành công!');
      }

      setResultModalVisible(false);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error submitting result:', error);
      notificationService.error('Có lỗi xảy ra khi nhập kết quả khám');
    } finally {
      setSubmittingResult(false);
    }
  };

  // Hàm gửi kết quả cho tất cả học sinh
  const handleSendAllResults = () => {
    // Lấy danh sách học sinh approved chưa nhập đủ kết quả
    const notCompleted = students.filter(s =>
      s.status === 'approved' &&
      !(
        s.Height !== null ||
        s.Weight !== null ||
        s.Blood_Pressure ||
        s.Vision_Left !== null ||
        s.Vision_Right !== null ||
        s.Dental_Status ||
        s.ENT_Status ||
        s.Skin_Status ||
        s.General_Conclusion
      )
    );
    setStudentsNotCompleted(notCompleted);
    console.log('Students not completed:', notCompleted);
    if (notCompleted.length > 0) {
      setSendAllModalVisible(true);
    } else {
      sendAllResults();
    }
  };

  const sendAllResults = async () => {
    if (!hcId) return;
    setSendingAll(true);
    try {
      await healthCheckService.sendHealthCheckResult(parseInt(hcId));
      notificationService.success('Đã gửi kết quả khám về phụ huynh!');
      navigate('/nurse/healthcheck'); // Quay lại danh sách đợt khám để reload trạng thái
    } catch (error) {
      notificationService.error('Có lỗi xảy ra khi gửi kết quả khám');
    } finally {
      setSendingAll(false);
      setSendAllModalVisible(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Họ và tên',
      dataIndex: ['Student', 'fullname'],
      key: 'fullname',
      render: (text: string) => (
        <div className="font-medium text-gray-900">{text}</div>
      ),
    },
    {
      title: 'Lớp',
      dataIndex: ['Student', 'Class'],
      key: 'Class',
      render: (text: string) => (
        <div className="font-medium text-gray-900">{text}</div>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: ['Student', 'dateOfBirth'],
      key: 'dateOfBirth',
      render: (text: string) => (
        <div className="font-medium text-gray-900">{text}</div>
      ),
    },
    {
      title: 'Giới tính',
      dataIndex: ['Student', 'gender'],
      key: 'gender',
      render: (text: string) => (
        <div className="text-gray-600">{text}</div>
      ),
    },
    {
      title: 'Phụ huynh',
      key: 'guardians',
      render: (record: HealthCheckForm) => {
        const guardians = record.Student.Guardians;
        if (guardians && guardians.length > 0) {
          return (
            <div className="space-y-1">
              {guardians.map((guardian, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-gray-700">{guardian.fullName}</div>
                  <div className="text-gray-500">{guardian.phoneNumber}</div>
                </div>
              ))}
            </div>
          );
        }
        return <span className="text-gray-400">Chưa có thông tin</span>;
      },
    },
    {
      title: 'Trạng thái xác nhận',
      key: 'confirmation',
      render: (record: HealthCheckForm) => {
        let color = 'orange';
        let text = 'Chờ xác nhận';
        let icon = <Clock className="w-3 h-3" />;
        if (record.status === 'approved' || record.status === 'checked') {
          color = 'green';
          text = 'Đã xác nhận';
          icon = <CheckCircle className="w-3 h-3" />;
        } else if (record.status === 'rejected') {
          color = 'red';
          text = 'Từ chối';
          icon = <AlertCircle className="w-3 h-3" />;
        }
        return (
          <Tag
            color={color}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              minWidth: '100px'
            }}
          >
            {icon} {text}
          </Tag>
        );
      },
    },
    {
      title: 'Cần gặp',
      key: 'needMeet',
      render: (record: HealthCheckForm) => (
        <Tag
          color={record.Is_need_meet ? 'red' : 'default'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '500',
            minWidth: '80px'
          }}
        >
          {record.Is_need_meet ? (
            <>
              <AlertCircle className="w-3 h-3" />
              Cần gặp
            </>
          ) : (
            <>
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              Bình thường
            </>
          )}
        </Tag>
      ),
    },
    {
      title: 'Kết quả khám',
      key: 'results',
      render: (record: HealthCheckForm) => {
        const hasResults = record.Height || record.Weight || record.Blood_Pressure ||
          record.Vision_Left || record.Vision_Right || record.Dental_Status ||
          record.ENT_Status || record.Skin_Status || record.General_Conclusion;

        return (
          <Tag
            color={hasResults ? 'blue' : 'default'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              minWidth: '80px'
            }}
          >
            {hasResults ? (
              <>
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                Đã khám
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                Chưa khám
              </>
            )}
          </Tag>
        );
      },
    },
    {
      title: 'Ngày tạo',
      key: 'createdAt',
      render: (record: HealthCheckForm) => (
        <div className="text-sm text-gray-500">
          {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : ''}
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (record: HealthCheckForm) => {
        const canInputResult =
          (record.status === 'approved' || record.status === 'checked') &&
          healthEventDetail &&
          typeof healthEventDetail === 'object' &&
          ('status' in healthEventDetail ? (healthEventDetail as any).status !== 'checked' : true) &&
          healthEventDetail.status === 'in progress';
        const hasResult = record.Height || record.Weight || record.Blood_Pressure;
        const isChecked = record.status === 'checked';

        return (
          <Space>
            {canInputResult && !hasResult && (
              <Button
                type="primary"
                size="small"
                icon={<Edit className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInputResult(record);
                }}
              >
                Nhập kết quả khám
              </Button>
            )}

            {canInputResult && hasResult && (
              <Button
                type="default"
                size="small"
                icon={<Edit className="w-3 h-3" />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleInputResult(record);
                }}
              >
                Chỉnh sửa kết quả
              </Button>
            )}

            {isChecked && hasResult && (
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleInputResult(record, true);
                }}
              >
                Xem chi tiết
              </Button>
            )}

            {canInputResult && hasResult && (
              isChecked ? (
                <Tag color="green" style={{ margin: 0 }}>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Đã gửi
                </Tag>
              ) : null // Ẩn nút gửi kết quả từng học sinh
            )}
          </Space>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/nurse/healthcheck')}
            className="flex items-center"
          >
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Danh sách học sinh - {healthEventDetail?.title}
            </h1>
            <p className="text-gray-600">
              Năm học: {healthEventDetail?.schoolYear} | Ngày khám: {healthEventDetail?.dateEvent ? new Date(healthEventDetail.dateEvent).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số học sinh"
              value={stats.total}
              prefix={<Users className="w-5 h-5 text-blue-500" />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã xác nhận"
              value={stats.confirmed}
              prefix={<CheckCircle className="w-5 h-5 text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chờ xác nhận"
              value={stats.pending}
              prefix={<Clock className="w-5 h-5 text-orange-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Từ chối"
              value={stats.reject}
              prefix={<AlertCircle className="w-5 h-5 text-red-500" />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Nút gửi kết quả chung */}
      {healthEventDetail?.status === 'in progress' && (
        <Button
          type="primary"
          onClick={handleSendAllResults}
          loading={sendingAll}
          style={{ marginBottom: 16 }}
        >
          Gửi kết quả
        </Button>
      )}

      {/* Students Table */}
      <Card title="Danh sách học sinh" className="shadow-sm">
        <Table
          columns={columns}
          dataSource={students}
          rowKey="Form_ID"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} học sinh`,
          }}
          scroll={{ x: 1200 }}
          className="custom-table"
        />
      </Card>

      {/* Result Input Modal */}
      <Modal
        title={`Kết quả khám sức khoẻ - ${selectedStudent?.Student?.fullname}`}
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={resultForm}
          layout="vertical"
          onFinish={handleSubmitResult}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="height"
                label="Chiều cao (cm)"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === '') return Promise.reject('Vui lòng nhập chiều cao');
                      if (typeof value === 'string' && !/^\d+$/.test(value)) return Promise.reject('Chỉ được nhập số nguyên dương');
                      const num = Number(value);
                      if (isNaN(num) || !Number.isInteger(num)) return Promise.reject('Chỉ được nhập số nguyên dương');
                      if (num < 70 || num > 160) return Promise.reject('Chiều cao hợp lý cho học sinh tiểu học là từ 70 đến 160cm');
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input disabled={viewOnly} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="weight"
                label="Cân nặng (kg)"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === '') return Promise.reject('Vui lòng nhập cân nặng');
                      if (typeof value === 'string' && !/^\d+(\.\d+)?$/.test(value)) return Promise.reject('Chỉ được nhập số dương, có thể có thập phân');
                      const num = Number(value);
                      if (isNaN(num) || num < 9 || num > 60) return Promise.reject('Cân nặng hợp lý cho học sinh tiểu học là từ 9 đến 60kg');
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input disabled={viewOnly} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vision_left"
                label="Thị lực mắt trái"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === '') return Promise.reject('Vui lòng nhập thị lực mắt trái');
                      if (typeof value === 'string' && !/^\d+$/.test(value)) return Promise.reject('Chỉ được nhập số nguyên dương, không nhập chữ hoặc ký tự đặc biệt');
                      const num = Number(value);
                      if (isNaN(num) || !Number.isInteger(num)) return Promise.reject('Chỉ được nhập số nguyên dương, không nhập chữ hoặc ký tự đặc biệt');
                      if (num < 0 || num > 10) return Promise.reject('Thị lực phải từ 0 đến 10');
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input disabled={viewOnly} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="vision_right"
                label="Thị lực mắt phải"
                rules={[
                  {
                    validator: (_, value) => {
                      if (value === undefined || value === null || value === '') return Promise.reject('Vui lòng nhập thị lực mắt phải');
                      if (typeof value === 'string' && !/^\d+$/.test(value)) return Promise.reject('Chỉ được nhập số nguyên dương, không nhập chữ hoặc ký tự đặc biệt');
                      const num = Number(value);
                      if (isNaN(num) || !Number.isInteger(num)) return Promise.reject('Chỉ được nhập số nguyên dương, không nhập chữ hoặc ký tự đặc biệt');
                      if (num < 0 || num > 10) return Promise.reject('Thị lực phải từ 0 đến 10');
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <Input disabled={viewOnly} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="blood_pressure"
            label="Huyết áp"
            rules={[
              {
                validator: (_, value) => {
                  if (!value || typeof value !== 'string') return Promise.reject('Vui lòng nhập huyết áp');
                  // Chỉ cho phép định dạng số dương/số dương, không nhận số âm, chữ, ký tự đặc biệt khác ngoài dấu /
                  if (!/^\d{2,3}\/\d{2,3}$/.test(value)) {
                    return Promise.reject('Vui lòng nhập đúng định dạng: VD 110/70');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Input disabled={viewOnly} placeholder="VD: 110/70" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="dental_status"
                label="Tình trạng răng"
                rules={[{ required: true, message: 'Vui lòng nhập tình trạng răng' }]}
              >
                <Input disabled={viewOnly} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="ent_status"
                label="Tai mũi họng"
                rules={[{ required: true, message: 'Vui lòng nhập tình trạng tai mũi họng' }]}
              >
                <Input disabled={viewOnly} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="skin_status"
                label="Tình trạng da"
                rules={[{ required: true, message: 'Vui lòng nhập tình trạng da' }]}
              >
                <Input disabled={viewOnly} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="general_conclusion"
            label="Kết luận chung"
            rules={[
              { required: true, message: 'Vui lòng nhập kết luận chung' },
              { min: 3, message: 'Kết luận phải có ít nhất 3 ký tự' },
              { max: 1000, message: 'Kết luận không vượt quá 1000 ký tự' }
            ]}
          >
            <TextArea disabled={viewOnly} rows={3} />
          </Form.Item>

          <Form.Item
            name="is_need_meet"
            label="Cần gặp phụ huynh"
            valuePropName="checked"
          >
            <Switch disabled={viewOnly} />
          </Form.Item>

          <Form.Item
            name="image"
            label="Hình ảnh đính kèm"
            valuePropName="fileList"
            getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}

          >
            <Dragger
              listType="picture-card"
              beforeUpload={() => false}
              accept="image/*"
              maxCount={1}
              disabled={viewOnly}
              style={{ marginBottom: 16 }}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
              </div>
            </Dragger>
          </Form.Item>


          {!viewOnly && (
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submittingResult}
                >
                  Lưu kết quả
                </Button>
                <Button onClick={() => setResultModalVisible(false)}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          )}

        </Form>
      </Modal>

      {/* Modal xác nhận gửi khi còn học sinh chưa nhập kết quả */}
      <Modal
        open={sendAllModalVisible}
        onCancel={() => setSendAllModalVisible(false)}
        onOk={sendAllResults}
        okText="Gửi kết quả"
        cancelText="Hủy"
        title="Xác nhận gửi kết quả"
      >
        <div>
          Còn {studentsNotCompleted.length} học sinh chưa được nhập kết quả khám. Bạn có chắc chắn muốn gửi?
        </div>
      </Modal>
    </div>
  );
};

export default HealthCheckStudents; 