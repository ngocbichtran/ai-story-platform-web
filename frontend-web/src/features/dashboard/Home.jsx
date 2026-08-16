import React, { useState, useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import banner from "../../assets/images/banner.png";
import toast from "react-hot-toast";
import axios from "axios";
import CustomModal from "../styles/CustomModal";

export default function Home() {
    const { search } = useOutletContext();
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [storyToDelete, setStoryToDelete] = useState(null);

    // Lấy danh sách truyện của riêng tác giả
    const fetchStoriesData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");

            const response = await axios.get("https://api.baostory.fun/api/stories/list", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

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

    const confirmDeleteStory = async () => {
        if (!storyToDelete) return;

        try {
            setDeletingId(storyToDelete.id);
            const token = localStorage.getItem("token");
            const response = await axios.delete(`https://api.baostory.fun/api/stories/${storyToDelete.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success) {
                toast.success("Xóa tác phẩm thành công!");
                setStories((prev) => prev.filter((story) => story.id !== storyToDelete.id));
            }
        } catch (error) {
            console.error("Lỗi khi xóa tác phẩm:", error);
            toast.error(error.response?.data?.message || "Xóa tác phẩm thất bại.");
        } finally {
            setDeletingId(null);
            setStoryToDelete(null);
        }
    };

    const filteredStories = stories.filter((story) => {
        return story.title?.toLowerCase().includes(search.toLowerCase()) || story.description?.toLowerCase().includes(search.toLowerCase());
    });

    // Kiểm tra xem đã có truyện gốc nào chưa (truyện không có original_story_id hoặc original_story_id bằng null/0)
    const hasOriginalStory = stories.some((story) => !story.original_story_id);

    return (
        <div className="dashboard-home relative min-h-screen space-y-8">
            {/* BANNER BAN ĐẦU */}
            <section className="dashboard-hero relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl animate-fadeIn">
                <img src={banner} alt="Banner" className="w-full h-[380px] object-cover opacity-90 hover:scale-[1.02] transition-transform duration-[4000ms]" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/90 to-transparent" />
                <div className="absolute inset-0 flex items-center px-10">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-black leading-tight mb-4">Có những thế giới chỉ tồn tại khi bạn bắt đầu viết.</h2>
                        <p className="text-slate-300 text-lg leading-relaxed mb-6">Người kể chuyện xứng đáng có một người đồng hành.</p>

                        <div className="flex items-center gap-4">
                            <Link to="/stories/create" className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-105 text-white font-semibold shadow-2xl transition-all duration-300">
                                <Plus className="w-4 h-4" />
                                Tạo truyện mới
                            </Link>

                            {/* NÚT TẠO TRUYỆN PHÁI SINH */}
                            <Link
                                to={hasOriginalStory ? "/stories/derivative/create" : "#"}
                                onClick={(e) => {
                                    if (!hasOriginalStory) {
                                        e.preventDefault();
                                        toast.error("Bạn cần phải có ít nhất một truyện trước khi tạo truyện phái sinh!");
                                    }
                                }}
                                className={`inline-flex items-center gap-2 h-12 px-6 rounded-2xl font-semibold shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 to-violet-600 text-white ${hasOriginalStory ? "hover:scale-105 cursor-pointer" : "cursor-not-allowed hover:scale-100"}`}
                            >
                                <Plus className="w-4 h-4" /> Tạo truyện phái sinh
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION TITLE & COUNTER */}
            <div className="dashboard-section-heading flex items-end justify-between border-b border-white/5 pb-2">
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
                        <div key={story.id} className="story-card group flex items-start gap-4 p-4 bg-slate-950/40 backdrop-blur-md border border-white/10 rounded-2xl hover:border-violet-500/50 hover:bg-slate-950/60 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300">
                            {/* 1. KHU VỰC ẢNH BÌA */}
                            <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-900 shrink-0 flex items-center justify-center relative border border-white/10 shadow-lg">
                                {story.cover_image ? (
                                    <img src={story.cover_image} alt={story.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-slate-950 to-violet-950 flex flex-col items-center justify-center p-2 text-center select-none">
                                        <BookOpen className="w-5 h-5 text-violet-400/50 mb-1" />
                                        <span className="text-[9px] uppercase text-violet-300 font-extrabold line-clamp-2 px-0.5 leading-tight">{story.title}</span>
                                    </div>
                                )}

                                {story.status === "PUBLISHED" && <div className="absolute top-0 left-0 bg-emerald-500 text-slate-950 font-black text-[9px] tracking-widest px-2 py-0.5 rounded-br-lg uppercase shadow-md z-10 select-none">Full</div>}
                            </div>

                            {/* 2. KHU VỰC NỘI DUNG CHỮ BÊN PHẢI */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between h-32 py-0.5">
                                <div className="space-y-1.5">
                                    <h3 className="text-sm md:text-base font-extrabold text-white group-hover:text-violet-400 transition-colors line-clamp-2 leading-snug tracking-wide cursor-pointer" title={story.title}>
                                        {story.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-slate-300/90 line-clamp-2 md:line-clamp-3 leading-relaxed font-normal">{story.description || "Chưa có mô tả tóm tắt cho bộ truyện này."}</p>
                                </div>

                                {/* HÀNG THÔNG TIN DƯỚI ĐÁY VÀ NÚT BẤM CHUYỂN HƯỚNG */}
                                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                                    {/* NÚT XÓA KÍCH HOẠT MODAL */}
                                    <button onClick={() => setStoryToDelete(story)} disabled={deletingId === story.id} className="group/btn-delete h-9 px-4 rounded-xl border border-white/5 bg-white/5 text-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-all duration-300 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
                                        <span>{deletingId === story.id ? "Đang xóa..." : "Xóa"}</span>
                                    </button>

                                    {/* NÚT ĐIỀU HƯỚNG WORKSPACE */}
                                    <Link to={`/stories/${story.id}/editor`} className={`h-9 px-4 rounded-xl text-xs font-bold flex items-center justify-center transition-all duration-300 active:scale-95 ${story.status === "PUBLISHED" ? "border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white" : "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/10 hover:scale-[1.03] hover:shadow-xl hover:shadow-blue-500/20"}`}>
                                        {story.status === "PUBLISHED" ? "Sửa tác phẩm" : "Viết tiếp"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-slate-950/40 backdrop-blur-md rounded-2xl border border-white/10">
                    <p className="text-slate-400 text-sm italic">Không có tác phẩm nào trong thư viện của bạn.</p>
                </div>
            )}

            {/* CUSTOM MODAL XÁC NHẬN XÓA */}
            <CustomModal isOpen={!!storyToDelete} onClose={() => setStoryToDelete(null)} onConfirm={confirmDeleteStory} title="Xác nhận xóa tác phẩm" message={`Bạn có chắc chắn muốn xóa vĩnh viễn tác phẩm "${storyToDelete?.title}" không? Hành động này không thể hoàn tác.`} confirmText="Xóa tác phẩm" cancelText="Hủy" type="danger" />
        </div>
    );
}
