import React, { useState, useEffect, useRef } from 'react';
import { Badge, Popover, List, Spin, Divider, Pagination } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { notificationService } from '../../services/NotificationService';
import { useNavigate } from 'react-router-dom';

interface Notification {
  notiId: number;
  title: string;
  mess: string;
  isRead: boolean;
  createdAt: string;
}

const Noti: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const isAutoRefreshing = useRef(false);

  const fetchNotifications = async (page: number, size: number) => {
    setLoading(true);
    try {
      const response = await notificationService.getNotificationsForCurrentUser(page, size);
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
      setTotalItems(response.pagination.totalItems);
      setCurrentPage(response.pagination.currentPage);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1, pageSize);

    if (!isAutoRefreshing.current) {
      notificationService.startAutoRefresh((response) => {
        if (currentPage === 1) {
          setNotifications(response.notifications);
          setTotalItems(response.pagination.totalItems);
        }
        setUnreadCount(response.unreadCount);
      }, 1, pageSize);
      isAutoRefreshing.current = true;
    }

    return () => {
      notificationService.stopAutoRefresh();
      isAutoRefreshing.current = false;
    };
  }, []);

  const handleOpenChange = (visible: boolean) => {
    setOpen(visible);
    if (visible && currentPage !== 1) {
      fetchNotifications(1, pageSize);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      await notificationService.markNotificationsAsRead([notification.notiId]);
      
      setNotifications(prev =>
        prev.map(n =>
          n.notiId === notification.notiId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));

      if (notification.title.toLowerCase().includes('tiêm chủng')) {
        const nameMatch = notification.mess.match(/cháu ([^\n\r]+)/i);
        if (nameMatch && nameMatch[1]) {
          const studentName = encodeURIComponent(nameMatch[1].trim());
          navigate(`/guardian/vaccines?openModal=true&studentName=${studentName}`);
        } 
        setOpen(false);
        return;
      }

      if (notification.title === 'Có đơn thuốc mới từ phụ huynh') {
        const notificationDate = new Date(notification.createdAt);
        const day = notificationDate.getDate().toString().padStart(2, '0');
        const month = (notificationDate.getMonth() + 1).toString().padStart(2, '0');
        const year = notificationDate.getFullYear();
        const dateParam = `${year}-${month}-${day}`;
        navigate(`/nurse/medical?date=${dateParam}`);
        setOpen(false);
        return;
      }

      const match = notification.title.match(/ vấn đề về sức khỏe vào ngày (\d{1,2})\/(\d{1,2})\/(\d{4})/i);
      if (match) { 
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3];
        const isoDate = `${year}-${month}-${day}`;
        navigate(`/guardian/events?date=${isoDate}`);
        setOpen(false);
        return;
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handlePageChange = (page: number) => {
    fetchNotifications(page, pageSize);
  };

  const content = (
    <div style={{ width: 360, maxHeight: 400, overflowY: 'auto' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin />
        </div>
      ) : (
        <>
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <React.Fragment key={item.notiId}>
                <List.Item
                  style={{ 
                    padding: '12px 16px',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleNotificationClick(item)}
                  onDoubleClick={() => handleNotificationClick(item)}
                >
                  <List.Item.Meta
                    avatar={
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          backgroundColor: item.isRead ? 'transparent' : '#1890ff',
                          marginTop: 6,
                          marginRight: 8
                        }}
                      />
                    }
                    title={
                      <span style={{ fontWeight: item.isRead ? 'normal' : 'bold' }}>
                        {item.title}
                      </span>
                    }
                    description={
                      <div>
                        <div style={{ fontSize: 12, color: '#888' }}>
                          {new Date(item.createdAt).toLocaleString('vi-VN')}
                        </div>
                        <div style={{ marginTop: 4 }}>{item.mess}</div>
                      </div>
                    }
                  />
                </List.Item>
                <Divider style={{ margin: 0, opacity: 0.3 }} />
              </React.Fragment>
            )}
          />
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <Pagination
              size="small"
              current={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onChange={handlePageChange}
              showSizeChanger={false}
              style={{ margin: 0 }}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small">
        <BellOutlined
          style={{
            fontSize: 24,
            color: open ? '#1890ff' : '#000',
            cursor: 'pointer',
          }}
        />
      </Badge>
    </Popover>
  );
};

export default Noti;

