import { useState } from 'react';
import { forgotPassword } from '../../services/AuthServices';
import { notificationService } from '../../services/NotificationService';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            notificationService.error('Vui lòng nhập email để đặt lại mật khẩu.');
            return;
        }
        setLoading(true);
        try {
            await forgotPassword(email);
            notificationService.success('Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.');
        } catch (err: any) {
            notificationService.error(err.message || 'Gửi email thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center w-full h-screen bg-gradient-to-r from-[#2bb0cf] to-white-600">
            <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-center mb-2">Quên mật khẩu</h2>
                <p className="text-gray-600 text-center mb-4">Nhập email tài khoản để nhận hướng dẫn đặt lại mật khẩu.</p>
                <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Nhập email..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                />
                <button
                    type="submit"
                    className="w-full bg-[#2283dd] text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
                    disabled={loading}
                >
                    {loading ? 'Đang gửi...' : 'Gửi email'}
                </button>
                <button
                    type="button"
                    className="w-full border border-blue-400 text-blue-500 py-2 rounded-md font-semibold hover:bg-blue-50 transition duration-300"
                    onClick={() => navigate('/login')}
                >
                    Quay lại đăng nhập
                </button>
            </form>
        </div>
    );
};

export default ForgotPasswordPage; 