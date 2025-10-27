import { toast, ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
};

const API_URL = "http://localhost:3333/api/v1";

function getUserIdFromToken(): number | null {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId || payload.id || null;
    } catch {
        return null;
    }
}

interface NotificationResponse {
    notifications: Array<{
        notiId: number;
        title: string;
        mess: string;
        isRead: boolean;
        createdAt: string;
        updatedAt: string;
        userId: number;
    }>;
    pagination: {
        currentPage: number;
        totalItems: number;
        totalPages: number;
    };
    unreadCount: number;
}



class NotificationService {
    private refreshInterval: number | null = null;

    success(message: string, options: ToastOptions = {}) {
        toast.success(message, { ...defaultOptions, ...options });
    }

    error(message: string, options: ToastOptions = {}) {
        toast.error(message, { ...defaultOptions, ...options });
    }

    info(message: string, options: ToastOptions = {}) {
        toast.info(message, { ...defaultOptions, ...options });
    }

    warning(message: string, options: ToastOptions = {}) {
        toast.warning(message, { ...defaultOptions, ...options });
    }

    async getNotificationsForCurrentUser(page: number = 1, pageSize: number = 5): Promise<NotificationResponse> {
        const userId = getUserIdFromToken();
        if (!userId) throw new Error("No userId in token");

        const response = await fetch(`${API_URL}/notify/user/${userId}?page=${page}&limit=${pageSize}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch notifications");
        }

        return await response.json();
    }

    async markNotificationsAsRead(notificationIds: number[]): Promise<any> {
        const token = localStorage.getItem("accessToken");
        if (!token) throw new Error("No access token found");

        try {
            const response = await fetch(`${API_URL}/notify/mark-read`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    notificationIds
                })
            });

            if (!response.ok) {
                throw new Error('Failed to mark notifications as read');
            }

            return await response.json();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            throw error;
        }
    }

    startAutoRefresh(callback: (data: NotificationResponse) => void, page: number = 1, pageSize: number = 5) {

        this.getNotificationsForCurrentUser(page, pageSize).then(callback);


        this.refreshInterval = setInterval(async () => {
            try {
                const data = await this.getNotificationsForCurrentUser(page, pageSize);
                callback(data);
            } catch (error) {
                console.error('Auto refresh failed:', error);
            }
        }, 5000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

export const notificationService = new NotificationService();