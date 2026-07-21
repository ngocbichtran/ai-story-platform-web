import React, { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Layers, Users, FolderHeart, Plus, ScrollText, Clapperboard, Loader2, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function LeftSidebar({ storyId, setActiveTab, setSelectedChapter }) {
    const [chaptersList, setChaptersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [activeChapter, setActiveChapter] = useState(null);
    const [activeNav, setActiveNav] = useState("overview");
    const navigate = useNavigate();
    const [story, setStory] = useState(null);

    const navItems = [
        { id: "overview", label: "Tổng quan", path: `/stories/${storyId}/editor/overview`, icon: <Layers size={15} /> },
        { id: "world", label: "Thế giới", path: `/stories/${storyId}/editor/worlds`, icon: <FolderHeart size={15} /> },
        { id: "characters", label: "Nhân vật", path: `/stories/${storyId}/editor/characters`, icon: <Users size={15} /> },
        { id: "plot", label: "Cốt truyện", path: `/stories/${storyId}/editor/plot`, icon: <ScrollText size={15} /> },
        { id: "plan", label: "Kế hoạch", path: `/stories/${storyId}/editor/plan`, icon: <Clapperboard size={16} /> },
    ];

    const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
    const [chapterTitle, setChapterTitle] = useState("");
    const [chapterNumberInput, setChapterNumberInput] = useState("");

    // =========================================================================
    // API: TẢI DANH SÁCH CHƯƠNG & THÔNG TIN DASHBOARD
    // =========================================================================
    const fetchData = async () => {
        if (!storyId) return;
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Gọi đồng thời cả 2 API lấy Thông tin Truyện và Danh sách Chương
            const [storyRes, chaptersRes] = await Promise.all([
                axios.get(`http://localhost:4000/api/stories/${storyId}`, config), // API lấy thông tin bộ truyện
                axios.get(`http://localhost:4000/api/chapters/${storyId}/chapters`, config), // API lấy danh sách chương
            ]);

            // Cập nhật State khi dữ liệu phản hồi thành công
            if (storyRes.data?.success) {
                setStory(storyRes.data.data);
            }

            if (chaptersRes.data?.success) {
                setChaptersList(chaptersRes.data.data || []);
            }
        } catch (error) {
            console.error("Lỗi đồng bộ dữ liệu Sidebar:", error);
            toast.error(error.response?.data?.message || "Không thể tải danh mục tác phẩm.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [storyId]);

    // =========================================================================
    // API: TẠO CHƯƠNG MỚI (Đã đổi thành camelCase: chapterNumber)
    // =========================================================================
    const handleCreateChapter = async () => {
        if (!chapterTitle.trim()) {
            toast.error("Vui lòng nhập tên chương!");
            return;
        }

        const parsedNumber = Number(chapterNumberInput);
        if (!chapterNumberInput || isNaN(parsedNumber) || parsedNumber <= 0) {
            toast.error("Số chương phải là số nguyên dương lớn hơn 0!");
            return;
        }

        try {
            setIsCreating(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                chapterNumber: parsedNumber, // Chuẩn hóa camelCase
                title: chapterTitle.trim(),
            };

            const res = await axios.post(`http://localhost:4000/api/chapters/${storyId}/chapters`, payload, config);

            if (res.data.success) {
                const newChapterObj = res.data.data || {
                    id: res.data.chapterId,
                    storyId: Number(storyId),
                    chapterNumber: parsedNumber,
                    title: chapterTitle.trim(),
                };

                setChaptersList((prev) => [...prev, newChapterObj]);
                setChapterTitle("");
                setChapterNumberInput("");
                setShowCreateChapterModal(false);
                toast.success("Tạo chương mới thành công!");

                setActiveNav("");
                setActiveChapter(parsedNumber);
                setSelectedChapter(newChapterObj);
                navigate(`/stories/${storyId}/editor/chapter/${parsedNumber}/edit`);
            }
        } catch (error) {
            console.error("Lỗi khởi tạo chương truyện:", error);
            toast.error(error.response?.data?.message || "Khởi tạo chương thất bại.");
        } finally {
            setIsCreating(false);
        }
    };

    // =========================================================================
    // API: XÓA CHƯƠNG TRUYỆN MỀM (DỒN SỐ TỰ ĐỘNG)
    // =========================================================================
    const handleDeleteChapter = async (e, targetChapterNumber) => {
        e.stopPropagation();

        const confirm = window.confirm(`Bạn có chắc muốn xóa chương ${targetChapterNumber}? Các chương sau sẽ tự động dồn số thứ tự.`);
        if (!confirm) return;

        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.delete(`http://localhost:4000/api/chapters/${storyId}/chapters/${targetChapterNumber}`, config);

            if (res.data.success) {
                toast.success("Xóa chương thành công!");
                if (activeChapter === targetChapterNumber) {
                    setActiveChapter(null);
                    navigate(`/stories/${storyId}/editor/overview`);
                }
                fetchData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Xóa thất bại.");
        }
    };

    return (
        <aside className="h-full max-h-full flex flex-col gap-2.5 select-none overflow-hidden">
            {/* 1. NÚT QUAY LẠI TRANG CHỦ */}
            <button onClick={() => navigate("/stories")} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-slate-950/20 hover:bg-slate-950/40 border border-white/5 transition duration-150 active:scale-[0.98] group flex-none" title="Quay lại danh sách truyện">
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-white" />
                <span>Quay lại</span>
            </button>

            {/* 2. KHỐI THÔNG TIN TRUYỆN */}
            <div className="flex-none rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-3 flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 flex-none">
                    <BookOpen size={16} />
                </div>
                <div className="min-w-0 flex-1 w-full">
                    <h3 className="text-sm font-bold text-[#e0e2eb] block truncate mt-0.5" title={story?.title}>
                        {story?.title || "Đang tải truyện..."}
                    </h3>
                </div>
            </div>

            {/* 3. MENU ĐIỀU HƯỚNG TỔNG QUAN */}
            <div className="flex-none rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-1.5 space-y-0.5">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => {
                            setActiveChapter(null);
                            setActiveNav(item.id);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs md:text-sm font-medium transition duration-150 ${activeNav === item.id ? "bg-[#1d2433] text-[#a7c8ff] font-bold border-l-2 border-[#0571d3] pl-2.5 shadow-md shadow-black/20" : "text-[#c1c6d5] hover:bg-[#181d29] hover:text-white"}`}
                    >
                        <span className={activeNav === item.id ? "text-[#a7c8ff]" : "text-[#8b919e]"}>{item.icon}</span>
                        <span>{item.label}</span>
                    </Link>
                ))}
            </div>

            {/* 4. DANH SÁCH CHƯƠNG TỰ CO GIÃN THÔNG MINH */}
            <div className="flex-1 rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-3 flex flex-col overflow-hidden min-h-0">
                <div className="text-[10px] uppercase font-black tracking-widest text-[#8b919e] mb-2.5 flex-none flex justify-between items-center">
                    <span>Danh sách chương</span>
                    <span className="text-slate-500 normal-case font-medium">{chaptersList.length} chương</span>
                </div>

                <div className="w-full flex-1 h-full overflow-y-auto pr-1 space-y-1 writing-canvas-scroll min-h-0 custom-scroll">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <Loader2 size={16} className="text-blue-500 animate-spin" />
                            <div className="text-xs text-slate-500 animate-pulse">Đang đồng bộ danh mục...</div>
                        </div>
                    ) : chaptersList.length === 0 ? (
                        <div className="text-xs text-slate-500 text-center py-6 italic border border-dashed border-white/5 rounded-xl bg-slate-950/10">Tác phẩm chưa có chương nào.</div>
                    ) : (
                        [...chaptersList]
                            .sort((a, b) => Number(a.chapterNumber) - Number(b.chapterNumber))
                            .map((chapter) => {
                                const displayTitle = chapter.title ? `Chương ${chapter.chapterNumber}: ${chapter.title}` : `Chương ${chapter.chapterNumber}`;
                                const isCurrentActive = activeChapter === chapter.chapterNumber;

                                return (
                                    <div key={chapter.id || chapter._id || `ch-${chapter.chapterNumber}`} className="relative group/chapter-row w-full flex items-center">
                                        <button
                                            onClick={() => {
                                                setActiveNav("");
                                                setActiveChapter(chapter.chapterNumber);
                                                setSelectedChapter(chapter);
                                                navigate(`/stories/${storyId}/editor/chapter/${chapter.chapterNumber}/edit`);
                                            }}
                                            className={`w-full text-left px-3 py-2.5 pr-10 rounded-xl text-xs md:text-sm transition-all duration-200 flex items-center gap-2 border ${isCurrentActive ? "bg-[#1d2433] text-[#a7c8ff] font-bold border-blue-500/30 shadow-sm" : "text-[#c1c6d5] border-transparent hover:bg-[#181d29] hover:text-white"}`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${isCurrentActive ? "bg-blue-400 scale-110" : "bg-slate-600 group-hover/chapter-row:bg-slate-400"}`} />
                                            <span className="block truncate flex-1" title={displayTitle}>
                                                {displayTitle}
                                            </span>
                                        </button>

                                        {/* NÚT XÓA CHƯƠNG */}
                                        <button onClick={(e) => handleDeleteChapter(e, chapter.chapterNumber)} className="absolute right-2 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover/chapter-row:opacity-100 transition-all duration-200" title={`Xóa chương ${chapter.chapterNumber}`}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                );
                            })
                    )}
                </div>
            </div>

            {/* 5. NÚT KÍCH HOẠT MODAL TẠO CHƯƠNG */}
            <button onClick={() => setShowCreateChapterModal(true)} className="h-11 rounded-2xl bg-[#0571d3] hover:bg-[#0460b3] active:scale-[0.98] text-white text-xs md:text-sm font-bold transition flex-none flex items-center justify-center gap-1.5 shadow-lg shadow-[#0571d3]/10">
                <Plus size={16} />
                <span>Tạo chương mới</span>
            </button>

            {/* MODAL TẠO CHƯƠNG */}
            {showCreateChapterModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="w-[440px] rounded-3xl border border-white/10 bg-[#0B1120] p-6 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />

                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span className="w-1.5 h-5 rounded-full bg-blue-500 block" />
                            Khởi tạo chương mới
                        </h2>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Số thứ tự chương <span className="text-red-400">*</span>
                                </label>
                                <input type="number" min="1" placeholder={`Gợi ý chương tiếp theo: ${chaptersList.length + 1}`} value={chapterNumberInput} onChange={(e) => setChapterNumberInput(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500 focus:bg-white/10 transition duration-200" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Tiêu đề chương <span className="text-red-400">*</span>
                                </label>
                                <input type="text" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Ví dụ: Khởi đầu mới tại thành phố cổ" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-blue-500 focus:bg-white/10 transition duration-200" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8 border-t border-white/5 pt-4">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowCreateChapterModal(false);
                                    setChapterTitle("");
                                    setChapterNumberInput("");
                                }}
                                className="h-10 px-4 rounded-xl bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10 transition active:scale-95 disabled:opacity-50"
                                disabled={isCreating}
                            >
                                Huỷ bỏ
                            </button>

                            <button type="button" onClick={handleCreateChapter} disabled={isCreating || !chapterTitle.trim() || !chapterNumberInput} className="h-10 px-5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold flex items-center justify-center gap-2 transition hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-blue-500/10">
                                {isCreating ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Đang kiểm tra...</span>
                                    </>
                                ) : (
                                    <span>Xác nhận tạo</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
