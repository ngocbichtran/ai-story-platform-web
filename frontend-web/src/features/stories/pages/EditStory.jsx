import { useEffect, useState } from "react";
import { BookOpen, ArrowLeft, Loader2, Save, Lightbulb } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function EditStory() {
    const navigate = useNavigate();

    // =========================
    // MOCK DATA
    // =========================
    const mockStory = {
        id: 1,
        title: "Sherlock Holmes",
        description: "Một thám tử thiên tài phá các vụ án bí ẩn tại London.",
        genres: ["Mystery", "Adventure"],
        cover: "https://picsum.photos/300/450",
    };

    // =========================
    // STATE
    // =========================

    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");

    const [storyPlanning, setStoryPlanning] = useState("");

    const [isSaving, setIsSaving] = useState(false);

    const [showGenreModal, setShowGenreModal] = useState(false);

    const [genres, setGenres] = useState(["Fantasy", "Adventure", "Romance", "Action", "Horror", "Mystery"]);

    const [selectedGenres, setSelectedGenres] = useState([]);

    const [showCreateGenre, setShowCreateGenre] = useState(false);

    const [newGenre, setNewGenre] = useState("");

    const [coverPreview, setCoverPreview] = useState(null);

    const [coverFile, setCoverFile] = useState(null);

    const [selectedStory, setSelectedStory] = useState("");

    const [reverseIdea, setReverseIdea] = useState("");

    const stories = [
        {
            id: 1,
            title: "Sherlock Holmes",
        },
        {
            id: 2,
            title: "Chuyển sinh làm kiếm",
        },
        {
            id: 3,
            title: "Ma Đạo",
        },
    ];

    // =========================
    // LOAD MOCK STORY
    // =========================

    useEffect(() => {
        setTitle(mockStory.title);

        setSummary(mockStory.description);

        setSelectedGenres(mockStory.genres);

        setCoverPreview(mockStory.cover);
    }, []);

    // =========================
    // GENRE
    // =========================

    const toggleGenre = (genre) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter((g) => g !== genre));
        } else {
            setSelectedGenres([...selectedGenres, genre]);
        }
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

    // =========================
    // COVER
    // =========================

    const handleCoverChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setCoverFile(file);

        setCoverPreview(URL.createObjectURL(file));
    };

    // =========================
    // SAVE (MOCK)
    // =========================

    const handleSave = async () => {
        if (!title.trim()) {
            return toast.error("Vui lòng nhập tên truyện!");
        }

        if (!summary.trim()) {
            return toast.error("Vui lòng nhập mô tả!");
        }

        if (selectedGenres.length === 0) {
            return toast.error("Vui lòng chọn thể loại!");
        }

        setIsSaving(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));

            console.log({
                title,
                summary,
                selectedGenres,
                coverFile,
            });

            toast.success("Cập nhật truyện thành công!");

            navigate("/stories");
        } catch (err) {
            toast.error("Có lỗi xảy ra.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white relative overflow-hidden flex flex-col justify-between">
            {/* BACKGROUND */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none" />
            <section className="relative z-10 flex-1 flex items-center w-full max-w-7xl mx-auto px-6 py-4">
                <div className="grid lg:grid-cols-2 gap-8 w-full items-stretch">
                    {/* ================= LEFT CARD ================= */}
                    <div className="flex flex-col justify-between max-h-[600px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-4">
                            <div className="flex items-center gap-3">
                                <BookOpen className="text-blue-400" />
                                <h2 className="text-xl font-bold">Chỉnh sửa truyện</h2>
                            </div>

                            <button onClick={() => window.history.back()} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 hover:bg-white/10 transition">
                                <ArrowLeft size={16} />
                                Quay lại
                            </button>
                        </div>

                        {/* CONTENT */}
                        <div className="mt-6 space-y-8">
                            {/* FORM */}
                            <div className="space-y-6">
                                {/* TÊN */}
                                <div className="flex items-center gap-4">
                                    <label className="w-24 shrink-0 text-sm font-medium text-slate-300">Tên truyện</label>

                                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nhập tên truyện" className="flex-1 h-12 rounded-xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500" />
                                </div>

                                {/* THỂ LOẠI */}
                                <div className="flex items-center gap-4">
                                    <label className="w-24 shrink-0 text-sm font-medium text-slate-300">Thể loại</label>

                                    <button type="button" onClick={() => setShowGenreModal(true)} className="flex-1 min-h-12 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-slate-300 hover:bg-white/10 transition">
                                        {selectedGenres.length ? selectedGenres.join(", ") : "Chọn thể loại"}
                                    </button>
                                </div>

                                {/* ẢNH BÌA */}
                                <div className="flex items-center gap-4">
                                    <label className="w-24 shrink-0 text-sm font-medium text-slate-300">Ảnh bìa</label>

                                    <div className="flex flex-1 items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                                        <span className="truncate text-sm text-slate-400">{coverFile ? coverFile.name : "Giữ nguyên ảnh hiện tại"}</span>

                                        <label className="cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 transition">
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

                                    <button type="button" className="h-12 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 font-semibold hover:scale-[1.02] active:scale-95 transition">
                                        Đảo ngược
                                    </button>
                                </div>

                                <textarea readOnly value={reverseIdea} placeholder="Ý tưởng đảo ngược sẽ xuất hiện tại đây..." className="h-44 w-full resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500" />
                            </div>
                        </div>
                    </div>{" "}
                    {/* ================= RIGHT CARD ================= */}
                    <div className="flex max-h-[600px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                        {/* Header */}
                        <div className="border-b border-white/10 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <Lightbulb className="text-yellow-400" size={20} />

                                <h2 className="text-lg font-bold">Thông tin tác phẩm</h2>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col gap-6 p-6">
                            {/* Cover + Info */}
                            <div className="flex gap-5">
                                {/* Cover */}
                                <div className="flex aspect-[3/4] w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">{coverPreview ? <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" /> : <span className="text-xs text-slate-500">Chưa có ảnh</span>}</div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold break-words">{title || "Tên truyện"}</h2>

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

                            {/* Description */}
                            <div className="flex flex-col flex-1">
                                <h3 className="mb-3 font-semibold">Mô tả truyện</h3>

                                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Viết mô tả truyện..." className="flex-1 min-h-[220px] resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500" />
                            </div>

                            {/* Save Button */}
                            <button onClick={handleSave} disabled={isSaving} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 font-semibold transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
                                {isSaving ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </section>{" "}
            {/* ================= GENRE MODAL ================= */}
            {showGenreModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-[440px] rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl">
                        <h3 className="mb-4 text-center text-lg font-bold">Chọn thể loại truyện</h3>

                        {/* CREATE GENRE */}
                        <div className="mb-4">
                            {!showCreateGenre ? (
                                <button onClick={() => setShowCreateGenre(true)} className="w-full rounded-xl border border-dashed border-violet-500 py-2 text-violet-400 transition hover:bg-violet-500/10">
                                    + Tạo thể loại mới
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <input type="text" value={newGenre} onChange={(e) => setNewGenre(e.target.value)} placeholder="Nhập tên thể loại..." className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-violet-500" />

                                    <button onClick={handleCreateGenre} className="rounded-xl bg-violet-600 px-4 hover:bg-violet-700">
                                        Thêm
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowCreateGenre(false);
                                            setNewGenre("");
                                        }}
                                        className="rounded-xl bg-white/10 px-3 hover:bg-white/20"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* LIST GENRES */}
                        <div className="grid max-h-[280px] grid-cols-2 gap-2.5 overflow-y-auto pr-1">
                            {genres.map((genre) => (
                                <button key={genre} onClick={() => toggleGenre(genre)} className={`rounded-xl border p-2.5 text-sm transition-all ${selectedGenres.includes(genre) ? "border-violet-500 bg-violet-500/20 font-medium text-violet-300" : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10"}`}>
                                    {genre}
                                </button>
                            ))}
                        </div>

                        {/* FOOTER */}
                        <div className="mt-6 flex justify-end gap-2 border-t border-white/5 pt-4">
                            <button onClick={() => setShowGenreModal(false)} className="rounded-xl bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                                Hủy
                            </button>

                            <button onClick={() => setShowGenreModal(false)} className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-2 text-sm">
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
