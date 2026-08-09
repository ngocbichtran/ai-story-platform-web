import React, { useState, useEffect } from "react";
import { Sparkles, User, Check, RotateCcw, ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function CharacterAppearanceStudio({ formData, setFormData, allCharacters, onClose, selectedStoryId }) {
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(20);
    const [selectedCharacterId, setSelectedCharacterId] = useState("");
    const [aiResult, setAiResult] = useState(null);

    // State quản lý trạng thái mở/thu gọn của cột Nhân vật gốc (Giống hệt kiểu showAISidebar)
    const [isOriginalOpen, setIsOriginalOpen] = useState(true);

    // Đồng hồ đếm ngược khi AI đang chạy
    useEffect(() => {
        let timer;
        if (isLoading && countdown > 0) {
            timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
        } else if (countdown === 0) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isLoading, countdown]);

    // =========================
    // TEXT CHANGE (Chỉnh sửa cột 3)
    // =========================
    const handleTextChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // =========================
    // CHỌN NHÂN VẬT NGUỒN
    // =========================
    const handleSelectCharacter = (e) => {
        const selectedValue = e.target.value;
        setSelectedCharacterId(selectedValue);

        if (!selectedValue) {
            setFormData((prev) => ({
                ...prev,
                appearance: "",
                personality: "",
                background: "",
                goal: "",
                ability: "",
                development: "",
                appearanceReverse: "",
                personalityReverse: "",
                backgroundReverse: "",
                goalReverse: "",
                abilityReverse: "",
                developmentReverse: "",
                appearanceFinal: "",
                personalityFinal: "",
                backgroundFinal: "",
                goalFinal: "",
                abilityFinal: "",
                developmentFinal: "",
            }));
            setAiResult(null);
            return;
        }

        const selectedCharacter = allCharacters.find((c) => String(c.id || c._id) === String(selectedValue));

        if (!selectedCharacter) return;

        setFormData((prev) => ({
            ...prev,
            appearance: selectedCharacter.appearance || "",
            personality: selectedCharacter.personality || "",
            background: selectedCharacter.background || "",
            goal: selectedCharacter.goal || "",
            ability: selectedCharacter.ability || "",
            development: selectedCharacter.development || "",

            appearanceReverse: "",
            personalityReverse: "",
            backgroundReverse: "",
            goalReverse: "",
            abilityReverse: "",
            developmentReverse: "",

            appearanceFinal: "",
            personalityFinal: "",
            backgroundFinal: "",
            goalFinal: "",
            abilityFinal: "",
            developmentFinal: "",
        }));
        setAiResult(null);
    };

    // =========================
    // AI n8n GENERATE
    // =========================
    const handleGenerateAI = async () => {
        if (!selectedCharacterId) {
            return toast.error("Vui lòng chọn nhân vật gốc trước khi chạy AI n8n!");
        }

        setIsLoading(true);
        setCountdown(20);

        try {
            const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
            const response = await axios.post(
                `https://apo.baostory.fun/api/characters/${selectedCharacterId}/transform`,
                { storyId: selectedStoryId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            let rawData = response.data?.data?.data || response.data?.data || response.data;
            if (Array.isArray(rawData)) {
                rawData = rawData[0] || {};
            }

            if (rawData && Object.keys(rawData).length > 0) {
                setAiResult(rawData);

                setFormData((prev) => ({
                    ...prev,
                    appearanceReverse: rawData.appearance || "",
                    personalityReverse: rawData.personality || "",
                    backgroundReverse: rawData.background || "",
                    goalReverse: rawData.goal || "",
                    abilityReverse: rawData.ability || "",
                    developmentReverse: rawData.development || "",

                    appearanceFinal: rawData.appearance || "",
                    personalityFinal: rawData.personality || "",
                    backgroundFinal: rawData.background || "",
                    goalFinal: rawData.goal || "",
                    abilityFinal: rawData.ability || "",
                    developmentFinal: rawData.development || "",
                }));

                toast.success("Hệ thống n8n đã biến đổi nhân vật thành công!");
            } else {
                toast.warning("Dữ liệu n8n trả về trống.");
            }
        } catch (err) {
            console.error("Lỗi gọi n8n biến đổi nhân vật:", err);
            toast.error("Không thể kết nối tới hệ thống xử lý n8n.");
        } finally {
            setIsLoading(false);
            setCountdown(20);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#070b14] text-white overflow-hidden animate-fade-in">
            {/* Background Glows */}
            <div className="absolute left-1/3 top-10 h-[400px] w-[500px] rounded-full bg-violet-600/5 blur-[180px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[180px] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl w-full flex-1 flex flex-col gap-6 p-6 min-h-0 overflow-hidden">
                {/* HEADER / ACTIONS */}
                <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl shrink-0">
                    <div className="flex flex-col gap-2 w-full max-w-lg">
                        <div className="relative">
                            <select value={selectedCharacterId} onChange={handleSelectCharacter} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white appearance-none focus:outline-none focus:border-violet-500 transition cursor-pointer">
                                <option value="">-- Chọn nhân vật để trích xuất hồ sơ --</option>
                                {allCharacters.map((character) => (
                                    <option key={character.id || character._id} value={character.id || character._id} className="bg-[#070b14]">
                                        {character.name || `Nhân vật #${character.id || character._id}`}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                <User size={16} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        {/* NÚT HỦY MỚI */}
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl bg-slate-800 text-sm font-bold text-slate-300 hover:bg-slate-700 hover:text-white transition active:scale-95">
                            Hủy
                        </button>

                        <button
                            type="button"
                            onClick={handleGenerateAI}
                            disabled={isLoading || !selectedCharacterId}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg active:scale-95
                                ${selectedCharacterId && !isLoading ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
                        >
                            <RotateCcw size={16} className={isLoading ? "animate-spin" : ""} />
                            <span>{isLoading ? `Đang xử lý n8n (${countdown}s)` : "Chạy AI n8n"}</span>
                        </button>

                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold hover:opacity-90 transition active:scale-95 flex items-center gap-1.5">
                            <Check size={16} /> Áp dụng
                        </button>
                    </div>
                </section>

                {/* WORKSPACE: FLEX ĐỂ ĐIỀU KHIỂN ĐÓNG MỞ CỘT 1 MƯỢT MÀ */}
                <section className="flex-1 flex gap-6 min-h-0 items-stretch overflow-hidden">
                    {/* NÚT MỞ NHANH KHI CỘT 1 BỊ ĐÓNG (GIỐNG THANH BÊN TRỢ LÝ AI) */}
                    {!isOriginalOpen && (
                        <button type="button" onClick={() => setIsOriginalOpen(true)} className="flex flex-col items-center justify-center gap-3 w-14 rounded-3xl border border-white/10 bg-[#10151E]/60 backdrop-blur-xl text-slate-400 hover:text-white hover:bg-[#10151E] transition-all shrink-0 py-6 cursor-pointer shadow-lg" title="Mở bảng Nhân vật gốc">
                            <User size={18} className="text-slate-300" />
                            <span className="text-[11px] font-bold uppercase tracking-widest [writing-mode:vertical-lr] rotate-180 select-none">Nhân vật gốc</span>
                        </button>
                    )}

                    {/* CỘT 1 : NHÂN VẬT GỐC (HIỆU ỨNG THU GỌN VỀ 0px VÀ ẨN MƯỢT MÀ) */}
                    <div className={`h-full flex flex-col min-h-0 transition-all duration-300 ease-in-out ${isOriginalOpen ? "w-[340px] opacity-100 shrink-0" : "w-0 opacity-0 pointer-events-none -mr-6 overflow-hidden shrink-0"}`}>
                        <div className="flex-1 h-full rounded-3xl border border-white/10 bg-slate-900/40 backdrop-blur-xl p-5 flex flex-col shadow-xl overflow-y-auto custom-scroll min-h-0">
                            {/* HEADER */}
                            <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-slate-500 shrink-0" />
                                    <span className="text-sm font-black uppercase tracking-wider text-slate-300 truncate">Nhân vật gốc</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 shrink-0">Chỉ đọc</span>
                                    <button type="button" onClick={() => setIsOriginalOpen(false)} className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all duration-200 flex items-center justify-center cursor-pointer shrink-0" title="Thu gọn bảng">
                                        <ChevronLeft size={16} /> Thu gọn
                                    </button>
                                </div>
                            </div>

                            {/* BODY */}
                            <div className="flex-1 space-y-3 text-xs md:text-sm">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Ngoại hình</label>
                                    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed min-h-[60px]">{formData.appearance || "Chưa có."}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Tính cách</label>
                                    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed min-h-[60px]">{formData.personality || "Chưa có."}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Tiểu sử</label>
                                    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed min-h-[80px]">{formData.background || "Chưa có."}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Mục tiêu</label>
                                    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed min-h-[60px]">{formData.goal || "Chưa có."}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Năng lực</label>
                                    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed min-h-[60px]">{formData.ability || "Chưa có."}</div>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Phát triển</label>
                                    <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed min-h-[60px]">{formData.development || "Chưa có."}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT 2 : AI ĐẢO NGƯỢC (N8N) - TỰ ĐỘNG GIÃN RỘNG */}
                    <div className="flex-1 rounded-2xl border border-violet-500/20 bg-violet-500/[0.02] p-5 flex flex-col shadow-lg min-h-0 overflow-hidden transition-all duration-300">
                        <div className="flex items-center justify-between border-b border-violet-500/10 pb-3 mb-4 shrink-0">
                            <span className="text-sm font-black uppercase tracking-wider text-violet-400 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse" />
                                AI Đảo ngược (n8n)
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300">AI Generated</span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scroll min-h-0 text-xs md:text-sm">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Ngoại hình đảo ngược</label>
                                <div className="w-full bg-black/40 border border-violet-500/10 rounded-xl p-3 text-xs text-slate-200 leading-relaxed min-h-[60px]">{formData.appearanceReverse || "Chưa có nội dung từ AI..."}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Tính cách đảo ngược</label>
                                <div className="w-full bg-black/40 border border-violet-500/10 rounded-xl p-3 text-xs text-slate-200 leading-relaxed min-h-[60px]">{formData.personalityReverse || "Chưa có nội dung từ AI..."}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Tiểu sử đảo ngược</label>
                                <div className="w-full bg-black/40 border border-violet-500/10 rounded-xl p-3 text-xs text-slate-200 leading-relaxed min-h-[80px]">{formData.backgroundReverse || "Chưa có nội dung từ AI..."}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Mục tiêu đảo ngược</label>
                                <div className="w-full bg-black/40 border border-violet-500/10 rounded-xl p-3 text-xs text-slate-200 leading-relaxed min-h-[60px]">{formData.goalReverse || "Chưa có nội dung từ AI..."}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Năng lực đảo ngược</label>
                                <div className="w-full bg-black/40 border border-violet-500/10 rounded-xl p-3 text-xs text-slate-200 leading-relaxed min-h-[60px]">{formData.abilityReverse || "Chưa có nội dung từ AI..."}</div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-violet-300">Phát triển đảo ngược</label>
                                <div className="w-full bg-black/40 border border-violet-500/10 rounded-xl p-3 text-xs text-slate-200 leading-relaxed min-h-[60px]">{formData.developmentReverse || "Chưa có nội dung từ AI..."}</div>
                            </div>
                        </div>
                    </div>

                    {/* CỘT 3 : KẾT QUẢ CUỐI CÙNG (EDITABLE) - TỰ ĐỘNG GIÃN RỘNG */}
                    <div className="flex-1 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 flex flex-col shadow-lg min-h-0 overflow-hidden transition-all duration-300">
                        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3 mb-4 shrink-0">
                            <span className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Kết quả cuối cùng
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">Editable</span>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-3.5 custom-scroll min-h-0 text-xs md:text-sm">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Ngoại hình cuối cùng</label>
                                <textarea name="appearanceFinal" value={formData.appearanceFinal || ""} onChange={handleTextChange} placeholder="Chỉnh sửa ngoại hình cuối cùng..." className="w-full h-[76px] bg-black/40 border border-emerald-500/10 rounded-xl p-3 text-xs text-white resize-none outline-none focus:border-emerald-500/40 transition placeholder-slate-600" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Tính cách cuối cùng</label>
                                <textarea name="personalityFinal" value={formData.personalityFinal || ""} onChange={handleTextChange} placeholder="Chỉnh sửa tính cách cuối cùng..." className="w-full h-[76px] bg-black/40 border border-emerald-500/10 rounded-xl p-3 text-xs text-white resize-none outline-none focus:border-emerald-500/40 transition placeholder-slate-600" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Tiểu sử cuối cùng</label>
                                <textarea name="backgroundFinal" value={formData.backgroundFinal || ""} onChange={handleTextChange} placeholder="Chỉnh sửa tiểu sử cuối cùng..." className="w-full h-[96px] bg-black/40 border border-emerald-500/10 rounded-xl p-3 text-xs text-white resize-none outline-none focus:border-emerald-500/40 transition placeholder-slate-600" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Mục tiêu cuối cùng</label>
                                <textarea name="goalFinal" value={formData.goalFinal || ""} onChange={handleTextChange} placeholder="Chỉnh sửa mục tiêu cuối cùng..." className="w-full h-[76px] bg-black/40 border border-emerald-500/10 rounded-xl p-3 text-xs text-white resize-none outline-none focus:border-emerald-500/40 transition placeholder-slate-600" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Năng lực cuối cùng</label>
                                <textarea name="abilityFinal" value={formData.abilityFinal || ""} onChange={handleTextChange} placeholder="Chỉnh sửa năng lực cuối cùng..." className="w-full h-[76px] bg-black/40 border border-emerald-500/10 rounded-xl p-3 text-xs text-white resize-none outline-none focus:border-emerald-500/40 transition placeholder-slate-600" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">Phát triển cuối cùng</label>
                                <textarea name="developmentFinal" value={formData.developmentFinal || ""} onChange={handleTextChange} placeholder="Chỉnh sửa định hướng phát triển..." className="w-full h-[76px] bg-black/40 border border-emerald-500/10 rounded-xl p-3 text-xs text-white resize-none outline-none focus:border-emerald-500/40 transition placeholder-slate-600" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
