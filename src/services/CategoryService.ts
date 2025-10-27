export interface Category {
  Category_id?: number;
  Name: string;
  User_ID: number;
  Created_at?: string;
}

const API_URL = 'http://localhost:3333/api/v1/categories';

export async function getAllCategories(): Promise<Category[]> {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Lỗi lấy danh sách category');
  const data = await res.json();
  return data.data;
}

export async function getCategoryById(id: number): Promise<Category> {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Không tìm thấy category');
  const data = await res.json();
  return data.data;
}

export async function createCategory(
  category: Omit<Category, 'Category_id' | 'Created_at'>,
  token: string
): Promise<Category> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(category)
  });
  if (!res.ok) throw new Error('Lỗi tạo category');
  const data = await res.json();
  return data.data;
}

export async function updateCategory(id: number, category: Partial<Category>, token: string): Promise<Category> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(category)
  });
  if (!res.ok) throw new Error('Lỗi cập nhật category');
  const data = await res.json();
  return data.data;
}

export async function deleteCategory(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Lỗi xóa category');
}
