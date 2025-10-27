import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CalendarOutlined } from '@ant-design/icons';
import { getBlogById, Blog } from '../../services/BlogService';
import { Image, Spin, message } from 'antd';

const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;

      setLoading(true);
      try {
        const blogId = parseInt(slug);
        const data = await getBlogById(blogId);
        setBlog(data);
      } catch (err: any) {
        message.error(err.message || 'Lỗi tải tin tức');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spin size="large" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Không tìm thấy tin tức</h2>
          <p className="text-gray-600">Bài viết bạn đang tìm kiếm không tồn tại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <article className="bg-white">
          {/* Header */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center justify-center text-gray-500 text-sm">
              <CalendarOutlined className="mr-2" />
              <time className="font-medium">
                {blog.createdAt ? formatDate(blog.createdAt) : ''}
              </time>
            </div>
          </header>

          {/* Featured Image */}
          {blog.image && (
            <figure className="mb-12">
              <div className="relative overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={blog.image}
                  alt={blog.title}
                  width="100%"
                  style={{
                    maxHeight: 500,
                    objectFit: 'cover',
                  }}
                  preview={false}
                />
              </div>
            </figure>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div
              className="text-gray-800 leading-relaxed [&>p]:mb-6 [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-8 [&>h2]:mb-4 [&>h2]:text-gray-900 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-6 [&>h3]:mb-3 [&>h3]:text-gray-900 [&>ul]:mb-6 [&>ol]:mb-6 [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-gray-700 [&>blockquote]:my-6"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <div className="text-center text-gray-500 text-sm">
              <p>Cập nhật lúc {blog.createdAt ? formatDate(blog.createdAt) : ''}</p>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
};

export default NewsDetail;