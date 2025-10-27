import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../../assets/files/BgLogin.json";
import { login } from "../../services/AuthServices";
import logo from "../../assets/images/medical-book.png";
import { useDispatch } from 'react-redux';
import { toggleLoading } from '../../app/redux/loading.slice';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { notificationService } from "../../services/NotificationService";

const getRedirectPath = (role: string) => {
    switch (role) {
        case "Admin":
            return "/admin/health-overview";
        case "Nurse":
            return "/nurse/dashboard";
        case "Guardian":
            return "/guardian";
        default:
            return null;
    }
};
export interface LoginResponse {
    data: {
        accessToken: string;
        refreshToken: string;
        role: string;
    };
}


const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    const navigate = useNavigate();
    const dispatch = useDispatch();


    const validate = () => {
        const newErrors: typeof errors = {};
        if (!email.trim()) {
            newErrors.email = "Vui lòng nhập tên đăng nhập.";
        }
        if (!password) {
            newErrors.password = "Vui lòng nhập mật khẩu.";
        } else if (password.length < 6) {
            newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {

        if (!validate()) return;

        try {
            dispatch(toggleLoading(true));
            const payload = { email, password };
            const res = await login(payload);
            console.log("Login response:", res.user);
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Lưu thông tin user vào localStorage
            const userData = {
                email: res.user.email,
                phone: res.user.phone,
                id: res.user.id,
                username: res.user.username,
                role: res.user.role.charAt(0).toUpperCase() + res.user.role.slice(1),
            };
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("accessToken", res.accessToken);
            localStorage.setItem("refreshToken", res.refreshToken);

            // Hiển thị thông báo thành công dựa trên role
            const role = userData.role;
            const redirectPath = getRedirectPath(role);
            if (!redirectPath) {
                notificationService.error("Tài khoản không hợp lệ hoặc không được phép đăng nhập.");
                localStorage.clear();
                return;
            }
            notificationService.success(`Đăng nhập thành công `);
            navigate(redirectPath, { replace: true });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message;

            // Xử lý các loại lỗi cụ thể
            if (errorMessage.includes('credentials')) {
                notificationService.error('Tên đăng nhập hoặc mật khẩu không chính xác');
            } else if (errorMessage.includes('locked')) {
                notificationService.error('Tài khoản của bạn đã bị khóa');
            } else if (errorMessage.includes('not found')) {
                notificationService.error('Tài khoản không tồn tại');
            } else {
                notificationService.error(errorMessage || 'Đã có lỗi xảy ra khi đăng nhập');
            }


        } finally {
            dispatch(toggleLoading(false));
        }
    };

    return (
        <div className="flex items-center justify-center w-full h-screen bg-gradient-to-r from-[#2bb0cf] to-white-600 relative">
            <div className="bg-white shadow-lg rounded-lg flex w-full max-w-5xl overflow-hidden">
                {/* Phần Lottie */}
                <div className="w-[60%] hidden md:flex items-center justify-center bg-[#3bc8e8] backdrop-blur-sm">
                    <Lottie animationData={animationData} loop autoplay style={{ width: 300, height: 300 }} />
                </div>

                <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col justify-center">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <img src={logo} alt="Logo" className="w-10 h-10 mr-2" />
                            <h1 className="text-3xl text-black font-bold">EduHealth</h1>
                        </div>

                        <div className="mb-6 text-center">
                            <h3 className="text-xl font-semibold mb-2">Xin chào!</h3>
                            <p className="text-base text-gray-600">Đăng nhập bằng tài khoản của bạn</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gmail đăng nhập</label>
                            <input
                                type="text"
                                placeholder="Nhập Gmail"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors({ ...errors, email: undefined });
                                }}
                                onBlur={validate}
                                className={`mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.email
                                    ? "border-red-500 focus:ring-red-500"
                                    : "border-gray-300 focus:ring-blue-500"
                                    }`}
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        if (errors.password) setErrors({ ...errors, password: undefined });
                                    }}
                                    onBlur={validate}
                                    className={`mt-1 w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${errors.password
                                        ? "border-red-500 focus:ring-red-500"
                                        : "border-gray-300 focus:ring-blue-500"
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOutlined className="text-lg" />
                                    ) : (
                                        <EyeInvisibleOutlined className="text-lg" />
                                    )}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                        </div>

                        {/* Quên mật khẩu */}
                        <div className="flex justify-end mt-1">
                            <button
                                type="button"
                                className="text-blue-500 hover:underline text-sm"
                                onClick={() => navigate('/forgot-password')}
                            >
                                Quên mật khẩu?
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2283dd] text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition duration-300"
                        >
                            <div className=" text-white">Đăng Nhập</div>
                        </button>
                        <p className="text-sm text-gray-600 text-center pt-4">

                            <a href="/" className="text-blue-500 hover:underline text-sm">
                                Quay lại trang chủ
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
