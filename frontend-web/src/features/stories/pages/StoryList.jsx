import React, { useState, useEffect, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { BookOpen, Plus, Loader2, Trash2, Download, Layers } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import CustomModal from "../../styles/CustomModal";

export default function StoryList() {
    const { search } = useOutletContext();
    const [stories, setStories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [activeTab, setActiveTab] = useState("regular");
    const [storyToDelete, setStoryToDelete] = useState(null);

    const fetchStoriesData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const response = await axios.get("https://api.baostory.fun/api/stories/list", config);
            if (response.data.success) {
                setStories(response.data.data || []);
            }
        } catch (error) {
            toast.error("Không thể tải danh sách tác phẩm.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchStoriesData();
    }, []);

    const filteredStories = useMemo(() => {
        const lowerSearch = search.toLowerCase();
        return stories.filter((story) => {
            const matchesSearch = story.title?.toLowerCase().includes(lowerSearch) || story.description?.toLowerCase().includes(lowerSearch);
            const isDerivative = !!(story.original_story_id || story.originalStoryId || story.original_id);
            return matchesSearch && (activeTab === "regular" ? !isDerivative : isDerivative);
        });
    }, [stories, search, activeTab]);

    const handleDownloadStory = async (storyId, storyTitle) => {
        try {
            setDownloadingId(storyId);
            toast.loading(`Đang tổng hợp "${storyTitle}"...`, { id: "downloading" });
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const chaptersRes = await axios.get(`https://api.baostory.fun/api/chapters/story/${storyId}/chapters`, config);
            const chaptersList = chaptersRes.data?.data || [];
            chaptersList.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));

            let allChaptersHtml = "";
            for (const ch of chaptersList) {
                const chNum = ch.chapterNumber || 1;
                const detailRes = await axios.get(`https://api.baostory.fun/api/chapters/display-chapter/${storyId}/${chNum}`, config);
                const chContent = detailRes.data?.data?.displayContent || "";
                allChaptersHtml += `<h2 style="page-break-before: always;">Chương ${chNum}: ${ch.title || ""}</h2><p>${chContent.replace(/\n/g, "</p><p>")}</p>`;
            }

            const fullWordHtml = `<html><head><meta charset='utf-8'></head><body><h1>${storyTitle}</h1>${allChaptersHtml}</body></html>`;
            const blob = new Blob(["\ufeff" + fullWordHtml], { type: "application/msword" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${storyTitle}-full.doc`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.dismiss("downloading");
            toast.success("Tải xuống thành công!");
        } catch (err) {
            toast.dismiss("downloading");
            toast.error("Lỗi khi tải truyện.");
        } finally {
            setDownloadingId(null);
        }
    };

    const confirmDeleteStory = async () => {
        if (!storyToDelete) return;

        try {
            setDeletingId(storyToDelete.id);
            await axios.delete(`https://api.baostory.fun/api/stories/${storyToDelete.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
            });
            setStories((prev) => prev.filter((s) => s.id !== storyToDelete.id));
            toast.success("Đã xóa tác phẩm thành công!");
        } catch (err) {
            toast.error("Xóa thất bại.");
        } finally {
            setDeletingId(null);
            setStoryToDelete(null);
        }
    };
    // Kiểm tra xem đã có truyện gốc nào chưa (truyện không có original_story_id hoặc original_story_id bằng null/0)
    const hasOriginalStory = stories.some((story) => !story.original_story_id);
    return (
        <div className="story-library relative min-h-screen">
            {/* 2. KHUNG NỘI DUNG CHÍNH (Kho Truyện) */}
            <div className="story-library__panel bg-[#0B1120]/70 backdrop-blur-md border border-white/10 rounded-[32px] p-8 shadow-2xl relative z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                    <h1 className="text-2xl font-black text-white">Kho Truyện Của Bạn</h1>
                    <div className="flex items-center gap-2">
                        <Link to="/stories/create" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-500 transition shadow-lg shadow-blue-600/10 active:scale-95">
                            <Plus size={14} /> Tạo truyện mới
                        </Link>

                        {/* NÚT TẠO TRUYỆN PHÁI SINH: CHẶN CLICK VÀ HIỆN THÔNG BÁO KHI RÊ CHUỘT */}
                        <Link
                            to={hasOriginalStory ? "/stories/derivative/create" : "#"}
                            onClick={(e) => {
                                if (!hasOriginalStory) {
                                    e.preventDefault();
                                    toast.error("Bạn cần phải có ít nhất một truyện trước khi tạo truyện phái sinh!");
                                }
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg active:scale-95 ${hasOriginalStory ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:scale-105 cursor-pointer shadow-violet-600/10" : "bg-violet-600 text-white cursor-not-allowed shadow-violet-600/10"}`}
                        >
                            <Plus className="w-4 h-4" /> Tạo truyện phái sinh
                        </Link>
                    </div>
                </div>

                {/* TAB LỌC */}
                <div className="flex gap-2 mb-6">
                    <button onClick={() => setActiveTab("regular")} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === "regular" ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400"}`}>
                        Truyện Gốc
                    </button>
                    <button onClick={() => setActiveTab("derivative")} className={`px-4 py-2 rounded-xl text-xs font-bold transition ${activeTab === "derivative" ? "bg-violet-600 text-white" : "bg-white/5 text-slate-400"}`}>
                        Truyện Phái Sinh
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                    </div>
                ) : filteredStories.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {filteredStories.map((story) => (
                            <div key={story.id} className="library-story-card flex gap-4 p-4 bg-slate-950/30 border border-white/5 rounded-2xl">
                                <div className="w-20 h-28 rounded-lg bg-slate-900 overflow-hidden shrink-0 border border-white/10">{story.cover_image && <img src={story.cover_image} className="w-full h-full object-cover" />}</div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <h3 className="font-bold text-white text-sm line-clamp-1">{story.title}</h3>
                                    <p className="text-xs text-slate-400 line-clamp-2">{story.description}</p>
                                    <div className="flex gap-2 mt-2">
                                        <button onClick={() => handleDownloadStory(story.id, story.title)} className="p-2 rounded-lg bg-white/5 hover:text-emerald-400 transition" title="Tải xuống">
                                            <Download size={14} />
                                        </button>
                                        <button onClick={() => setStoryToDelete(story)} className="p-2 rounded-lg bg-white/5 hover:text-red-400 transition" title="Xóa tác phẩm">
                                            <Trash2 size={14} />
                                        </button>
                                        <Link to={`/stories/${story.id}/editor`} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center">
                                            Viết tiếp
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-slate-500 italic">Không tìm thấy truyện nào.</div>
                )}
            </div>

            <CustomModal isOpen={!!storyToDelete} onClose={() => setStoryToDelete(null)} onConfirm={confirmDeleteStory} title="Xác nhận xóa tác phẩm" message={`Bạn có chắc chắn muốn xóa vĩnh viễn tác phẩm "${storyToDelete?.title}" không? Hành động này không thể hoàn tác.`} confirmText="Xóa tác phẩm" cancelText="Hủy" type="danger" />
        </div>
    );
}
