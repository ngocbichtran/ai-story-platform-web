import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google"; // Dùng Hook chuẩn từ thư viện
import { Download } from "lucide-react"; // Import icon Download từ lucide-react (hoặc dùng SVG thuần)
import loginImage from "../../../assets/images/login-banner.png";
import logoImage from "../../../assets/images/logo-white.png";

const LoginPage = () => {
    const navigate = useNavigate();

    // Khởi tạo hàm trigger Google Login chính chủ
    const loginWithGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.post("https://api.baostory.fun/api/auth/google", {
                    token: tokenResponse.access_token,
                });

                if (res.data?.token) {
                    localStorage.setItem("token", res.data.token);
                    toast.success("Đăng nhập thành công");
                    navigate("/home");
                } else {
                    toast.error("Đăng nhập thất bại: Không nhận được token từ server");
                }
            } catch (error) {
                console.error("Lỗi xác thực Backend:", error);
                toast.error(error.response?.data?.message || "Đăng nhập Google thất bại!");
            }
        },
        onError: (errorResponse) => {
            console.error("Lỗi Google Auth:", errorResponse);
            toast.error("Không thể kết nối với Google Login.");
        },
    });

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col md:flex-row font-sans antialiased selection:bg-purple-500/30">
            {/* BACKGROUND IMAGE LAYER */}
            <div className="absolute inset-0 z-0">
                <img src={loginImage} alt="BaoStory Midnight Background" className="w-full h-full object-cover select-none pointer-events-none" />
                <div className="absolute inset-0 bg-neutral-950/55 backdrop-blur-[3px]" />
            </div>

            {/* KHÔNG GIAN BÀI VIẾT & TÍNH NĂNG */}
            <div className="relative z-5 w-full md:w-[55%] flex items-center justify-center p-3 sm:p-12 md:p-16 border-b md:border-b-0 md:border-r border-white/5 bg-neutral-950/30 backdrop-blur-md">
                <div className="max-w-xl space-y-8 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wider uppercase">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Hệ thống hỗ trợ sáng tác truyện
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-wide bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent font-serif drop-shadow-sm">BaoStory</h2>
                        <p className="text-sm sm:text-base text-purple-200/70 font-light leading-relaxed">Không gian sáng tác dành cho tác giả tự do, nơi bạn có thể xây dựng, quản lý và phát triển toàn bộ tác phẩm trong một nền tảng thống nhất.</p>
                    </div>

                    <div className="space-y-4 sm:space-y-5">
                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-purple-500/[0.03] hover:border-purple-500/20 group/item">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover/item:bg-purple-500 group-hover/item:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-purple-100">Quản lý tác phẩm toàn diện</h4>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">Theo dõi cốt truyện, nhân vật, thế giới truyện, chương truyện và lịch sử chỉnh sửa trong một hệ thống thống nhất.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-purple-500/[0.03] hover:border-purple-500/20 group/item">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-300 group-hover/item:bg-purple-500 group-hover/item:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-purple-100">AI hỗ trợ sáng tác</h4>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">AI hỗ trợ phát triển ý tưởng, kiểm tra chính tả và gợi ý nội dung nhằm nâng cao năng suất sáng tác.</p>
                            </div>
                        </div>
                    </div>

                    {/* NÚT TẢI FILE APK CHO ANDROID */}
                    <div>
                        <a href="https://apk.baostory.fun/app-release.apk" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-purple-600/20 border border-purple-400/30 transition-all duration-300 active:scale-95 group/apk">
                            <Download className="w-4 h-4 group-hover/apk:translate-y-0.5 transition-transform" />
                            <span>Tải ứng dụng Android (APK)</span>
                        </a>
                    </div>
                </div>
            </div>

            {/* NỬA PHẢI: GIAO DIỆN ĐĂNG NHẬP */}
            <div className="relative z-5 w-full md:w-[45%] flex items-center justify-center p-3 sm:p-12 bg-neutral-950/10 backdrop-blur-sm">
                <div className="w-full max-w-[420px] transition-all duration-700 hover:scale-[1.01] group">
                    <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600/15 via-indigo-500/5 to-fuchsia-500/15 rounded-[40px] blur-2xl opacity-80 group-hover:opacity-100 transition duration-700 pointer-events-none" />

                    <div className="relative bg-neutral-950/65 backdrop-blur-3xl border border-white/[0.08] px-6 sm:px-10 py-12 shadow-[0_35px_90px_-15px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.1)] overflow-hidden" style={{ clipPath: "polygon(12% 0%, 88% 0%, 100% 10%, 100% 90%, 88% 100%, 12% 100%, 0% 90%, 0% 10%)" }}>
                        <div className="absolute inset-0 border border-purple-400/10 pointer-events-none scale-[0.97]" style={{ clipPath: "polygon(12% 0%, 88% 0%, 100% 10%, 100% 90%, 88% 100%, 12% 100%, 0% 90%, 0% 10%)" }} />

                        <div className="text-center flex flex-col items-center relative z-10">
                            <div className="relative mb-6 group/logo">
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-indigo-600/0 blur-xl rounded-full scale-150 animate-pulse" />
                                <div className="absolute inset-0 border border-purple-300/20 rotate-45 scale-110 transition-transform duration-700 group-hover/logo:rotate-[225deg]" />
                                <img src={logoImage} alt="BaoStory" className="relative w-18 h-18 md:w-22 md:h-22 object-contain filter drop-shadow-[0_10px_20px_rgba(147,51,234,0.3)]" />
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-[4px] uppercase bg-gradient-to-b from-white via-slate-100 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] font-serif">Đăng nhập</h1>
                            <p className="text-xs sm:text-sm text-purple-200/60 mt-3 mb-10 tracking-wide">Chào mừng bạn đến với BaoStory!</p>
                        </div>

                        {/* CUSTOM GOOGLE BUTTON */}
                        <div className="relative z-5 w-full mx-auto">
                            <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-purple-400/40 to-fuchsia-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <button type="button" onClick={() => loginWithGoogle()} className="w-full py-4 rounded-xl border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.08] hover:border-purple-400/40 active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3.5 font-semibold text-white tracking-wide shadow-[0_15px_35px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] group/btn relative overflow-hidden">
                                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500" />
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shine_1.2s_ease-in-out_infinite]" />

                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover/btn:scale-110 group-hover/btn:rotate-[12deg] transition-transform duration-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />

                                <span className="drop-shadow-[0_2px_5px_rgba(0,0,0,0.6)] text-sm sm:text-base text-slate-100">Đăng nhập bằng Google</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
