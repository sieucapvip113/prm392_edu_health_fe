import React, { useEffect, useState } from 'react';
import { Typography, Table, Button, Modal, Form, Input, message, Popconfirm, Space, Card, Row, Col, Tabs, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllBlogs, createBlog, updateBlog, deleteBlog, Blog } from '../../../services/BlogService';
import { getAllCategories, createCategory, updateCategory, deleteCategory, Category } from '../../../services/CategoryService';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

const { Text } = Typography;

const ContentManagement: React.FC = () => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [form] = Form.useForm();
    const [imageFile, setImageFile] = useState<File | undefined>(undefined);
    const [submitting, setSubmitting] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [catLoading, setCatLoading] = useState(false);
    const [catModalOpen, setCatModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [catForm] = Form.useForm();
    const [catSubmitting, setCatSubmitting] = useState(false);
    const [catSubmitAttempted, setCatSubmitAttempted] = useState(false);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            const data = await getAllBlogs();
            setBlogs(data);
        } catch (err: any) {
            message.error(err.message || 'Lỗi tải blog');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        setCatLoading(true);
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch (err: any) {
            message.error(err.message || 'Lỗi tải category');
        } finally {
            setCatLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs();
        fetchCategories();
    }, []);

    useEffect(() => {
        if (modalOpen) {
            form.setFieldsValue({
                content: editingBlog?.content || '',
            });
        }
    }, [modalOpen, editingBlog]);

    const handleCreate = () => {
        setEditingBlog(null);
        setImageFile(undefined);
        setSubmitAttempted(false);
        setModalOpen(true);
    };

    const handleEdit = (blog: Blog) => {
        setEditingBlog(blog);
        setImageFile(undefined);
        setSubmitAttempted(false);
        setModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                message.error('Bạn cần đăng nhập để thực hiện thao tác này');
                return;
            }

            setLoading(true);
            await deleteBlog(id, token);
            message.success('Đã xóa blog');
            fetchBlogs();
        } catch (err: any) {
            message.error(err.message || 'Lỗi xóa blog');
        } finally {
            setLoading(false);
        }
    };

    const handleModalOk = async () => {
        setSubmitAttempted(true);
        try {
            const values = await form.validateFields();
            if (!imageFile && !editingBlog) {
                message.error('Vui lòng upload ảnh');
                return;
            }
            console.log('Submitting values:', values);
            const token = localStorage.getItem('accessToken');
            if (!token) {
                message.error('Bạn cần đăng nhập để thực hiện thao tác này');
                return;
            }
            setSubmitting(true);

            if (editingBlog) {
                await updateBlog(editingBlog.id!, { ...values }, token, imageFile);
                message.success('Đã cập nhật blog');
            } else {
                await createBlog({ ...values }, token, imageFile);
                message.success('Đã tạo blog');
            }
            setModalOpen(false);
            form.resetFields();
            setImageFile(undefined);
            fetchBlogs();
        } catch (err: any) {
            console.error('Error:', err);
            if (!err.errorFields) {
                message.error(err.message || 'Lỗi xử lý');
            }
        } finally {
            setSubmitting(false);
        }
    };




    // Reset form fields when modal is opened
    React.useEffect(() => {
        if (modalOpen && !editingBlog) {
            form.resetFields();
        }
        if (modalOpen && editingBlog) {
            form.setFieldsValue({
                title: editingBlog.title,
                content: editingBlog.content,
                author: editingBlog.author,
                Category_id: editingBlog.Category_id
            });
        }
    }, [modalOpen, editingBlog, form]);

    const columns = [
        {
            title: 'Tiêu đề',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <Text strong>{text || '--'}</Text>
        },
        {
            title: 'Tác giả',
            dataIndex: 'author',
            key: 'author',
            render: (text: string) => <Text type="secondary">{text || '--'}</Text>
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (v: string) => (
                <Text type="secondary">{v ? new Date(v).toLocaleDateString() : '--'}</Text>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: unknown, record: Blog) => (
                <Space>
                    <Button
                        type="default"
                        onClick={() => handleEdit(record)}
                        style={{
                            backgroundColor: '#ffe58f',
                            color: '#874d00',
                            borderColor: '#ffd666'
                        }}
                        icon={<EditOutlined />}
                        shape="circle"
                        title="Sửa"
                    />
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa blog này?"
                        onConfirm={() => handleDelete(record.id!)}
                        okText="Xóa"
                        cancelText="Hủy"
                        placement="topRight"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} shape="circle" title="Xóa" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleCatCreate = () => {
        setEditingCategory(null);
        setCatSubmitAttempted(false);
        setCatModalOpen(true);
    };

    const handleCatEdit = (cat: Category) => {
        setEditingCategory(cat);
        setCatSubmitAttempted(false);
        setCatModalOpen(true);
    };

    const handleCatDelete = async (id: number) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                message.error('Bạn cần đăng nhập để thực hiện thao tác này');
                return;
            }
            setCatLoading(true);
            await deleteCategory(id, token);
            message.success('Đã xóa category');
            fetchCategories();
        } catch (err: any) {
            message.error(err.message || 'Lỗi xóa category');
        } finally {
            setCatLoading(false);
        }
    };

    const handleCatModalOk = async () => {
        setCatSubmitAttempted(true);
        try {
            const values = await catForm.validateFields();
            const token = localStorage.getItem('accessToken');
            if (!token) {
                message.error('Bạn cần đăng nhập để thực hiện thao tác này');
                return;
            }
            setCatSubmitting(true);
            const User_ID = Number(localStorage.getItem('userId')) || 1;
            if (editingCategory) {
                await updateCategory(editingCategory.Category_id!, { ...values, User_ID }, token);
                message.success('Đã cập nhật category');
            } else {
                await createCategory({ ...values, User_ID }, token);
                message.success('Đã tạo category');
            }
            setCatModalOpen(false);
            catForm.resetFields();
            fetchCategories();
        } catch (err: any) {
            if (!err.errorFields) {
                message.error(err.message || 'Lỗi xử lý');
            }
        } finally {
            setCatSubmitting(false);
        }
    };

    React.useEffect(() => {
        if (catModalOpen && !editingCategory) {
            catForm.resetFields();
        }
        if (catModalOpen && editingCategory) {
            catForm.setFieldsValue({
                Name: editingCategory.Name
            });
        }
    }, [catModalOpen, editingCategory, catForm]);

    const catColumns = [
        {
            title: 'Tên category',
            dataIndex: 'Name',
            key: 'Name',
            render: (text: string) => <Text strong>{text || '--'}</Text>
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'Created_at',
            key: 'Created_at',
            render: (v: string) => (
                <Text type="secondary">{v ? new Date(v).toLocaleDateString() : '--'}</Text>
            )
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: unknown, record: Category) => (
                <Space>
                    <Button
                        type="default"
                        onClick={() => handleCatEdit(record)}
                        style={{
                            backgroundColor: '#ffe58f',
                            color: '#874d00',
                            borderColor: '#ffd666'
                        }}
                        icon={<EditOutlined />}
                        shape="circle"
                        title="Sửa"
                    />
                    <Popconfirm
                        title="Bạn chắc chắn muốn xóa category này?"
                        onConfirm={() => handleCatDelete(record.Category_id!)}
                        okText="Xóa"
                        cancelText="Hủy"
                        placement="topRight"
                    >
                        <Button type="primary" danger icon={<DeleteOutlined />} shape="circle" title="Xóa" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const blogTab = (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 className="text-3xl font-bold text-blue-600 mb-6">
                    Quản lý Blog
                </h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCreate}
                >
                    Tạo bài viết mới
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={blogs}
                rowKey="id"
                loading={loading}
                bordered
                pagination={{ pageSize: 6 }}
            />
            <Modal
                title={<Text strong>{editingBlog ? 'Cập nhật Blog' : 'Tạo Blog mới'}</Text>}
                open={modalOpen}
                onOk={handleModalOk}
                onCancel={() => {
                    setModalOpen(false);
                    setImageFile(undefined);
                }}
                okText={editingBlog ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                confirmLoading={submitting}
                width={700}
                destroyOnHidden
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ title: '', content: '', author: '', Category_id: undefined }}
                >
                    <Row gutter={16}>

                        <Col span={24}>
                            <Form.Item
                                label="Ảnh minh họa"
                                required
                                validateStatus={submitAttempted && !imageFile && !editingBlog ? 'error' : ''}
                                help={submitAttempted && !imageFile && !editingBlog ? 'Vui lòng upload ảnh minh họa' : ''}
                            >
                                <div
                                    style={{
                                        border: '1px dashed #d9d9d9',
                                        borderRadius: '8px',
                                        padding: '20px',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        backgroundColor: '#fafafa',
                                        transition: 'border-color 0.3s',
                                    }}
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="upload-input"
                                        onChange={(e) => {
                                            const file = e.target.files && e.target.files[0];
                                            if (!file) return;
                                            setImageFile(file);
                                        }}
                                    />
                                    <label htmlFor="upload-input" style={{ cursor: 'pointer' }}>
                                        {imageFile ? (
                                            <div>
                                                <img
                                                    src={URL.createObjectURL(imageFile)}
                                                    alt="blog cover"
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: '300px',
                                                        objectFit: 'contain',
                                                        marginBottom: '16px',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                                <Button type="primary" onClick={() => document.getElementById('upload-input')?.click()}>
                                                    Thay đổi ảnh
                                                </Button>
                                            </div>
                                        ) : editingBlog && editingBlog.image ? (
                                            <div>
                                                <img
                                                    src={editingBlog.image}
                                                    alt="blog cover"
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: '300px',
                                                        objectFit: 'contain',
                                                        marginBottom: '16px',
                                                        borderRadius: '4px'
                                                    }}
                                                />
                                                <Button type="primary" onClick={() => document.getElementById('upload-input')?.click()}>
                                                    Thay đổi ảnh
                                                </Button>
                                            </div>
                                        ) : (
                                            <div>
                                                <PlusOutlined style={{ fontSize: '24px', color: '#1890ff', marginBottom: '8px' }} />
                                                <div style={{ marginTop: '8px' }}>
                                                    <div>Nhấn để tải ảnh lên</div>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        Hỗ trợ tất cả định dạng ảnh
                                                    </Text>
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                name="title"
                                label="Tiêu đề"
                                rules={[
                                    { required: true, message: 'Nhập tiêu đề' },
                                    { min: 5, message: 'Tiêu đề tối thiểu 5 ký tự' },
                                    { max: 200, message: 'Tiêu đề tối đa 200 ký tự' }
                                ]}
                                validateStatus={submitAttempted && form.getFieldError('title').length ? 'error' : ''}
                                help={submitAttempted && form.getFieldError('title')[0]}
                            >
                                <Input placeholder="Nhập tiêu đề blog" maxLength={200} />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="Category_id"
                                label="Danh mục"
                                rules={[{ required: true, message: 'Chọn danh mục' }]}
                                validateStatus={submitAttempted && form.getFieldError('Category_id').length ? 'error' : ''}
                                help={submitAttempted && form.getFieldError('Category_id')[0]}
                            >
                                <Select
                                    placeholder="Chọn danh mục"
                                    options={categories.map(cat => ({ value: cat.Category_id, label: cat.Name }))}
                                    showSearch
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                name="content"
                                label="Nội dung"
                                rules={[
                                    { required: true, message: 'Nhập nội dung' },
                                    { min: 10, message: 'Nội dung tối thiểu 10 ký tự' }
                                ]}
                            >
                                <div className="border border-gray-300 rounded-lg">
                                    <CKEditor
                                        editor={ClassicEditor}
                                        config={{ removePlugins: ['AutoGrow'] }}
                                        data={editingBlog?.content || ''}
                                        onReady={editor => {
                                            const editableEl = editor.ui.view.editable.element!;

                                            // Hàm set lại height
                                            const setFixedHeight = () => {
                                                const lh = parseFloat(getComputedStyle(editableEl).lineHeight);
                                                const rows = 10;
                                                const h = lh * rows;
                                                editableEl.style.height = `${h}px`;
                                                editableEl.style.maxHeight = `${h}px`;
                                                editableEl.style.overflowY = 'auto';
                                                editableEl.style.padding = '0.5rem';
                                            };

                                            // set lần đầu
                                            setFixedHeight();

                                            // mỗi lần focus/blur lại set lại
                                            editor.ui.focusTracker.on('change:isFocused', (_evt, _name, isFocused) => {
                                                if (isFocused) {
                                                    setFixedHeight();
                                                }
                                            });
                                        }}
                                        onChange={(_, editor) => {
                                            form.setFieldsValue({ content: editor.getData() });
                                        }}
                                    />

                                </div>
                            </Form.Item>

                        </Col>


                    </Row>

                </Form>
            </Modal>
        </>
    );

    const categoryTab = (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <h1 className="text-3xl font-bold text-blue-600 mb-6">
                    Quản lý Category
                </h1>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleCatCreate}
                >
                    Tạo category mới
                </Button>
            </div>
            <Table
                columns={catColumns}
                dataSource={categories}
                rowKey="Category_id"
                loading={catLoading}
                bordered
                pagination={{ pageSize: 6 }}
            />
            <Modal
                title={<Text strong>{editingCategory ? 'Cập nhật Category' : 'Tạo Category mới'}</Text>}
                open={catModalOpen}
                onOk={handleCatModalOk}
                onCancel={() => setCatModalOpen(false)}
                okText={editingCategory ? 'Cập nhật' : 'Tạo mới'}
                cancelText="Hủy"
                confirmLoading={catSubmitting}
                width={500}
                destroyOnHidden
            >
                <Form
                    form={catForm}
                    layout="vertical"
                    initialValues={{ Name: '' }}
                >
                    <Form.Item
                        name="Name"
                        label="Tên category"
                        rules={[
                            { required: true, message: 'Nhập tên category' },
                            { min: 5, message: 'Tên tối thiểu 5 ký tự' },
                            { max: 100, message: 'Tên tối đa 100 ký tự' }
                        ]}
                        validateStatus={catSubmitAttempted && catForm.getFieldError('Name').length ? 'error' : ''}
                        help={catSubmitAttempted && catForm.getFieldError('Name')[0]}
                    >
                        <Input placeholder="Nhập tên category" maxLength={100} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );

    return (
        <Card
            variant="borderless"
            style={{ maxWidth: 1200, margin: '0 auto' }}
            styles={{ body: { padding: 24 } }}
        >
            <Tabs
                defaultActiveKey="blog"
                items={[
                    { key: 'blog', label: 'Quản lý Blog', children: blogTab },
                    { key: 'category', label: 'Quản lý Category', children: categoryTab },
                ]}
            />
        </Card>
    );
};

export default ContentManagement;