import React, { useState, useEffect, useCallback } from "react";
import { Save, ScrollText, PenSquare, Loader2, Sparkles, Check } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function PlotList() {
    const { storyId } = useParams();

    const [isEditing, setIsEditing] = useState(false);
    const [plotType, setPlotType] = useState("5sentence");

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [showAISidebar, setShowAISidebar] = useState(false);
    const [isGenerating5Sentence, setIsGenerating5Sentence] = useState(false);
    const [isGenerating1Page, setIsGenerating1Page] = useState(false);
    const [isGenerating4Page, setIsGenerating4Page] = useState(false);

    const [isDerivative, setIsDerivative] = useState(false);

    const [form, setForm] = useState({
        fiveSentences: "",
        onePage: "",
        fourPages: "",
    });

    const [aiResults, setAiResults] = useState({
        fiveSentences: "",
        onePage: "",
        fourPages: "",
    });

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const checkIsDerivative = (storyData) => {
        const rawOriginalStoryId = storyData?.original_story_id ?? storyData?.originalStoryId ?? null;

        if (rawOriginalStoryId === null || rawOriginalStoryId === undefined || rawOriginalStoryId === "" || rawOriginalStoryId === "null" || rawOriginalStoryId === "undefined") {
            setIsDerivative(false);
            return false;
        }

        const numericOriginalStoryId = Number(rawOriginalStoryId);

        if (Number.isNaN(numericOriginalStoryId) || numericOriginalStoryId <= 0) {
            setIsDerivative(false);
            return false;
        }

        setIsDerivative(true);
        return true;
    };

    const fetchOutlineData = useCallback(async () => {
        if (!storyId) return;

        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const storyRes = await axios.get(`https://api.baostory.fun/api/stories/${storyId}`, config);
            const storyData = storyRes.data?.data ?? storyRes.data?.story ?? storyRes.data;

            checkIsDerivative(storyData);

            // Sửa lại thành:
            const outlineRes = await axios.get(`https://api.baostory.fun/api/storyOutline/${storyId}/outline`, config);
            if (outlineRes.data?.success && outlineRes.data?.data) {
                const data = outlineRes.data.data;

                setForm({
                    fiveSentences: data.fiveSentences || "",
                    onePage: data.onePage || "",
                    fourPages: data.fourPages || "",
                });
            } else {
                setForm({
                    fiveSentences: "",
                    onePage: "",
                    fourPages: "",
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải dữ liệu đề cương.");
        } finally {
            setIsLoading(false);
        }
    }, [storyId]);

    useEffect(() => {
        if (storyId) {
            fetchOutlineData();
        }
    }, [storyId, fetchOutlineData]);

    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem("token");

            const res = await axios.put(`https://api.baostory.fun/api/storyOutline/${storyId}/outline`, form, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (res.data?.success) {
                toast.success("Đã lưu đề cương thành công!");
                setIsEditing(false);
            } else {
                toast.error(res.data?.message || "Lưu đề cương thất bại.");
            }
        } catch (err) {
            toast.error("Lưu thất bại.");
        } finally {
            setIsSaving(false);
        }
    };

    const parseAIResponse = (responseData, targetPlotType) => {
        console.log("====================================");
        console.log("🔍 PARSING AI RESPONSE CHO TAB:", targetPlotType);
        console.log("====================================");
        console.log(JSON.stringify(responseData, null, 2));

        let field = "";
        if (targetPlotType === "5sentence") {
            field = "fiveSentences";
        } else if (targetPlotType === "1page") {
            field = "onePage";
        } else if (targetPlotType === "4pages") {
            field = "fourPages";
        }

        let rawData = responseData?.data ?? responseData;
        if (Array.isArray(rawData)) {
            rawData = rawData[0] || {};
        }

        let content = "";

        // 1. Lấy trực tiếp từ field chuẩn (fiveSentences, onePage, fourPages, hoặc content)
        if (typeof rawData === "object" && rawData !== null) {
            content = rawData[field] || rawData.fourPages || rawData.fiveSentences || rawData.onePage || rawData.content || rawData.output || rawData.text || "";

            // 2. Nếu không thấy nhưng có mảng outline từ N8N trả về (như mảng 12 câu của bạn)
            if (!content && rawData.outline) {
                content = rawData.outline;
            }
        } else if (typeof rawData === "string") {
            content = rawData;
        }

        // 3. Nếu content đang là một mảng các đoạn văn (Array)
        if (Array.isArray(content)) {
            content = content
                .map((item) => {
                    if (typeof item === "string") return item;
                    if (item && typeof item === "object") {
                        return item.content || item.text || item.output || "";
                    }
                    return "";
                })
                .filter(Boolean)
                .join("\n\n");
        }

        // 4. Nếu content là object lồng nhau
        if (content && typeof content === "object") {
            if (Array.isArray(content.outline)) {
                content = content.outline.join("\n\n");
            } else {
                content = content.content || content.output || content.text || "";
            }
        }

        content = String(content || "").trim();

        console.log("🎯 FIELD ĐÍCH:", field);
        console.log("📝 NỘI DUNG SAU KHI PARSE:", content.substring(0, 100) + "...");

        return {
            field,
            content,
        };
    };

    // =====================================================
    // KẾT NỐI 3 API RIÊNG BIỆT TƯƠNG ỨNG 3 NÚT AI
    // =====================================================
    const handleAISuggestByType = async (targetPlotType) => {
        if (isDerivative) {
            toast.error("Truyện phái sinh không sử dụng tính năng AI gợi ý.");
            return;
        }

        setShowAISidebar(true);

        const setLoad = (value) => {
            if (targetPlotType === "5sentence") {
                setIsGenerating5Sentence(value);
            } else if (targetPlotType === "1page") {
                setIsGenerating1Page(value);
            } else if (targetPlotType === "4pages") {
                setIsGenerating4Page(value);
            }
        };

        // Phân rã Endpoint chuẩn xác cho từng nút gọi AI
        let endpointSubPath = "";
        if (targetPlotType === "5sentence") {
            endpointSubPath = "ai-suggest-5sentences";
        } else if (targetPlotType === "1page") {
            endpointSubPath = "ai-suggest-1page";
        } else if (targetPlotType === "4pages") {
            endpointSubPath = "ai-suggest-4pages";
        }

        try {
            setLoad(true);
            const token = localStorage.getItem("token");

            const payload = {
                storyId: Number(storyId),
                plotType: targetPlotType,
                originalOutline: {
                    fiveSentences: form.fiveSentences || "",
                    onePage: form.onePage || "",
                    fourPages: form.fourPages || "",
                },
            };

            const res = await axios.post(`https://api.baostory.fun/api/storyOutline/${storyId}/${endpointSubPath}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                timeout: 120000,
            });

            if (!res.data?.success) {
                toast.error(res.data?.message || "AI không trả về kết quả.");
                return;
            }

            const parsed = parseAIResponse(res.data, targetPlotType);
            const field = parsed.field;
            const contentAI = parsed.content;

            if (!contentAI) {
                toast.error("AI trả về dữ liệu nhưng không có nội dung.");
                return;
            }

            setAiResults((prev) => ({
                ...prev,
                [field]: contentAI,
            }));

            setShowAISidebar(true);
            toast.success("Trợ lý AI đã tạo gợi ý thành công!");
        } catch (err) {
            console.error("Lỗi gọi AI:", err.response?.data || err.message);
            if (err.response?.status === 502) {
                toast.error("Backend không kết nối được với N8N.");
            } else {
                toast.error(err.response?.data?.message || "Không thể tạo gợi ý từ AI.");
            }
        } finally {
            setLoad(false);
        }
    };

    const handleApplyAIResult = () => {
        let field = "";

        if (plotType === "5sentence") {
            field = "fiveSentences";
        } else if (plotType === "1page") {
            field = "onePage";
        } else if (plotType === "4pages") {
            field = "fourPages";
        }

        const aiContent = aiResults[field];

        if (!aiContent) {
            toast.error("Chưa có nội dung AI để áp dụng.");
            return;
        }

        handleChange(field, aiContent);
        setIsEditing(true);
        toast.success("Đã áp dụng nội dung AI vào đề cương!");
    };

    const setCurrentContent = (value) => {
        if (plotType === "5sentence") {
            handleChange("fiveSentences", value);
        } else if (plotType === "1page") {
            handleChange("onePage", value);
        } else if (plotType === "4pages") {
            handleChange("fourPages", value);
        }
    };

    const getCurrentContent = () => {
        if (plotType === "5sentence") return form.fiveSentences;
        if (plotType === "1page") return form.onePage;
        return form.fourPages;
    };

    const getCurrentAIResult = () => {
        if (plotType === "5sentence") return aiResults.fiveSentences;
        if (plotType === "1page") return aiResults.onePage;
        return aiResults.fourPages;
    };

    const isCurrentGeneratingAI = plotType === "5sentence" ? isGenerating5Sentence : plotType === "1page" ? isGenerating1Page : isGenerating4Page;

    const currentText = getCurrentContent();
    const outlineAIResult = getCurrentAIResult();
    const wordCount = currentText.trim().split(/\s+/).filter(Boolean).length;
    const charCount = currentText.length;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center bg-[#080d1a] text-blue-500">
                <Loader2 size={32} className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#080d1a] p-8 text-[#dae2fd]">
            {/* TOOLBAR */}
            <section className="mb-5 flex shrink-0 items-center justify-between rounded-2xl border border-white/10 bg-[#131720] p-2">
                <div className="flex gap-2">
                    {["5sentence", "1page", "4pages"].map((type) => (
                        <button
                            key={type}
                            onClick={() => {
                                setPlotType(type);
                                if (showAISidebar) setShowAISidebar(true);
                            }}
                            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${plotType === type ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}
                        >
                            {type === "5sentence" && "Tóm tắt (5 Câu)"}
                            {type === "1page" && "Chi tiết (1 Trang)"}
                            {type === "4pages" && "Outline (4 Trang)"}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#0460b3]">
                            <PenSquare size={16} />
                            Sửa đề cương
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    fetchOutlineData();
                                }}
                                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm transition hover:bg-white/5"
                            >
                                Hủy
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold transition hover:bg-[#0460b3] disabled:cursor-not-allowed disabled:opacity-50">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSaving ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* MAIN LAYOUT */}
            <div className="flex min-h-0 flex-1 gap-6 overflow-hidden">
                {/* AI SIDEBAR */}
                {!isDerivative && isEditing && (
                    <div className={`h-full min-h-0 flex-col transition-all duration-300 ease-in-out ${showAISidebar ? "flex w-[380px] opacity-100" : "pointer-events-none flex w-0 -mr-6 opacity-0"}`}>
                        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#10151E]/60 shadow-xl">
                            <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-blue-500/5 px-6 py-4">
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-400">
                                    <Sparkles size={15} />
                                    <span>Gợi ý AI ({plotType === "5sentence" ? "5 Câu" : plotType === "1page" ? "1 Trang" : "4 Trang"})</span>
                                </div>

                                {outlineAIResult && (
                                    <button onClick={handleApplyAIResult} className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-blue-500 active:scale-95" title="Chèn nội dung AI vào đề cương">
                                        <Check size={13} />
                                        <span>Chấp nhận</span>
                                    </button>
                                )}
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col px-6 py-5">
                                {isCurrentGeneratingAI ? (
                                    <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-400">
                                        <Loader2 size={28} className="animate-spin text-blue-400" />
                                        <span className="text-xs">
                                            Trợ lý AI đang tạo {plotType === "5sentence" ? "5 câu" : plotType === "1page" ? "1 trang" : "4 trang"}
                                            ...
                                        </span>
                                    </div>
                                ) : (
                                    <textarea readOnly value={outlineAIResult} placeholder="Nội dung gợi ý từ AI sẽ hiển thị ở đây..." className="custom-scroll h-full w-full resize-none border-none bg-transparent p-0 text-[14px] leading-7 text-slate-300 outline-none focus:ring-0" />
                                )}
                            </div>

                            <div className="flex shrink-0 items-center justify-between border-t border-white/5 bg-black/20 p-4">
                                <button onClick={() => setShowAISidebar(false)} className="text-xs text-slate-400 transition hover:text-white">
                                    Đóng bảng gợi ý
                                </button>

                                <button onClick={() => handleAISuggestByType(plotType)} disabled={isCurrentGeneratingAI} className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50">
                                    {isCurrentGeneratingAI ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    <span>{isCurrentGeneratingAI ? "Đang tạo..." : "Tạo lại tab này"}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MAIN EDITOR */}
                <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#131720] p-6">
                    <div className="mb-4 flex shrink-0 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-500/10">
                                <ScrollText size={20} className="text-violet-400" />
                            </div>

                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-bold text-white">
                                    {plotType === "5sentence" && "Tóm tắt cốt truyện 5 câu ngắn"}
                                    {plotType === "1page" && "Ý tưởng phân cảnh chi tiết trong 1 trang"}
                                    {plotType === "4pages" && "Đề cương phát triển khung sườn truyện 4 trang"}
                                </h2>

                                {/* 3 NÚT GỌI 3 API RIÊNG BIỆT */}
                                {!isDerivative && isEditing && (
                                    <>
                                        {plotType === "5sentence" && (
                                            <button onClick={() => handleAISuggestByType("5sentence")} disabled={isGenerating5Sentence} className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50">
                                                {isGenerating5Sentence ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                {isGenerating5Sentence ? "Đang tạo..." : "Yêu cầu AI (5 Câu)"}
                                            </button>
                                        )}

                                        {plotType === "1page" && (
                                            <button onClick={() => handleAISuggestByType("1page")} disabled={isGenerating1Page} className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50">
                                                {isGenerating1Page ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                {isGenerating1Page ? "Đang tạo..." : "Yêu cầu AI (1 Trang)"}
                                            </button>
                                        )}

                                        {plotType === "4pages" && (
                                            <button onClick={() => handleAISuggestByType("4pages")} disabled={isGenerating4Page} className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50">
                                                {isGenerating4Page ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                {isGenerating4Page ? "Đang tạo..." : "Yêu cầu AI (4 Trang)"}
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 px-2 text-sm font-medium text-slate-500">
                            <span>{wordCount} từ</span>
                            <span>{charCount} ký tự</span>
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-1 flex-col">
                        <div className="w-full flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A]">
                            {isEditing ? (
                                <textarea value={currentText} onChange={(e) => setCurrentContent(e.target.value)} placeholder={plotType === "5sentence" ? "Hãy viết tóm tắt cốt truyện trong 5 câu..." : plotType === "1page" ? "Hãy phát triển ý tưởng cốt truyện trong 1 trang..." : "Hãy phát triển đề cương khung sườn truyện trong 4 trang..."} className="custom-scroll h-full w-full resize-none bg-transparent p-6 text-[16px] leading-8 text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500" />
                            ) : (
                                <div className="custom-scroll h-full overflow-y-auto p-6">
                                    {currentText.trim() === "" ? (
                                        <div className="flex h-full items-center justify-center">
                                            <span className="italic text-slate-500">Phần đề cương này chưa được soạn thảo nội dung.</span>
                                        </div>
                                    ) : (
                                        <p className="whitespace-pre-wrap break-words text-[16px] leading-8 text-slate-200">{currentText}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
