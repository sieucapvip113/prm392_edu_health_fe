import { Heart, Shield, Users, ClipboardList, BarChart3, UserCheck, FileText, Activity } from 'lucide-react';

const about= () => {
  const features = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Quản lý Sức khỏe Toàn diện",
      description: "Theo dõi tình trạng sức khỏe học đường, blog chia sẻ kinh nghiệm và thông tin y tế chuyên nghiệp"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Chức năng Phòng ngừa",
      description: "Hỗ trợ sức khỏe của học sinh, phòng bệnh mãn tính, tiêm chủng và các dịch vụ y tế khác"
    },
    {
      icon: <ClipboardList className="w-8 h-8" />,
      title: "Hỗ trợ Phu huynh",
      description: "Phần mềm giúp Phu huynh gửi thước cho trường để nhận viện y tế cho học sinh uống thuốc"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Quản lý Nhân viên",
      description: "Hệ thống quản lý nhân viên y tế ghi nhận và xử lý sự kiện y tế tại trường"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Báo cáo & Thống kê",
      description: "Dashboard & Report với các chức năng thống kê và phân tích dữ liệu y tế"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Quản lý Hồ sơ",
      description: "Lưu trữ quản lý hồ sơ sức khỏe học sinh an toàn và truy xuất nhanh chóng"
    }
  ];

  const userRoles = [
    {
      role: "Student",
      description: "Học sinh có thể xem thông tin sức khỏe cá nhân và đăng ký các dịch vụ y tế",
      color: "bg-blue-500"
    },
    {
      role: "Parent",
      description: "Phụ huynh theo dõi tình trạng sức khỏe con em và tương tác với nhà trường",
      color: "bg-green-500"
    },
    {
      role: "School Nurse",
      description: "Y tá trường học quản lý và chăm sóc sức khỏe học sinh hàng ngày",
      color: "bg-purple-500"
    },
    {
      role: "Manager",
      description: "Quản lý giám sát toàn bộ hoạt động y tế và ra quyết định chiến lược",
      color: "bg-orange-500"
    },
    {
      role: "Admin",
      description: "Quản trị viên hệ thống với quyền truy cập và điều hành cao nhất",
      color: "bg-red-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-90"></div>
        <div className="relative px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Activity className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Hệ thống Quản lý Y tế Học đường
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto leading-relaxed">
              Hệ thống nội bộ trường tiểu học FPT hỗ trợ quản lý sức khỏe học sinh một cách khoa học, chuyên nghiệp và hiệu quả.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Tính năng nổi bật</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hệ thống được thiết kế để đáp ứng mọi nhu cầu quản lý y tế trong trường học
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white/70 rounded-3xl p-8 shadow-xl border border-cyan-200 hover:scale-105 hover:shadow-2xl transition-transform transition-shadow duration-200 will-change-transform will-change-shadow backdrop-blur-md flex flex-col items-center text-center" style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.10)' }}>
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-400 rounded-2xl flex items-center justify-center mb-5 text-white text-3xl shadow-lg group-hover:from-blue-500 group-hover:to-cyan-500 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-blue-700 mb-3 drop-shadow-sm">{feature.title}</h3>
                  <p className="text-gray-700 leading-relaxed font-medium opacity-90">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Roles Section */}
      <div className="py-20 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Người dùng hệ thống</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hệ thống hỗ trợ đa vai trò với giao diện và chức năng phù hợp cho từng đối tượng sử dụng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRoles.map((user, index) => (
              <div key={index} className="group cursor-pointer">
                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-transparent hover:border-l-4 hover:border-blue-500">
                  <div className="flex items-center mb-4">
                    <div className={`w-4 h-4 rounded-full ${user.color} mr-3`}></div>
                    <h3 className="text-lg font-bold text-gray-800">{user.role}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{user.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">5+</h3>
              <p className="text-gray-600">Vai trò người dùng</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">24/7</h3>
              <p className="text-gray-600">Giám sát sức khỏe</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">100%</h3>
              <p className="text-gray-600">Báo cáo tự động</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">∞</h3>
              <p className="text-gray-600">Chăm sóc tận tâm</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default about;