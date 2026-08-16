import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Lightbulb, BookOpen } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function ViewStoryDetail() {
    const navigate = useNavigate();
    const { storyId } = useParams();
    const [story, setStory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStoryDetail = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem("token");
                const config = {
                    headers: { Authorization: `Bearer ${token}` },
                };
                const res = await axios.get(`https://api.baostory.fun/api/stories/${storyId}`, config);

                if (res.data.success) {
                    setStory(res.data.data);
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết tác phẩm:", err);
                toast.error(err.response?.data?.message || "Không thể tải thông tin tác phẩm.");
                navigate("/stories");
            } finally {
                setIsLoading(false);
            }
        };

        if (storyId) fetchStoryDetail();
    }, [storyId, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B1120] flex items-center justify-center text-white">
                <Loader2 className="animate-spin text-violet-500 mr-2" size={24} />
                <span>Đang tải thông tin chi tiết tác phẩm...</span>
            </div>
        );
    }

    const renderGenres = () => {
        if (!story?.genres) return <span className="text-sm text-slate-500">Chưa chọn thể loại</span>;
        const genresArray = story.genres.split(", ");
        return genresArray.map((genreName, index) => (
            <span key={index} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300 font-medium border border-violet-500/10">
                {genreName}
            </span>
        ));
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white relative overflow-hidden flex flex-col justify-between">
            {/* BACKGROUND DECORATION */}
            <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-violet-600/10 blur-[120px] pointer-events-none" />

            <section className="relative z-10 flex items-center w-full max-w-7xl mx-auto px-6 py-4">
                <div className="gap-8 w-full items-stretch">
                    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
                        {/* HEADER DASHBOARD */}
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div className="flex items-center gap-4">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20">
                                    <BookOpen size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Tổng quan tác phẩm</h2>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button onClick={() => navigate(`/stories/${storyId}/edit`)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-blue-500/20 active:scale-95">
                                    Chỉnh sửa truyện
                                </button>
                            </div>
                        </div>

                        {/* DISPLAY CONTENT */}
                        <div className="flex flex-1 flex-col gap-6 p-6">
                            <div className="flex gap-6 items-start border-b border-white/5 pb-6">
                                <div className="flex aspect-[3/4] w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-inner">{story?.cover_image ? <img src={story.cover_image} alt="Cover" className="h-full w-full object-cover" /> : <span className="text-xs text-slate-500 text-center p-2">Chưa có ảnh bìa</span>}</div>
                                <div className="flex-1 space-y-3">
                                    <h1 className="text-3xl font-bold tracking-tight text-white break-words">{story?.title || "Chưa đặt tên truyện"}</h1>
                                    <div className="flex flex-col gap-1.5">
                                        <div className="flex flex-wrap gap-2">{renderGenres()}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">Tóm tắt nội dung cốt truyện</h3>
                                <div className="w-full min-h-[170px] rounded-2xl border border-white/5 bg-black/20 p-5 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words border-dashed">{story?.description || "Tác phẩm này chưa có bài viết tóm tắt mô tả cốt truyện."}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
