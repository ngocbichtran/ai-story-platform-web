import { LockKeyhole, Eye, ShieldCheck, KeyRound, Clock3, Laptop, SearchCheck } from "lucide-react";

export default function ChangePasswordPage() {
    return (
        <div className="space-y-8">
            {/* CARD */}
            <div className="grid lg:grid-cols-[320px_1fr] gap-8 rounded-[32px] border border-white/10 bg-slate-950/40 backdrop-blur-xl p-8">
                {/* LEFT */}
                <div className="space-y-6">
                    <div className="flex items-center gap-5">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-[0_0_35px_rgba(59,130,246,.35)]">
                            <LockKeyhole className="w-10 h-10 text-white" />
                        </div>

                        <div>
                            <h1 className="text-3xl font-black text-white">Đổi mật khẩu</h1>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold">Bảo mật tài khoản</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <ShieldCheck className="w-5 h-5 text-violet-400 mt-1" />

                            <div>
                                <p className="font-semibold">Mật khẩu được mã hóa</p>

                                <p className="text-sm text-slate-400">BaoStory không lưu mật khẩu dưới dạng văn bản.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Laptop className="w-5 h-5 text-cyan-400 mt-1" />

                            <div>
                                <p className="font-semibold">Thiết bị</p>

                                <p className="text-sm text-slate-400">Bạn sẽ cần đăng nhập lại sau khi đổi mật khẩu.</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Clock3 className="w-5 h-5 text-amber-400 mt-1" />

                            <div>
                                <p className="font-semibold">Lần đổi gần nhất</p>

                                <p className="text-sm text-slate-400">Chưa có dữ liệu</p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <div className="w-5 h-5 flex items-start justify-center shrink-0 mt-1">
                                <SearchCheck className="w-5 h-5 text-green-400" />
                            </div>

                            <div>
                                <p className="font-semibold">Yêu cầu mật khẩu</p>

                                <p className="text-sm text-slate-400">Ít nhất 8 ký tự, Có chữ in hoa, Có chữ thường, Có số, Có ký tự đặc biệt, Không trùng mật khẩu cũ</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT */}
                <form className="space-y-6">
                    {/* CURRENT */}
                    <div>
                        <label className="block mb-2 font-semibold">Mật khẩu hiện tại</label>

                        <div className="relative">
                            <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5" />

                            <input type="password" placeholder="Nhập mật khẩu hiện tại" className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 pl-14 pr-14 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 outline-none" />

                            <Eye className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                        </div>
                    </div>

                    {/* NEW */}
                    <div>
                        <label className="block mb-2 font-semibold">Mật khẩu mới</label>

                        <div className="relative">
                            <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5" />

                            <input type="password" placeholder="Nhập mật khẩu mới" className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 pl-14 pr-14 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 outline-none" />

                            <Eye className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                        </div>
                    </div>

                    {/* CONFIRM */}
                    <div>
                        <label className="block mb-2 font-semibold">Xác nhận mật khẩu</label>

                        <div className="relative">
                            <KeyRound className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5" />

                            <input type="password" placeholder="Nhập lại mật khẩu" className="w-full h-14 rounded-2xl border border-white/10 bg-white/5 pl-14 pr-14 text-white placeholder:text-slate-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 outline-none" />

                            <Eye className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 w-5" />
                        </div>
                    </div>

                    {/* BUTTON */}
                    <button className="w-full h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[.98] transition">Đổi mật khẩu</button>
                </form>
            </div>
        </div>
    );
}
