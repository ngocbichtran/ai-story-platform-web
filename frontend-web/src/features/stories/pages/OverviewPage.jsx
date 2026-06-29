import { useEffect, useState } from "react";
import { BookOpen, ArrowLeft, Loader2, Save, Lightbulb } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function EditStory() {
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
    const navigate = useNavigate();
    const { storyId } = useParams();
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
            <section className="relative z-10 flex items-center w-full max-w-7xl mx-auto px-6 py-4">
                <div className="gap-8 w-full items-stretch">
                    {/* ================= RIGHT CARD ================= */}
                    <div className="  overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/20">
                                    <Lightbulb size={20} className="text-yellow-400" />
                                </div>

                                <div>
                                    <h2 className="text-xl font-bold text-white">Thông tin tác phẩm</h2>

                                    <p className="text-sm text-slate-400 mt-0.5">Quản lý thông tin, thể loại và cài đặt của truyện</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/stories/${storyId}/edit`)}
                                className="
        flex items-center gap-2
        rounded-xl
        border border-blue-500/20
        bg-gradient-to-r from-blue-600 to-violet-600
        px-5 py-2.5
        text-sm font-semibold text-white
        transition-all duration-200
        hover:scale-[1.03]
        hover:shadow-lg hover:shadow-blue-500/20
        active:scale-95
    "
                            >
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                Chỉnh sửa
                            </button>
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
                        </div>
                    </div>
                </div>
            </section>{" "}
        </div>
    );
}
