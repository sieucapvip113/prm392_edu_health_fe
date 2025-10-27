import { EnvironmentOutlined, HeartOutlined, MailOutlined, PhoneOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <HeartOutlined className="w-3 h-3 text-white fill-white" />
                </div>
              </div>
              <h3 className="text-xl font-bold">EduHealth</h3>
            </div>
            <p className="text-blue-100 leading-relaxed">
              Hệ thống quản lý y tế học đường hiện đại,
              bảo vệ sức khỏe học sinh một cách toàn diện và chuyên nghiệp.
            </p>
            <div className="flex items-center space-x-2 text-blue-100">
              <SafetyCertificateOutlined className="w-4 h-4" />
              <span className="text-sm">Bảo mật thông tin y tế tuyệt đối</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Liên kết nhanh</h4>
            <ul className="space-y-3">
              {[
                'Quản lý hồ sơ sức khỏe',
                'Theo dõi khám định kỳ',
                'Báo cáo thống kê',
                'Hướng dẫn sử dụng',
                'Chính sách bảo mật'
              ].map((item, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors duration-200 text-sm hover:underline"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Liên hệ hỗ trợ</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-blue-100">
                <PhoneOutlined className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">Hotline: 1900-1234</span>
              </div>
              <div className="flex items-center space-x-3 text-blue-100">
                <MailOutlined className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">tieuhoc@eduhealth.vn</span>
              </div>
              <div className="flex items-start space-x-3 text-blue-100">
                <EnvironmentOutlined className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-sm">
                  Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-blue-400/30">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <p className="text-blue-100 text-sm">
              © 2025 EduHealth - Phần mềm quản lý y tế học đường.
              <span className="hidden md:inline"> Tất cả quyền được bảo lưu.</span>
            </p>
            <div className="flex items-center space-x-4 text-xs text-blue-200">
              <a href="#" className="hover:text-white transition-colors">
                Điều khoản sử dụng
              </a>
              <span>•</span>
              <a href="#" className="hover:text-white transition-colors">
                Chính sách riêng tư
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;