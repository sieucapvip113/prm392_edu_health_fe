import React from 'react';
import { Card, Table, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';


const studentData = [
    {
        key: '1',
        studentId: 'HS001',
        name: 'Nguyễn Văn A',
        class: '10A1',
        healthStatus: 'Sức khỏe tốt',
    },
    {
        key: '2',
        studentId: 'HS002',
        name: 'Trần Thị B',
        class: '10A2',
        healthStatus: 'Cần theo dõi',
    },
    {
        key: '3',
        studentId: 'HS003',
        name: 'Lê Văn C',
        class: '10A1',
        healthStatus: 'Bệnh/chấn thương',
    },
    {
        key: '4',
        studentId: 'HS004',
        name: 'Phạm Thị D',
        class: '10A3',
        healthStatus: 'Sức khỏe tốt',
    },
];

const columns = [
    {
        title: 'Mã học sinh',
        dataIndex: 'studentId',
        key: 'studentId',
    },
    {
        title: 'Họ tên',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Lớp',
        dataIndex: 'class',
        key: 'class',
    },
    {
        title: 'Trạng thái sức khỏe',
        dataIndex: 'healthStatus',
        key: 'healthStatus',
        render: (text: string) => {
            const colorMap: Record<string, string> = {
                'Sức khỏe tốt': '#52c41a',
                'Cần theo dõi': '#faad14',
                'Bệnh/chấn thương': '#ff4d4f'
            };
            return <span style={{ color: colorMap[text], fontWeight: 600 }}>{text}</span>;
        },
    },
];

const ExportExcel: React.FC = () => {
    const handleDownload = () => {
        alert('Chức năng tải Excel sẽ được phát triển sau.');
    };

    return (
        <div className="p-8 bg-gradient-to-br from-blue-50 to-purple-50 min-h-[calc(100vh-64px)]">
            <h1 className="text-3xl font-bold text-blue-600 mb-6">
                Danh sách học sinh - Y tế học đường
            </h1>

            <Card
                className="shadow-md rounded-xl"
                bodyStyle={{ padding: 16 }}
            >
                {/* Nút tải xuống Excel góc trên phải */}
                <div className="flex justify-end mb-4">
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleDownload}
                        style={{ background: '#22c55e', border: 'none' }}
                    >
                        Tải xuống Excel
                    </Button>
                </div>

                {/* Bảng danh sách học sinh */}
                <Table
                    columns={columns}
                    dataSource={studentData}
                    pagination={{ pageSize: 5 }}
                    bordered
                    size="middle"
                    scroll={{ x: 600 }}
                />
            </Card>
        </div>
    );
};

export default ExportExcel;
