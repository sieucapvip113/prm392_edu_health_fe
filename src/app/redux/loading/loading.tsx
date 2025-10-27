
import React, { useState, useEffect } from 'react';
import './loading.css';

interface LoadingProps {
  timeout?: number;
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({
  timeout = 20000,
  message = 'Đang tải dữ liệu...',
}) => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout]);

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <div className="luxury-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-dot"></div>
        </div>

        <h2 className="loading-title">{message}</h2>

        {showTimeout && (
          <p className="timeout-message">
            Quá trình tải đang mất nhiều thời gian hơn dự kiến. Vui lòng kiểm
            tra kết nối mạng.
          </p>
        )}
      </div>
    </div>
  );
};

export default Loading;
