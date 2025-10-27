import React, { useState, useEffect, useMemo } from 'react';
import { Pagination, Spin, message } from 'antd';
import NewsCard from './NewsCard';
import { getAllBlogs, Blog } from '../../services/BlogService';

interface NewsCardsContainerProps {
  searchQuery: string;
  selectedCategory: string;
}

const NewsCardsContainer: React.FC<NewsCardsContainerProps> = ({
  searchQuery,
  selectedCategory
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const pageSize = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const data = await getAllBlogs();
        // Sort blogs by creation date in descending order (newest first)
        const sortedBlogs = data.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setBlogs(sortedBlogs);
      } catch (err: any) {
        message.error(err.message || 'Lỗi tải danh sách tin tức');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter(blog => {
      const matchesSearch = searchQuery
        ? blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesCategory = selectedCategory === 'all'
        ? true
        : blog.Category_id === Number(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [blogs, searchQuery, selectedCategory]);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-8 ">
      {filteredBlogs.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          Không tìm thấy bài viết nào phù hợp
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentBlogs.map((blog) => (
              <NewsCard
                key={blog.id}
                title={blog.title}
                description={blog.content}
                image={blog.image || ''}
                date={blog.createdAt || ''}
                author={blog.author}
                slug={`${blog.id}`}
                Category_id={blog.Category_id}
              />
            ))}
          </div>

          <div className="flex justify-center">
            <Pagination
              current={currentPage}
              total={filteredBlogs.length}
              pageSize={pageSize}
              onChange={handlePageChange}
              showSizeChanger={false}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default NewsCardsContainer;