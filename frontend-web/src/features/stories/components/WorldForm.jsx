import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Globe2, Map, Sparkles, Save, X, Plus } from "lucide-react";

export default function WorldForm({ mode = "create", initialData = null, onSubmit, onCancel }) {
    const navigate = useNavigate();
    const { storyId } = useParams();

    const isCreate = mode === "create";
    const isEdit = mode === "edit";

    // =========================
    // Tabs State
    // =========================
    const [mainTab, setMainTab] = useState("info");
    const [infoTab, setInfoTab] = useState("description");
    const [mechanicTab, setMechanicTab] = useState("power");
    const [powerInput, setPowerInput] = useState({
        name: "",
        description: "",
    });
    // =========================
    // Form & UI States
    // =========================
    const [loading, setLoading] = useState(false);
    const [geoInput, setGeoInput] = useState(""); // Lưu trữ giá trị input tạm thời cho địa lý
    const [ruleInput, setRuleInput] = useState(""); // Lưu trữ giá trị input tạm thời cho quy luật

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        history: "",
        culture: "",
        geography: [],
        powerSystems: [],
        rules: [],
    });

    // Đồng bộ dữ liệu sửa đổi (Gộp từ 2 useEffect cũ)
    useEffect(() => {
        if (isEdit && initialData) {
            setFormData({
                title: initialData.title || "",
                description: initialData.description || "",
                history: initialData.history || "",
                culture: initialData.culture || "",
                geography: initialData.geography || [],
                powerSystems: initialData.powerSystems || [],
                rules: initialData.rules || [],
            });
        }
    }, [isEdit, initialData]);

    // =========================
    // INPUT HANDLERS
    // =========================
    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // =========================
    // GEOGRAPHY ACTIONS (Tags Style)
    // =========================
    const addGeoItem = () => {
        const value = geoInput.trim();

        if (!value) return;

        if (formData.geography.includes(value)) {
            setGeoInput("");
            return;
        }

        setFormData((prev) => ({
            ...prev,
            geography: [...prev.geography, value],
        }));

        setGeoInput("");
    };

    const removeGeoItem = (itemToRemove) => {
        setFormData((prev) => ({
            ...prev,
            geography: prev.geography.filter((item) => item !== itemToRemove),
        }));
    };

    // =========================
    // POWER SYSTEM ACTIONS
    // =========================
    const handlePowerSystemChange = (index, field, value) => {
        setFormData((prev) => {
            const updated = [...prev.powerSystems];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, powerSystems: updated };
        });
    };

    const addPowerSystem = () => {
        if (!powerInput.name.trim()) return;

        setFormData((prev) => ({
            ...prev,
            powerSystems: [
                ...prev.powerSystems,
                {
                    name: powerInput.name.trim(),
                    description: powerInput.description.trim(),
                },
            ],
        }));

        setPowerInput({
            name: "",
            description: "",
        });
    };

    const removePowerSystem = (index) => {
        setFormData((prev) => ({
            ...prev,
            powerSystems: prev.powerSystems.filter((_, i) => i !== index),
        }));
    };

    // =========================
    // RULES ACTIONS
    // =========================
    const addRule = () => {
        if (!ruleInput.trim()) return;
        setFormData((prev) => ({
            ...prev,
            rules: [...prev.rules, ruleInput.trim()],
        }));
        setRuleInput("");
    };

    const removeRule = (index) => {
        setFormData((prev) => ({
            ...prev,
            rules: prev.rules.filter((_, i) => i !== index),
        }));
    };

    // =========================
    // SUBMIT FORM
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert("Vui lòng nhập tên thế giới.");
            return;
        }

        try {
            setLoading(true);
            if (onSubmit) {
                await onSubmit(formData);
            }
        } catch (error) {
            console.error("Submit world failed:", error);
            alert("Có lỗi xảy ra khi lưu dữ liệu.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#070b14] text-white font-sans antialiased">
            {/* Background Glows */}
            <div className="absolute left-1/4 top-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

            <main className="relative z-10 mx-auto max-w-7xl px-4 pt-6  flex flex-col gap-4">
                {/* ======================================================
                    HEADER (5 PHẦN TỬ TRÊN 1 HÀNG)
                ====================================================== */}
                <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-4 backdrop-blur-xl shadow-xl">
                    <div className="absolute -right-20 -top-20 h-32 w-32 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

                    <div className="grid gap-3 grid-cols-12 items-center relative z-10 w-full">
                        {/* 1. Nút quay lại */}
                        <div className="col-span-12 md:col-span-1">
                            <button type="button" onClick={() => (onCancel ? onCancel() : navigate(-1))} className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/5 bg-slate-950/40 py-2.5 text-xs font-semibold text-slate-300 transition-all duration-300 hover:bg-slate-800 hover:text-white">
                                <ArrowLeft size={14} />
                                Quay lại
                            </button>
                        </div>

                        {/* 2. Tiêu đề / Tên hành tinh */}
                        <div className="col-span-12 md:col-span-4 flex items-center gap-2.5 min-w-0 bg-slate-950/20 p-1.5 rounded-xl border border-white/5">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-transparent">
                                <Globe2 className="text-blue-400 drop-shadow-[0_0_6px_rgba(96,165,250,0.4)]" size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-base md:text-lg font-black tracking-tight text-white">{formData.title || (isCreate ? "Tạo thế giới mới" : "Chỉnh sửa thế giới")}</h1>
                            </div>
                        </div>

                        {/* 3. Cụm 2 Tabs chính */}
                        <div className="col-span-12 md:col-span-4 flex rounded-xl border border-white/5 bg-slate-950/60 p-0.5 shadow-inner">
                            <button type="button" onClick={() => setMainTab("info")} className={`flex-1 text-center rounded-lg py-1.5 text-xs font-bold transition-all duration-300 ${mainTab === "info" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                Thông tin
                            </button>
                            <button type="button" onClick={() => setMainTab("data")} className={`flex-1 text-center rounded-lg py-1.5 text-xs font-bold transition-all duration-300 ${mainTab === "data" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                Dữ liệu thế giới
                            </button>
                        </div>
                        <div className="col-span-12 md:col-span-2"></div>
                        {/* 4. Nút Lưu thay đổi */}
                        <div className="col-span-12 md:col-span-1">
                            <button type="submit" onClick={handleSubmit} disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/10 transition-all duration-300 hover:opacity-90 active:scale-95 disabled:opacity-50">
                                {loading ? "Đang lưu..." : isCreate ? "Lưu" : "Lưu"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* ======================================================
                    FORM CONTENT DATA (ĐỒNG BỘ KÍCH THƯỚC MIN-H-[420PX])
                ====================================================== */}
                <div className="w-full min-h-[500px] flex flex-col">
                    {/* TAB THÔNG TIN TỔNG QUAN */}
                    {mainTab === "info" && (
                        <section className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-slate-900/30 p-4 backdrop-blur-xl shadow-xl">
                            {/* Sub Tabs menu */}
                            <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                <div className="flex w-full md:w-auto md:min-w-[320px] rounded-lg border border-white/5 bg-slate-950/60 p-0.5">
                                    <button type="button" onClick={() => setInfoTab("description")} className={`flex-1 text-center rounded-md py-1.5 text-xs font-medium transition-all duration-200 ${infoTab === "description" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white" : "text-slate-400 hover:text-white"}`}>
                                        Giới thiệu
                                    </button>
                                    <button type="button" onClick={() => setInfoTab("history")} className={`flex-1 text-center rounded-md py-1.5 text-xs font-medium transition-all duration-200 ${infoTab === "history" ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white" : "text-slate-400 hover:text-white"}`}>
                                        Lịch sử
                                    </button>
                                    <button type="button" onClick={() => setInfoTab("culture")} className={`flex-1 text-center rounded-md py-1.5 text-xs font-medium transition-all duration-200 ${infoTab === "culture" ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white" : "text-slate-400 hover:text-white"}`}>
                                        Văn hóa
                                    </button>
                                </div>
                            </div>

                            {/* Sub Tabs Content */}
                            <div className="mt-4 flex-1 flex flex-col gap-4">
                                {infoTab === "description" && (
                                    <div className="flex flex-col gap-3 flex-1">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-xs font-medium text-slate-400 tracking-wide">Tên thế giới *</label>
                                            <input type="text" value={formData.title} onChange={(e) => handleChange("title", e.target.value)} placeholder="Ví dụ: Đại lục Hoàn Mỹ, Tinh hệ Alpha..." className="w-full h-10 rounded-xl border border-white/10 bg-slate-950/40 px-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-blue-500 transition-all" />
                                        </div>
                                        <div className="flex flex-col gap-1.5 flex-1">
                                            <label className="text-xs font-medium text-slate-400 tracking-wide">Mô tả</label>
                                            <textarea value={formData.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Bối cảnh chung của thế giới..." className="w-full flex-1 min-h-[160px] resize-none rounded-xl border border-white/5 bg-slate-950/30 p-3 text-sm leading-relaxed text-slate-200 outline-none focus:border-blue-500 transition-all custom-scroll" />
                                        </div>
                                    </div>
                                )}

                                {infoTab === "history" && (
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <label className="text-xs font-medium text-slate-400 tracking-wide">Biên niên sử hình thành (Lịch sử thế giới)</label>
                                        <textarea value={formData.history} onChange={(e) => handleChange("history", e.target.value)} placeholder="Ghi lại các sự kiện lớn, cuộc chiến cổ đại..." className="w-full flex-1 min-h-[220px] resize-none rounded-xl border border-white/5 bg-slate-950/30 p-3 text-sm leading-relaxed text-slate-200 outline-none focus:border-violet-500 transition-all custom-scroll" />
                                    </div>
                                )}

                                {infoTab === "culture" && (
                                    <div className="flex flex-col gap-1.5 flex-1">
                                        <label className="text-xs font-medium text-slate-400 tracking-wide">Văn hóa, Tôn giáo và Lễ hội</label>
                                        <textarea value={formData.culture} onChange={(e) => handleChange("culture", e.target.value)} placeholder="Phong tục tập quán, võ đạo, các ngày lễ đặc biệt..." className="w-full flex-1 min-h-[220px] resize-none rounded-xl border border-white/5 bg-slate-950/30 p-3 text-sm leading-relaxed text-slate-200 outline-none focus:border-cyan-500 transition-all custom-scroll" />
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                    {/* TAB DỮ LIỆU ĐỊA LÝ & CƠ CHẾ SỨC MẠNH */}
                    {mainTab === "data" && (
                        <section className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-slate-900/30 p-4 backdrop-blur-xl shadow-xl">
                            <div className="grid flex-1 gap-4 lg:grid-cols-10">
                                {/* =====================================
                                    GEOGRAPHY CARD
                                ===================================== */}
                                <div className="lg:col-span-3 flex flex-col rounded-xl border border-white/10 bg-slate-950/20 p-4 h-full">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/10">
                                                <Map className="text-cyan-400" size={16} />
                                            </div>
                                            <h2 className="text-sm font-bold text-slate-100">Địa danh</h2>
                                        </div>
                                    </div>

                                    {/* Khung thêm Tag & danh sách (1 DÒNG ĐƯỢC 3 ITEM BOX) */}
                                    <div className="mt-3 flex-1 flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={geoInput}
                                                onChange={(e) => setGeoInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") {
                                                        e.preventDefault();
                                                        addGeoItem();
                                                    }
                                                }}
                                                placeholder="Thêm khu vực..."
                                                className="flex-1 h-9 rounded-lg border border-white/10 bg-slate-950/40 px-3 text-xs outline-none focus:border-cyan-500 text-white"
                                            />

                                            <button type="button" onClick={addGeoItem} className="rounded-lg bg-cyan-600/20 border border-cyan-500/30 px-3 text-xs font-medium text-cyan-400 hover:bg-cyan-600/40 transition-all">
                                                Thêm
                                            </button>
                                        </div>

                                        {/* Hiển thị item: 1 dòng 3 cái item */}
                                        <div className="flex-1 overflow-y-auto pr-1 max-h-[200px] custom-scroll">
                                            <div className="grid gap-2 grid-cols-3">
                                                {formData.geography.map((item, idx) => (
                                                    <div key={idx} className="flex items-center justify-between rounded-lg border border-white/5 bg-slate-950/40 pl-2.5 pr-1.5 py-1.5 group hover:border-white/10">
                                                        <span className="text-xs truncate text-slate-200">{item}</span>
                                                        <button type="button" onClick={() => removeGeoItem(item)} className="text-slate-500 hover:text-red-400 transition-all ml-1">
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* =====================================
                                    MECHANICS CARD (POWER & RULES)
                                ===================================== */}
                                <div className="lg:col-span-7 flex h-full min-h-0 flex-col rounded-xl border border-white/10 bg-slate-950/20 p-4">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-yellow-500/20 bg-yellow-500/10">
                                                <Sparkles className="text-yellow-400" size={16} />
                                            </div>
                                            <h2 className="text-sm font-bold text-slate-100">Cơ chế vận hành</h2>
                                        </div>

                                        <div className="flex min-w-[160px] rounded-lg border border-white/5 bg-slate-950/60 p-0.5">
                                            <button type="button" onClick={() => setMechanicTab("power")} className={`flex-1 text-center rounded-md py-1 text-xs font-medium transition-all duration-200 ${mechanicTab === "power" ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                                Hệ thống
                                            </button>
                                            <button type="button" onClick={() => setMechanicTab("rules")} className={`flex-1 text-center rounded-md py-1 text-xs font-medium transition-all duration-200 ${mechanicTab === "rules" ? "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                                Quy luật
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Render động theo Tab cơ chế */}
                                    <div className="mt-3 flex-1 min-h-0">
                                        {/* Sub-Tab Hệ thống sức mạnh */}
                                        {mechanicTab === "power" && (
                                            /* Thay h-full bằng h-[300px] để cố định khung, fix lỗi tràn layout */
                                            <div className="grid h-[380px] gap-4 lg:grid-cols-5">
                                                {/* KHỐI TRÁI: THÊM HỆ THỐNG (2 Cột) */}
                                                <div className="lg:col-span-2 flex flex-col rounded-xl border border-white/10 bg-slate-950/40 p-4">
                                                    <h3 className="mb-3 text-xs font-semibold text-yellow-400 uppercase tracking-wider">Thêm hệ thống sức mạnh</h3>

                                                    <div className="flex-1 flex flex-col gap-2.5">
                                                        <input
                                                            type="text"
                                                            value={powerInput.name}
                                                            onChange={(e) =>
                                                                setPowerInput({
                                                                    ...powerInput,
                                                                    name: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Tên hệ thống (VD: Ma Pháp, Đấu Khí...)"
                                                            className="h-9 w-full rounded-lg border border-white/10 bg-transparent px-3 text-xs font-semibold text-yellow-400 outline-none focus:border-yellow-500 transition-all"
                                                        />

                                                        {/* Giảm bớt h-40 xuống h-24 để vừa vặn trong khung h-[300px] */}
                                                        <textarea
                                                            value={powerInput.description}
                                                            onChange={(e) =>
                                                                setPowerInput({
                                                                    ...powerInput,
                                                                    description: e.target.value,
                                                                })
                                                            }
                                                            placeholder="Mô tả ngắn gọn nguyên lý vận hành..."
                                                            className="flex-1 resize-none rounded-lg border border-white/10 bg-transparent px-3 py-2 text-xs text-slate-300 outline-none focus:border-yellow-500 transition-all custom-scroll"
                                                        />

                                                        <button type="button" onClick={addPowerSystem} className="h-9 rounded-lg bg-yellow-600/20 border border-yellow-500/30 text-xs font-bold text-yellow-400 hover:bg-yellow-600/40 active:scale-[0.98] transition-all">
                                                            Thêm vào danh sách
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* KHỐI PHẢI: DANH SÁCH (3 Cột) */}
                                                <div className="lg:col-span-3 flex flex-col rounded-xl border border-white/10 bg-slate-950/40 p-4 min-h-0">
                                                    <h3 className="mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Danh sách hệ thống hiện có</h3>

                                                    {/* Vùng chứa có thuộc tính scroll hoạt động chuẩn xác */}
                                                    <div className="flex-1 overflow-y-auto pr-1 custom-scroll">
                                                        {formData.powerSystems.length === 0 ? (
                                                            <div className="flex h-full items-center justify-center text-xs text-slate-500 italic">Chưa có hệ thống sức mạnh nào được tạo</div>
                                                        ) : (
                                                            <div className="flex flex-col gap-2">
                                                                {formData.powerSystems.map((system, index) => (
                                                                    <div key={index} className="relative rounded-xl border border-white/5 bg-slate-900/40 p-3.5 pr-8 transition-all hover:border-white/10">
                                                                        <button type="button" onClick={() => removePowerSystem(index)} className="absolute right-3 top-3.5 text-slate-500 hover:text-red-400 transition-all">
                                                                            <X size={14} />
                                                                        </button>

                                                                        <h4 className="text-xs font-bold text-yellow-400 tracking-wide">{system.name || "Hệ thống chưa đặt tên"}</h4>

                                                                        <p className="mt-1 whitespace-pre-wrap text-[11px] leading-5 text-slate-400">{system.description || "Chưa có mô tả chi tiết."}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {mechanicTab === "rules" && (
                                            /* Khóa chiều cao tổng của khối Quy luật bằng h-[380px] và chia flex để tính toán không gian */
                                            <div className="flex flex-col gap-3 h-[380px] min-h-0 w-full">
                                                {/* Ô nhập liệu quy luật mới */}
                                                <div className="flex gap-2 shrink-0">
                                                    <input type="text" value={ruleInput} onChange={(e) => setRuleInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())} placeholder="Nhập quy luật tuyệt đối (VD: Mỗi người thức tỉnh 1 hệ)..." className="flex-1 h-9 rounded-lg border border-white/10 bg-slate-950/40 px-3 text-xs outline-none focus:border-red-500 text-white transition-all" />
                                                    <button type="button" onClick={addRule} className="rounded-lg bg-red-600/20 border border-red-500/30 px-3 text-xs font-medium text-red-400 hover:bg-red-600/40 active:scale-95 transition-all">
                                                        Thêm
                                                    </button>
                                                </div>

                                                {/* Vùng chứa danh sách được gán flex-1 và max-h để kích hoạt scroll chuẩn xác khi tràn dữ liệu */}
                                                <div className="flex-1 overflow-y-auto pr-1 max-h-[380px] custom-scroll min-h-0">
                                                    {formData.rules.length === 0 ? (
                                                        <div className="flex h-full items-center justify-center text-xs text-slate-500 italic">Chưa có quy luật nào được tạo</div>
                                                    ) : (
                                                        <div className="flex flex-col gap-2">
                                                            {formData.rules.map((rule, idx) => (
                                                                <div key={idx} className="flex items-start justify-between rounded-lg border border-white/5 bg-slate-950/40 p-2.5 group hover:border-white/10 transition-all">
                                                                    <div className="flex items-start gap-2 min-w-0">
                                                                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400 shadow shadow-red-400" />
                                                                        <p className="text-xs text-slate-300 leading-normal break-words">{rule}</p>
                                                                    </div>
                                                                    <button type="button" onClick={() => removeRule(idx)} className="text-slate-500 hover:text-red-400 transition-all ml-2 shrink-0">
                                                                        <X size={12} />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
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
