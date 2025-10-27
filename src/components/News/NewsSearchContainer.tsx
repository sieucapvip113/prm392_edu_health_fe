import React from 'react';
import NewsSearch from './NewsSearch';
import NewsFilter from './NewsFilter';

interface NewsSearchContainerProps {
  onSearch: (value: string) => void;
  onCategoryChange: (categoryId: string) => void;
}

const NewsSearchContainer: React.FC<NewsSearchContainerProps> = ({
  onSearch,
  onCategoryChange
}) => {
  const handleSearch = (value: string) => {
    onSearch(value);
  };

  const handleFilterChange = (value: string) => {
    onCategoryChange(value);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-3/4">
          <NewsSearch onSearch={handleSearch} />
        </div>
        <div className="w-full sm:w-1/4 min-w-[200px]">
          <NewsFilter onFilterChange={handleFilterChange} />
        </div>
      </div>
    </div>
  );
};

export default NewsSearchContainer; 