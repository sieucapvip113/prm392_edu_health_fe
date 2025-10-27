import React from "react";
import { MapPin, Phone, Mail, Clock, Users, Award, BadgeCheck } from "lucide-react";

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            LIÊN HỆ VỚI CHÚNG TÔI
          </h1>
          <p className="text-xl text-yellow-300">
            Trường Tiểu học FPT - Nơi khởi đầu tương lai tươi sáng
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Info */}
          <div className="bg-white rounded-xl shadow-lg p-8 h-full border border-blue-100 hover:shadow-2xl transition duration-300">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <MapPin className="w-6 h-6 text-blue-600 mr-3" />
              Thông Tin Liên Hệ
            </h2>
            <div className="space-y-6">
              {/* Addr */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Địa chỉ</h3>
                  <p className="text-gray-600">
                    Lô E2a-7, Đường D1 Khu Công nghệ cao,<br />
                    P. Long Thạnh Mỹ, TP. Thủ Đức,<br />
                    TP. Hồ Chí Minh
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Điện thoại</h3>
                  <p className="text-gray-600">(028) 7300 5588</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Email</h3>
                  <p className="text-gray-600">tieuhoc.hcm@fpt.edu.vn</p>
                </div>
              </div>

              {/* Hour */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Giờ làm việc</h3>
                  <p className="text-gray-600">
                    Thứ 2 - Thứ 6: 7:00 - 17:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Highlight */}
          <div className="bg-white rounded-xl shadow-lg p-8 h-full border border-green-100 hover:shadow-2xl transition duration-300 flex flex-col justify-between">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Điểm Nổi Bật</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg flex flex-col items-center justify-center text-center p-6 h-[160px]">
                <Users className="w-8 h-8 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-600">2500+</div>
                <div className="text-sm text-gray-600">Học sinh</div>
              </div>
              <div className="bg-green-50 rounded-lg flex flex-col items-center justify-center text-center p-6 h-[160px]">
                <Award className="w-8 h-8 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-600">30+</div>
                <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
              </div>
              <div className="bg-yellow-50 rounded-lg flex flex-col items-center justify-center text-center p-6 h-[160px] md:col-span-2">
                <BadgeCheck className="w-8 h-8 text-yellow-600 mb-2" />
                <div className="text-base font-bold text-yellow-700">
                  Chất lượng giáo dục và y tế đạt chuẩn quốc gia
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-cyan-500 text-white">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white-800 mb-4 text-center">Vị Trí Trường Học</h2>
            <p className="text-yellow-300 text-center mb-6">
              Nằm tại khu vực Công nghệ cao TP. Thủ Đức, thuận tiện cho việc đi lại
            </p>
          </div>
          <div className="h-96 bg-gray-200 flex items-center justify-center">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.6100105376063!2d106.80730271139375!3d10.841127589267032!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752731176b07b1%3A0xb752b24b379bae5e!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBGUFQgVFAuIEhDTQ!5e0!3m2!1svi!2s!4v1748059188676!5m2!1svi!2s"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;