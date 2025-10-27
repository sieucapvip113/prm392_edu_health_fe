import React from 'react';
import { Input } from 'antd';

interface NewsSearchProps {
  onSearch: (value: string) => void;
}

const NewsSearch: React.FC<NewsSearchProps> = ({ onSearch }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <Input
      placeholder="Tìm kiếm tin tức..."
      allowClear
      size="large"
      onChange={handleChange}
      className="w-full"
    />
  );
};

export default NewsSearch; 