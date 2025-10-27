const API_URL = 'http://localhost:3333/api/v1/dashboard';

export async function getTotalEvents(): Promise<{ count: number }> {
    const res = await fetch(`${API_URL}/event/other-medical/count`);
    if (!res.ok) throw new Error('Lỗi lấy tổng số sự kiện');
    const data = await res.json();
    return data;
}

export async function getTotalHealthCheck(): Promise<{ count: number }> {
    const res = await fetch(`${API_URL}/health-check/rounds/count`);
    if (!res.ok) throw new Error('Lỗi lấy tổng số sự kiện khám sức khỏe');
    const data = await res.json();
    return data;
}

export async function getTotalMedicalSend(): Promise<{ count: number }> {
    const res = await fetch(`${API_URL}/medicine/prescriptions/total`);
    if (!res.ok) throw new Error('Lỗi lấy tổng số sự kiện gửi y tế');
    const data = await res.json();
    return data;
}

export async function getTotalVaccine(): Promise<{ count: number }> {
    const res = await fetch(`${API_URL}/vaccine/rounds/count`);
    if (!res.ok) throw new Error('Lỗi lấy tỷ lệ xác nhận từ phụ huynh');
    const data = await res.json();
    return data; // Có thể là phần trăm (ví dụ: 0.85 hoặc 85)
}

export interface MedicalStatusCounts {
    countPending: number;
    countReceived: number;
    countRejected: number;
    countGiven: number;
}

export async function getTotalMedicalStatus(): Promise<MedicalStatusCounts> {
    const res = await fetch(`${API_URL}/medicine/prescriptions/statuses`);
    if (!res.ok) throw new Error('Lỗi lấy tổng số sự kiện gửi y tế');
    const data = await res.json();
    return data;
}


export async function getOtherMedicalMonthly(): Promise<{ count: { name: string; value: number }[] }> {
    const res = await fetch(`${API_URL}/event/other-medical/monthly`);
    if (!res.ok) throw new Error('Lỗi khi lấy thống kê sự kiện y tế');
    return res.json();
}

export interface VaccineStatusCounts {
    countPending: number;
    countAllowed: number;
    countInjected: number;
    countRejected: number;
}

export async function getTotalVaccineStatus(): Promise<VaccineStatusCounts> {
    const res = await fetch(`${API_URL}/vaccine/status/count`);
    if (!res.ok) throw new Error('Lỗi khi lấy thống kê sự kiện tiêm chủng');
    return res.json();
}

export interface HealthCheckStatusCounts {
    "countCreated": number;
    "countInProgress": number;
    "countPending": number;
    "countChecked": number;
}

export async function getTotalHealthCheckStatus(): Promise<HealthCheckStatusCounts> {
    const res = await fetch(`${API_URL}/health-check/rounds/statuses`);
    if (!res.ok) throw new Error('Lỗi khi lấy thống kê sự kiện khám sức khỏe');
    return res.json();
}

export interface AdminCounts {
    "countUsers": number,
    "countBlog": number,
    "countVaccineRounds": number,
    "countHealthChecks": number
}

export async function getDashboardCounts(): Promise<AdminCounts> {
    const res = await fetch(`${API_URL}/event/admin/count`);
    if (!res.ok) throw new Error('Lỗi khi lấy thống kê sự kiện khám sức khỏe');
    return res.json();
}

export async function getTotalMedicalRecord(): Promise<{ count: number }> {
    const res = await fetch(`${API_URL}/event/medical-record/count`);
    if (!res.ok) throw new Error('Lỗi lấy tổng số hồ sơ y tế');
    const data = await res.json();
    return data;
}