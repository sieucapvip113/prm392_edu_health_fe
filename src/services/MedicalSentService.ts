const API_URL = 'http://localhost:3333/api/v1/medical-sents';

export type MedicalSentStatus = 'pending' | 'received' | 'rejected' | 'given';

const mapMedicalSent = (item: any): MedicalSent => {
  const { ID, ...rest } = item;
  return {
    ...rest,
    id: ID || item.id,
    Notes: item.Notes || item.notes
  };
};

export interface MedicalSent {
  id: number;
  User_ID: number;
  Guardian_phone: string;
  Class: string;
  Image_prescription: string;
  Medications: string;
  Delivery_time: string;
  Status: MedicalSentStatus;
  createdAt: string;
  Notes?: string;
  User?: {
    Full_name: string;
  };
  patientName?: string;
}

export async function getMedicalSentsByGuardian(token: string): Promise<MedicalSent[]> {
  const res = await fetch(`${API_URL}/by-guardian`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Lỗi lấy danh sách đơn thuốc của học sinh');
  const data = await res.json();
  return data.map(mapMedicalSent);
}

export async function getAllMedicalSents(token?: string): Promise<MedicalSent[]> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(API_URL, { headers });
  if (!res.ok) throw new Error('Lỗi lấy danh sách đơn thuốc');
  const data = await res.json();
  return data.map(mapMedicalSent);
}

export async function getMedicalSentById(id: number, token?: string): Promise<MedicalSent> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}/${id}`, { headers });
  if (!res.ok) throw new Error('Không tìm thấy đơn thuốc');
  const data = await res.json();
  return mapMedicalSent(data);
}

export async function createMedicalSent(formData: FormData, token: string): Promise<MedicalSent> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  if (!res.ok) {
    let errorMsg = 'Lỗi tạo đơn thuốc';
    try {
      const errData = await res.json();
      errorMsg = errData.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const data = await res.json();
  return mapMedicalSent(data);
}

export async function updateMedicalSent(id: number, formData: FormData, token: string): Promise<MedicalSent> {
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: headers,
    body: formData
  });
  if (!res.ok) {
    let errorMsg = 'Lỗi cập nhật đơn thuốc';
    try {
      const errData = await res.json();
      errorMsg = errData.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
  const data = await res.json();
  return mapMedicalSent(data);
}

export async function deleteMedicalSent(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    let errorMsg = 'Lỗi xoá đơn thuốc';
    try {
      const errData = await res.json();
      errorMsg = errData.message || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }
}
