import React, { useEffect, useState } from "react";
import { ArrowLeft, Pencil, User, BadgeInfo, Eye, BookOpen, Target, Users, Loader2, Zap, TrendingUp, MapPin, Tag } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function CharacterDetailPage() {
    const navigate = useNavigate();
    const { storyId, characterId } = useParams();
    const [infoTab, setInfoTab] = useState("figured");
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCharacterDetail = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`https://api.baostory.fun/api/characters/${characterId}`, config);
                if (res.data.success) {
                    setCharacter(res.data.data);
                }
            } catch (err) {
                console.error("Lỗi khi tải chi tiết nhân vật:", err);
                toast.error("Không thể tải thông tin chi tiết nhân vật.");
            } finally {
                setLoading(false);
            }
        };

        if (characterId) {
            fetchCharacterDetail();
        }
    }, [characterId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#070b14] text-slate-400 gap-2">
                <Loader2 size={28} className="animate-spin text-blue-500" />
                <span>Đang tải thông tin nhân vật...</span>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#070b14] text-slate-400 gap-4">
                <p>Không tìm thấy dữ liệu nhân vật.</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#070b14] text-white">
            {/* Background Glows */}
            <div className="absolute left-1/4 top-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

            <main className="relative z-10 mx-auto max-w-7xl pt-2 flex-1 flex flex-col gap-4 w-full pb-6">
                <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-xl shrink-0">
                    <div className="absolute -right-20 -top-20 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                    <div className="grid grid-cols-12 items-center gap-3 p-2 relative z-10 w-full">
                        <div className="col-span-12 md:col-span-1">
                            <button onClick={() => navigate(`/stories/${storyId}/editor/characters`)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-slate-950/40 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-95">
                                <ArrowLeft size={15} /> Quay lại
                            </button>
                        </div>

                        <div className="col-span-12 md:col-span-4 flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/30 p-2">
                            {character.avatar ? (
                                <img src={character.avatar} alt={character.name} className="h-10 w-10 shrink-0 rounded-xl object-cover border border-blue-500/20" />
                            ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                                    <User size={20} className="text-blue-400" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-lg font-black">{character.name}</h1>
                            </div>
                        </div>

                        <div className="hidden md:block md:col-span-5" />

                        <div className="col-span-12 md:col-span-2">
                            <button onClick={() => navigate(`/stories/${storyId}/editor/characters/edit/${characterId}`)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 shadow-lg shadow-blue-500/10">
                                <Pencil size={15} /> Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </section>

                <section className="w-full flex-1 flex flex-col min-h-0">
                    <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-slate-900/30 backdrop-blur-xl shadow-xl overflow-hidden">
                        {/* SUB TABS */}
                        <div className="border-b border-white/10 p-2 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex rounded-xl border border-white/10 bg-slate-950/40 p-1">
                                    <button onClick={() => setInfoTab("figured")} className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${infoTab === "figured" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                        Hình tượng nhân vật
                                    </button>
                                    <button onClick={() => setInfoTab("storyline")} className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${infoTab === "storyline" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                        Tuyến nhân vật
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* VÙNG HIỂN THỊ NỘI DUNG CHI TIẾT */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar min-h-0">
                            {/* TAB 1: HÌNH TƯỢNG NHÂN VẬT */}
                            {infoTab === "figured" && (
                                <div className="grid gap-5 lg:grid-cols-12 w-full">
                                    {/* THÔNG TIN CƠ BẢN */}
                                    <section className="lg:col-span-4 rounded-2xl border border-blue-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col gap-4">
                                        <div className="flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <User size={18} className="text-blue-400" />
                                            <h2 className="font-bold text-white">Thông tin chung</h2>
                                        </div>
                                        <div className="space-y-3.5 text-sm flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tên</span>
                                                <span className="font-semibold text-white">{character.name || "Chưa cập nhật"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loài</span>
                                                <span className="font-semibold text-white">{character.species || "Chưa cập nhật"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vai trò</span>
                                                <span className="font-semibold text-white">{character.role || "Chưa cập nhật"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Giới tính</span>
                                                <span className="font-semibold text-white">{character.gender || "Chưa cập nhật"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tuổi</span>
                                                <span className="font-semibold text-white">{character.age || "Chưa cập nhật"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nghề nghiệp</span>
                                                <span className="font-semibold text-white">{character.occupation || "Chưa cập nhật"}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vị trí hiện tại</span>
                                                <span className="font-semibold text-white flex items-center gap-1">
                                                    <MapPin size={13} className="text-cyan-400" />
                                                    {character.currentLocation || "Chưa cập nhật"}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</span>
                                                <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs border ${character.status === "dead" ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"}`}>{character.status === "dead" ? "Đã chết" : character.status === "missing" ? "Mất tích" : character.status === "unknown" ? "Không rõ" : "Còn sống"}</span>
                                            </div>

                                            {/* TAGS */}
                                            <div className="pt-2 border-t border-white/5">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">Thẻ (Tags)</span>
                                                {character.tags && character.tags.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {character.tags.map((tag, idx) => (
                                                            <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300">
                                                                <Tag size={11} className="text-blue-400" />
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-500 italic">Chưa có thẻ tags.</span>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* NGOẠI HÌNH */}
                                    <section className="lg:col-span-4 rounded-2xl border border-violet-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[480px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <Eye size={18} className="text-violet-400" />
                                            <h2 className="font-bold text-violet-300">Ngoại hình</h2>
                                        </div>
                                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 text-sm leading-7 text-slate-300 whitespace-pre-line">{character.appearance || "Chưa có mô tả ngoại hình."}</div>
                                    </section>

                                    {/* TÍNH CÁCH & NĂNG LỰC */}
                                    <section className="lg:col-span-4 rounded-2xl border border-emerald-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[480px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <BadgeInfo size={18} className="text-emerald-400" />
                                            <h2 className="font-bold text-emerald-300">Tính cách & Năng lực</h2>
                                        </div>
                                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 space-y-4 text-sm text-slate-300">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Tính cách</h3>
                                                <p className="leading-6 whitespace-pre-line">{character.personality || "Chưa có mô tả tính cách."}</p>
                                            </div>
                                            <div className="pt-3 border-t border-white/5">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
                                                    <Zap size={13} /> Năng lực đặc biệt
                                                </h3>
                                                <p className="leading-6 whitespace-pre-line">{character.ability || "Chưa có mô tả năng lực."}</p>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* TAB 2: TUYẾN NHÂN VẬT */}
                            {infoTab === "storyline" && (
                                <div className="grid gap-5 lg:grid-cols-12 w-full">
                                    {/* MỤC TIÊU & PHÁT TRIỂN */}
                                    <section className="lg:col-span-4 rounded-2xl border border-yellow-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[480px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10">
                                                <Target size={18} className="text-yellow-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-yellow-300">Mục tiêu & Phát triển</h2>
                                                <p className="text-xs text-slate-400">Động lực và hành trình.</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 space-y-4 text-sm text-slate-300">
                                            <div>
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-1">Mục tiêu</h3>
                                                <p className="leading-6 whitespace-pre-line">{character.goal || "Chưa cập nhật mục tiêu."}</p>
                                            </div>
                                            <div className="pt-3 border-t border-white/5">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                                                    <TrendingUp size={13} /> Hành trình phát triển
                                                </h3>
                                                <p className="leading-6 whitespace-pre-line">{character.development || "Chưa cập nhật hành trình phát triển."}</p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* TIỂU SỬ */}
                                    <section className="lg:col-span-4 rounded-2xl border border-cyan-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[480px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                                                <BookOpen size={18} className="text-cyan-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-cyan-300">Tiểu sử</h2>
                                                <p className="text-xs text-slate-400">Quá khứ, nguồn gốc xuất thân.</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 text-sm leading-8 text-slate-300 whitespace-pre-line">{character.background || "Chưa có tiểu sử chi tiết."}</div>
                                    </section>

                                    {/* MỐI QUAN HỆ */}
                                    <section className="lg:col-span-4 rounded-2xl border border-white/10 bg-slate-900/30 backdrop-blur-xl shadow-xl flex flex-col h-[480px] overflow-hidden">
                                        <div className="mb-2 flex items-center gap-3 border-b border-white/10 p-5 pb-3 shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                                                <Users size={18} className="text-blue-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-blue-300">Mối quan hệ</h2>
                                                <p className="text-xs text-slate-400">Các nhân vật liên quan.</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar min-h-0">
                                            {!character.relationship || character.relationship.length === 0 ? (
                                                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500 italic py-12">Chưa có mối quan hệ nào.</div>
                                            ) : (
                                                <div className="flex flex-col gap-2.5 w-full">
                                                    {character.relationship.map((item, index) => {
                                                        const targetId = item.characterId || item.id;
                                                        return (
                                                            <div key={index} className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/[0.04]">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="min-w-0">
                                                                        <h3 className="text-sm font-semibold text-white truncate">{item.name || "Nhân vật liên kết"}</h3>
                                                                        <p className="mt-0.5 text-xs text-slate-400 truncate">{item.relationType}</p>
                                                                        {item.description && <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{item.description}</p>}
                                                                    </div>
                                                                </div>
                                                                {targetId && (
                                                                    <div className="flex items-center gap-2 shrink-0">
                                                                        <button onClick={() => navigate(`/stories/${storyId}/editor/characters/${targetId}`)} className="flex items-center gap-1.5 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 transition hover:bg-blue-500/20">
                                                                            Chi tiết
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
