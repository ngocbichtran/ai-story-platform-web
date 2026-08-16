import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PanelRightClose, User, MapPin, Sparkles, ChevronDown, Loader2, Plus, ExternalLink } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function RightSidebar({ isOpen, setIsOpen }) {
    const { storyId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("");
    const [characters, setCharacters] = useState([]);
    const [worlds, setWorlds] = useState([]);
    const [loadingChars, setLoadingChars] = useState(false);
    const [loadingWorlds, setLoadingWorlds] = useState(false);

    // =====================================================
    // 1. GỌI API LẤY DANH SÁCH NHÂN VẬT THEO STORY ID
    // =====================================================
    const fetchCharacters = useCallback(async () => {
        if (!storyId) return;
        try {
            setLoadingChars(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`https://api.baostory.fun/api/characters/${storyId}/list`, config);
            if (res.data.success) {
                setCharacters(res.data.data || []);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách nhân vật:", err);
            toast.error("Không thể tải danh sách nhân vật.");
        } finally {
            setLoadingChars(false);
        }
    }, [storyId]);

    // =====================================================
    // 2. GỌI API LẤY DANH SÁCH THẾ GIỚI THEO STORY ID
    // =====================================================
    const fetchWorlds = useCallback(async () => {
        if (!storyId) return;
        try {
            setLoadingWorlds(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`https://api.baostory.fun/api/world/list/${storyId}`, config);
            if (res.data.success) {
                setWorlds(res.data.data || []);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách thế giới:", err);
            toast.error("Không thể tải danh sách thế giới.");
        } finally {
            setLoadingWorlds(false);
        }
    }, [storyId]);

    useEffect(() => {
        if (isOpen && storyId) {
            if (activeTab === "characters" && characters.length === 0) {
                fetchCharacters();
            } else if (activeTab === "worlds" && worlds.length === 0) {
                fetchWorlds();
            }
        }
    }, [isOpen, activeTab, storyId, characters.length, worlds.length, fetchCharacters, fetchWorlds]);

    const toggleCard = (cardName) => {
        const nextTab = activeTab === cardName ? "" : cardName;
        setActiveTab(nextTab);

        if (nextTab === "characters" && characters.length === 0) {
            fetchCharacters();
        } else if (nextTab === "worlds" && worlds.length === 0) {
            fetchWorlds();
        }
    };

    if (!isOpen) return null;

    return (
        <aside className="absolute top-4 right-4 z-50 w-[380px] flex flex-col gap-2 select-none overflow-hidden p-3 bg-[#0B1120]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 animate-fadeIn">
            {/* TIÊU ĐỀ & NÚT ĐÓNG POPUP */}
            <div onClick={() => setIsOpen(false)} className="flex items-center justify-between p-2 bg-slate-950/40 border border-white/5 rounded-xl flex-none cursor-pointer hover:bg-slate-950/60 transition duration-150 active:scale-[0.99] select-none" title="Click để đóng bảng tra cứu">
                <div className="flex items-center gap-2 pl-1.5">
                    <Sparkles size={14} className="text-violet-400" />
                    <span className="text-xs font-bold text-[#a7c8ff] tracking-wide">Bảng Dữ Liệu Tra Cứu</span>
                </div>
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-white transition">
                    <PanelRightClose size={16} />
                </div>
            </div>

            {/* --- DROPDOWN 1: NHÂN VẬT --- */}
            <div className={`rounded-xl bg-[#131720]/80 border border-[#1e2633] flex flex-col overflow-hidden transition-all duration-300 ${activeTab === "characters" ? "flex-1" : "flex-none"}`}>
                <div className="w-full flex items-center justify-between p-3 bg-slate-950/10 hover:bg-slate-950/30 transition duration-150 flex-none">
                    <button onClick={() => toggleCard("characters")} className="flex items-center gap-1.5 flex-1 text-left">
                        <User size={13} className="text-blue-400" />
                        <span className={`text-xs uppercase tracking-wider font-bold ${activeTab === "characters" ? "text-white" : "text-[#8b919e]"}`}>Nhân vật truyện ({characters.length})</span>
                    </button>
                    <div className="flex items-center gap-2">
                        {/* Nút Thêm mới nhân vật */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/stories/${storyId}/editor/characters/create`);
                            }}
                            className="p-1 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
                            title="Thêm nhân vật mới"
                        >
                            <Plus size={14} />
                        </button>
                        <button onClick={() => toggleCard("characters")}>
                            <ChevronDown size={14} className={`transition-transform duration-200 text-[#8b919e] ${activeTab === "characters" ? "rotate-180 text-white" : ""}`} />
                        </button>
                    </div>
                </div>

                {activeTab === "characters" && (
                    <div className="overflow-y-auto max-h-[248px] p-2.5 space-y-1.5 writing-canvas-scroll animate-fadeIn border-t border-white/5 flex-1">
                        {loadingChars ? (
                            <div className="flex h-20 items-center justify-center text-slate-400 gap-2">
                                <Loader2 size={16} className="animate-spin text-blue-400" />
                                <span className="text-xs">Đang tải nhân vật...</span>
                            </div>
                        ) : characters.length > 0 ? (
                            characters.map((char, index) => {
                                const charId = char._id || char.id;
                                return (
                                    <div key={charId || index} className="p-2.5 rounded-xl transition duration-200 border bg-[#181d29] hover:bg-[#1d2433] border-transparent hover:border-white/5 flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-sm font-bold text-[#a7c8ff] leading-snug truncate">{char.name || char.fullName || "Chưa đặt tên"}</h4>
                                            {/* Nút Chi tiết hiện sẵn luôn */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/stories/${storyId}/editor/characters/${charId}`);
                                                }}
                                                className="flex-none flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-300 hover:text-white text-[10px] font-semibold transition"
                                                title="Xem chi tiết nhân vật"
                                            >
                                                <span>Chi tiết</span>
                                                <ExternalLink size={10} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-[#c1c6d5] line-clamp-1 opacity-90">{char.description || char.desc || char.role || "Không có mô tả."}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center italic text-slate-500 text-xs py-4">Chưa có nhân vật nào trong truyện.</div>
                        )}
                    </div>
                )}
            </div>

            {/* --- DROPDOWN 2: THẾ GIỚI / ĐỊA DANH --- */}
            <div className={`rounded-xl bg-[#131720]/80 border border-[#1e2633] flex flex-col overflow-hidden transition-all duration-300 ${activeTab === "worlds" ? "flex-1" : "flex-none"}`}>
                <div className="w-full flex items-center justify-between p-3 bg-slate-950/10 hover:bg-slate-950/30 transition duration-150 flex-none">
                    <button onClick={() => toggleCard("worlds")} className="flex items-center gap-1.5 flex-1 text-left">
                        <MapPin size={13} className="text-emerald-400" />
                        <span className={`text-xs uppercase tracking-wider font-bold ${activeTab === "worlds" ? "text-white" : "text-[#8b919e]"}`}>Thế giới & Địa danh ({worlds.length})</span>
                    </button>
                    <div className="flex items-center gap-2">
                        {/* Nút Thêm mới thế giới */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/stories/${storyId}/editor/worlds/create`);
                            }}
                            className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition"
                            title="Thêm thế giới mới"
                        >
                            <Plus size={14} />
                        </button>
                        <button onClick={() => toggleCard("worlds")}>
                            <ChevronDown size={14} className={`transition-transform duration-200 text-[#8b919e] ${activeTab === "worlds" ? "rotate-180 text-white" : ""}`} />
                        </button>
                    </div>
                </div>

                {activeTab === "worlds" && (
                    <div className="overflow-y-auto max-h-[248px] p-2.5 space-y-1.5 writing-canvas-scroll animate-fadeIn border-t border-white/5 flex-1">
                        {loadingWorlds ? (
                            <div className="flex h-20 items-center justify-center text-slate-400 gap-2">
                                <Loader2 size={16} className="animate-spin text-emerald-400" />
                                <span className="text-xs">Đang tải thế giới...</span>
                            </div>
                        ) : worlds.length > 0 ? (
                            worlds.map((world, index) => {
                                const worldId = world._id || world.id;
                                return (
                                    <div key={worldId || index} className="p-2.5 rounded-xl transition duration-200 border bg-[#181d29] hover:bg-[#1d2433] border-transparent hover:border-white/5 flex flex-col gap-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <h4 className="text-sm font-bold text-[#a7c8ff] leading-snug truncate">{world.name || world.title || "Chưa đặt tên"}</h4>
                                            {/* Nút Chi tiết hiện sẵn luôn */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/stories/${storyId}/editor/worlds/${worldId}`);
                                                }}
                                                className="flex-none flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[10px] font-semibold transition"
                                                title="Xem chi tiết thế giới"
                                            >
                                                <span>Chi tiết</span>
                                                <ExternalLink size={10} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-[#c1c6d5] line-clamp-1 opacity-90">{world.description || world.desc || "Không có mô tả."}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center italic text-slate-500 text-xs py-4">Chưa có thiết lập thế giới nào.</div>
                        )}
                    </div>
                )}
            </div>
        </aside>
    );
}
