import React, { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, Layers, Users, FolderHeart, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Đảm bảo đã cài đặt axios (hoặc dùng fetch thay thế)
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
export default function LeftSidebar({ storyId, setActiveTab, setSelectedChapter }) {
    const [chaptersList, setChaptersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeChapter, setActiveChapter] = useState(null);
    const [activeNav, setActiveNav] = useState("overview");
    const navigate = useNavigate();
    const [story, setStory] = useState(null);
    const navItems = [
        {
            id: "overview",
            label: "Tổng quan",
            path: `/stories/${storyId}/edit/overview`,
            icon: <Layers size={15} />,
        },
        {
            id: "world",
            label: "Thế giới",
            path: "/story/world",
            icon: <FolderHeart size={15} />,
        },
        {
            id: "characters",
            label: "Nhân vật",
            path: "/story/characters",
            icon: <Users size={15} />,
        },
    ];
    const [showCreateChapterModal, setShowCreateChapterModal] = useState(false);
    const [chapterTitle, setChapterTitle] = useState("");

    // Tạo chương
    const handleCreateChapter = async () => {
        if (!chapterTitle.trim()) {
            toast.error("Vui lòng nhập tên chương");
            return;
        }

        try {
            const response = await fetch("https://api.baostory.fun/api/chapters/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    story_id: storyId,
                    title: chapterTitle,
                }),
            });

            if (!response.ok) {
                throw new Error("Không thể tạo chương");
            }

            const result = await response.json();

            setChaptersList((prev) => [...prev, result.data]);

            setChapterTitle("");
            setShowCreateChapterModal(false);

            toast.success("Tạo chương thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Tạo chương thất bại");
        }
    };
    // Gọi API để lấy danh sách chương khi component mount hoặc storyId thay đổi
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const [storyRes, chaptersRes] = await Promise.all([axios.get(`https://api.baostory.fun/api/stories/${storyId}`), axios.get(`https://api.baostory.fun/api/chapters/story-chapters?story_id=${storyId}`)]);

                setStory(storyRes.data.data);
                setChaptersList(chaptersRes.data.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [storyId]);

    return (
        <aside className="h-full max-h-full flex flex-col gap-2.5 select-none overflow-hidden">
            {/* 1. NÚT BACK QUAY LẠI TRANG TRƯỚC */}
            <button onClick={() => navigate(-1)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-slate-950/20 hover:bg-slate-950/40 border border-white/5 transition duration-150 active:scale-[0.98] group flex-none" title="Quay lại trang trước">
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-white" />
                <span>Quay lại</span>
            </button>
            {/* 2. KHỐI THÔNG TIN TRUYỆN */}
            <div className="flex-none rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-3 flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 flex-none">
                    <BookOpen size={16} />
                </div>
                <div className="min-w-0 flex-1 w-full">
                    <div className="min-w-0 flex-1 w-full">
                        <h3 className="text-sm font-bold text-[#e0e2eb] block truncate mt-0.5" title={story?.title}>
                            {story?.title || "Đang tải truyện..."}
                        </h3>
                    </div>
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
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#8b919e] mb-2.5 flex-none">Danh sách chương</div>

                <div className="w-full flex-1 h-full overflow-y-auto pr-1 space-y-1 writing-canvas-scroll min-h-0">
                    {loading ? (
                        // Hiệu ứng Loading chờ tải dữ liệu
                        <div className="text-xs text-slate-500 text-center py-4 animate-pulse">Đang tải chương...</div>
                    ) : chaptersList.length === 0 ? (
                        <div className="text-xs text-slate-500 text-center py-4">Chưa có chương nào.</div>
                    ) : (
                        chaptersList.map((chapter, index) => {
                            // Xử lý linh hoạt trường hợp API trả về mảng object {id, title} hoặc mảng chuỗi thuần
                            const chapterId = chapter.id !== undefined ? chapter.id : `chapter-${index}`;
                            const chapterTitle = chapter.title || chapter;

                            return (
                                <button
                                    key={chapterId}
                                    onClick={() => {
                                        console.log("Clicked:", chapter.id);

                                        setActiveChapter(chapter.id);

                                        setSelectedChapter(chapter);

                                        setActiveTab("draft");
                                    }}
                                    className={`w-full text-left px-3 py-2 rounded-xl text-xs md:text-sm transition duration-150 ${activeChapter === chapterId ? "bg-[#1d2433] text-[#a7c8ff] font-bold shadow-sm border border-white/5" : "text-[#c1c6d5] hover:bg-[#181d29] hover:text-white"}`}
                                >
                                    <span className="block truncate" title={chapterTitle}>
                                        {chapterTitle}
                                    </span>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
            {/* 5. NÚT TẠO CHƯƠNG MỚI */}
            <button onClick={() => setShowCreateChapterModal(true)} className="h-11 rounded-2xl bg-[#0571d3] hover:bg-[#0460b3] active:scale-[0.98] text-white text-xs md:text-sm font-bold transition flex-none flex items-center justify-center gap-1.5 shadow-lg shadow-[#0571d3]/10">
                <Plus size={16} />
                <span>Tạo chương mới</span>
            </button>
            {showCreateChapterModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-[420px] rounded-3xl border border-white/10 bg-[#0B1120] p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-5">Tạo chương mới</h2>

                        <input type="text" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Ví dụ: Chương 5 - Thành phố cổ" className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-white outline-none focus:border-violet-500" />

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setShowCreateChapterModal(false)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10">
                                Huỷ
                            </button>

                            <button onClick={handleCreateChapter} className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold">
                                Tạo chương
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
