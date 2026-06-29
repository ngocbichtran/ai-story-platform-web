import { useState } from "react";
import { BookOpen, ArrowLeft, Loader2, Forward, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Copy, Check } from "lucide-react";
export default function CreateStory() {
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [storyPlanning, setStoryPlanning] = useState(""); // Giữ nguyên để mai mốt hiển thị kịch bản AI
    const [isCreating, setIsCreating] = useState(false);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [genres, setGenres] = useState(["Fantasy", "Adventure", "Romance", "Action", "Horror", "Mystery"]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [showCreateGenre, setShowCreateGenre] = useState(false);
    const [newGenre, setNewGenre] = useState("");
    const navigate = useNavigate();
    const [ideaMode, setIdeaMode] = useState("new");
    const [selectedStory, setSelectedStory] = useState("");
    const [reverseIdea, setReverseIdea] = useState("");
    const [copied, setCopied] = useState(false);
    const stories = [
        { id: 1, title: "Sherlock Holmes" },
        { id: 2, title: "Chuyển sinh làm kiếm" },
        { id: 3, title: "Ma Đạo" },
    ];
    //test
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);
    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter((g) => g !== genre));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
    };
    //test
    const handleCoverChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };
    const handleCreateGenre = () => {
        if (!newGenre.trim()) return;

        if (!genres.includes(newGenre.trim())) {
            setGenres([...genres, newGenre.trim()]);
        }

        setSelectedGenres([...selectedGenres, newGenre.trim()]);
        setNewGenre("");
        setShowCreateGenre(false);
    };

    const handleCopy = async (text) => {
        if (!text.trim()) return;

        await navigator.clipboard.writeText(text);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
        if (!title.trim()) return toast.error("Vui lòng nhập tên truyện!");
        if (!summary.trim()) return toast.error("Vui lòng nhập mô tả cốt truyện!");
        if (selectedGenres.length === 0) return toast.error("Vui lòng chọn thể loại truyện!");

        setIsCreating(true);
        try {
            // Bước 1: Khởi tạo thông tin cơ bản bộ truyện (vào bảng stories và story_genres)
            const initResponse = await fetch("https://api.baostory.fun/api/stories/init", {
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
            const approveResponse = await fetch("https://api.baostory.fun/api/stories/approve-planning", {
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
                toast.success("Chúc mừng! Tác phẩm mới đã được khởi tạo thành công trên BaoStory.");
                navigate("/stories");
            } else {
                toast.error(approveResult.message || "Không thể khởi tạo cấu trúc phân hồi.");
            }
        } catch (error) {
            console.error("Lỗi tạo truyện:", error);
            toast.error(error.message || "Lỗi hệ thống khi khởi tạo truyện.");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white relative overflow-hidden flex flex-col justify-between">
            {/* BACKGROUND DECORATION */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none" />

            <section className="relative z-10 flex-1 flex items-center w-full max-w-7xl mx-auto px-6 py-4">
                <div className="grid lg:grid-cols-2 gap-8 w-full items-stretch">
                    {/* LEFT CARD */}
                    <div className=" flex-col justify-between max-h-[600px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-blue-400" />
                                <h2 className="text-xl font-bold">Ý tưởng truyện</h2>
                            </div>

                            <button onClick={() => window.history.back()} className="flex items-center gap-1.5 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-white/10 hover:text-white">
                                <ArrowLeft size={14} />
                                Quay lại
                            </button>
                        </div>

                        {/* Content */}
                        <div className="mt-6 space-y-8">
                            {/* FORM */}
                            <div className="space-y-6">
                                {/* Tên truyện */}
                                <div className="flex items-center gap-4">
                                    <label className="w-24 shrink-0 text-sm font-medium text-slate-300">Tên truyện</label>

                                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên truyện" className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500" />
                                </div>

                                {/* Thể loại */}
                                <div className="flex items-center gap-4">
                                    <label className="w-24 shrink-0 text-sm font-medium text-slate-300">Thể loại</label>

                                    <button type="button" onClick={() => setShowGenreModal(true)} className="flex-1 min-h-12 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-slate-300 transition hover:bg-white/10">
                                        {selectedGenres.length ? selectedGenres.join(", ") : "Chọn thể loại"}
                                    </button>
                                </div>

                                {/* Ảnh bìa */}
                                <div className="flex items-center gap-4">
                                    <label className="w-24 shrink-0 text-sm font-medium text-slate-300">Ảnh bìa</label>

                                    <div className="flex flex-1 items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                        <span className="truncate text-sm text-slate-400">{coverFile ? coverFile.name : "Chưa chọn tệp"}</span>

                                        <label className="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-500">
                                            Chọn ảnh
                                            <input type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* AI REVERSE */}
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <select value={selectedStory} onChange={(e) => setSelectedStory(e.target.value)} className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white outline-none focus:border-violet-500">
                                        <option value="">Chọn tác phẩm...</option>

                                        {stories.map((story) => (
                                            <option key={story.id} value={story.id} className="bg-slate-900">
                                                {story.title}
                                            </option>
                                        ))}
                                    </select>

                                    <button type="button" className="h-12 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 font-semibold transition hover:scale-[1.02] active:scale-95">
                                        Đảo ngược
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => handleCopy("original", reverseIdea)}
                                            className="
        absolute
        top-3
        right-3
        z-10
        flex
        items-center
        justify-center
        w-9
        h-9
        rounded-lg
        border
        border-white/10
        bg-black/40
        text-slate-400
        hover:bg-violet-600
        hover:text-white
        transition-all
    "
                                        >
                                            {copied === "original" ? <CopyCheck size={18} /> : <Copy size={18} />}
                                        </button>

                                        <textarea readOnly value={reverseIdea} placeholder="Ý tưởng gốc..." className="h-40 w-full pr-24 custom-scroll resize-none rounded-2xl border border-white/10 bg-white/5 p-4" />
                                    </div>

                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => handleCopy("reverse", storyPlanning)}
                                            className="
        absolute
        top-3
        right-3
        z-10
        flex
        items-center
        justify-center
        w-9
        h-9
        rounded-lg
        border
        border-white/10
        bg-black/40
        text-slate-400
        hover:bg-violet-600
        hover:text-white
        transition-all
    "
                                        >
                                            {copied === "reverse" ? <CopyCheck size={18} /> : <Copy size={18} />}
                                        </button>

                                        <textarea readOnly value={storyPlanning} placeholder="Ý tưởng đảo ngược..." className="h-40 w-full pr-24 custom-scroll resize-none rounded-2xl border border-white/10 bg-white/5 p-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* RIGHT CARD */} {/* RIGHT CARD */}
                    <div className="flex max-h-[600px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                        {/* Header */}
                        <div className="border-b border-white/10 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <Lightbulb className="text-yellow-400" size={20} />

                                <h2 className="text-lg font-bold">Xem trước tác phẩm</h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col gap-6 p-6">
                            {/* Cover + Info */}
                            <div className="flex gap-5">
                                {/* Cover */}
                                <div className="flex aspect-[3/4] w-22 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">{coverPreview ? <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" /> : <span className="text-xs text-slate-500">Chưa có ảnh</span>}</div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold">{title || "Tên truyện"}</h2>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedGenres.length ? (
                                            selectedGenres.map((genre) => (
                                                <span key={genre} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300">
                                                    {genre}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-500">Chưa chọn thể loại</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Story Planning */}
                            <div className="flex flex-col">
                                <h3 className="mb-3 font-semibold">Mô tả ý tưởng bằng 1 câu văn</h3>

                                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Viết ý tưởng..." className="h-52 w-full custom-scroll resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500" />
                            </div>

                            {/* Button */}
                            <button onClick={handleCreate} disabled={isCreating} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 font-semibold transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
                                {isCreating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang tạo...
                                    </>
                                ) : (
                                    <>
                                        <Forward size={18} />
                                        Tạo truyện
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* GENRE MODAL */}
            {showGenreModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
                    <div className="w-[440px] bg-[#111827] border border-white/10 rounded-2xl p-6 shadow-2xl">
                        <h3 className="text-lg font-bold mb-4 text-center">Chọn thể loại truyện</h3>

                        {/* Tạo thể loại */}
                        <div className="mb-4">
                            {!showCreateGenre ? (
                                <button onClick={() => setShowCreateGenre(true)} className="w-full py-2 rounded-xl border border-dashed border-violet-500 text-violet-400 hover:bg-violet-500/10 transition">
                                    + Tạo thể loại mới
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input type="text" value={newGenre} onChange={(e) => setNewGenre(e.target.value)} placeholder="Nhập tên thể loại..." className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500" />

                                    <button onClick={handleCreateGenre} className="px-4 rounded-xl bg-violet-600 hover:bg-violet-700">
                                        Thêm
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowCreateGenre(false);
                                            setNewGenre("");
                                        }}
                                        className="px-3 rounded-xl bg-white/10 hover:bg-white/20"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Danh sách thể loại */}
                        <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                            {genres.map((genre) => (
                                <button key={genre} onClick={() => toggleGenre(genre)} className={`p-2.5 text-sm rounded-xl border transition-all ${selectedGenres.includes(genre) ? "bg-violet-500/20 border-violet-500 text-violet-300 font-medium" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"}`}>
                                    {genre}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/5">
                            <button onClick={() => setShowGenreModal(false)} className="px-4 py-2 text-sm rounded-xl bg-white/5 hover:bg-white/10">
                                Hủy
                            </button>

                            <button onClick={() => setShowGenreModal(false)} className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-blue-600 to-violet-600">
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
