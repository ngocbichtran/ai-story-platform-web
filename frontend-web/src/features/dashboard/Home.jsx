import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import banner from "../../assets/images/banner.png";

export default function Home() {
    // Nhận search và currentUser từ MainLayouts qua Outlet context
    const { search } = useOutletContext();

    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStoriesData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("https://api.baostory.fun/api/chapters/stories", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        setStories(result.data);
                    }
                } else {
                    console.error("Lỗi phản hồi hệ thống khi lấy danh sách truyện.");
                }
            } catch (error) {
                console.error("Lỗi kết nối API /api/chapters/stories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStoriesData();
    }, []);

    // 🔥 ĐỒNG BỘ: Đổi story.summary thành story.description theo chuẩn MySQL
    const filteredStories = stories.filter((story) => {
        return story.title?.toLowerCase().includes(search.toLowerCase()) || story.description?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <div className="space-y-8">
            {/* BANNER BAN ĐẦU */}
            <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl animate-fadeIn">
                <img src={banner} alt="Banner" className="w-full h-[380px] object-cover opacity-90 hover:scale-[1.02] transition-transform duration-[4000ms]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/90 to-transparent" />
                <div className="absolute inset-0 flex items-center px-10">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">Có những thế giới chỉ tồn tại khi bạn bắt đầu viết.</h2>
                        <p className="text-slate-300 text-lg leading-relaxed mb-6">Người kể chuyện xứng đáng có một người đồng hành.</p>
                        <Link to="/stories/create" className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-105 text-white font-semibold shadow-2xl transition-all duration-300">
                            <Plus className="w-4 h-4" />
                            Tạo truyện mới
                        </Link>
                    </div>
                </div>
            </section>

            {/* AUTHORS TEAM */}
            <div className="relative flex items-center justify-center py-2">
                <div className="absolute w-full h-[1px] bg-white/10" />
                <div className="relative z-10 px-5 py-1 bg-[#090d1a] border border-white/5 rounded-full text-center">
                    <p className="text-slate-500 text-[8px] tracking-[0.25em] uppercase mb-[2px]">Created By</p>
                    <h3 className="text-white text-sm font-medium tracking-wide">
                        Trần Ngọc Bích
                        <span className="mx-2 text-violet-400 text-[10px]">✦</span>
                        Nguyễn Trí Hào
                    </h3>
                </div>
            </div>

            {/* SECTION TITLE & COUNTER */}
            <div className="flex items-end justify-between border-b border-white/5 pb-2">
                <h2 className="text-2xl md:text-3xl font-black text-white">Đang sáng tác</h2>
                <p className="text-slate-400 text-sm">{isLoading ? "..." : `${filteredStories.length} truyện`}</p>
            </div>

            {/* TRẠNG THÁI LOADING */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-950/20 rounded-2xl border border-white/5 backdrop-blur-md">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-2" />
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Đang tải danh sách tác phẩm từ thư viện...</p>
                </div>
            ) : filteredStories.length > 0 ? (
                /* STORIES GRID */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    {filteredStories.map((story) => (
                        <div key={story.id} className="group flex items-start gap-4 p-4 bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-2xl hover:border-violet-500/50 hover:bg-slate-950/60 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300">
                            {/* 1. KHU VỰC ẢNH BÌA DỌC (ĐỒNG BỘ: cover_image) */}
                            <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-900 shrink-0 flex items-center justify-center relative border border-white/10 shadow-lg">
                                {story.cover_image ? (
                                    <img src={story.cover_image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-950 to-violet-950 flex flex-col items-center justify-center p-2 text-center select-none">
                                        <BookOpen className="w-5 h-5 text-violet-400/50 mb-1" />
                                        <span className="text-[9px] uppercase text-violet-300 font-extrabold line-clamp-2 px-0.5 leading-tight">{story.title}</span>
                                    </div>
                                )}

                                {/* BADGE TRẠNG THÁI (ĐỒNG BỘ: PUBLISHED) */}
                                {story.status === "PUBLISHED" && <div className="absolute top-0 left-0 bg-emerald-500 text-slate-950 font-black text-[9px] tracking-widest px-2 py-0.5 rounded-br-lg uppercase shadow-md z-10 select-none">Full</div>}
                            </div>

                            {/* 2. KHU VỰC NỘI DUNG CHỮ BÊN PHẢI */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-32 py-0.5">
                                <div className="space-y-1.5">
                                    <h3 className="text-sm md:text-base font-extrabold text-white group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug tracking-wide cursor-pointer" title={story.title}>
                                        {story.title}
                                    </h3>
                                    {/* 🔥 ĐỒNG BỘ: Đổi story.summary thành story.description */}
                                    <p className="text-xs md:text-sm text-slate-300/90 line-clamp-2 md:line-clamp-3 leading-relaxed font-normal">{story.description || "Chưa có mô tả tóm tắt cho bộ truyện này."}</p>
                                </div>

                                {/* HÀNG THÔNG TIN DƯỚI ĐÁY VÀ NÚT BẤM CHUYỂN HƯỚNG */}
                                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5">
                                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                                        Mã tác giả: <span className="text-slate-300 font-semibold">#{story.user_id}</span>
                                    </span>

                                    {/* Đường dẫn nhảy sang Workspace xử lý theo ID truyện thật */}
                                    <Link to={`/stories/${story.id}/editor`} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-300 ${story.status === "PUBLISHED" ? "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10" : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/10 hover:scale-105 active:scale-95"}`}>
                                        {story.status === "PUBLISHED" ? "Sửa tác phẩm" : "Viết tiếp →"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* THÔNG BÁO KHI TRỐNG TRUYỆN */
                <div className="text-center py-20 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-sm italic">Không có tác phẩm nào trong thư viện của bạn.</p>
                </div>
            )}
        </div>
    );
}
