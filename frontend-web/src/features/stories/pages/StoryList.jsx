import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { BookOpen, Edit3, Plus, Loader2 } from "lucide-react";

export default function StoryList() {
    const { search } = useOutletContext();

    // 1. CHUYỂN ĐỔI STATE: Xóa dữ liệu cứng, khởi tạo mảng rỗng và quản lý trạng thái loading
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // 2. FETCH DATA TỪ API BACKEND CỦA BẠN
    useEffect(() => {
        const fetchStoriesData = async () => {
            setIsLoading(true);
            try {
                const response = await fetch("http://localhost:4000/api/chapters/stories", {
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

    // 3. BỘ LỌC TÌM KIẾM ĐỒNG BỘ THỜI GIAN THỰC (Đồng bộ cột dữ liệu chuẩn MySQL)
    const filteredStories = stories.filter((story) => {
        return story.title?.toLowerCase().includes(search.toLowerCase()) || story.description?.toLowerCase().includes(search.toLowerCase());
    });

    return (
        /* KHUNG CHỨA LỚN:*/
        <div className="bg-[#0B1120]/70 backdrop-blur-md border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl relative z-10">
            {/* THÔNG TIN TIÊU ĐỀ KHO TRUYỆN */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-black text-white">Kho Truyện Của Bạn</h1>
                </div>

                {/* KHU VỰC CÁC NÚT HÀNH ĐỘNG GÓC PHẢI */}
                <div className="flex items-center gap-3 shrink-0">
                    {/* Badge đếm số truyện */}
                    <p className="text-xs font-bold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-2 rounded-xl backdrop-blur-sm shadow-sm hidden sm:block">{isLoading ? "..." : `${filteredStories.length} Truyện`}</p>

                    {/* NÚT TẠO TRUYỆN MỚI  */}
                    <Link to="/stories/create" className="inline-flex items-center gap-1.5 text-xs font-bold h-9.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-105 active:scale-95 text-white shadow-lg shadow-blue-500/10 transition-all duration-200">
                        <Plus className="w-3.5 h-3.5" />
                        Tạo truyện mới
                    </Link>
                </div>
            </div>

            {/* DANH SÁCH LƯỚI TRUYỆN HOẶC TRẠNG THÁI LOADING */}
            {isLoading ? (
                /* HIỂN THỊ XOAY LOADING KHI ĐANG LẤY DỮ LIỆU TỪ CLOUD */
                <div className="flex flex-col items-center justify-center py-20 bg-slate-950/20 rounded-2xl border border-white/5 backdrop-blur-md">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-2" />
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Đang tải danh sách tác phẩm từ thư viện...</p>
                </div>
            ) : filteredStories.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    {filteredStories.map((story) => (
                        <div key={story.id} className="group flex items-start gap-4 p-3.5 bg-slate-950/30 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-violet-500/50 hover:bg-slate-950/60 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                            {/* 1. KHU VỰC ẢNH BÌA DỌC (Đồng bộ: cover_image) */}
                            <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-900 shrink-0 flex items-center justify-center relative border border-white/10 shadow-lg">
                                {story.cover_image ? (
                                    <img src={story.cover_image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                ) : (
                                    /* Giao diện thay thế bằng chữ nghệ thuật nếu truyện chưa up ảnh bìa */
                                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-violet-950 flex flex-col items-center justify-center p-2 text-center select-none">
                                        <BookOpen className="w-5 h-5 text-violet-400/50 mb-1" />
                                        <span className="text-[9px] uppercase text-violet-300 font-extrabold line-clamp-2 px-0.5 leading-tight">{story.title}</span>
                                    </div>
                                )}

                                {/* BADGE "FULL" XANH LÁ (Đồng bộ trạng thái: PUBLISHED) */}
                                {story.status === "PUBLISHED" && <div className="absolute top-0 left-0 bg-emerald-500 text-slate-950 font-black text-[9px] tracking-widest px-2 py-0.5 rounded-br-lg uppercase shadow-md z-10">Full</div>}
                            </div>

                            {/* 2. KHU VỰC CHỮ BÊN PHẢI */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-32 py-0.5">
                                <div className="space-y-1.5">
                                    {/* Tiêu đề truyện */}
                                    <h3 className="text-sm md:text-base font-extrabold text-white group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug tracking-wide" title={story.title}>
                                        {story.title}
                                    </h3>

                                    {/* Tóm tắt truyện (Đồng bộ: description) */}
                                    <p className="text-xs md:text-sm text-slate-300 line-clamp-2 md:line-clamp-3 leading-relaxed font-normal opacity-90">{story.description || "Chưa có mô tả tóm tắt cho bộ truyện này."}</p>
                                </div>

                                {/* THANH THÔNG TIN VÀ NÚT BẤM DƯỚI ĐÁY */}
                                <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/5">
                                    <span className="text-[11px] text-slate-400 font-medium truncate max-w-[150px]">
                                        Mã tác giả: <span className="text-slate-300 font-semibold">#{story.user_id}</span>
                                    </span>

                                    <Link to={`/stories/${story.id}/editor`} className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all duration-300 ${story.status === "PUBLISHED" ? "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10" : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/10 hover:scale-105"}`}>
                                        <Edit3 className="w-3 h-3" />
                                        {story.status === "PUBLISHED" ? "Sửa tác phẩm" : "Viết tiếp"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-slate-400 text-sm italic">Không tìm thấy câu chuyện nào phù hợp từ khối thư viện của bạn.</div>
            )}
        </div>
    );
}
