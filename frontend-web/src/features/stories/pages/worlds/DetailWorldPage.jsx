import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, Globe2, Map, Sparkles, Loader2 } from "lucide-react";

export default function DetailWorldPage() {
    const navigate = useNavigate();
    const { storyId, worldId } = useParams();
    const [mainTab, setMainTab] = useState("info");
    const [infoTab, setInfoTab] = useState("description");
    const [mechanicTab, setMechanicTab] = useState("power");
    const [world, setWorld] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorldDetail = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem("token");
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`https://api.baostory.fun/api/world/detail/${worldId}`, config);
                if (res.data.success) {
                    setWorld(res.data.data);
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết thế giới:", err);
                toast.error("Không thể tải thông tin bối cảnh thế giới.");
            } finally {
                setLoading(false);
            }
        };
        if (worldId) {
            fetchWorldDetail();
        }
    }, [worldId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#070b14] text-slate-400 gap-2">
                <Loader2 size={28} className="animate-spin text-blue-500" />
                <span>Đang tải thông tin thế giới...</span>
            </div>
        );
    }

    if (!world) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-[#070b14] text-slate-400 gap-4">
                <p>Không tìm thấy dữ liệu thế giới.</p>
                <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold">
                    Quay lại
                </button>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white font-sans antialiased">
            <div className="absolute left-1/4 top-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

            <main className="relative z-10 mx-auto max-w-7xl px-4 pt-6 flex flex-col gap-4">
                <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl shadow-xl">
                    <div className="absolute -right-20 -top-20 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                    <div className="grid gap-3 grid-cols-12 items-center relative z-10 w-full">
                        <div className="col-span-12 md:col-span-1">
                            <button onClick={() => navigate(`/stories/${storyId}/editor/worlds`)} className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-slate-950/40 py-2.5 text-xs font-semibold text-slate-300 transition-all duration-300 hover:bg-slate-800 hover:text-white active:scale-95 shadow-sm">
                                <ArrowLeft size={14} /> Quay lại
                            </button>
                        </div>
                        <div className="col-span-12 md:col-span-5 flex items-center gap-2.5 min-w-0 bg-slate-950/20 p-1.5 rounded-xl border border-white/5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-transparent shadow-sm">
                                <Globe2 className="text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.4)]" size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-base md:text-lg font-black tracking-tight text-white" title={world.title}>
                                    {world.title}
                                </h1>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-3 flex rounded-xl border border-white/5 bg-slate-950/60 p-0.5 shadow-inner">
                            <button onClick={() => setMainTab("info")} className={`flex-1 text-center rounded-lg py-1.5 text-xs font-bold tracking-wide transition-all duration-300 ${mainTab === "info" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                Thông tin
                            </button>
                            <button onClick={() => setMainTab("data")} className={`flex-1 text-center rounded-lg py-1.5 text-xs font-bold tracking-wide transition-all duration-300 ${mainTab === "data" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                Dữ liệu
                            </button>
                        </div>
                        <div className="col-span-12 md:col-span-2"></div>
                        <div className="col-span-12 md:col-span-1">
                            <button onClick={() => navigate(`/stories/${storyId}/editor/worlds/${worldId}/edit`)} className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/10 transition-all duration-300 hover:opacity-95 hover:scale-[1.02] active:scale-95 overflow-hidden">
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine" /> Chỉnh sửa
                            </button>
                        </div>
                    </div>
                </section>

                <div className="w-full min-h-[500px] flex flex-col">
                    {/* TAB 1: THÔNG TIN THẾ GIỚI */}
                    {mainTab === "info" && (
                        <section className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-slate-900/30 p-4 backdrop-blur-xl shadow-xl transition-all duration-300">
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex w-full md:w-auto md:min-w-[320px] rounded-lg border border-white/5 bg-slate-950/60 p-0.5">
                                    <button onClick={() => setInfoTab("description")} className={`flex-1 text-center rounded-md py-1.5 text-xs font-medium transition-all duration-200 ${infoTab === "description" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}>
                                        Giới thiệu
                                    </button>
                                    <button onClick={() => setInfoTab("history")} className={`flex-1 text-center rounded-md py-1.5 text-xs font-medium transition-all duration-200 ${infoTab === "history" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white" : "text-slate-400 hover:text-white"}`}>
                                        Lịch sử
                                    </button>
                                    <button onClick={() => setInfoTab("culture")} className={`flex-1 text-center rounded-md py-1.5 text-xs font-medium transition-all duration-200 ${infoTab === "culture" ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                                        Văn hóa
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 flex-1 overflow-y-auto max-h-[440px] rounded-xl border border-white/5 bg-slate-950/30 p-5 text-[15px] md:text-base leading-relaxed text-slate-300 tracking-wide shadow-inner scrollbar-thin scrollbar-thumb-white/10">
                                {infoTab === "description" && <p className="whitespace-pre-wrap">{world.description || "Chưa có thông tin giới thiệu."}</p>}
                                {infoTab === "history" && <p className="whitespace-pre-wrap">{world.history || "Chưa có thông tin lịch sử."}</p>}
                                {infoTab === "culture" && <p className="whitespace-pre-wrap">{world.culture || "Chưa có thông tin văn hóa."}</p>}
                            </div>
                        </section>
                    )}

                    {/* TAB 2: DỮ LIỆU THẾ GIỚI */}
                    {mainTab === "data" && (
                        <section className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-slate-900/30 p-4 backdrop-blur-xl shadow-xl transition-all duration-300">
                            <div className="grid flex-1 gap-4 lg:grid-cols-12">
                                <div className="lg:col-span-4 flex flex-col rounded-xl border border-white/10 bg-slate-950/20 p-4 h-[480px]">
                                    <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                                            <Map className="text-cyan-400" size={16} />
                                        </div>
                                        <h2 className="text-sm font-bold tracking-wide text-slate-100">Địa danh</h2>
                                    </div>
                                    <div className="mt-3 flex-1 overflow-y-auto pr-1 custom-scroll">
                                        {!world.geography || world.geography.length === 0 ? (
                                            <div className="flex h-full items-center justify-center text-xs text-slate-500 italic">Chưa có địa danh</div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                {world.geography.map((item, index) => (
                                                    <div key={index} className="rounded-lg border border-white/5 bg-slate-950/40 px-2 py-2 text-center transition-all hover:border-cyan-500/30 hover:bg-cyan-500/5">
                                                        <p className="truncate text-[11px] font-medium text-cyan-300">{item}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="lg:col-span-8 flex flex-col rounded-xl border border-white/10 bg-slate-950/20 p-4 h-[480px]">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/10">
                                                <Sparkles className="text-yellow-400" size={16} />
                                            </div>
                                            <h2 className="text-sm font-bold tracking-wide text-slate-100">Cơ chế vận hành</h2>
                                        </div>
                                        <div className="flex min-w-[160px] rounded-lg border border-white/5 bg-slate-950/60 p-0.5">
                                            <button onClick={() => setMechanicTab("power")} className={`flex-1 text-center rounded-md py-1 text-xs font-medium transition-all duration-200 ${mechanicTab === "power" ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                                Sức mạnh
                                            </button>
                                            <button onClick={() => setMechanicTab("rules")} className={`flex-1 text-center rounded-md py-1 text-xs font-medium transition-all duration-200 ${mechanicTab === "rules" ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                                Quy luật
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 flex-1 overflow-y-auto pr-1 custom-scroll">
                                        {mechanicTab === "power" && (
                                            <div className="flex flex-col gap-2 w-full">
                                                {!world.powerSystems || world.powerSystems.length === 0 ? (
                                                    <div className="flex h-32 items-center justify-center text-xs text-slate-500 italic">Chưa có hệ thống sức mạnh</div>
                                                ) : (
                                                    world.powerSystems.map((system, index) => (
                                                        <article key={index} className="rounded-xl border border-white/5 bg-slate-900/40 p-3 transition-all hover:border-yellow-500/20 hover:bg-yellow-500/5 shadow-sm">
                                                            <h4 className="text-xs font-bold text-yellow-400 tracking-wide">{system.name}</h4>
                                                            <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{system.description}</p>
                                                        </article>
                                                    ))
                                                )}
                                            </div>
                                        )}

                                        {mechanicTab === "rules" && (
                                            <div className="flex flex-col gap-2 w-full">
                                                {!world.rules || world.rules.length === 0 ? (
                                                    <div className="flex h-32 items-center justify-center text-xs text-slate-500 italic">Chưa có quy luật nào</div>
                                                ) : (
                                                    world.rules.map((rule, index) => (
                                                        <article key={index} className="rounded-xl border border-white/5 bg-white/5 p-3 transition-all hover:border-red-500/20 hover:bg-red-500/5">
                                                            <div className="flex items-start gap-2.5">
                                                                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400 shadow shadow-red-400" />
                                                                <p className="text-xs md:text-sm leading-relaxed text-slate-300">{rule}</p>
                                                            </div>
                                                        </article>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
