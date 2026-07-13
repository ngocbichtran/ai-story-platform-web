import React, { useState } from "react";
import { ArrowLeft, User, Plus, Eye, Users, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

export default function CharacterListPage() {
    const navigate = useNavigate();
    const { storyId } = useParams();
    const [roleFilter, setRoleFilter] = useState("all");

    // ===========================
    // MOCK DATA
    // ===========================
    const [characters, setCharacters] = useState([
        { id: 1, name: "Trí Hào", role: "Nhân vật chính" },
        { id: 2, name: "Linh Lan", role: "Phản diện" },
        { id: 3, name: "Ông Giáo", role: "Khác" },
        { id: 4, name: "Mây", role: "Nhân vật phụ" },
        { id: 5, name: "Hạo Thiên", role: "Nhân vật phụ" },
        { id: 6, name: "Thiên Vũ", role: "Phản diện" },
    ]);

    // Hàm xử lý xóa nhân vật
    const handleDeleteCharacter = (id, name) => {
        if (window.confirm(`Bạn có chắc chắn muốn xóa nhân vật "${name}" không?`)) {
            setCharacters(characters.filter((char) => char.id !== id));
        }
    };

    // ===========================
    // ROLE COLOR
    // ===========================
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

    const filteredCharacters = roleFilter === "all" ? characters : characters.filter((item) => item.role === roleFilter);

    return (
        <div className="min-h-screen bg-[#0B1120] text-white overflow-hidden relative">
            {/* Background */}
            <div className="absolute top-20 left-20 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px]" />
            <div className="absolute bottom-20 right-20 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px]" />

            <main className="relative z-10 px-8 py-8">
                {/* ================= HEADER ================= */}
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

                {/* ================= FILTER TABS ================= */}
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

                {/* ================= CHARACTER TABLE GRID ================= */}
                <div className="mt-6 h-[380px] overflow-y-auto rounded-2xl border border-white/10 bg-white/5 custom-scroll">
                    {/* Header */}
                    <div className="grid grid-cols-12 rounded-2xl border-b border-white/10 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sticky top-0 backdrop-blur-xl z-10">
                        <div className="col-span-5">Nhân vật</div>
                        <div className="col-span-3">Vai trò</div>
                        <div className="col-span-4 text-right">Thao tác</div>
                    </div>

                    {/* Rows */}
                    {filteredCharacters.map((character) => (
                        <div key={character.id} className="grid grid-cols-12 items-center border-b border-white/5 px-5 py-4 transition-all hover:bg-white/5">
                            {/* Tên */}
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20">
                                    <User size={18} className="text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{character.name}</p>
                                </div>
                            </div>

                            {/* Vai trò */}
                            <div className="col-span-3">
                                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getRoleColor(character.role)}`}>{character.role}</span>
                            </div>

                            {/* Thao tác */}
                            <div className="col-span-4 flex justify-end gap-2">
                                <button onClick={() => navigate(`/stories/${storyId}/editor/characters/${character.id}`)} className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-2 text-xs font-semibold text-blue-300 transition hover:bg-blue-500/20">
                                    Chi tiết
                                </button>
                                <button onClick={() => handleDeleteCharacter(character.id, character.name)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition hover:bg-red-500/20">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {filteredCharacters.length === 0 && <div className="flex h-52 items-center justify-center text-slate-500">Không có nhân vật phù hợp.</div>}
                </div>
            </main>
        </div>
    );
}
