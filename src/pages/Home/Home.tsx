
import {
  HeartOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  FileTextOutlined,
  LineChartOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  BookOutlined,
  MedicineBoxOutlined,
  StarFilled,
} from '@ant-design/icons';
import { Rate } from 'antd';
import { NavLink } from "react-router-dom";

const Home = () => {
  const features = [
    {
      icon: <FileTextOutlined className="ml-3 w-8 h-8 text-xl" />,
      title: "Quản lý hồ sơ sức khỏe",
      description: "Lưu trữ và quản lý thông tin sức khỏe học sinh một cách hệ thống và bảo mật"
    },
    {
      icon: <LineChartOutlined className="ml-3 w-8 h-8 text-xl" />,
      title: "Theo dõi khám định kỳ",
      description: "Lập lịch và theo dõi các cuộc khám sức khỏe định kỳ cho học sinh"
    },
    {
      icon: <UserOutlined className="ml-3 w-8 h-8 text-xl" />,
      title: "Quản lý nhân viên y tế",
      description: "Phân quyền và quản lý đội ngũ nhân viên y tế trong trường học"
    },
    {
      icon: <SafetyCertificateOutlined className="ml-3 w-8 h-8 text-xl" />,
      title: "Bảo mật tuyệt đối",
      description: "Đảm bảo an toàn thông tin y tế với hệ thống bảo mật hiện đại"
    }
  ];

  const stats = [
    { number: "2,487", label: "Học sinh toàn trường" },
    { number: "1,234", label: "Hồ sơ sức khỏe" },
    { number: "245", label: "Khám sức khỏe tháng này" },
    { number: "12", label: "Nhân viên y tế" }
  ];

  const schoolInfo = [
    {
      icon: <BookOutlined className="w-6 h-6" />,
      title: "Trường Tiểu học FPT",
      description: "Trường tiểu học hàng đầu với 30 năm kinh nghiệm giáo dục"
    },
    {
      icon: <UserOutlined className="w-6 h-6" />,
      title: "2,500 học sinh",
      description: "Quy mô lớn với đội ngũ giáo viên chất lượng cao"
    },
    {
      icon: <TrophyOutlined className="w-6 h-6" />,
      title: "Chất lượng giáo dục",
      description: "Đạt chuẩn quốc gia với nhiều thành tích xuất sắc"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                  Hệ thống quản lý
                  <span className="block text-yellow-300">Y tế học đường</span>
                </h1>
                <p className="text-xl text-blue-100 leading-relaxed">
                  Hệ thống nội bộ trường tiểu học FPT hỗ trợ quản lý sức khỏe học sinh
                  một cách khoa học, chuyên nghiệp và hiệu quả.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">

                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  <NavLink
                    to="/login"
                  >
                    Đăng nhập
                  </NavLink>
                  <ArrowRightOutlined className="ml-2 w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <div className="flex items-center space-x-2">
                  <SafetyCertificateOutlined className="w-5 h-5 text-yellow-300" />
                  <span className="text-sm">Bảo mật cao</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircleOutlined className="w-5 h-5 text-green-300" />
                  <span className="text-sm">Dễ sử dụng</span>
                </div>
                <div className="flex items-center space-x-2">
                  <HeartOutlined className="w-5 h-5 text-red-300" />
                  <span className="text-sm">Chăm sóc tốt nhất</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                      <MedicineBoxOutlined className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Khám sức khỏe định kỳ/tiêm vaccine</h3>
                      <p className="text-blue-100 text-sm">Ưu tiên sự đồng ý phụ huynh</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {stats.slice(0, 2).map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-bold text-yellow-300">{stat.number}</div>
                        <div className="text-xs text-blue-100">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* School Information */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Về trường học của chúng tôi
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trường Tiểu học - Nơi ươm mầm tri thức và chăm sóc sức khỏe toàn diện cho học sinh
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {schoolInfo.map((info, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white/60 shadow-xl border border-blue-200 hover:scale-105 hover:shadow-2xl transition-all duration-300 backdrop-blur-md group"
                style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
              >
                <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-full mb-6 shadow-lg group-hover:from-cyan-400 group-hover:to-blue-500 transition-colors">
                  <span className="text-white text-4xl flex items-center justify-center drop-shadow-lg">{info.icon}</span>
                </div>
                <h3 className="text-2xl font-bold text-blue-700 mb-2 drop-shadow-sm">{info.title}</h3>
                <p className="text-gray-700 font-medium opacity-90">{info.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="flex flex-col justify-center h-full">
                <h3 className="text-2xl font-bold mb-4">Thông tin trường học</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <EnvironmentOutlined className="w-5 h-5" />
                    <span>Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <PhoneOutlined className="w-5 h-5" />
                    <span>Điện thoại: (028) 7300 5588</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MailOutlined className="w-5 h-5" />
                    <span>Email: tieuhoc.hcm@fpt.edu.vn</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center h-full border-l border-white/30 py-4">
                <div className="text-5xl font-extrabold mb-2 drop-shadow-lg">30+</div>
                <div className="text-blue-100 text-lg font-semibold mb-2">Năm kinh nghiệm</div>
                <Rate
                  defaultValue={5}
                  disabled
                  character={<StarFilled />}
                  style={{ fontSize: 24 }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Tính năng nổi bật của EduHealth
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Hệ thống quản lý y tế học đường với các tính năng hiện đại,
              giúp nhà trường chăm sóc sức khỏe học sinh hiệu quả nhất
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/70 rounded-3xl p-8 shadow-xl border border-cyan-200 hover:scale-105 hover:shadow-2xl transition-all duration-300 backdrop-blur-md group flex flex-col items-center text-center" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}>
                <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-2xl flex items-center justify-center mb-5 text-white text-3xl shadow-lg group-hover:from-blue-500 group-hover:to-cyan-500 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-3 drop-shadow-sm">{feature.title}</h3>
                <p className="text-gray-700 leading-relaxed font-medium opacity-90">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Thống kê hoạt động trường học
            </h2>
            <p className="text-xl text-gray-600">
              Tổng quan về tình hình sức khỏe và hoạt động y tế tại trường Tiểu học FPT
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100 shadow-xl border border-blue-200 hover:scale-105 hover:shadow-2xl transition-transform transition-shadow duration-200 will-change-transform will-change-shadow">
              <div className="text-5xl font-extrabold text-blue-600 mb-2 drop-shadow-lg">2,487</div>
              <div className="text-blue-700 font-semibold text-lg">Học sinh toàn trường</div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-green-100 to-teal-100 shadow-xl border border-green-200 hover:scale-105 hover:shadow-2xl transition-transform transition-shadow duration-200 will-change-transform will-change-shadow">
              <div className="text-5xl font-extrabold text-green-600 mb-2 drop-shadow-lg">1,234</div>
              <div className="text-green-700 font-semibold text-lg">Hồ sơ sức khỏe</div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-orange-100 to-yellow-100 shadow-xl border border-orange-200 hover:scale-105 hover:shadow-2xl transition-transform transition-shadow duration-200 will-change-transform will-change-shadow">
              <div className="text-5xl font-extrabold text-orange-500 mb-2 drop-shadow-lg">245</div>
              <div className="text-orange-700 font-semibold text-lg">Khám sức khỏe tháng này</div>
            </div>
            <div className="text-center p-8 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 shadow-xl border border-purple-200 hover:scale-105 hover:shadow-2xl transition-transform transition-shadow duration-200 will-change-transform will-change-shadow">
              <div className="text-5xl font-extrabold text-purple-600 mb-2 drop-shadow-lg">12</div>
              <div className="text-purple-700 font-semibold text-lg">Nhân viên y tế</div>
            </div>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Home;