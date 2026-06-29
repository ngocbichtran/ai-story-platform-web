import { Link } from "react-router-dom";
import loginImage from "../../../assets/images/login-banner.png";
import logoImage from "../../../assets/images/logo-white.png";

const ForgotPasswordPage = () => {
    return (
        <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
            {/* Background */}
            <img src={loginImage} alt="Background" className="absolute inset-0 w-full h-full object-cover" />

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

            {/* Card */}
            <div className="relative z-10 w-full max-w-[460px] bg-white/12 backdrop-blur-2xl border border-white/20 rounded-[32px] px-6 sm:px-10 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                {/* Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full"></div>

                            <img src={logoImage} alt="BaoStory" className="relative w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_8px_25px_rgba(255,255,255,0.35)]" />
                        </div>

                        <h1 className="text-3xl font-black tracking-[1px] bg-gradient-to-r from-white via-orange-100 to-yellow-200 bg-clip-text text-transparent">Quên mật khẩu</h1>
                    </div>
                </div>

                {/* Form */}
                <form className="space-y-5">
                    {/* EMAIL */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-white">Email</label>

                        <input type="email" placeholder="Nhập email của bạn" className="w-full px-4 py-3.5 rounded-2xl border border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:bg-white/15 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 outline-none transition-all" />
                    </div>

                    {/* NEW PASSWORD */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-white">Mật khẩu mới</label>

                        <div className="relative">
                            <input type="password" placeholder="Nhập mật khẩu mới" className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:bg-white/15 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 outline-none transition-all" />

                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                <i className="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>

                    {/* CONFIRM PASSWORD */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-white">Xác nhận mật khẩu</label>

                        <div className="relative">
                            <input type="password" placeholder="Nhập lại mật khẩu" className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-white/20 bg-white/10 text-white placeholder:text-gray-300 focus:bg-white/15 focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 outline-none transition-all" />

                            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                                <i className="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>

                    {/* BUTTON */}
                    <button type="submit" className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-[1.01] active:scale-[0.99] text-white font-semibold transition-all shadow-lg">
                        Đặt lại mật khẩu
                    </button>
                </form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <Link to="/login" className="text-blue-300 hover:text-blue-200 font-medium">
                        Quay về đăng nhập
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
