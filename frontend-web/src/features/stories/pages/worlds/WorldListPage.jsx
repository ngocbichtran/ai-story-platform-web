import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Globe2, Trash2, Loader2 } from "lucide-react";

export default function WorldListPage() {
    const navigate = useNavigate();
    const { storyId } = useParams();
    const [loading, setLoading] = useState(true);
    const [worlds, setWorlds] = useState([]);
    const fetchWorlds = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`https://api.baostory.fun/api/world/list/${storyId}`, config);
            if (res.data.success) {
                setWorlds(res.data.data || []);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách thế giới:", err);
            toast.error("Không thể tải danh sách bối cảnh thế giới.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storyId) {
            fetchWorlds();
        }
    }, [storyId]);

    const handleDeleteWorld = async (worldId) => {
        if (!window.confirm("Bạn có chắc muốn xóa vĩnh viễn thế giới này?")) return;

        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.delete(`https://api.baostory.fun/api/world/${worldId}`, config);

            if (res.data.success) {
                setWorlds((prev) => prev.filter((w) => w.id !== worldId));
                toast.success("Xóa bối cảnh thế giới thành công.");
            }
        } catch (err) {
            console.error("Lỗi xóa thế giới:", err);
            const errorMsg = err.response?.data?.message || "Không thể xóa thế giới.";
            toast.error(errorMsg);
        }
    };

    const handleCreateWorld = () => {
        navigate(`/stories/${storyId}/worlds/create`);
    };

    return (
        <main className="h-full overflow-hidden flex flex-col p-6">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-white/10 pb-5 flex-none">
                <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/20 to-violet-500/20">
                        <Globe2 size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">Danh sách thế giới</h2>
                        <p className="mt-0.5 text-sm text-slate-400">Quản lý và tiếp tục kiến tạo các thế giới trong truyện.</p>
                    </div>
                </div>

                <button onClick={handleCreateWorld} className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-blue-500/20 active:scale-95">
                    <Plus size={18} />
                    Tạo thế giới mới
                </button>
            </div>

            {/* BODY */}
            {loading ? (
                <div className="flex flex-1 items-center justify-center text-slate-400 gap-2">
                    <Loader2 size={24} className="animate-spin text-blue-400" />
                    <span>Đang tải danh sách thế giới...</span>
                </div>
            ) : worlds.length === 0 ? (
                <div className="mt-6 flex flex-1 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5">
                    <Globe2 size={80} className="mb-6 text-slate-500" />
                    <h2 className="text-2xl font-bold text-white">Chưa có thế giới nào</h2>
                    <p className="mt-2 text-sm text-slate-400">Hãy tạo thế giới đầu tiên cho tác phẩm của bạn.</p>
                </div>
            ) : (
                <div className="mt-6 flex-1 overflow-y-auto rounded-3xl border border-white/10 bg-white/5 p-6 writing-canvas-scroll">
                    <div className="grid grid-cols-4 gap-4">
                        {worlds.map((world) => (
                            <div key={world.id} className="group rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-900/20 flex flex-col justify-between">
                                <div className="flex h-full flex-col justify-between gap-4">
                                    {/* Nội dung thông tin thế giới */}
                                    <div>
                                        <h3 className="text-sm font-bold leading-6 text-white line-clamp-2">{world.title}</h3>
                                        <p className="mt-1.5 text-xs text-slate-400 line-clamp-3 leading-relaxed">{world.description || "Chưa có mô tả chi tiết cho thế giới này."}</p>
                                    </div>

                                    {/* Footer / Actions */}
                                    <div className="flex gap-2 pt-2 border-t border-white/5">
                                        <button onClick={() => navigate(`/stories/${storyId}/editor/worlds/${world.id}`)} className="flex-1 flex h-10 items-center justify-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 text-sm font-medium text-blue-300 transition-all hover:bg-blue-600 hover:text-white">
                                            Chi tiết
                                        </button>

                                        <button onClick={() => handleDeleteWorld(world.id)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-600 hover:text-white">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}
