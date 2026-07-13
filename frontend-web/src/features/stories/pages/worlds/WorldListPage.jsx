import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Globe2, Eye, Trash2 } from "lucide-react";

export default function WorldListPage() {
    const navigate = useNavigate();
    const { storyId } = useParams();

    // =========================
    // MOCK DATA
    // =========================
    const [loading] = useState(false);
    const [worlds] = useState([
        { id: 1, name: "Đế Quốc Thiên Vân", description: "Một đế quốc rộng lớn với bề dày lịch sử hàng ngàn năm.", territory_count: 12, main_race: "Tu tiên giả" },
        { id: 2, name: "Vương Quốc Ánh Sáng", description: "Vùng đất của những sinh vật huyền bí.", territory_count: 5, main_race: "Tinh linh" },
        { id: 3, name: "Lục Địa Huyết Nguyệt", description: "Một thế giới bị nguyền rủa.", territory_count: 18, main_race: "Ma tộc" },
        { id: 4, name: "Thành Phố Cơ Khí", description: "Nền văn minh steampunk.", territory_count: 7, main_race: "Người máy" },
        { id: 5, name: "Đại Dương Băng Giá", description: "Thế giới biển băng.", territory_count: 9, main_race: "Hải tộc" },
        { id: 6, name: "Rừng Cổ Linh", description: "Khu rừng hàng triệu năm tuổi.", territory_count: 15, main_race: "Tinh linh" },
        { id: 7, name: "Sa Mạc Hỏa Diệm", description: "Sa mạc đỏ rực lửa.", territory_count: 8, main_race: "Long tộc" },
    ]);

    // =========================
    // HANDLE
    // =========================
    const handleDeleteWorld = (worldId) => {
        if (!window.confirm("Bạn có chắc muốn xóa thế giới này?")) return;
        console.log("Delete:", worldId);
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
                <div className="flex flex-1 items-center justify-center text-slate-400">Đang tải...</div>
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
                            <div key={world.id} className="group rounded-2xl border border-white/10 bg-gradient-to-b from-slate-800/70 to-slate-900/80 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-900/20">
                                <div className="flex h-full flex-col">
                                    {/* Tên */}
                                    <h3 className="flex-1 text-center text-sm font-bold leading-6 text-white line-clamp-2 min-h-[48px]">{world.name}</h3>

                                    {/* Footer */}
                                    <div className="flex gap-2">
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
