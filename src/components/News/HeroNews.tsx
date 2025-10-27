import React from 'react';

const HeroNews: React.FC = () => {
  return (
    <div className="relative w-full h-[400px] bg-blue-600">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-90"></div>
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center">
        <p className="text-white text-4xl md:text-4xl font-bold mb-4">
          Bản Tin Y Tế Học Đường
        </p>
        <p className="text-white text-lg max-w-2xl">
          Nơi cập nhật nhanh chóng và chính xác các thông tin mới nhất về sức khỏe học đường, chính sách y tế, cùng những hoạt động chăm sóc sức khỏe dành cho học sinh.
        </p>
      </div>
    </div>
  );
};

export default HeroNews; 