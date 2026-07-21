import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { BookOpen, Edit3, Plus, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function StoryList() {
    const { search } = useOutletContext();

    // =========================
    // STATE DỮ LIỆU THỰC TẾ
    // =========================
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null); // Quản lý hiệu ứng loading khi xóa truyện

    // =========================
    // API: TẢI DANH SÁCH TRUYỆN
    // =========================
    const fetchStoriesData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Gọi chuẩn đường dẫn lấy danh sách truyện của riêng tác giả đang đăng nhập
            const response = await axios.get("https://api.baostory.fun/api/stories/list", config);

            if (response.data.success) {
                setStories(response.data.data || []);
            }
        } catch (error) {
            console.error("Lỗi kết nối API lấy danh sách truyện:", error);
            toast.error("Không thể tải danh sách tác phẩm từ thư viện.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStoriesData();
    }, []);

    // =========================================================================
    // API: XỬ LÝ XÓA MỀM TÁC PHẨM
    // =========================================================================
    const handleDeleteStory = async (storyId, storyTitle) => {
        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa tác phẩm "${storyTitle}" không? Hành động này không thể hoàn tác.`);
        if (!confirmDelete) return;

        try {
            setDeletingId(storyId);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const response = await axios.delete(`https://api.baostory.fun/api/stories/${storyId}`, config);

            if (response.data.success) {
                toast.success("Xóa tác phẩm thành công!");
                // Khấu trừ bộ nhớ state ảo ngay lập tức mà không cần gọi lại toàn bộ API
                setStories((prev) => prev.filter((story) => story.id !== storyId));
            }
        } catch (error) {
            console.error("Lỗi khi xóa tác phẩm:", error);
            toast.error(error.response?.data?.message || "Xóa tác phẩm thất bại.");
        } finally {
            setDeletingId(null);
        }
    };

    // Bộ lọc tìm kiếm đồng bộ theo thời gian thực (Description/Title)
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
                <div className="flex flex-col items-center justify-center py-20 bg-slate-950/20 rounded-2xl border border-white/5 backdrop-blur-md">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin mb-2" />
                    <p className="text-slate-400 text-sm font-medium tracking-wide">Đang tải danh sách tác phẩm từ thư viện...</p>
                </div>
            ) : filteredStories.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                    {filteredStories.map((story) => (
                        <div key={story.id} className="group flex items-start gap-4 p-3.5 bg-slate-950/30 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-violet-500/50 hover:bg-slate-950/60 hover:-translate-y-0.5 hover:shadow-xl transition-all duration-300">
                            {/* 1. KHU VỰC ẢNH BÌA DỌC */}
                            <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-900 shrink-0 flex items-center justify-center relative border border-white/10 shadow-lg">
                                {story.cover_image ? (
                                    <img src={story.cover_image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-violet-950 flex flex-col items-center justify-center p-2 text-center select-none">
                                        <BookOpen className="w-5 h-5 text-violet-400/50 mb-1" />
                                        <span className="text-[9px] uppercase text-violet-300 font-extrabold line-clamp-2 px-0.5 leading-tight">{story.title}</span>
                                    </div>
                                )}

                                {/* BADGE PUBLISHED */}
                                {story.status === "PUBLISHED" && <div className="absolute top-0 left-0 bg-emerald-500 text-slate-950 font-black text-[9px] tracking-widest px-2 py-0.5 rounded-br-lg uppercase shadow-md z-10">Full</div>}
                            </div>

                            {/* 2. KHU VỰC NỘI DUNG CHỮ BÊN PHẢI */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-32 py-0.5">
                                <div className="space-y-1.5">
                                    <h3 className="text-sm md:text-base font-extrabold text-white group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug tracking-wide" title={story.title}>
                                        {story.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-300 line-clamp-2 md:line-clamp-3 leading-relaxed font-normal opacity-90">{story.description || "Chưa có mô tả tóm tắt cho bộ truyện này."}</p>
                                </div>

                                {/* THANH THÔNG TIN VÀ CỤM NÚT BẤM DỒN HẾT VỀ PHÍA PHẢI */}
                                <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                                    {/* NÚT XÓA TÁC PHẨM CAO CẤP */}
                                    <button onClick={() => handleDeleteStory(story.id, story.title)} disabled={deletingId === story.id} className="group/btn-delete h-8 px-3 rounded-xl border border-white/5 bg-white/5 text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
                                        <span>{deletingId === story.id ? "Đang xóa..." : "Xóa"}</span>
                                    </button>

                                    {/* NÚT VIẾT TIẾP / SỬA TÁC PHẨM */}
                                    <Link to={`/stories/${story.id}/editor`} className={`h-8 px-3 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-300 active:scale-95 ${story.status === "PUBLISHED" ? "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/10 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/20"}`}>
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
