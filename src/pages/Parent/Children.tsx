import { useEffect, useState } from 'react';
import {
    Card,
    Form,
    Input,
    Select,
    Button,
    Modal,
    Tabs,
    Tag,
    Space,
    Divider,
    Row,
    Col,
    Avatar,
    Typography,
    Alert,

    Tooltip,
    Upload,
    message
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    MedicineBoxOutlined,
    HeartOutlined,
    SafetyOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { getStudentsByGuardianUserId, getUserById } from '../../services/AccountService';
import { createStudentWithMedicalRecord, deleteMedicalRecord, getMedicalRecordsByGuardian, updateMedicalRecord } from '../../services/MedicalRecordService';
import { vaccineService, VaccineHistoryByMedicalRecordResponse } from '../../services/Vaccineservice';
import type { MedicalRecord } from '../../services/MedicalRecordService';
const { Option } = Select;

const { Title, Text } = Typography;

const Children = () => {
    const token = localStorage.getItem('accessToken') as string;

    const { Dragger } = Upload;

    const [loading, setLoading] = useState(false);
    const [children, setChildren] = useState<MedicalRecord[]>([]);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [vaccineHistories, setVaccineHistories] = useState<{ [medicalRecordId: number]: VaccineHistoryByMedicalRecordResponse }>(
        {}
    );
    const [parentFullname, setParentFullname] = useState<string>('');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const records = await getMedicalRecordsByGuardian(token);
                console.log('Fetched medical records:', records);
                setChildren(records);
            } catch (error) {
                console.error('Lỗi khi lấy hồ sơ y tế:', error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Fetch parent's fullname from API
        const fetchParentFullname = async () => {
            try {
                const user = localStorage.getItem('user');
                const userIdStr = user ? JSON.parse(user).id : null;
                if (!userIdStr || !token) return;
                const userData = await getUserById(userIdStr, token);
                setParentFullname(userData.fullname || '');
            } catch (e) {
                setParentFullname('');
            }
        };
        fetchParentFullname();
    }, [token]);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingChild, setEditingChild] = useState<MedicalRecord | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const user = localStorage.getItem('user');

                const userIdStr = user ? JSON.parse(user).id : null;

                if (!userIdStr || !token) {
                    console.error('Không tìm thấy userId hoặc token');
                    return;
                }

                const userId = parseInt(userIdStr, 10);
                const data = await getStudentsByGuardianUserId(userId, token);
                console.log('Fetched children data:', data);
                const studentList = data.students.map((student: any) => ({
                    id: student.id,
                    name: student.fullname
                }));
                console.log('Processed children list:', studentList);
            } catch (error) {
                console.error('Lỗi lấy danh sách học sinh:', error);
            }
        };

        fetchChildren();
    }, []);

    const watchedDOB = Form.useWatch('dateOfBirth', form);
    const watchedClass = Form.useWatch('Class', form);






    const commonDiseases = [
        'Hen suyễn', 'Dị ứng da', 'Viêm mũi dị ứng', 'Tiểu đường type 1',
        'Bệnh tim bẩm sinh', 'Động kinh', 'Tự kỷ', 'ADHD'
    ];

    const commonAllergies = [
        'Phấn hoa', 'Bụi nhà', 'Lông động vật', 'Tôm cua', 'Sữa',
        'Trứng', 'Đậu phộng', 'Kháng sinh Penicillin', 'Aspirin'
    ];
    const genderOptions = ['Nam', 'Nữ'];
    const showModal = (child: MedicalRecord | null = null) => {
        setEditingChild(child);
        setIsModalVisible(true);
        console.log('Editing child:', child);
        if (child) {
            form.setFieldsValue({
                ...child,
                vaccines: child.vaccines || [],
                chronicDiseases: child.chronicDiseases || [],
                allergies: child.allergies || [],
            });
        } else {
            form.resetFields();
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingChild(null);
        form.resetFields();
    };

    useEffect(() => {
        if (editingChild) {
            const chronicArr: string[] = [];
            if (typeof editingChild.chronicDiseases === 'string') {
                chronicArr.push(
                    ...editingChild.chronicDiseases.split(',').map(s => s.trim()).filter(s => s)
                );
            }
            const allergyArr: string[] = [];
            if (typeof editingChild.allergies === 'string') {
                allergyArr.push(
                    ...editingChild.allergies.split(',').map(s => s.trim()).filter(s => s)
                );
            }

            form.setFieldsValue({
                ...editingChild,
                chronicDiseases: chronicArr,
                allergies: allergyArr,
                vaccines: editingChild.vaccines || [],
                Class: (editingChild as any).class || (editingChild as any).Class || undefined
            });
        }
    }, [editingChild]);

    const parseToObjArray = (val: any): { name: string }[] => {
        if (!val) return [];
        if (Array.isArray(val)) {
            return val.map((d: string) => ({ name: d }));
        }
        if (typeof val === 'string') {
            return val.split(',').map(s => ({ name: s.trim() })).filter(item => item.name);
        }
        return [];
    };

    const suggestClassFromDOB = (watchedDOB: string | undefined): string | null => {
        if (!watchedDOB) return null;

        const birthDate = new Date(watchedDOB);
        const now = new Date();

        let age = now.getFullYear() - birthDate.getFullYear();
        const m = now.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 5 || age > 13) return null;

        return `${age - 5}`;
    };


    const handleSubmit = async (values: any) => {
        const token = localStorage.getItem('accessToken') as string;
        if (!token) {
            console.error('Không tìm thấy token');
            return;
        }

        const user = localStorage.getItem('user');
        const userIdStr = user ? JSON.parse(user).id : null;
        console.log('values', values);

        setLoading(true);

        try {
            const newChild = {
                guardianUserId: userIdStr,
                student: {
                    fullname: values.fullname,
                    dateOfBirth: values.dateOfBirth,
                    gender: values.gender
                },
                medicalRecord: {
                    Class: values.Class,
                    height: Number(values.height),
                    weight: Number(values.weight),
                    bloodType: values.bloodType,
                    chronicDiseases: parseToObjArray(values.chronicDiseases),
                    allergies: parseToObjArray(values.allergies),
                    pastIllnesses: values.pastIllnesses || []
                }
            };

            console.log('Payload gửi BE:', newChild);

            let medicalRecordId: number | null = null;

            if (editingChild) {
                await updateMedicalRecord(editingChild.ID!, newChild, token);
                medicalRecordId = editingChild.ID!;
            } else {
                const res = await createStudentWithMedicalRecord(newChild, token);
                medicalRecordId = res?.data?.medicalRecord?.ID; // Tùy theo response API
            }

            if (medicalRecordId && values.vaccines && values.vaccines.length > 0) {
                for (const v of values.vaccines) {
                    const formData = new FormData();
                    formData.append('ID', String(medicalRecordId));
                    formData.append('Vaccine_name', v.Vaccine_name);
                    formData.append('Vaccince_type', v.Vaccince_type);
                    formData.append('Date_injection', v.Date_injection);
                    formData.append('note_affter_injection', v.note_affter_injection || '');

                    const file = v.evidence?.[0]?.originFileObj;
                    if (file) {
                        formData.append('evidence', file);
                    }
                    console.log('Form data gửi BE:', formData);

                    await vaccineService.createVaccineEvidence(formData);
                }
            }


            const updatedRecords = await getMedicalRecordsByGuardian(token);
            setChildren(updatedRecords);

            setIsModalVisible(false);
            setEditingChild(null);
            form.resetFields();
            message.success(editingChild ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        } catch (error) {
            console.error('Lỗi khi gửi form:', error);
            message.error('Có lỗi xảy ra!');
        } finally {
            setLoading(false);
        }
    };


    const showDeleteConfirm = (id: number) => {
        setDeletingId(id);
        setIsDeleteModalVisible(true);
    };

    const handleDelete = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token || deletingId === null) return;

        try {
            await deleteMedicalRecord(deletingId, token);
            const updatedRecords = await getMedicalRecordsByGuardian(token);
            setChildren(updatedRecords);
        } catch (error) {
            console.error('Lỗi khi xóa hồ sơ y tế:', error);
        } finally {
            setIsDeleteModalVisible(false);
            setDeletingId(null);
        }
    };



    const calculateAge = (dateOfBirth: string) => {
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        const fetchVaccineHistories = async () => {
            try {
                const histories: { [medicalRecordId: number]: VaccineHistoryByMedicalRecordResponse } = {};
                for (const child of children) {
                    if (child.ID) {
                        try {
                            const data = await vaccineService.getVaccineHistoryByMedicalRecordId(child.ID);
                            histories[child.ID] = data;
                            console.log(`Fetched vaccine history for child ID ${child.ID}:`, data);
                        } catch (e) {
                        }
                    }
                }
                setVaccineHistories(histories);
            } catch (error) {
            }
        };
        if (children.length > 0) {
            fetchVaccineHistories();
        }
    }, [children]);

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
                {/* Banner full width */}
                <div
                    style={{
                        marginBottom: '24px',
                        textAlign: 'center',
                        padding: '50px',
                        paddingBottom: '80px',
                        paddingTop: '80px',
                        background: 'linear-gradient(to right, #2563eb, #06b6d4)',
                        color: '#ffffff',
                    }}
                >
                    <Title
                        level={2}
                        style={{
                            color: '#ffffff',
                            marginBottom: '8px',
                        }}
                    >
                        <HeartOutlined /> Hồ Sơ Sức Khỏe Con Em
                    </Title>
                    <Text style={{ color: '#ffffff', opacity: 0.9 }}>
                        Quản lý thông tin sức khỏe toàn diện cho con em của bạn
                    </Text>
                </div>

                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ marginBottom: '24px' }}>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => showModal()}
                                size="large"
                            >
                                Thêm Hồ Sơ Con Em
                            </Button>
                        </div>


                        <Row gutter={[16, 16]}>
                            {children.map(child => (
                                <Col xs={24} lg={12} key={child.userId}>
                                    <Card
                                        hoverable
                                        bordered={false}
                                        style={{
                                            height: '100%',
                                            borderRadius: 20,
                                            boxShadow: '0 6px 32px rgba(24, 144, 255, 0.10)',
                                            marginBottom: 24,
                                            background: '#fff',
                                            padding: 0
                                        }}
                                        actions={[
                                            <Tooltip title="Chỉnh sửa" key="edit">
                                                <EditOutlined
                                                    style={{ fontSize: 22, color: '#2563eb' }}
                                                    onClick={() => showModal(child)}
                                                />
                                            </Tooltip>,
                                            <Tooltip title="Xóa" key="delete">
                                                <DeleteOutlined
                                                    style={{ fontSize: 22, color: '#ff4d4f' }}
                                                    onClick={() => showDeleteConfirm(child.ID)}
                                                />
                                            </Tooltip>
                                        ]}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', padding: 24, paddingBottom: 0 }}>
                                            <Avatar
                                                size={80}
                                                icon={<UserOutlined />}
                                                style={{
                                                    background: 'linear-gradient(135deg, #bae6fd 0%, #2563eb 100%)',
                                                    marginRight: 28,
                                                    border: '3px solid #fff',
                                                    boxShadow: '0 2px 8px #91d5ff'
                                                }}
                                            />
                                            <div>
                                                <Title level={4} style={{ margin: 0, color: '#2563eb', fontWeight: 700 }}>{child.fullname}</Title>
                                                <div style={{ margin: '8px 0' }}>
                                                    <Tag color="blue" style={{ fontSize: 15, padding: '2px 12px' }}>Lớp: {child.Class || 'Chưa xác định'}</Tag>
                                                    <Tag color="geekblue" style={{ fontSize: 15, padding: '2px 12px' }}>Tuổi: {calculateAge(child.dateOfBirth)}</Tag>
                                                </div>
                                                <div>
                                                    <Tag color="cyan" style={{ fontSize: 15, padding: '2px 12px' }}>Chiều cao: {child.height || 'Chưa xác định'} cm</Tag>
                                                    <Tag color="cyan" style={{ fontSize: 15, padding: '2px 12px' }}>Cân nặng: {child.weight || 'Chưa xác định'} kg</Tag>
                                                </div>
                                            </div>
                                        </div>
                                        <Divider style={{ margin: '16px 0' }} />
                                        <Tabs
                                            size="large"
                                            tabBarGutter={40}
                                            items={[
                                                {
                                                    key: '1',
                                                    label: (
                                                        <span style={{ fontSize: 16 }}>
                                                            <SafetyOutlined /> Vaccine
                                                        </span>
                                                    ),
                                                    children: (
                                                        <div style={{ minHeight: 60, padding: '0 16px' }}>
                                                            {vaccineHistories[child.ID] &&
                                                                vaccineHistories[child.ID].vaccineHistory
                                                                    .filter(v => v.Status === 'Đã tiêm')
                                                                    .length > 0 ? (
                                                                vaccineHistories[child.ID].vaccineHistory
                                                                    .filter(v => v.Status === 'Đã tiêm')
                                                                    .map((vaccine, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            style={{
                                                                                marginBottom: 10,
                                                                                padding: 10,
                                                                                backgroundColor: '#f6ffed',
                                                                                borderRadius: 6,
                                                                                border: '1px solid #b7eb8f'
                                                                            }}
                                                                        >
                                                                            <Text strong style={{ color: '#389e0d', fontSize: 15 }}>{vaccine.Vaccine_name}</Text>
                                                                            <br />
                                                                            <Text type="secondary" style={{ fontSize: 13, color: '#389e0d' }}>
                                                                                Ngày Tiêm: {vaccine.Date_injection ? new Date(vaccine.Date_injection).toLocaleDateString('vi-VN') : ''}
                                                                            </Text>
                                                                        </div>
                                                                    ))
                                                            ) : (
                                                                <Text type="secondary"><SafetyOutlined /> Chưa có thông tin vaccine đã tiêm</Text>
                                                            )}
                                                        </div>
                                                    )
                                                },
                                                {
                                                    key: '2',
                                                    label: (
                                                        <span style={{ fontSize: 16 }}>
                                                            <MedicineBoxOutlined /> Sức khỏe
                                                        </span>
                                                    ),
                                                    children: (
                                                        <div style={{ minHeight: 60, padding: '0 16px' }}>
                                                            {(() => {
                                                                let chronicArr: { name: string }[] = [];
                                                                if (Array.isArray(child.chronicDiseases)) {
                                                                    chronicArr = child.chronicDiseases;
                                                                } else if (typeof child.chronicDiseases === 'string') {
                                                                    chronicArr = child.chronicDiseases
                                                                        .split(',')
                                                                        .map(s => ({ name: s.trim() }))
                                                                        .filter(item => item.name);
                                                                }
                                                                let allergyArr: { name: string }[] = [];
                                                                if (Array.isArray(child.allergies)) {
                                                                    allergyArr = child.allergies;
                                                                } else if (typeof child.allergies === 'string') {
                                                                    allergyArr = child.allergies
                                                                        .split(',')
                                                                        .map(s => ({ name: s.trim() }))
                                                                        .filter(item => item.name);
                                                                }
                                                                return (
                                                                    <>
                                                                        {chronicArr.length > 0 && (
                                                                            <div style={{ marginBottom: 12 }}>
                                                                                <Text strong>Bệnh nền:</Text>
                                                                                <div style={{ marginTop: 4 }}>
                                                                                    {chronicArr.map((disease, idx) => (
                                                                                        <Tag key={idx} color="orange" style={{ fontSize: 14, padding: '2px 10px' }}>{disease.name}</Tag>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                        {allergyArr.length > 0 && (
                                                                            <div style={{ marginBottom: 12 }}>
                                                                                <Text strong>Dị ứng:</Text>
                                                                                <div style={{ marginTop: 4 }}>
                                                                                    {allergyArr.map((allergy, idx) => (
                                                                                        <Tag key={idx} color="red" style={{ fontSize: 14, padding: '2px 10px' }}>{allergy.name}</Tag>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    )
                                                }
                                            ]}
                                        />
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                </div>

                {/* Modal for adding/editing child profile */}

                <Modal
                    title={editingChild ? "Chỉnh Sửa Hồ Sơ" : "Thêm Hồ Sơ Mới"}
                    visible={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                    width={800}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Alert
                            message="Thông tin cơ bản"
                            type="info"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />

                        <Form.Item
                            name="fullname"
                            label="Họ và tên"
                            rules={[
                                { required: true, message: 'Vui lòng nhập họ và tên!' },
                                () => ({
                                    validator(_, value) {
                                        if (value && parentFullname && value.trim().toLowerCase() === parentFullname.trim().toLowerCase()) {
                                            return Promise.reject(new Error('Tên con không được trùng với tên cha/mẹ!'));
                                        }
                                        return Promise.resolve();
                                    }
                                })
                            ]}
                        >
                            <Input placeholder="Nhập họ và tên" />
                        </Form.Item>


                        <Form.Item
                            name="Class"
                            label="Lớp"
                            rules={[
                                { required: true, message: 'Vui lòng nhập lớp!' },
                                {
                                    pattern: /^[1-5][A-Z]$/,
                                    message: 'Lớp phải có định dạng như 1A, 2B... với số từ 1 đến 5 và một chữ cái in hoa.'
                                }
                            ]}
                        >
                            <Input placeholder="Nhập lớp (ví dụ: 1A, 5E)" />
                        </Form.Item>

                        {watchedDOB && watchedClass && (() => {
                            const suggested = suggestClassFromDOB(watchedDOB);
                            const classNum = parseInt(watchedClass);

                            if (!suggested || isNaN(classNum)) return null;

                            if (classNum === +suggested) return null;

                            return (
                                <div
                                    style={{
                                        fontSize: '12px',
                                        color: 'red',
                                        marginTop: '-10px',
                                        marginBottom: '12px'
                                    }}
                                >
                                    ⚠️ Gợi ý: Với ngày sinh này, lớp phù hợp là <b>{suggested}</b>
                                </div>
                            );
                        })()}



                        <Form.Item
                            name="gender"
                            label="Giới tính"
                            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
                        >
                            <Select placeholder="Chọn giới tính">
                                {genderOptions.map(gender => (
                                    <Select.Option key={gender} value={gender}>{gender}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="dateOfBirth"
                            label="Ngày sinh"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày sinh!' },
                                ({ }) => ({
                                    validator(_, value) {
                                        if (!value) return Promise.resolve();

                                        const birthDate = new Date(value);
                                        const today = new Date();
                                        const age = today.getFullYear() - birthDate.getFullYear();
                                        const m = today.getMonth() - birthDate.getMonth();

                                        const isBirthdayPassed =
                                            m > 0 || (m === 0 && today.getDate() >= birthDate.getDate());
                                        const actualAge = isBirthdayPassed ? age : age - 1;

                                        if (actualAge < 5 || actualAge > 13) {
                                            return Promise.reject(new Error('Độ tuổi phải từ 5 đến 13 tuổi!'));
                                        }

                                        return Promise.resolve();
                                    }
                                })
                            ]}
                        >
                            <Input
                                type="date"
                                max={new Date().toISOString().split("T")[0]}
                            />
                        </Form.Item>


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
                            <Input type="number" min={1} placeholder="Nhập chiều cao" />
                        </Form.Item>

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
                            <Input type="number" min={1} placeholder="Nhập cân nặng" />
                        </Form.Item>

                        {!editingChild && (
                            <>

                                <Divider />

                                <Alert
                                    message="Lưu ý: Phần tiêm chủng chỉ cho phép thêm mới lần đầu, không thể chỉnh sửa khi cập nhật hồ sơ."
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />

                                <Alert
                                    message="Thông tin tiêm chủng"
                                    type="success"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                                <Form.List name="vaccines">
                                    {(fields, { add, remove }) => (
                                        <>
                                            {fields.map(field => (
                                                <div key={field.key} className="border p-3 mb-4 rounded-md">
                                                    <Row gutter={16}>
                                                        <Col span={8}>
                                                            <Form.Item

                                                                {...field}
                                                                name={[field.name, 'Vaccine_name']}
                                                                label="Tên vaccine"
                                                                rules={[{ required: true, message: 'Nhập tên vaccine' }]}
                                                            >
                                                                <Input placeholder="VD: ComBE Five" />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'Vaccince_type']}
                                                                label="Loại vaccine"
                                                            >
                                                                <Input placeholder="VD: Phòng bạch hầu" />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'batch_number']}
                                                                label="Số lô"
                                                            >
                                                                <Input placeholder="VD: 123456" />
                                                            </Form.Item>
                                                        </Col>
                                                        <Col span={8}>
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'Date_injection']}
                                                                label="Ngày tiêm"
                                                            >
                                                                <Input type="date"
                                                                    max={new Date().toISOString().split("T")[0]}
                                                                />
                                                            </Form.Item>
                                                        </Col>
                                                    </Row>

                                                    <Row gutter={16}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'note_affter_injection']}
                                                                label="Ghi chú sau tiêm"
                                                            >
                                                                <Input.TextArea rows={3} placeholder="VD: Sốt nhẹ sau tiêm..." />
                                                            </Form.Item>
                                                        </Col>

                                                    </Row>
                                                    <Row gutter={16}>
                                                        <Col span={24}>
                                                            <Form.Item
                                                                {...field}
                                                                name={[field.name, 'evidence']}
                                                                label="Hình ảnh minh chứng"
                                                                valuePropName="fileList"
                                                                getValueFromEvent={e => Array.isArray(e) ? e : e?.fileList}
                                                                rules={[{ required: true, message: 'Vui lòng tải lên hình ảnh minh chứng' }]}
                                                            >
                                                                <Dragger
                                                                    listType="picture-card"
                                                                    beforeUpload={() => false}
                                                                    accept="image/*"
                                                                    maxCount={1}
                                                                    style={{ marginBottom: 16 }}
                                                                >
                                                                    <div>
                                                                        <UploadOutlined />
                                                                        <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                                                                    </div>
                                                                </Dragger>
                                                            </Form.Item>


                                                        </Col>
                                                    </Row>

                                                    <Button danger onClick={() => remove(field.name)}>
                                                        Xóa mục tiêm
                                                    </Button>
                                                </div>
                                            ))}
                                            <Form.Item>
                                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                    Thêm mũi tiêm
                                                </Button>
                                            </Form.Item>
                                        </>
                                    )}
                                </Form.List>
                            </>

                        )}
                        <Divider />

                        <Alert
                            message="Thông tin sức khỏe"
                            type="warning"
                            showIcon
                            style={{ marginBottom: '16px' }}
                        />

                        <Form.Item name="bloodType" label="Nhóm máu">
                            <Select placeholder="Chọn nhóm máu">
                                <Option value="A+">A+</Option>
                                <Option value="A-">A-</Option>
                                <Option value="B+">B+</Option>
                                <Option value="B-">B-</Option>
                                <Option value="AB+">AB+</Option>
                                <Option value="AB-">AB-</Option>
                                <Option value="O+">O+</Option>
                                <Option value="O-">O-</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item name="chronicDiseases" label="Bệnh nền">
                            <Select
                                mode="multiple"
                                placeholder="Chọn các bệnh nền (nếu có)"
                                style={{ width: '100%' }}
                            >
                                {commonDiseases.map(disease => (
                                    <Option key={disease} value={disease}>{disease}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item name="allergies" label="Dị ứng">
                            <Select
                                mode="multiple"
                                placeholder="Chọn các loại dị ứng (nếu có)"
                                style={{ width: '100%' }}
                            >
                                {commonAllergies.map(allergy => (
                                    <Option key={allergy} value={allergy}>{allergy}</Option>
                                ))}
                            </Select>
                        </Form.Item>


                        <Form.Item style={{ marginTop: '24px', textAlign: 'right' }}>
                            <Space>
                                <Button onClick={handleCancel}>
                                    Hủy
                                </Button>
                                <Button type="primary" htmlType="submit" loading={loading}>
                                    {editingChild ? 'Cập Nhật' : 'Thêm Mới'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>

                <Modal
                    title={
                        <span className="text-lg font-bold">
                            Xác nhận xóa
                        </span>
                    }
                    open={isDeleteModalVisible}
                    onOk={handleDelete}
                    onCancel={() => setIsDeleteModalVisible(false)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okType="danger"
                >
                    <p className="text-base font-semibold text-gray-800">Bạn có chắc chắn muốn xóa hồ sơ y tế của học sinh này không?</p>
                    <Text type="danger" className='text-sm'>
                        * Nếu xóa hồ sơ này, học sinh cũng sẽ bị xóa khỏi hệ thống. Hãy kiểm tra kỹ trước khi thực hiện.
                    </Text>
                </Modal>

            </div>
        </div >
    );
};

export default Children;