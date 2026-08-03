import React from "react";
import { Sparkles, User } from "lucide-react";

export default function CharacterAppearanceStudio({ formData, setFormData, allCharacters, onClose }) {
    // =========================
    // TEXT CHANGE
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
        const selectedId = parseInt(e.target.value);

        if (!selectedId) {
            setFormData((prev) => ({
                ...prev,

                appearance: "",
                personality: "",

                appearanceReverse: "",
                personalityReverse: "",

                appearanceFinal: "",
                personalityFinal: "",
            }));

            return;
        }

        const selectedCharacter = allCharacters.find((c) => c.id === selectedId);

        if (!selectedCharacter) return;

        setFormData((prev) => ({
            ...prev,

            // Dữ liệu gốc
            appearance: selectedCharacter.appearance || "Ngoại hình của nhân vật...",

            personality: selectedCharacter.personality || "Tính cách của nhân vật...",

            // Reset AI
            appearanceReverse: "",
            personalityReverse: "",

            // Reset kết quả cuối
            appearanceFinal: "",
            personalityFinal: "",
        }));
    };

    // =========================
    // AI GENERATE
    // =========================
    const handleGenerateAI = () => {
        if (!formData.appearance && !formData.personality) return;

        setFormData((prev) => ({
            ...prev,

            appearanceReverse: "AI đã phân tích và tạo ra một phiên bản ngoại hình tương phản: mái tóc trắng bạc, ánh mắt lạnh lùng, gương mặt góc cạnh hơn, trang phục mang sắc đen và tím huyền bí.",

            personalityReverse: "AI đã xây dựng tính cách đối lập: lạnh lùng, ít nói, luôn hành động theo lý trí, khó tin tưởng người khác và sẵn sàng hy sinh lợi ích cá nhân để đạt mục tiêu.",
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#070b14] text-white overflow-y-auto custom-scrollbar animate-fade-in">
            {/* Background */}
            <div className="absolute left-1/3 top-10 h-[400px] w-[500px] rounded-full bg-violet-600/5 blur-[180px] pointer-events-none" />

            <div className="absolute bottom-10 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-600/5 blur-[180px] pointer-events-none" />

            <div className="relative z-10 mx-auto max-w-7xl w-full flex-1 flex flex-col gap-6 p-6 min-h-screen">
                {/* HEADER */}

                <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-2xl">
                    {/* Character Select */}
                    <div className="flex flex-col gap-2 w-full max-w-lg">
                        <div className="relative">
                            <select onChange={handleSelectCharacter} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white appearance-none focus:outline-none focus:border-violet-500 transition">
                                <option value="">-- Chọn nhân vật để trích xuất hồ sơ --</option>

                                {allCharacters.map((character) => (
                                    <option key={character.id} value={character.id} className="bg-[#070b14]">
                                        {character.name}
                                    </option>
                                ))}
                            </select>

                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
                                <User size={16} />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={handleGenerateAI}
                            disabled={!formData.appearance && !formData.personality}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition shadow-lg active:scale-95
                                ${formData.appearance || formData.personality ? "bg-violet-600 hover:bg-violet-500 text-white" : "bg-slate-800 text-slate-500 cursor-not-allowed"}`}
                        >
                            <Sparkles size={16} />
                            AI Phân tích
                        </button>

                        <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold hover:opacity-90 transition active:scale-95">
                            Áp dụng & Quay lại Form
                        </button>
                    </div>
                </section>

                {/* WORKSPACE */}

                <section className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
                    {/* CỘT 1 : NHÂN VẬT GỐC */}
                    <div className="rounded-2xl border border-white/10 bg-slate-900/20 p-5 flex flex-col shadow-lg">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4 shrink-0">
                            <span className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-slate-500" />
                                Nhân vật gốc
                            </span>

                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400">Chỉ đọc</span>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 flex flex-col gap-5 min-h-0">
                            {/* NGOẠI HÌNH */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Ngoại hình</label>

                                <textarea name="appearance" value={formData.appearance} readOnly placeholder="Chọn nhân vật để hiển thị ngoại hình..." className="flex-1 w-full rounded-xl border border-white/5 bg-slate-950/40 p-4 text-sm leading-7 text-slate-300 resize-none custom-scrollbar cursor-not-allowed focus:outline-none placeholder-slate-600" />
                            </div>

                            {/* TÍNH CÁCH */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Tính cách</label>

                                <textarea name="personality" value={formData.personality} readOnly placeholder="Chọn nhân vật để hiển thị tính cách..." className="flex-1 w-full rounded-xl border border-white/5 bg-slate-950/40 p-4 text-sm leading-7 text-slate-300 resize-none custom-scrollbar cursor-not-allowed focus:outline-none placeholder-slate-600" />
                            </div>
                        </div>
                    </div>
                    {/* CỘT 2 : AI ĐẢO NGƯỢC */}
                    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.02] p-5 flex flex-col shadow-lg">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-violet-500/10 pb-3 mb-4 shrink-0">
                            <span className="text-sm font-black uppercase tracking-wider text-violet-400 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-violet-500" />
                                AI Đảo ngược
                            </span>

                            <span className="text-[10px] px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-violet-300">AI Generated</span>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 flex flex-col gap-5 min-h-0">
                            {/* NGOẠI HÌNH ĐẢO NGƯỢC */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-violet-300">Ngoại hình đảo ngược</label>
                                </div>

                                <textarea name="appearanceReverse" value={formData.appearanceReverse} readOnly placeholder="AI sẽ tạo ra phiên bản ngoại hình đối lập hoặc hắc hóa..." className="flex-1 w-full rounded-xl border border-violet-500/10 bg-slate-950/40 p-4 text-sm leading-7 text-slate-200 resize-none custom-scrollbar cursor-not-allowed focus:outline-none placeholder-slate-600" />
                            </div>

                            {/* TÍNH CÁCH ĐẢO NGƯỢC */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-violet-300">Tính cách đảo ngược</label>
                                </div>

                                <textarea name="personalityReverse" value={formData.personalityReverse} readOnly placeholder="AI sẽ tạo ra phiên bản tính cách đối lập dựa trên nhân vật gốc..." className="flex-1 w-full rounded-xl border border-violet-500/10 bg-slate-950/40 p-4 text-sm leading-7 text-slate-200 resize-none custom-scrollbar cursor-not-allowed focus:outline-none placeholder-slate-600" />
                            </div>
                        </div>
                    </div>{" "}
                    {/* CỘT 3 : KẾT QUẢ CUỐI CÙNG */}
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.02] p-5 flex flex-col shadow-lg">
                        {/* HEADER */}
                        <div className="flex items-center justify-between border-b border-emerald-500/10 pb-3 mb-4 shrink-0">
                            <span className="text-sm font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Kết quả cuối cùng
                            </span>

                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">Editable</span>
                        </div>

                        {/* BODY */}
                        <div className="flex-1 flex flex-col gap-5 min-h-0">
                            {/* NGOẠI HÌNH CUỐI */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <label className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-300">Ngoại hình cuối cùng</label>

                                <textarea name="appearanceFinal" value={formData.appearanceFinal} onChange={handleTextChange} placeholder="Chỉnh sửa hoặc tổng hợp ngoại hình cuối cùng..." className="flex-1 w-full rounded-xl border border-emerald-500/10 bg-slate-900/30 p-4 text-sm leading-7 text-white resize-none custom-scrollbar focus:outline-none focus:border-emerald-500/40 transition placeholder-slate-600" />
                            </div>

                            {/* TÍNH CÁCH CUỐI */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <label className="mb-2 text-xs font-bold uppercase tracking-wider text-emerald-300">Tính cách cuối cùng</label>

                                <textarea name="personalityFinal" value={formData.personalityFinal} onChange={handleTextChange} placeholder="Chỉnh sửa hoặc tổng hợp tính cách cuối cùng..." className="flex-1 w-full rounded-xl border border-emerald-500/10 bg-slate-900/30 p-4 text-sm leading-7 text-white resize-none custom-scrollbar focus:outline-none focus:border-emerald-500/40 transition placeholder-slate-600" />
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
