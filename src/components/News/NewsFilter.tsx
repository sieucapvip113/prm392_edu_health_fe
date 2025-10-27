import React, { useState, useEffect } from 'react';
import { Select, message } from 'antd';
import { getAllCategories, Category } from '../../services/CategoryService';

interface NewsFilterProps {
  onFilterChange: (value: string) => void;
}

const NewsFilter: React.FC<NewsFilterProps> = ({ onFilterChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (err: any) {
        message.error(err.message || 'Lỗi tải danh mục');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Select
      defaultValue="all"
      size="large"
      style={{ width: '100%' }}
      onChange={onFilterChange}
      loading={loading}
      options={[
        { value: 'all', label: 'Tất cả' },
        ...categories.map(category => ({
          value: String(category.Category_id),
          label: category.Name
        }))
      ]}
    />
  );
};

export default NewsFilter; 