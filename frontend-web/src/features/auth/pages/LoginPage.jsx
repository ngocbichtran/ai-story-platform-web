import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import { useRef } from "react";
import loginImage from "../../../assets/images/login-banner.png";
import logoImage from "../../../assets/images/logo-white.png";

const LoginPage = () => {
    const googleWrapperRef = useRef(null);
    const navigate = useNavigate();

    const handleGoogleLogin = async (credentialResponse) => {
        try {
            const res = await axios.post("https://api.baostory.fun/api/auth/google", {
                credential: credentialResponse.credential,
            });

            localStorage.setItem("token", res.data.token);

            toast.success("Đăng nhập thành công");

            navigate("/home");
        } catch (error) {
            console.error(error);

            toast.error("Google Login Failed");
        }
    };
    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col md:flex-row font-sans antialiased selection:bg-purple-500/30">
            {/* BACKGROUND IMAGE LAYER - Phủ toàn màn hình phía dưới */}
            <div className="absolute inset-0 z-0">
                <img src={loginImage} alt="BaoStory Midnight Background" className="w-full h-full object-cover select-none pointer-events-none" />
                <div className="absolute inset-0 bg-neutral-950/55 backdrop-blur-[3px]" />
            </div>

            {/* ================= NỬA TRÁI: TIÊU CHÍ KHÔNG GIAN RIÊNG TƯ & TÍNH NĂNG ĐẶC QUYỀN ================= */}
            <div className="relative z-10 w-full md:w-[55%] flex items-center justify-center p-6 sm:p-12 md:p-16 border-b md:border-b-0 md:border-r border-white/5 bg-neutral-950/30 backdrop-blur-md">
                <div className="max-w-xl space-y-8 text-left">
                    {/* Tag định vị hệ thống */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold tracking-wider uppercase">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                        </svg>
                        Không gian làm việc bảo mật
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-3xl sm:text-4xl font-black tracking-wide bg-gradient-to-r from-white via-slate-100 to-purple-200 bg-clip-text text-transparent font-serif drop-shadow-sm">BaoStory Studio</h2>
                        <p className="text-sm sm:text-base text-purple-200/70 font-light leading-relaxed">Trình soạn thảo chuyên nghiệp tối ưu riêng cho tác giả sáng tác. Nơi ý tưởng của bạn được bảo mật tuyệt đối — chỉ bạn mới có quyền tiếp cận và lật mở tác phẩm của chính mình.</p>
                    </div>

                    {/* CÁC ĐIỂM ĐẶC TRƯNG PHÙ HỢP VỚI HỆ THỐNG */}
                    <div className="space-y-4 sm:space-y-5">
                        {/* Đặc quyền 1: Private Workspace (FR02, FR07) */}
                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-purple-500/[0.03] hover:border-purple-500/20 group/item">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold group-hover/item:bg-purple-500 group-hover/item:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-purple-100">Biên soạn chuyên sâu & Độc quyền</h4>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">Quản lý trọn gói từ Cốt truyện, Nhân vật, Phân cảnh cho đến Thế giới truyện. Cơ chế tự động lưu (Auto-save) và quản lý lịch sử phiên bản giúp bạn không bao giờ mất bản thảo.</p>
                            </div>
                        </div>

                        {/* Đặc quyền 2: AI Assistant (FR02.7, FR06.5, FR07.6, FR07.7) */}
                        <div className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-purple-500/[0.03] hover:border-purple-500/20 group/item">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-purple-950/50 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold group-hover/item:bg-purple-500 group-hover/item:text-white transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm sm:text-base font-bold text-purple-100">Trợ lý AI</h4>
                                <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">Bứt phá tư duy với AI hỗ trợ kiểm tra chính tả, đảo ngược các ý tưởng có sẵn một cách độc đáo.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= NỬA PHẢI: GIAO DIỆN ĐĂNG NHẬP (GIỮ NGUYÊN) ================= */}
            <div className="relative z-10 w-full md:w-[45%] flex items-center justify-center p-6 sm:p-12 bg-neutral-950/10 backdrop-blur-sm">
                {/* LOGIN CARD */}
                <div className="w-full max-w-[420px] transition-all duration-700 hover:scale-[1.01] group">
                    {/* Hào quang lăng kính phía sau */}
                    <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600/15 via-indigo-500/5 to-fuchsia-500/15 rounded-[40px] blur-2xl opacity-80 group-hover:opacity-100 transition duration-700 pointer-events-none" />

                    {/* Thân Card tinh thể cắt góc */}
                    <div className="relative bg-neutral-950/65 backdrop-blur-3xl border border-white/[0.08] px-6 sm:px-10 py-12 shadow-[0_35px_90px_-15px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.1)] overflow-hidden" style={{ clipPath: "polygon(12% 0%, 88% 0%, 100% 10%, 100% 90%, 88% 100%, 12% 100%, 0% 90%, 0% 10%)" }}>
                        {/* Khung viền góc cắt */}
                        <div className="absolute inset-0 border border-purple-400/10 pointer-events-none scale-[0.97]" style={{ clipPath: "polygon(12% 0%, 88% 0%, 100% 10%, 100% 90%, 88% 100%, 12% 100%, 0% 90%, 0% 10%)" }} />

                        {/* CONTENT */}
                        <div className="text-center flex flex-col items-center relative z-10">
                            {/* LOGO */}
                            <div className="relative mb-6 group/logo">
                                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/30 to-indigo-600/0 blur-xl rounded-full scale-150 animate-pulse" />
                                <div className="absolute inset-0 border border-purple-300/20 rotate-45 scale-110 transition-transform duration-700 group-hover/logo:rotate-[225deg]" />

                                <img src={logoImage} alt="BaoStory" className="relative w-18 h-18 md:w-22 md:h-22 object-contain filter drop-shadow-[0_10px_20px_rgba(147,51,234,0.3)]" />
                            </div>

                            {/* TIÊU ĐỀ */}
                            <h1 className="text-3xl font-extrabold tracking-[4px] uppercase bg-gradient-to-b from-white via-slate-100 to-purple-200 bg-clip-text text-transparent drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] font-serif">Đăng nhập</h1>

                            {/* Slogan định hướng hệ thống cá nhân */}
                            <p className="text-xs sm:text-sm text-purple-200/60 mt-3 mb-10 tracking-wide">Tiếp tục hành trình xây dựng thế giới truyện của riêng bạn.</p>
                        </div>

                        {/* GOOGLE LOGIN HIDDEN - HOÀN TOÀN GIỮ NGUYÊN LOGIC CỦA BẠN */}
                        <div ref={googleWrapperRef} className="absolute opacity-0 pointer-events-none">
                            <GoogleLogin
                                onSuccess={handleGoogleLogin}
                                onError={() => {
                                    toast.error("Google Login Failed");
                                }}
                            />
                        </div>

                        {/* CUSTOM GOOGLE BUTTON */}
                        <div className="relative z-10 w-full mx-auto">
                            <div className="absolute -inset-px bg-gradient-to-r from-indigo-500/0 via-purple-400/40 to-fuchsia-500/0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <button
                                type="button"
                                onClick={() => {
                                    const googleBtn = googleWrapperRef.current?.querySelector('[role="button"]');
                                    googleBtn?.click();
                                }}
                                className="w-full py-4 rounded-xl border border-white/[0.12] bg-white/[0.03] hover:bg-white/[0.08] hover:border-purple-400/40 active:scale-[0.97] transition-all duration-300 flex items-center justify-center gap-3.5 font-semibold text-white tracking-wide shadow-[0_15px_35px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)] group/btn relative overflow-hidden"
                            >
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
