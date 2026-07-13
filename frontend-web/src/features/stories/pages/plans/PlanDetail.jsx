import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Save, PenSquare, Plus, Trash2, BookOpen, Clapperboard, FileText, Heading, AlignLeft, CalendarDays, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function ChapterSceneManager() {
    const { storyId } = useParams();
    const navigate = useNavigate();
    // MOCK DATA (Theo cấu trúc Collection)
    const [chapters, setChapters] = useState([
        { _id: "cp001", storyId: 15, chapterNumber: 1, title: "Khởi đầu", summary: "Giới thiệu nhân vật chính và bối cảnh." },
        { _id: "cp002", storyId: 15, chapterNumber: 2, title: "Biến cố", summary: "Sự cố đầu tiên xảy ra khiến nhân vật phải lựa chọn." },
    ]);

    const [scenes, setScenes] = useState([
        { _id: "scene001", chapterId: "cp001", storyId: 15, sceneOrder: 1, title: "Ở trường", summary: "Giới thiệu nhân vật chính.", content: "Nội dung chi tiết phân cảnh 1..." },
        { _id: "scene002", chapterId: "cp001", storyId: 15, sceneOrder: 2, title: "Đường về nhà", summary: "Gặp gỡ nhân vật phụ.", content: "Nội dung chi tiết phân cảnh 2..." },
    ]);

    // STATE QUẢN LÝ UI
    const [selectedChapterId, setSelectedChapterId] = useState("cp001");
    const [activeTab, setActiveTab] = useState("plan"); // "plan" hoặc "scenes"
    const [isEditingChapter, setIsEditingChapter] = useState(false);

    // State riêng cho Scene (Phân cảnh đang chọn để Xem/Sửa hoặc Thêm mới)
    const [selectedScene, setSelectedScene] = useState(null);
    const [isEditingScene, setIsEditingScene] = useState(false);

    // =====================================================
    // DỮ LIỆU HIỆN TẠI
    // =====================================================
    const currentChapter = chapters.find((c) => c._id === selectedChapterId) || chapters[0];
    const currentScenes = scenes.filter((s) => s.chapterId === selectedChapterId).sort((a, b) => a.sceneOrder - b.sceneOrder);

    // Form tạm để chỉnh sửa
    const [chapterForm, setChapterForm] = useState({ title: "", summary: "" });
    const [sceneForm, setSceneForm] = useState({ title: "", summary: "", content: "", sceneOrder: 1 });

    // Kích hoạt chế độ sửa chương
    const startEditChapter = () => {
        if (!currentChapter) return;
        setChapterForm({ title: currentChapter.title, summary: currentChapter.summary });
        setIsEditingChapter(true);
    };

    // Lưu chương
    const handleSaveChapter = () => {
        setChapters((prev) => prev.map((c) => (c._id === currentChapter._id ? { ...c, ...chapterForm } : c)));
        setIsEditingChapter(false);
    };

    // Thêm chương mới tự động tăng số chương
    const handleAddChapter = () => {
        const nextNum = chapters.length + 1;
        const newId = `cp00${Date.now()}`;
        const newCh = {
            _id: newId,
            storyId: Number(storyId) || 15,
            chapterNumber: nextNum,
            title: `Chương ${nextNum} (Mới)`,
            summary: "Tóm tắt chương mới...",
        };
        setChapters([...chapters, newCh]);
        setSelectedChapterId(newId);
        setIsEditingChapter(false);
    };

    // Xóa chương
    const handleDeleteChapter = (id, e) => {
        e.stopPropagation(); // Tránh kích hoạt select chapter
        if (window.confirm("Bạn có chắc muốn xóa chương này và các phân cảnh liên quan?")) {
            setChapters((prev) => prev.filter((c) => c._id !== id));
            setScenes((prev) => prev.filter((s) => s.chapterId !== id));
            if (selectedChapterId === id) {
                const remaining = chapters.filter((c) => c._id !== id);
                if (remaining.length > 0) setSelectedChapterId(remaining[0]._id);
            }
        }
    };

    // Kích hoạt xem/sửa phân cảnh
    const startEditScene = (scene, editMode = false) => {
        setSelectedScene(scene);
        setSceneForm({ title: scene.title, summary: scene.summary, content: scene.content, sceneOrder: scene.sceneOrder });
        setIsEditingScene(editMode);
    };

    // Lưu hoặc Thêm mới phân cảnh
    const handleSaveScene = () => {
        if (selectedScene?._id === "new") {
            // Thêm mới
            const newSc = {
                _id: `scene00${Date.now()}`,
                chapterId: currentChapter._id,
                storyId: currentChapter.storyId,
                ...sceneForm,
            };
            setScenes([...scenes, newSc]);
            setSelectedScene(newSc);
        } else {
            // Cập nhật
            setScenes((prev) => prev.map((s) => (s._id === selectedScene._id ? { ...s, ...sceneForm } : s)));
            setSelectedScene({ ...selectedScene, ...sceneForm });
        }
        setIsEditingScene(false);
    };

    // Chuẩn bị form thêm phân cảnh mới
    const startAddScene = () => {
        setSelectedScene({ _id: "new" });
        setSceneForm({ title: "", summary: "", content: "", sceneOrder: currentScenes.length + 1 });
        setIsEditingScene(true);
    };

    // Xóa phân cảnh
    const handleDeleteScene = (id) => {
        if (window.confirm("Bạn có chắc muốn xóa phân cảnh này?")) {
            setScenes((prev) => prev.filter((s) => s._id !== id));
            setSelectedScene(null);
            setIsEditingScene(false);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#080d1a] text-[#dae2fd] p-6 gap-6">
            {/* =====================================================
                CỘT TRÁI: DANH SÁCH CHƯƠNG
               ===================================================== */}
            <aside className="w-1/4 min-w-[250px] flex flex-col rounded-3xl border border-white/10 bg-[#131720] overflow-hidden">
                <div className="p-3 border-b border-white/10">
                    <button onClick={() => navigate("/stories/${storyId}/editor")} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white transition">
                        Quay lại
                    </button>
                </div>

                <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <BookOpen size={18} className="text-blue-400" /> Danh sách
                    </h3>
                    <button onClick={handleAddChapter} className="flex items-center gap-1 rounded-xl bg-[#0571d3] px-3 py-1.5 text-xs font-semibold hover:bg-[#0460b3] transition text-white">
                        <Plus size={14} /> Thêm
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 custom-scroll">
                    {chapters.map((ch) => (
                        <div
                            key={ch._id}
                            onClick={() => {
                                setSelectedChapterId(ch._id);
                                setSelectedScene(null);
                                setIsEditingScene(false);
                                setIsEditingChapter(false);
                            }}
                            className={`group flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition-all ${selectedChapterId === ch._id ? "border-blue-500 bg-blue-500/10 text-white shadow-lg" : "border-white/5 bg-[#0F172A]/40 text-slate-400 hover:bg-white/5"}`}
                        >
                            <div className="flex flex-col min-w-0 pr-2">
                                <span className="text-xs font-semibold text-slate-500 group-hover:text-blue-400 transition">Chương {ch.chapterNumber}</span>
                                <span className="font-bold text-sm truncate text-slate-200 mt-0.5">{ch.title}</span>
                            </div>
                            <button onClick={(e) => handleDeleteChapter(ch._id, e)} className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 transition shrink-0">
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {chapters.length === 0 && <div className="text-center italic text-slate-500 text-sm mt-4">Chưa có kế hoạch nào.</div>}
                </div>
            </aside>

            {/* =====================================================
                CỘT PHẢI: CHI TIẾT TABS (KẾ HOẠCH HOẶC PHÂN CẢNH)
               ===================================================== */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* MENU TAB ĐIỀU HƯỚNG */}
                <section className="mb-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#131720] p-2 shrink-0">
                    <div className="flex gap-2">
                        <button onClick={() => setActiveTab("plan")} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === "plan" ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                            <BookOpen size={16} /> Kế hoạch chương
                        </button>

                        <button onClick={() => setActiveTab("scenes")} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${activeTab === "scenes" ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                            <Clapperboard size={16} /> Phân cảnh ({currentScenes.length})
                        </button>
                    </div>
                </section>

                {/* VÙNG NỘI DUNG CHÍNH CỦA TAB */}
                <section className="flex-1 min-h-0 flex flex-col rounded-3xl border border-white/10 bg-[#131720] p-6 overflow-hidden">
                    {!currentChapter ? (
                        <div className="flex h-full items-center justify-center italic text-slate-500">Vui lòng tạo hoặc chọn một chương để bắt đầu.</div>
                    ) : activeTab === "plan" ? (
                        /* =====================================================
                           NỘI DUNG TAB: KẾ HOẠCH CHƯƠNG
                           ===================================================== */
                        <div className="flex flex-col h-full gap-4">
                            <div className="flex items-center justify-between border-b border-white/5 pb-3">
                                <div>
                                    <h2 className="text-xl font-bold text-white">Chi tiết Kế Hoạch Chương</h2>
                                </div>

                                {activeTab === "plan" &&
                                    currentChapter &&
                                    (!isEditingChapter ? (
                                        <button onClick={startEditChapter} className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0460b3]">
                                            <PenSquare size={16} />
                                            Sửa kế hoạch
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setIsEditingChapter(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5">
                                                Hủy
                                            </button>

                                            <button onClick={handleSaveChapter} className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0460b3]">
                                                <Save size={16} />
                                                Lưu kế hoạch
                                            </button>
                                        </div>
                                    ))}
                            </div>

                            <div className="flex flex-col gap-4 mt-2">
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Số chương */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">Số thứ tự</label>

                                        {isEditingChapter ? (
                                            <input
                                                type="text"
                                                value={chapterForm.title}
                                                onChange={(e) =>
                                                    setChapterForm({
                                                        ...chapterForm,
                                                        title: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-4 py-3 text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                            />
                                        ) : (
                                            <div className="rounded-xl border border-white/10 bg-[#0F172A]/70 px-4 py-3 text-slate-100 font-medium">1</div>
                                        )}
                                    </div>

                                    {/* Phiên bản */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">Tên kế hoạch</label>

                                        {isEditingChapter ? (
                                            <input
                                                type="text"
                                                value={chapterForm.versionName}
                                                onChange={(e) =>
                                                    setChapterForm({
                                                        ...chapterForm,
                                                        versionName: e.target.value,
                                                    })
                                                }
                                                className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-4 py-3 text-slate-200 placeholder:text-slate-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                            />
                                        ) : (
                                            <div className="rounded-xl border border-white/10 bg-[#0F172A]/70 px-4 py-3 text-slate-100 font-medium">{currentChapter.version_name || "Biến cố"}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Tóm tắt chương */}
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">Tóm tắt chương</label>
                                    {isEditingChapter ? <textarea value={chapterForm.summary} onChange={(e) => setChapterForm({ ...chapterForm, summary: e.target.value })} rows={6} className="w-full rounded-xl border border-white/10 bg-[#0F172A] p-4 text-slate-200 outline-none focus:border-blue-500 transition resize-none leading-7 h-[290px] custom-scroll" /> : <div className="rounded-xl border border-white/5 bg-[#0F172A]/60 p-4 text-slate-300 whitespace-pre-wrap leading-7 h-[290px] custom-scroll">{currentChapter.summary || <span className="italic text-slate-600">Chưa có tóm tắt cho chương này.</span>}</div>}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* =====================================================
                           NỘI DUNG TAB: QUẢN LÝ PHÂN CẢNH
                           ===================================================== */
                        <div className="flex h-full gap-5 overflow-hidden">
                            {/* Danh sách phân cảnh dạng cột nhỏ ở trong */}
                            <div className="w-2/5 border-r border-white/10 pr-4 flex flex-col gap-2 overflow-y-auto custom-scroll">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Danh sách phân cảnh</span>
                                    <button onClick={startAddScene} className="flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1 text-xs font-semibold text-blue-400 hover:bg-blue-500/20 transition">
                                        <Plus size={12} /> Thêm
                                    </button>
                                </div>

                                {currentScenes.map((scene) => (
                                    <div key={scene._id} onClick={() => startEditScene(scene, false)} className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${selectedScene?._id === scene._id ? "border-violet-500 bg-violet-500/10 text-white" : "border-white/5 bg-[#0F172A]/40 text-slate-400 hover:bg-white/5"}`}>
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-violet-400">#Cảnh {scene.sceneOrder}</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteScene(scene._id);
                                                    }}
                                                    className="p-1 hover:text-red-400"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </div>
                                        <h4 className="font-semibold text-sm text-slate-200 mt-1 truncate">{scene.title}</h4>
                                    </div>
                                ))}

                                {currentScenes.length === 0 && <div className="text-center italic text-slate-600 text-xs mt-6">Chưa có phân cảnh nào trong chương này.</div>}
                            </div>

                            {/* Chi tiết / Chỉnh sửa Phân cảnh bên cạnh */}
                            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scroll">
                                {selectedScene ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <h4 className="font-bold text-white flex items-center gap-2 text-base">{selectedScene._id === "new" ? "Phân cảnh mới" : `Cảnh ${sceneForm.sceneOrder}`}</h4>

                                            {isEditingScene ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => setIsEditingScene(false)} className="px-2.5 py-1 text-xs border border-white/10 rounded-lg text-slate-400 hover:bg-white/5">
                                                        Hủy
                                                    </button>
                                                    <button onClick={handleSaveScene} className="px-2.5 py-1 text-xs bg-blue-500 text-white rounded-lg flex items-center gap-1 hover:bg-blue-600">
                                                        <Save size={12} /> Lưu
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setIsEditingScene(true)} className="px-2.5 py-1 text-xs bg-[#0571d3] text-white rounded-lg flex items-center gap-1 hover:bg-blue-600">
                                                    <PenSquare size={12} /> Sửa nội dung
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-3 text-sm">
                                            {/* Thứ tự và Tiêu đề */}
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="col-span-1">
                                                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Thứ tự</label>
                                                    <input type="number" disabled={!isEditingScene} value={sceneForm.sceneOrder} onChange={(e) => setSceneForm({ ...sceneForm, sceneOrder: Number(e.target.value) })} className="w-full rounded-lg border border-white/10 bg-[#0F172A] p-2 text-slate-200 outline-none focus:border-blue-500 disabled:opacity-60" />
                                                </div>
                                                <div className="col-span-3">
                                                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Tiêu đề cảnh</label>
                                                    <input type="text" disabled={!isEditingScene} value={sceneForm.title} onChange={(e) => setSceneForm({ ...sceneForm, title: e.target.value })} placeholder="Nhập tên phân cảnh..." className="w-full rounded-lg border border-white/10 bg-[#0F172A] p-2 text-slate-200 outline-none focus:border-blue-500 disabled:opacity-60" />
                                                </div>
                                            </div>

                                            {/* Tóm tắt cảnh */}
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Tóm tắt ngắn</label>
                                                <input type="text" disabled={!isEditingScene} value={sceneForm.summary} onChange={(e) => setSceneForm({ ...sceneForm, summary: e.target.value })} placeholder="Tóm tắt ngắn hành động chính..." className="w-full rounded-lg border border-white/10 bg-[#0F172A] p-2 text-slate-200 outline-none focus:border-blue-500 disabled:opacity-60" />
                                            </div>

                                            {/* Nội dung chi tiết cảnh */}
                                            <div>
                                                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Nội dung chi tiết phân cảnh</label>
                                                {isEditingScene ? <textarea rows={6} value={sceneForm.content} onChange={(e) => setSceneForm({ ...sceneForm, content: e.target.value })} placeholder="Viết diễn biến chi tiết tại đây..." className="w-full rounded-lg border border-white/10 bg-[#0F172A] p-3 text-slate-200 outline-none focus:border-blue-500 resize-none leading-6  h-[260px] " /> : <div className="rounded-lg border border-white/5 bg-[#0F172A]/60 p-3 text-slate-300 h-[260px] whitespace-pre-wrap leading-6 text-xs">{selectedScene.content || <span className="italic text-slate-600">Chưa có nội dung chi tiết. Click "Sửa nội dung" để viết truyện.</span>}</div>}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-full items-center justify-center italic text-slate-600 text-xs py-10">
                                        <Eye size={14} className="mr-1" /> Chọn hoặc thêm một phân cảnh cụ thể để xem chi tiết.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
