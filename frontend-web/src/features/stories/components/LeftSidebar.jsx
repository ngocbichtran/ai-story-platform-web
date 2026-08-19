import React, { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Layers, Users, FolderHeart, Plus, ScrollText, Clapperboard, Loader2, Trash2 } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function LeftSidebar({ storyId, setActiveTab, setSelectedChapter }) {
    const location = useLocation();
    const navigate = useNavigate();

    const [chaptersList, setChaptersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [activeChapter, setActiveChapter] = useState(null);
    const [activeNav, setActiveNav] = useState("");
    const [story, setStory] = useState(null);
    const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
    const [chapterTitle, setChapterTitle] = useState("");
    const [chapterNumberInput, setChapterNumberInput] = useState("");

    const navItems = [
        { id: "overview", label: "Tổng quan", path: `/stories/${storyId}/editor/overview`, icon: <Layers size={15} /> },
        { id: "worlds", label: "Thế giới", path: `/stories/${storyId}/editor/worlds`, icon: <FolderHeart size={15} /> },
        { id: "characters", label: "Nhân vật", path: `/stories/${storyId}/editor/characters`, icon: <Users size={15} /> },
        { id: "plot", label: "Cốt truyện", path: `/stories/${storyId}/editor/plot`, icon: <ScrollText size={15} /> },
        { id: "plan", label: "Kế hoạch", path: `/stories/${storyId}/editor/plan`, icon: <Clapperboard size={16} /> },
    ];

    // ĐỒNG BỘ NAVIGATION
    useEffect(() => {
        const currentPath = location.pathname;
        if (currentPath.includes("/editor/chapter/")) {
            const match = currentPath.match(/\/editor\/chapter\/(\d+)/);
            const chNum = match ? Number(match[1]) : null;
            setActiveChapter((prev) => (prev !== chNum ? chNum : prev));
            setActiveNav((prev) => (prev !== "" ? "" : prev));
        } else {
            setActiveChapter((prev) => (prev !== null ? null : prev));
            const matchedNav = navItems.find((item) => currentPath.endsWith(item.id));
            const newNav = matchedNav ? matchedNav.id : currentPath.endsWith("/editor") ? "overview" : "";
            setActiveNav((prev) => (prev !== newNav ? newNav : prev));
        }
    }, [location.pathname, storyId]);

    const fetchData = async () => {
        if (!storyId) return;
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const [storyRes, chaptersRes] = await Promise.all([axios.get(`https://api.baostory.fun/api/stories/${storyId}`, config), axios.get(`https://api.baostory.fun/api/chapters/${storyId}/chapters`, config)]);

            if (storyRes.data?.success) setStory(storyRes.data.data);
            console.log("CHAPTER API RESPONSE:", chaptersRes.data);
            console.table(chaptersRes.data.data);
            if (chaptersRes.data?.success) setChaptersList(chaptersRes.data.data || []);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [storyId]);

    // XỬ LÝ TẠO MỚI & XÓA CHƯƠNG
    const handleCreateChapter = async () => {
        if (!chapterTitle.trim() || !chapterNumberInput) return toast.error("Vui lòng nhập đủ thông tin!");
        try {
            setIsCreating(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.post(
                `https://api.baostory.fun/api/chapters/${storyId}/chapters`,
                {
                    chapterNumber: Number(chapterNumberInput),
                    title: chapterTitle.trim(),
                },
                config
            );

            if (res.data.success) {
                toast.success("Tạo chương thành công!");
                setShowCreateChapterModal(false);
                fetchData();
                navigate(`/stories/${storyId}/editor/chapter/${chapterNumberInput}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Khởi tạo chương thất bại.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteChapter = async (e, targetChapterNumber) => {
        e.stopPropagation();
        if (!window.confirm(`Xóa chương ${targetChapterNumber}?`)) return;
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.delete(`https://api.baostory.fun/api/chapters/${storyId}/chapters/${targetChapterNumber}`, config);
            toast.success("Đã xóa!");
            fetchData();
            if (activeChapter === targetChapterNumber) navigate(`/stories/${storyId}/editor/overview`);
        } catch (err) {
            toast.error("Xóa thất bại.");
        }
    };

    return (
        <aside className="h-full max-h-full flex flex-col gap-2.5 select-none overflow-hidden">
            <button onClick={() => navigate("/stories")} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-slate-950/20 hover:bg-slate-950/40 border border-white/5 transition active:scale-[0.98] flex-none">
                <ArrowLeft size={14} /> Quay lại
            </button>

            <div className="flex-none rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-3 flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 flex-none">
                    <BookOpen size={16} />
                </div>
                <h3 className="text-sm font-bold text-[#e0e2eb] truncate">{story?.title || "Đang tải..."}</h3>
            </div>

            <div className="flex-none rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-1.5 space-y-0.5">
                {navItems.map((item) => (
                    <Link key={item.id} to={item.path} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition ${activeNav === item.id ? "bg-[#1d2433] text-[#a7c8ff] font-bold border-l-2 border-[#0571d3] pl-2.5" : "text-[#c1c6d5] hover:bg-[#181d29] hover:text-white"}`}>
                        {item.icon} {item.label}
                    </Link>
                ))}
            </div>

            <div className="flex-1 rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-3 flex flex-col overflow-hidden min-h-0">
                <div className="text-[10px] uppercase font-black tracking-widest text-[#8b919e] mb-2.5 flex justify-between">
                    <span>Danh sách chương</span>
                    <span>{chaptersList.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scroll space-y-1">
                    {[...chaptersList]
                        .sort((a, b) => a.chapterNumber - b.chapterNumber)
                        .map((ch, index) => (
                            <div key={`${ch.chapterNumber}-${index}`} className="group flex items-center">
                                <button onClick={() => navigate(`/stories/${storyId}/editor/chapter/${ch.chapterNumber}`)} className={`w-full text-left px-3 py-2 rounded-xl text-xs ${activeChapter === ch.chapterNumber ? "bg-[#1d2433] text-blue-300 font-bold" : "text-[#c1c6d5] hover:bg-[#181d29]"}`}>
                                    {ch.title ? `Chương ${ch.chapterNumber}: ${ch.title}` : `Chương ${ch.chapterNumber}`}
                                </button>
                                <button onClick={(e) => handleDeleteChapter(e, ch.chapterNumber)} className="p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        ))}
                </div>
            </div>

            <div className="flex gap-2 flex-none">
                <button
                    onClick={() => {
                        const maxChapterNum = chaptersList.length > 0 ? Math.max(...chaptersList.map((ch) => Number(ch.chapterNumber) || 0)) : 0;
                        setChapterNumberInput(maxChapterNum + 1);
                        setChapterTitle("");
                        setShowCreateChapterModal(true);
                    }}
                    className="flex-1 h-11 rounded-2xl bg-[#0571d3] hover:bg-[#0460b3] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg shadow-[#0571d3]/10"
                >
                    <Plus size={16} /> Tạo mới
                </button>
            </div>

            {showCreateChapterModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-[400px] rounded-3xl border border-white/10 bg-[#0B1120] p-6 shadow-2xl">
                        <h2 className="text-lg font-bold text-white mb-4">Khởi tạo chương mới</h2>

                        <div className="mb-3">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Số thứ tự chương</label>
                            <input type="number" readOnly value={chapterNumberInput} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed outline-none" />
                        </div>

                        <div className="mb-4">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">Tiêu đề chương</label>
                            <input type="text" placeholder="Nhập tiêu đề chương..." value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-white outline-none focus:border-blue-500" />
                        </div>

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setShowCreateChapterModal(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition">
                                Huỷ
                            </button>
                            <button onClick={handleCreateChapter} disabled={isCreating} className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition">
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
