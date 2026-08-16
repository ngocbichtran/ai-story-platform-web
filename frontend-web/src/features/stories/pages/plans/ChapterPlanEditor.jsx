import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, PenSquare, Plus, Trash2, BookOpen, Loader2, Sparkles, Check } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
const N8N_BASE_URL = "https://n8n.baostory.fun";

export default function ChapterPlanEditor() {
    const { storyId } = useParams();
    const navigate = useNavigate();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAILoading, setIsAILoading] = useState(false);
    const [isCurrentAILoading, setIsCurrentAILoading] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [isEditingPlan, setIsEditingPlan] = useState(false);
    const [aiSuggestedSummary, setAiSuggestedSummary] = useState("");
    const [planForm, setPlanForm] = useState({
        chapterNumber: 1,
        versionName: "",
        summary: "",
    });
    const getAuthConfig = () => {
        const token = localStorage.getItem("token");
        return {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        };
    };
    const extractChapterPlan = (rawResponse) => {
        try {
            let data = rawResponse;
            if (typeof data === "string") {
                const trimmed = data.trim();
                if (!trimmed) return null;
                try {
                    data = JSON.parse(trimmed);
                } catch (parseError) {
                    return null;
                }
            }
            if (data && typeof data === "object" && !Array.isArray(data) && data.data !== undefined) {
                data = data.data;
            }
            if (Array.isArray(data)) {
                if (data.length === 0) return null;
                data = data[0];
            }
            if (data && typeof data === "object" && !Array.isArray(data) && data.data !== undefined) {
                data = data.data;
                if (Array.isArray(data)) data = data[0];
            }
            if (data && typeof data === "object" && data.chapterPlan !== undefined) {
                data = data.chapterPlan;
            }
            if (Array.isArray(data)) data = data[0];
            if (!data || typeof data !== "object") return null;
            return data;
        } catch (error) {
            console.error("Lỗi extract chapterPlan:", error);
            return null;
        }
    };

    const buildChapterSummary = (chapterPlan) => {
        if (!chapterPlan) return "";
        if (typeof chapterPlan.summary === "string" && chapterPlan.summary.trim()) {
            return chapterPlan.summary.trim();
        }
        if (typeof chapterPlan.content === "string" && chapterPlan.content.trim()) {
            return chapterPlan.content.trim();
        }
        const parts = [];
        if (typeof chapterPlan.purpose === "string" && chapterPlan.purpose.trim()) {
            parts.push(`Mục tiêu: ${chapterPlan.purpose.trim()}`);
        }
        if (typeof chapterPlan.conflict === "string" && chapterPlan.conflict.trim()) {
            parts.push(`Xung đột: ${chapterPlan.conflict.trim()}`);
        }
        if (typeof chapterPlan.endingHook === "string" && chapterPlan.endingHook.trim()) {
            parts.push(`Điểm móc: ${chapterPlan.endingHook.trim()}`);
        }
        return parts.join("\n\n").trim();
    };

    const getChapterTitle = (chapterPlan, chapterNumber) => {
        if (!chapterPlan) return `Chương ${chapterNumber} (Gợi ý AI)`;
        if (typeof chapterPlan.title === "string" && chapterPlan.title.trim()) {
            return chapterPlan.title.trim();
        }
        if (typeof chapterPlan.versionName === "string" && chapterPlan.versionName.trim()) {
            return chapterPlan.versionName.trim();
        }
        return `Chương ${chapterNumber} (Gợi ý AI)`;
    };

    // =====================================================
    // 1. LẤY DANH SÁCH KẾ HOẠCH CHƯƠNG
    // =====================================================
    const fetchPlans = useCallback(async () => {
        if (!storyId) return;
        try {
            setLoading(true);
            const config = getAuthConfig();
            const res = await axios.get(`https://api.baostory.fun/api/chapterPlan/stories/${storyId}`, config);

            if (res.data?.success) {
                const planList = Array.isArray(res.data.data) ? res.data.data : [];
                setPlans(planList);

                if (planList.length > 0) {
                    setSelectedPlanId((currentSelectedId) => {
                        if (currentSelectedId && planList.some((plan) => plan._id === currentSelectedId)) {
                            return currentSelectedId;
                        }
                        return planList[0]._id;
                    });
                } else {
                    setSelectedPlanId(null);
                }
            } else {
                setPlans([]);
            }
        } catch (err) {
            console.error("Lỗi tải danh sách kế hoạch chương:", err.response?.data || err);
            toast.error(err.response?.data?.message || "Không thể tải danh sách kế hoạch.");
        } finally {
            setLoading(false);
        }
    }, [storyId]);

    useEffect(() => {
        if (storyId) fetchPlans();
    }, [storyId, fetchPlans]);

    const currentPlan = plans.find((p) => p._id === selectedPlanId) || null;

    useEffect(() => {
        if (currentPlan) {
            setPlanForm({
                chapterNumber: currentPlan.chapterNumber || 1,
                versionName: currentPlan.versionName || currentPlan.title || "",
                summary: buildChapterSummary(currentPlan),
            });
            setAiSuggestedSummary("");
        }
    }, [currentPlan]);

    // =====================================================
    // N8N TẠO MỚI KẾ HOẠCH KẾ TIẾP & TỰ ĐỘNG TẠO CHƯƠNG
    // =====================================================
    const handleAISuggestPlan = async () => {
        if (!storyId) {
            toast.error("Không tìm thấy storyId.");
            return;
        }
        if (plans.length > 0) {
            const hasEmptySummary = plans.some((p) => !buildChapterSummary(p));
            if (hasEmptySummary) {
                toast.error("Vui lòng hoàn thiện nội dung tóm tắt cho các kế hoạch chương hiện tại trước khi tạo thêm kế hoạch mới!");
                return;
            }
        }

        try {
            setIsAILoading(true);
            const config = getAuthConfig();
            const nextNum = plans.length > 0 ? Math.max(...plans.map((p) => Number(p.chapterNumber) || 0)) + 1 : 1;
            const payload = {
                storyId: Number(storyId),
                chapterNumber: Number(nextNum),
            };
            const res = await axios.post("https://api.baostory.fun/api/chapterPlan/suggest-next", payload, config);
            if (!res.data?.success) {
                toast.error(res.data?.message || "Không thể tạo kế hoạch chương.");
                return;
            }
            toast.success("AI đã tạo kế hoạch và khởi tạo chương mới thành công!");
            await fetchPlans();
            const newId = res.data?.data?.planId;
            if (newId) {
                setSelectedPlanId(newId);
            }
        } catch (err) {
            console.error("LỖI TẠO KẾ HOẠCH:", err.response?.data || err);

            toast.error(err.response?.data?.message || "Không thể kết nối tới hệ thống.");
        } finally {
            setIsAILoading(false);
        }
    };
    // =====================================================
    // GỢI Ý AI CHO CHƯƠNG HIỆN TẠI (HIỂN THỊ CỘT RIÊNG)
    // =====================================================
    const handleAISuggestCurrentPlan = async () => {
        if (!storyId || !currentPlan) {
            toast.error("Vui lòng chọn một kế hoạch chương.");
            return;
        }
        try {
            setIsCurrentAILoading(true);
            const config = getAuthConfig();
            const currentChapterNumber = Number(currentPlan.chapterNumber);
            const payload = {
                storyId: Number(storyId),
                chapterNumber: currentChapterNumber,
            };

            const res = await axios.post(`https://api.baostory.fun/api/chapterPlan/suggest-current`, payload, config);
            if (!res.data?.success) {
                toast.error(res.data?.message || "Không thể lấy gợi ý AI.");
                return;
            }
            const data = res.data.data;
            const generatedSummary = buildChapterSummary(data);
            setAiSuggestedSummary(generatedSummary);
            setIsEditingPlan(true);

            toast.success(`AI đã đưa ra gợi ý mới cho Chương ${currentChapterNumber}.`);
        } catch (err) {
            console.error("LỖI GỢI Ý CHƯƠNG HIỆN TẠI:", err.response?.data || err);
            toast.error(err.response?.data?.message || "Không thể kết nối hệ thống AI.");
        } finally {
            setIsCurrentAILoading(false);
        }
    };

    const handleAcceptAISummary = () => {
        if (!aiSuggestedSummary) return;
        setPlanForm((prev) => ({
            ...prev,
            summary: aiSuggestedSummary,
        }));
        toast.success("Đã áp dụng nội dung từ AI vào văn bản gốc!");
    };

    // =====================================================
    // 4. LƯU KẾ HOẠCH
    // =====================================================
    const handleSavePlan = async () => {
        try {
            const config = getAuthConfig();
            const payload = {
                storyId: Number(storyId),
                chapterNumber: Number(planForm.chapterNumber),
                planData: {
                    versionName: planForm.versionName,
                    summary: planForm.summary,
                },
            };

            let res;
            if (currentPlan && currentPlan._id) {
                res = await axios.put(`https://api.baostory.fun/api/chapterPlan/${currentPlan._id}`, payload, config);
            } else {
                res = await axios.post(`https://api.baostory.fun/api/chapterPlan`, payload, config);
            }

            if (res.data?.success) {
                toast.success("Lưu kế hoạch chương thành công!");
                await fetchPlans();
                setIsEditingPlan(false);
                setAiSuggestedSummary("");
            } else {
                toast.error(res.data?.message || "Lưu kế hoạch thất bại.");
            }
        } catch (err) {
            console.error("Lỗi lưu kế hoạch:", err.response?.data || err);
            toast.error(err.response?.data?.message || "Không thể lưu kế hoạch.");
        }
    };

    // =====================================================
    // 5. XÓA KẾ HOẠCH
    // =====================================================
    const handleDeletePlan = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Bạn có chắc muốn xóa kế hoạch chương này không?")) return;

        try {
            const config = getAuthConfig();
            const res = await axios.delete(`https://api.baostory.fun/api/chapterPlan/${id}`, config);
            if (res.data?.success) {
                toast.success("Xóa kế hoạch chương thành công!");
                if (selectedPlanId === id) setSelectedPlanId(null);
                await fetchPlans();
            } else {
                toast.error(res.data?.message || "Không thể xóa kế hoạch.");
            }
        } catch (err) {
            console.error("Lỗi xóa kế hoạch:", err.response?.data || err);
            toast.error(err.response?.data?.message || "Không thể xóa kế hoạch.");
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#080d1a] text-blue-500">
                <div className="flex items-center gap-3">
                    <Loader2 size={30} className="animate-spin" />
                    <span className="text-sm text-slate-400">Đang tải kế hoạch chương...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-[#080d1a] p-6 text-[#dae2fd]">
            <div className="flex w-full gap-6">
                {/* =====================================================
                    CỘT TRÁI: DANH SÁCH
                ===================================================== */}
                <aside className="flex w-1/4 min-w-[270px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#131720]">
                    <div className="border-b border-white/10 p-3">
                        <button onClick={() => navigate(`/stories/${storyId}/editor`)} className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white">
                            Quay lại
                        </button>
                    </div>

                    <div className="flex shrink-0 items-center justify-between border-b border-white/10 p-4">
                        {/* Tiêu đề */}
                        <h3 className="flex items-center gap-2 text-sm font-extrabold tracking-wide text-slate-200">
                            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                                <BookOpen size={14} />
                            </div>
                            <span>Danh sách kế hoạch</span>
                        </h3>
                        <button onClick={handleAISuggestPlan} disabled={isAILoading} className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-lg shadow-purple-500/10 transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50">
                            {isAILoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-purple-200" />}
                            <span>{isAILoading ? "Đang tạo..." : "Thêm"}</span>
                        </button>
                    </div>

                    <div className="custom-scroll flex flex-1 flex-col gap-2 overflow-y-auto p-3">
                        {plans.map((p) => (
                            <div
                                key={p._id}
                                onClick={() => {
                                    setSelectedPlanId(p._id);
                                    setIsEditingPlan(false);
                                    setAiSuggestedSummary("");
                                }}
                                className={`group flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${selectedPlanId === p._id ? "border-blue-500 bg-blue-500/10 text-white shadow-lg" : "border-white/5 bg-[#0F172A]/40 text-slate-400 hover:bg-white/5"}`}
                            >
                                <div className="flex min-w-0 flex-col pr-2">
                                    <span className="text-xs font-semibold text-slate-500 transition group-hover:text-blue-400">Chương {p.chapterNumber}</span>
                                    <span className="mt-0.5 truncate text-sm font-bold text-slate-200">{p.versionName || p.title || `Chương ${p.chapterNumber}`}</span>
                                </div>
                                <button onClick={(e) => handleDeletePlan(p._id, e)} className="shrink-0 rounded-lg p-1.5 text-slate-500 opacity-0 transition hover:bg-red-500/20 hover:text-red-400 group-hover:opacity-100">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {!loading && plans.length === 0 && <div className="mt-4 text-center text-sm italic text-slate-500">Chưa có kế hoạch nào.</div>}
                    </div>
                </aside>

                {/* =====================================================
                    CỘT PHẢI: CHI TIẾT KẾ HOẠCH & 2 KHUNG VĂN BẢN
                ===================================================== */}
                <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
                    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#131720] p-6">
                        {currentPlan ? (
                            <div className="flex h-full flex-col gap-4 overflow-y-auto custom-scroll pr-2">
                                {/* HEADER */}
                                <div className="flex items-center justify-between border-b border-white/5 pb-3 shrink-0">
                                    <h2 className="text-xl font-bold text-white">Kế Hoạch: Chương {currentPlan.chapterNumber}</h2>

                                    <div className="flex items-center gap-3">
                                        {!isEditingPlan ? (
                                            <button onClick={() => setIsEditingPlan(true)} className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0460b3]">
                                                <PenSquare size={16} /> Sửa kế hoạch
                                            </button>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <button onClick={handleAISuggestCurrentPlan} disabled={isCurrentAILoading} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-purple-500/10 transition hover:opacity-90 disabled:opacity-50">
                                                    {isCurrentAILoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                                    <span>{isCurrentAILoading ? "Đang gợi ý..." : "Gợi ý AI (n8n)"}</span>
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setIsEditingPlan(false);
                                                        setAiSuggestedSummary("");
                                                    }}
                                                    disabled={isCurrentAILoading}
                                                    className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5"
                                                >
                                                    Hủy
                                                </button>

                                                <button onClick={handleSavePlan} disabled={isCurrentAILoading} className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0460b3]">
                                                    <Save size={16} /> Lưu kế hoạch
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* FORM METADATA */}
                                <div className="mt-2 flex flex-col gap-4 shrink-0">
                                    <div className=" gap-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">Tên kế hoạch</label>
                                            {isEditingPlan ? <input type="text" value={planForm.versionName} onChange={(e) => setPlanForm({ ...planForm, versionName: e.target.value })} className="w-full rounded-xl border border-white/10 bg-[#0F172A] px-4 py-3 text-slate-200 outline-none focus:border-blue-500 transition" /> : <div className="rounded-xl border border-white/10 bg-[#0F172A]/70 px-4 py-3 font-medium text-slate-100">{currentPlan.versionName || currentPlan.title || "Chưa đặt tên"}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* CHIA KẾ HOẠCH THÀNH 2 CỘT: GỐC VÀ AI TRẢ VỀ */}
                                <div className="flex flex-col gap-1.5 flex-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Tóm tắt nội dung kế hoạch</label>

                                    {isEditingPlan ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
                                            <div className="flex flex-col gap-2 relative">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wide flex items-center gap-1.5">
                                                        <Sparkles size={14} /> Gợi ý mới từ AI (n8n)
                                                    </div>
                                                    <button onClick={handleAcceptAISummary} disabled={!aiSuggestedSummary} className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition shadow-sm disabled:opacity-40" title="Chuyển toàn bộ nội dung AI sang khung bên trái">
                                                        <Check size={14} /> Áp dụng thay thế
                                                    </button>
                                                </div>
                                                <div className="custom-scroll h-[320px] w-full overflow-y-auto whitespace-pre-wrap rounded-xl border border-purple-500/30 bg-purple-500/[0.03] p-4 leading-7 text-slate-200 shadow-inner">{aiSuggestedSummary || <span className="italic text-slate-600">Bấm "Gợi ý AI (n8n)" ở phía trên để nhận nội dung mới từ AI...</span>}</div>
                                            </div>{" "}
                                            {/* CỘT 1: VĂN BẢN GỐC / CHỈNH SỬA */}
                                            <div className="flex flex-col gap-2">
                                                <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">Văn bản gốc / Chỉnh sửa</div>
                                                <textarea value={planForm.summary} onChange={(e) => setPlanForm({ ...planForm, summary: e.target.value })} rows={10} className="custom-scroll h-[320px] w-full resize-none rounded-xl border border-blue-500/40 bg-[#0F172A] p-4 leading-7 text-slate-200 outline-none transition focus:border-blue-500 shadow-lg" />
                                            </div>
                                        </div>
                                    ) : (
                                        /* HIỂN THỊ THƯỜNG KHI KHÔNG SỬA (CHỈ XEM) */
                                        <div className="flex-1">
                                            <div className="custom-scroll h-[320px] w-full overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/5 bg-[#0F172A]/60 p-4 leading-7 text-slate-300">{buildChapterSummary(currentPlan) || <span className="italic text-slate-600">Chưa có tóm tắt kế hoạch.</span>}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center text-sm italic text-slate-500">Vui lòng chọn hoặc tạo mới một kế hoạch chương bên cột trái.</div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}
