import { useState, useEffect } from "react";
import axios from "axios";
import { BookOpen, ArrowLeft, Loader2, Forward, Lightbulb, Copy, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import CustomSelect from "../../../features/styles/CustomSelect";

export default function CreateStory() {
    const [title, setTitle] = useState("");
    const [summary, setSummary] = useState("");
    const [storyPlanning, setStoryPlanning] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const [showGenreModal, setShowGenreModal] = useState(false);
    const [newGenre, setNewGenre] = useState("");
    const navigate = useNavigate();
    const [selectedStory, setSelectedStory] = useState("");
    const [reverseIdea, setReverseIdea] = useState("");
    const [copied, setCopied] = useState("");
    const [stories, setStories] = useState([]);
    const [loadingStories, setLoadingStories] = useState(false);
    const [genres, setGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [coverPreview, setCoverPreview] = useState(null);
    const [coverFile, setCoverFile] = useState(null);

    // Lấy danh sách thể loại
    const fetchGenres = async () => {
        try {
            const res = await axios.get("https://api.baostory.fun/api/genres");
            if (res.data.success) {
                setGenres(res.data.data);
            }
        } catch (err) {
            console.error("Lỗi lấy thể loại:", err);
        }
    };

    // Tạo thể loại mới
    const handleCreateGenre = async () => {
        if (!newGenre.trim()) {
            toast.error("Vui lòng nhập tên thể loại.");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Không tìm thấy phiên đăng nhập. Vui lòng đăng nhập lại!");
                return;
            }

            const res = await axios.post(
                "https://api.baostory.fun/api/genres",
                {
                    name: newGenre.trim(),
                    description: "",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.data.success) {
                await fetchGenres();
                setNewGenre("");
                toast.success("Tạo thể loại thành công!");
            }
        } catch (err) {
            console.error("Lỗi tạo thể loại từ Client:", err);
            toast.error(err.response?.data?.message || "Không thể tạo thể loại.");
        }
    };

    // XÓA MỀM THỂ LOẠI (Frontend - CreateStory.jsx)
    const handleDeleteGenre = async (e, genre) => {
        e.stopPropagation();

        const confirmDelete = window.confirm(`Bạn có chắc chắn muốn đưa thể loại "${genre.name}" vào thùng rác không?`);
        if (!confirmDelete) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Bạn cần đăng nhập để thực hiện chức năng này.");
                return;
            }

            const res = await axios.delete(`https://api.baostory.fun/api/genres/${genre.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.success) {
                // Gỡ bỏ khỏi danh sách đang chọn ở giao diện nếu lỡ chọn trúng cái vừa xóa
                setSelectedGenres((prev) => prev.filter((g) => g.id !== genre.id));

                // Tải lại danh sách (Chỉ còn các thể loại chưa bị xóa mềm)
                await fetchGenres();
                toast.success("Đã chuyển thể loại vào thùng rác!");
            }
        } catch (err) {
            console.error("Lỗi khi xóa thể loại:", err);
            toast.error(err.response?.data?.message || "Không thể thực hiện hành động này.");
        }
    };

    // Chọn / Bỏ chọn thể loại
    const toggleGenre = (genre) => {
        setSelectedGenres((prev) => {
            if (prev.some((g) => g.id === genre.id)) {
                return prev.filter((g) => g.id !== genre.id);
            }
            return [...prev, genre];
        });
    };

    const handleCoverChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleCopy = async (id, text) => {
        if (!text.trim()) return;
        await navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(""), 2000);
    };
    // Danh sách truyện của user
    const fetchStories = async () => {
        try {
            setLoadingStories(true);
            const response = await fetch("https://api.baostory.fun/api/stories/list", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setStories(result.data);
            } else {
                toast.error(result.message || "Không lấy được danh sách truyện");
            }
        } catch (error) {
            console.error(error);
            toast.error("Lỗi kết nối");
        } finally {
            setLoadingStories(false);
        }
    };

    useEffect(() => {
        fetchStories();
        fetchGenres();
    }, []);

    const preparePayload = () => {
        const genreIds = selectedGenres.map((g) => g.id);
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        const localPath = `/baostory/workspace/stories/${slug}`;
        return {
            title: title,
            description: summary,
            local_folder_path: localPath,
            genre_ids: genreIds,
        };
    };
    // Tạo truyện mới
    const handleCreate = async () => {
        if (!title.trim()) return toast.error("Vui lòng nhập tên truyện!");
        if (!summary.trim()) return toast.error("Vui lòng nhập mô tả cốt truyện!");
        if (selectedGenres.length === 0) return toast.error("Vui lòng chọn thể loại truyện!");

        setIsCreating(true);
        try {
            // Gọi API gộp duy nhất lên Backend
            const initResponse = await fetch("https://api.baostory.fun/api/stories/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify(preparePayload()),
            });

            if (!initResponse.ok) {
                throw new Error(`Yêu cầu thất bại với mã lỗi ${initResponse.status}. Vui lòng kiểm tra lại cấu hình Route Backend!`);
            }

            const initResult = await initResponse.json();

            // Nếu Backend xử lý chuỗi MySQL + MongoDB thành công
            if (initResult.success) {
                toast.success("Chúc mừng! Tác phẩm mới đã được khởi tạo thành công trên BaoStory.");
                navigate("/stories"); // Chuyển hướng về trang danh sách truyện
            } else {
                toast.error(initResult.message || "Khởi tạo tác phẩm thất bại.");
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
                    <div className="flex flex-col justify-between max-h-[600px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6">
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
                        <div className="mt-6 space-y-8 overflow-y-auto pr-1">
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
                                        {selectedGenres.length ? selectedGenres.map((g) => g.name).join(", ") : "Chọn thể loại"}
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
                                    <CustomSelect
                                        className="flex-1"
                                        value={selectedStory}
                                        loading={loadingStories}
                                        placeholder="Chọn tác phẩm..."
                                        onChange={setSelectedStory}
                                        options={stories.map((story) => ({
                                            value: story.id,
                                            label: story.title,
                                        }))}
                                    />
                                    <button type="button" className="h-12 whitespace-nowrap rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 font-semibold transition hover:scale-[1.02] active:scale-95">
                                        Đảo ngược
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="relative">
                                        <button type="button" onClick={() => handleCopy("original", reverseIdea)} className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-black/40 text-slate-400 hover:bg-violet-600 hover:text-white transition-all">
                                            {copied === "original" ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                        <textarea readOnly value={reverseIdea} placeholder="Ý tưởng gốc..." className="h-40 w-full pr-12 custom-scroll resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm" />
                                    </div>

                                    <div className="relative">
                                        <button type="button" onClick={() => handleCopy("reverse", storyPlanning)} className="absolute top-3 right-3 z-10 flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 bg-black/40 text-slate-400 hover:bg-violet-600 hover:text-white transition-all">
                                            {copied === "reverse" ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                        <textarea readOnly value={storyPlanning} placeholder="Ý tưởng đảo ngược..." className="h-40 w-full pr-12 custom-scroll resize-none rounded-2xl border border-white/10 bg-white/5 p-4 text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CARD */}
                    <div className="flex max-h-[600px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                        <div className="border-b border-white/10 px-6 py-5">
                            <div className="flex items-center gap-3">
                                <Lightbulb className="text-yellow-400" size={20} />
                                <h2 className="text-lg font-bold">Xem trước tác phẩm</h2>
                            </div>
                        </div>

                        <div className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
                            <div className="flex gap-5">
                                <div className="flex aspect-[3/4] w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5">{coverPreview ? <img src={coverPreview} alt="Cover" className="h-full w-full object-cover" /> : <span className="text-xs text-slate-500">Chưa có ảnh</span>}</div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold truncate max-w-[280px]">{title || "Tên truyện"}</h2>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedGenres.length ? (
                                            selectedGenres.map((genre) => (
                                                <span key={genre.id} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300">
                                                    {genre.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-500">Chưa chọn thể loại</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <h3 className="mb-3 font-semibold">Mô tả ý tưởng bằng 1 câu văn</h3>
                                <textarea value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Viết ý tưởng..." className="h-44 w-full custom-scroll resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-white placeholder:text-slate-500 outline-none focus:border-violet-500" />
                            </div>

                            <button onClick={handleCreate} disabled={isCreating} className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 font-semibold transition hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 mt-auto">
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
                            <div className="flex gap-2">
                                <input type="text" value={newGenre} onChange={(e) => setNewGenre(e.target.value)} placeholder="Nhập tên thể loại..." className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none focus:border-violet-500 text-white" />
                                <button onClick={handleCreateGenre} className="px-4 rounded-xl bg-violet-600 hover:bg-violet-700">
                                    Thêm
                                </button>
                            </div>
                        </div>

                        {/* Danh sách thể loại */}
                        <div className="grid grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1 custom-scroll">
                            {genres.map((genre) => {
                                const isSelected = selectedGenres.some((g) => g.id === genre.id);
                                return (
                                    <div key={genre.id} onClick={() => toggleGenre(genre)} className={`group relative flex items-center justify-between p-2.5 text-sm rounded-xl border cursor-pointer transition-all ${isSelected ? "bg-violet-500/20 border-violet-500 text-violet-300 font-medium" : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"}`}>
                                        {/* 1. Đăng ký pr-8 để chữ không bao giờ đè lên nút xóa */}
                                        <span className="truncate pr-8 select-none">{genre.name}</span>

                                        {/* 2. Bổ sung z-10 và pointer-events-auto để chắc chắn nút nhận diện hover/click */}
                                        <button type="button" onClick={(e) => handleDeleteGenre(e, genre)} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white transition-all opacity-0 group-hover:opacity-100 pointer-events-auto" title={`Xóa thể loại ${genre.name}`}>
                                            <X size={13} />
                                        </button>
                                    </div>
                                );
                            })}
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
