import React, { useEffect, useState } from 'react';
import { Card, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getCategoryById, Category } from '../../services/CategoryService';

interface NewsCardProps {
  title: string;
  description: string;
  image: string;
  date: string;
  author: string;
  slug: string;
  Category_id: number;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  description,
  image,
  date,
  slug,
  Category_id
}) => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const data = await getCategoryById(Category_id);
        setCategory(data);
      } catch (err) {
        console.error('Error fetching category:', err);
      }
    };

    if (Category_id) {
      fetchCategory();
    }
  }, [Category_id]);

  const handleCardClick = () => {
    navigate(`/tintuc/${slug}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <Card
      hoverable
      className="w-full shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer h-full flex flex-col min-h-[410px]"
      onClick={handleCardClick}
      cover={
        <div className="relative w-full pt-[56.25%] bg-gray-100 flex items-center justify-center overflow-hidden">
          <img
            alt={title}
            src={image}
            className="absolute inset-0 w-full h-full object-contain"
          />
        </div>
      }
      bodyStyle={{ padding: '12px 16px' }}
    >
      <div className="flex flex-col flex-1 h-full">
        {/* Title */}
        <div className="flex-none min-h-[56px] max-h-[56px] flex items-start">
          <h3 className="text-xl font-semibold line-clamp-2 w-full">{title}</h3>
        </div>
        {/* Description */}
        <div className="flex-none min-h-[66px] max-h-[66px] my-1 flex items-start">
          <div
            className="text-gray-600 text-sm line-clamp-3 w-full"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
        {/* Spacer to push footer down */}
        <div className="flex-1" />
        {/* Footer */}
        <div className="flex-none mt-2">
          <div className="flex justify-between items-center text-sm text-gray-500 w-full">
            <span>{formatDate(date)}</span>
            {category && (
              <Tag color="blue" className="text-center w-fit">
                {category.Name}
              </Tag>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NewsCard;
