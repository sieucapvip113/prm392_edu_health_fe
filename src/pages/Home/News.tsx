import React, { useState } from 'react';
import HeroNews from '../../components/News/HeroNews';
import NewsSearchContainer from '../../components/News/NewsSearchContainer';
import NewsCardsContainer from '../../components/News/NewsCardsContainer';

const News: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 ">
      {/* Hero Section */}
      <HeroNews />

      {/* Search and Category Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <NewsSearchContainer
            onSearch={handleSearch}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </section>

      {/* News Cards Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <NewsCardsContainer
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
          />
        </div>
      </section>
    </div>
  );
};

export default News;