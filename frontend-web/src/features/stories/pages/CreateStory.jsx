import { useState } from "react";
import { BookOpen, ArrowLeft, Loader2, Forward, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CreateStory() {
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [storyPlanning, setStoryPlanning] = useState(""); // Giữ nguyên để mai mốt hiển thị kịch bản AI
    const [isCreating, setIsCreating] = useState(false);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [genres, setGenres] = useState(["Fantasy", "Adventure", "Romance", "Action", "Horror", "Mystery"]);
    const [selectedGenres, setSelectedGenres] = useState([]);

    const navigate = useNavigate();

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter((g) => g !== genre));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
    };

    // Helper: Gom dữ liệu thô gửi lên API
    const preparePayload = () => {
        const genreIds = selectedGenres.map((g) => genres.indexOf(g) + 1);
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const localPath = `/baostory/workspace/stories/${slug}`;
        return {
            title: title,
            description: summary,
            local_folder_path: localPath,
            genre_ids: genreIds,
        };
    };

    // =========================================================================
    // LUỒNG TẠO TRUYỆN THUẦN - ĐÃ THIẾT KẾ SẴN LUỒNG 2 BƯỚC (CHẠY NGẦM)
    // =========================================================================
    const handleCreate = async () => {
        if (!title.trim()) return alert("Vui lòng nhập tên truyện!");
        if (!summary.trim()) return alert("Vui lòng nhập mô tả cốt truyện!");
        if (selectedGenres.length === 0) return alert("Vui lòng chọn thể loại truyện!");

        setIsCreating(true);
        try {
            // Bước 1: Khởi tạo thông tin cơ bản bộ truyện (vào bảng stories và story_genres)
            const initResponse = await fetch("http://localhost:4000/api/stories/init", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(preparePayload()),
            });

            const initResult = await initResponse.json();
            if (!initResponse.ok || !initResult.success) {
                throw new Error(initResult.message || "Khởi tạo tác phẩm thất bại.");
            }

            const finalStoryId = initResult.data.story_id;

            // Bước 2: Chuẩn bị cấu trúc hồi trống (Hiện tại lưu thô, mai mốt thay thế bằng data của n8n)
            // Cấu trúc Object này được thiết kế khớp 100% với cấu trúc bảng 'story_planning'
            const defaultArcs = [
                {
                    part_number: 1,
                    title: "Hồi 1: Khởi đầu mới",
                    plot_summary: summary, // Lấy luôn mô tả của user làm nội dung hồi 1
                    climax: "Chưa thiết lập cao trào.",
                },
            ];

            // Gọi API phê duyệt/lưu cấu trúc phân hồi xuống MySQL
            const approveResponse = await fetch("http://localhost:4000/api/stories/approve-planning", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    story_id: finalStoryId,
                    arcs: defaultArcs,
                }),
            });

            const approveResult = await approveResponse.json();
            if (approveResponse.ok && approveResult.success) {
                alert("Chúc mừng! Tác phẩm mới đã được khởi tạo thành công trên BaoStory.");
                navigate("/stories");
            } else {
                alert(approveResult.message || "Không thể khởi tạo cấu trúc phân hồi.");
            }
        } catch (error) {
            console.error("Lỗi tạo truyện:", error);
            alert(error.message || "Lỗi hệ thống khi khởi tạo truyện.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white relative overflow-hidden flex flex-col justify-between">
            {/* BACKGROUND DECORATION */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none" />

            <section className="relative z-10 max-w-7xl w-full mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
                <div className="grid lg:grid-cols-2 gap-8 items-stretch">
                    {/* LEFT COLUMN: INPUT FORM */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between min-h-[550px]">
                        <div className="space-y-5">
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                    <BookOpen className="text-blue-400" />
                                    <h2 className="text-xl font-bold">Ý tưởng truyện</h2>
                                </div>

                                <button onClick={() => window.history.back()} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg transition-all">
                                    <ArrowLeft size={14} />
                                    Quay lại
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* TITLE */}
                                <div className="flex items-center gap-4">
                                    <label className="w-24 text-sm text-slate-300 shrink-0">Tên truyện:</label>
                                    <input value={title} onChange={(e) => setTitle(e.target.value)} disabled={isCreating} placeholder="Nhập tên truyện" className="flex-1 h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50" />
                                </div>

                                {/* GENRES */}
                                <div className="flex items-center gap-4">
                                    <label className="w-24 text-sm text-slate-300 shrink-0">Thể loại:</label>
                                    <button type="button" onClick={() => setShowGenreModal(true)} disabled={isCreating} className="flex-1 h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-left text-slate-300 hover:bg-white/10 transition-colors disabled:opacity-50">
                                        {selectedGenres.length > 0 ? `${selectedGenres.join(", ")}` : "Chọn thể loại"}
                                    </button>
                                </div>

                                {/* STORY DESCRIPTION */}
                                <div className="space-y-2 pt-2">
                                    <label className="text-sm text-slate-300 font-medium">Mô tả ý tưởng của bạn</label>
                                    <textarea rows={6} value={summary} onChange={(e) => setSummary(e.target.value)} disabled={isCreating} placeholder="Mô tả thế giới, nhân vật và kịch bản sơ bộ của bạn..." className="w-full h-44 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50" />
                                </div>
                            </div>
                        </div>

                        {/* NÚT SUBMIT */}
                        <div className="mt-8 max-w-md mx-auto w-full">
                            <button onClick={handleCreate} disabled={isCreating} className="w-full h-12 rounded-xl font-bold text-white transition-all shadow-xl bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 shadow-blue-500/10 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                {isCreating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>BaoStory đang lưu dự án...</span>
                                    </>
                                ) : (
                                    <>
                                        <Forward size={16} />
                                        <span>Khởi tạo & Lưu tác phẩm</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: AI STORY PLANNING (GIỮ DESIGN - ĐỢI AI) */}
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col min-h-[550px]">
                        <div className="bg-gradient-to-r from-blue-600/80 via-violet-600/80 to-purple-600/80 p-4 flex items-center gap-3 select-none">
                            <Lightbulb size={18} className="text-orange-300 shrink-0" />
                            <p className="text-xs text-slate-100 leading-relaxed">Khung kịch bản cấu trúc Hồi. Tính năng AI sinh kịch bản tự động đang được thiết lập nâng cấp.</p>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 overflow-hidden flex">
                                <textarea value={storyPlanning} readOnly placeholder="Dàn ý kịch bản từ AI sẽ xuất hiện tại đây sau khi hệ thống kích hoạt tính năng n8n AI..." className="w-full h-full bg-transparent text-slate-400 text-sm leading-6 resize-none outline-none overflow-y-auto custom-scroll font-mono select-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* GENRE MODAL */}
            {showGenreModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="w-[440px] bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-center">Chọn thể loại truyện</h3>
                        <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                            {genres.map((genre) => (
                                <button key={genre} onClick={() => toggleGenre(genre)} className={`p-2.5 text-sm rounded-xl border transition-all ${selectedGenres.includes(genre) ? "bg-violet-500/20 border-violet-500 text-violet-300 font-medium" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"}`}>
                                    {genre}
                                </button>
                            ))}
                        </div>
                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/5">
                            <button onClick={() => setShowGenreModal(false)} className="px-4 py-2 text-sm rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                                Hủy
                            </button>
                            <button onClick={() => setShowGenreModal(false)} className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 font-medium">
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
