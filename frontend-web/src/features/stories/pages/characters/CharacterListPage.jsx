import React, { useEffect, useState, useCallback } from "react";
import { User, Plus, Users, Trash2, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = "http://localhost:4000/api/characters";

export default function CharacterListPage() {
    const navigate = useNavigate();
    const { storyId } = useParams();
    const [roleFilter, setRoleFilter] = useState("all");

    const [characters, setCharacters] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCharacters = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            let url = `${API_BASE_URL}/${storyId}/list`;
            if (roleFilter !== "all") {
                url += `?role=${encodeURIComponent(roleFilter)}`;
            }

            const res = await axios.get(url, config);
            if (res.data.success) {
                setCharacters(res.data.data || []);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách nhân vật:", err);
            toast.error("Không thể tải danh sách nhân vật.");
        } finally {
            setLoading(false);
        }
    }, [storyId, roleFilter]);

    useEffect(() => {
        if (storyId) {
            fetchCharacters();
        }
    }, [storyId, roleFilter, fetchCharacters]);

    // Hàm xử lý xóa nhân vật
    const handleDeleteCharacter = async (characterId, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa nhân vật "${name}" không?`)) return;

        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.delete(`${API_BASE_URL}/${characterId}`, config);
            if (res.data.success) {
                setCharacters((prev) => prev.filter((char) => char.id !== characterId));
                toast.success(`Đã xóa nhân vật "${name}" thành công.`);
            }
        } catch (err) {
            console.error("Lỗi xóa nhân vật:", err);
            const errorMsg = err.response?.data?.message || "Không thể xóa nhân vật.";
            toast.error(errorMsg);
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case "Nhân vật chính":
                return "bg-blue-500/15 text-blue-300 border-blue-500/30";
            case "Nhân vật phụ":
                return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
            case "Phản diện":
                return "bg-red-500/15 text-red-300 border-red-500/30";
            case "Người hướng dẫn":
                return "bg-yellow-500/15 text-yellow-300 border-yellow-500/30";
            default:
                return "bg-white/10 text-slate-300 border-white/10";
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1120] text-white overflow-hidden relative">
            <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />

            <main className="relative z-10 px-8 py-8">
                {/* HEADER */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10">
                            <Users size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Danh sách nhân vật</h1>
                        </div>
                    </div>

                    <button onClick={() => navigate(`/stories/${storyId}/editor/characters/create`)} className="group relative overflow-hidden flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0571d3] via-[#2563eb] to-[#6d5dfc] text-white font-semibold shadow-lg shadow-blue-900/30 hover:scale-[1.03] active:scale-95 transition-all duration-300">
                        <div className="relative flex items-center gap-3">
                            <Plus size={15} />
                            <p className="text-sm font-bold">Thêm nhân vật</p>
                        </div>
                    </button>
                </div>

                {/* FILTER TABS */}
                <div className="mt-5 flex items-center gap-2">
                    <button onClick={() => setRoleFilter("all")} className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${roleFilter === "all" ? "bg-blue-600 text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                        Tất cả
                    </button>
                    <button onClick={() => setRoleFilter("Nhân vật chính")} className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${roleFilter === "Nhân vật chính" ? "bg-emerald-600 text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                        Nhân vật chính
                    </button>
                    <button onClick={() => setRoleFilter("Phản diện")} className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${roleFilter === "Phản diện" ? "bg-red-600 text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                        Phản diện
                    </button>
                    <button onClick={() => setRoleFilter("Nhân vật phụ")} className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${roleFilter === "Nhân vật phụ" ? "bg-violet-600 text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                        Nhân vật phụ
                    </button>
                    <button onClick={() => setRoleFilter("Khác")} className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${roleFilter === "Khác" ? "bg-slate-600 text-white" : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}>
                        Khác
                    </button>
                </div>

                {/* CHARACTER TABLE GRID */}
                <div className="mt-6 h-[380px] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 custom-scroll">
                    <div className="grid grid-cols-12 rounded-2xl border-b border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sticky top-0 backdrop-blur-xl z-10">
                        <div className="col-span-5">Nhân vật</div>
                        <div className="col-span-3">Vai trò</div>
                        <div className="col-span-4 text-right">Thao tác</div>
                    </div>

                    {loading ? (
                        <div className="flex h-52 items-center justify-center text-slate-400 gap-2">
                            <Loader2 size={24} className="animate-spin text-blue-400" />
                            <span>Đang tải danh sách nhân vật...</span>
                        </div>
                    ) : characters.length === 0 ? (
                        <div className="flex h-52 items-center justify-center text-slate-500">Không có nhân vật phù hợp.</div>
                    ) : (
                        characters.map((character) => (
                            <div key={character.id} className="grid grid-cols-12 items-center border-b border-white/5 px-5 py-4 transition-all hover:bg-white/5">
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                                        <User size={18} className="text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{character.name}</p>
                                    </div>
                                </div>

                                <div className="col-span-3">
                                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleColor(character.role)}`}>{character.role || "Chưa phân loại"}</span>
                                </div>

                                <div className="col-span-4 flex justify-end gap-2">
                                    <button onClick={() => navigate(`/stories/${storyId}/editor/characters/${character.id}`)} className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20">
                                        Chi tiết
                                    </button>
                                    <button onClick={() => handleDeleteCharacter(character.id, character.name)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}
