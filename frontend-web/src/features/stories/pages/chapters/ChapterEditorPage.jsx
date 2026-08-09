import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { PanelRight, CalendarDays, FileText, ChevronLeft, ChevronRight, Wand2, Save, Loader2, Sparkles, BookOpen, History, RotateCcw, X, PenLine, Check, Copy, Trash2 } from "lucide-react";
import RightSidebar from "../../components/RightSidebar";

// 🟢 Định nghĩa Base URL cho Localhost
const API_BASE_URL = "https://api.baostory.fun/api";

export default function ChapterEditorPage() {
    const { storyId, chapterNumber } = useParams();
    const navigate = useNavigate();

    // UI State
    const [isRightOpen, setIsRightOpen] = useState(false);
    const [showAISidebar, setShowAISidebar] = useState(true);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // CHAPTER DATA State
    const [chapter, setChapter] = useState(null);
    const [chapterTitle, setChapterTitle] = useState("Tiêu đề chương");
    const [updatedAt, setUpdatedAt] = useState("Vừa xong");
    const [autoSaveStatus, setAutoSaveStatus] = useState("Đồng bộ thời gian thực");

    // CONTENT State
    const [content, setContent] = useState("");
    const [outlineAIResult, setOutlineAIResult] = useState("");

    // 🌟 State phân biệt chế độ AI: true = Kiểm tra chính tả (có highlight), false = Gợi ý nội dung (văn bản thường)
    const [isSpellCheckMode, setIsSpellCheckMode] = useState(false);
    const [highlightedAIElements, setHighlightedAIElements] = useState([]);
    const [detectedErrorCount, setDetectedErrorCount] = useState(0);

    const [versionHistory, setVersionHistory] = useState([]);
    const [previewVersion, setPreviewVersion] = useState(null);
    const [restoredVersionId, setRestoredVersionId] = useState(null);

    // LOADING State
    const [loading, setLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [isAILoading, setIsAILoading] = useState(false);
    const [isPlotLoading, setIsPlotLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // REF CHO AUTOSAVE DEBOUNCE
    const autoSaveTimerRef = useRef(null);

    const wordCount = content.trim() ? content.trim().split(/\s+/).filter(Boolean).length : 0;

    // 🌟 Thuật toán Diff đếm đúng lỗi thay thế/sai từ (Không đếm nhầm do lệch vị trí)
    const buildHighlightedDiff = (original = "", polished = "") => {
        if (!original || !polished) {
            setHighlightedAIElements([<span key="default">{polished}</span>]);
            setDetectedErrorCount(0);
            return;
        }

        const origWords = original.trim().split(/\s+/);
        const newWords = polished.trim().split(/\s+/);

        // Chuyển tập hợp từ mới sang Set để tra cứu nhanh xem từ đó có tồn tại hay không
        const newWordsSet = new Set(newWords);

        const spans = [];
        let errorCount = 0;
        const maxLen = Math.max(newWords.length, origWords.length);

        for (let i = 0; i < maxLen; i++) {
            const origWord = i < origWords.length ? origWords[i] : "";
            const newWord = i < newWords.length ? newWords[i] : "";

            // Kiểm tra xem từ cũ có bị thay thế / viết sai không (nếu từ cũ tồn tại ở mảng mới nhưng khác vị trí hoặc bị đổi)
            const isReplacedOrWrong = origWord && !newWordsSet.has(origWord);

            if (isReplacedOrWrong) {
                errorCount++; // 🟢 Chỉ đếm khi thực sự là từ bị thay thế/sai
                spans.push(
                    <span
                        key={`del-${i}`}
                        style={{
                            color: "#ff5252",
                            textDecoration: "line-through",
                            backgroundColor: "rgba(255, 82, 82, 0.15)",
                            padding: "0 2px",
                            borderRadius: "3px",
                        }}
                    >
                        {origWord}
                    </span>
                );
                spans.push(<span key={`sp1-${i}`}> </span>);
            }

            if (newWord) {
                // Nếu là từ mới được thêm/sửa vào
                const isAddedOrChanged = !origWords.includes(newWord);

                spans.push(
                    <span
                        key={`ins-${i}`}
                        style={{
                            color: isAddedOrChanged ? "#69f0ae" : "rgba(255, 255, 255, 0.7)",
                            fontWeight: isAddedOrChanged ? "bold" : "normal",
                            backgroundColor: isAddedOrChanged ? "rgba(105, 240, 174, 0.15)" : "transparent",
                            padding: isAddedOrChanged ? "0 2px" : "0",
                            borderRadius: "3px",
                        }}
                    >
                        {newWord}
                    </span>
                );
            }

            if (i < maxLen - 1) {
                spans.push(<span key={`space-${i}`}> </span>);
            }
        }

        setHighlightedAIElements(spans.length === 0 ? [<span key="def">{polished}</span>] : spans);
        setDetectedErrorCount(errorCount);
    };

    // =========================================================================
    // 1. API: TẢI THÔNG TIN CHƯƠNG TỪ BACKEND
    // =========================================================================
    const loadChapter = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`${API_BASE_URL}/chapters/display-chapter/${storyId}/${chapterNumber}`, config);
            const data = res.data.data || {};

            setChapter(data);
            setChapterTitle(data.title || `Chương ${chapterNumber}`);
            setContent(data.content || "");

            if (data.updatedAt) {
                setUpdatedAt(formatShortTime(data.updatedAt));
            }
        } catch (err) {
            console.error("Lỗi khi tải thông tin chương:", err);
            toast.error(err.response?.data?.message || "Không thể tải dữ liệu chương.");
            setChapter(null);
            setChapterTitle(`Chương ${chapterNumber}`);
        } finally {
            setLoading(false);
        }
    };

    // =========================================================================
    // 2. API: LƯU THỦ CÔNG & TẠO PHIÊN BẢN SNAPSHOT LỊCH SỬ
    // =========================================================================
    const handleSaveContent = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                title: chapterTitle,
                content: content,
            };

            const res = await axios.put(`${API_BASE_URL}/chapters/edit/${storyId}/${chapterNumber}`, payload, config);

            if (res.data.success) {
                toast.success("Đã lưu nội dung chương thành công!");
                setAutoSaveStatus("Đã lưu thủ công");
                setUpdatedAt(formatShortTime(new Date()));
                setRestoredVersionId(null);
                if (isHistoryOpen) loadVersionHistory();
            }
        } catch (err) {
            console.error("Lỗi khi lưu chương:", err);
            toast.error(err.response?.data?.message || "Không thể lưu tác phẩm xuống cơ sở dữ liệu.");
        } finally {
            setIsSaving(false);
        }
    };

    const formatTime = (rawDate) => {
        const dt = rawDate ? new Date(rawDate) : new Date();
        if (isNaN(dt.getTime())) return "Vừa xong";

        const hours = String(dt.getHours()).padStart(2, "0");
        const minutes = String(dt.getMinutes()).padStart(2, "0");
        const seconds = String(dt.getSeconds()).padStart(2, "0");
        const day = String(dt.getDate()).padStart(2, "0");
        const month = String(dt.getMonth() + 1).padStart(2, "0");
        const year = dt.getFullYear();

        return `${hours}:${minutes}:${seconds} ${day}/${month}/${year}`;
    };

    const formatShortTime = (rawDate) => {
        const dt = rawDate ? new Date(rawDate) : new Date();
        if (isNaN(dt.getTime())) return "Vừa xong";

        const hours = String(dt.getHours()).padStart(2, "0");
        const minutes = String(dt.getMinutes()).padStart(2, "0");
        const seconds = String(dt.getSeconds()).padStart(2, "0");

        return `${hours}:${minutes}:${seconds}`;
    };

    // =========================================================================
    // 3. API: AUTOSAVE TỰ ĐỘNG NGẦM
    // =========================================================================
    const triggerAutoSave = async (contentToSave) => {
        try {
            setAutoSaveStatus("Đang lưu nháp...");
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.put(`${API_BASE_URL}/chapters/autosave/${storyId}/${chapterNumber}`, { content: contentToSave }, config);

            if (res.data.success) {
                let serverText = res.data.data?.savedAtText || "";

                if (serverText) {
                    serverText = serverText.replace(/\d{2}:\d{2}:\d{2}/, (match) => {
                        const [h, m, s] = match.split(":").map(Number);
                        const date = new Date();
                        date.setHours(h + 7, m, s);
                        return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
                    });
                }

                setAutoSaveStatus(serverText || "Đã lưu nháp tự động");

                const now = new Date();
                const hours = String(now.getHours()).padStart(2, "0");
                const minutes = String(now.getMinutes()).padStart(2, "0");
                const seconds = String(now.getSeconds()).padStart(2, "0");
                setUpdatedAt(`${hours}:${minutes}:${seconds}`);
            }
        } catch (err) {
            console.error("Lỗi lưu nháp ngầm:", err);
            setAutoSaveStatus("Lỗi đồng bộ nháp");
        }
    };

    useEffect(() => {
        if (loading || !content) return;

        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        autoSaveTimerRef.current = setTimeout(() => {
            triggerAutoSave(content);
        }, 2000);

        return () => {
            if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
        };
    }, [content]);

    // =========================================================================
    // 4. API: TẢI DANH SÁCH LỊCH SỬ PHIÊN BẢN TỪ DATABASE
    // =========================================================================
    const loadVersionHistory = async () => {
        try {
            setIsHistoryLoading(true);
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { storyId, chapterNumber },
            };

            const res = await axios.get(`${API_BASE_URL}/chapters/history`, config);
            const historyData = res.data.data || [];

            const formattedHistory = historyData.map((ver) => ({
                ...ver,
                createdAt: formatTime(ver.createdAt || ver.created_at),
            }));

            setVersionHistory(formattedHistory);

            if (formattedHistory.length > 0) {
                setPreviewVersion(formattedHistory[0]);
            } else {
                setPreviewVersion(null);
            }
        } catch (err) {
            console.error("Lỗi tải lịch sử phiên bản:", err);
            setVersionHistory([]);
            setPreviewVersion(null);
        } finally {
            setIsHistoryLoading(false);
        }
    };

    // =========================================================================
    // 5. KHÔI PHỤC PHIÊN BẢN
    // =========================================================================
    const handleRestoreVersion = async (ver) => {
        setContent(ver.content);
        setRestoredVersionId(ver.id);
        toast.success(`Đã khôi phục [${ver.versionName || ver.version_name}]!`);
        setIsHistoryOpen(false);

        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.put(`${API_BASE_URL}/chapters/restore/${storyId}/${chapterNumber}`, { content: ver.content }, config);
            setAutoSaveStatus("Đã khôi phục và đồng bộ");
            setUpdatedAt(formatShortTime(new Date()));
        } catch (err) {
            console.error("Lỗi gọi API khôi phục:", err);
            toast.error("Không thể đồng bộ bản khôi phục xuống cơ sở dữ liệu.");
        }
    };

    // =========================================================================
    // AI KIỂM TRA CHÍNH TẢ (Có bật chế độ Highlight Diff)
    // =========================================================================
    const handleAIEnhance = async () => {
        if (!storyId || !chapterNumber) return;

        try {
            setIsAILoading(true);
            setShowAISidebar(true);
            setIsSpellCheckMode(true); // 🟢 Bật cờ Highlight cho chính tả

            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                storyId: Number(storyId),
                chapterNumber: Number(chapterNumber),
            };

            const requestUrl = `${API_BASE_URL}/chapters/ai/${chapterNumber}/spell-check`;
            const response = await axios.post(requestUrl, payload, config);

            if (response.data && response.data.success === true) {
                let polishedContent = "";

                const extractContent = (json) => {
                    if (json && typeof json === "object") {
                        if (json.hasOwnProperty("content") && typeof json.content === "string" && json.content.trim() !== "") {
                            return json.content;
                        }
                        if (json.hasOwnProperty("polishedContent") && typeof json.polishedContent === "string") {
                            return json.polishedContent;
                        }
                        if (json.hasOwnProperty("data")) {
                            return extractContent(json.data);
                        }
                    } else if (typeof json === "string") {
                        return json;
                    }
                    return "";
                };

                polishedContent = extractContent(response.data);
                const finalResultText = polishedContent.trim() !== "" ? polishedContent.trim() : content;

                setOutlineAIResult(finalResultText);

                // Gọi hàm sinh Highlight so sánh
                buildHighlightedDiff(content, finalResultText);

                toast.success("Sửa chính tả thành công!");
            } else {
                toast.error(response.data?.message || "Không thể kiểm tra chính tả.");
            }
        } catch (error) {
            console.error("Lỗi AI kiểm tra chính tả:", error);
            toast.error("Không thể kết nối với hệ thống AI kiểm tra chính tả.");
        } finally {
            setIsAILoading(false);
        }
    };

    // =========================================================================
    // AI GỢI Ý NỘI DUNG CHƯƠNG (KHÔNG DÙNG HIGHLIGHT - HIỂN THỊ VĂN BẢN THƯỜNG)
    // =========================================================================
    const handlePlotSuggest = async () => {
        if (!storyId || !chapterNumber) return;

        try {
            setIsPlotLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            try {
                const planRes = await axios.get(`${API_BASE_URL}/chapterPlan/stories/${storyId}`, config);
                const planList = planRes.data?.success ? (Array.isArray(planRes.data.data) ? planRes.data.data : []) : [];
                const currentChapterPlan = planList.find((p) => Number(p.chapterNumber) === Number(chapterNumber));

                if (planList.length === 0 || !currentChapterPlan || (!currentChapterPlan.summary && !currentChapterPlan.purpose && !currentChapterPlan.conflict && !currentChapterPlan.endingHook)) {
                    toast.error(`Vui lòng bổ sung đầy đủ kế hoạch cho Chương ${chapterNumber} trước khi sử dụng tính năng gợi ý từ AI!`);
                    setIsPlotLoading(false);
                    return;
                }
            } catch (planErr) {
                console.error("Lỗi khi kiểm tra kế hoạch chương:", planErr);
            }

            setShowAISidebar(true);
            setIsSpellCheckMode(false); // 🟢 Tắt cờ Highlight, hiển thị văn bản bình thường

            const payload = {
                storyId: Number(storyId),
                chapterNumber: Number(chapterNumber),
                currentContent: content || "",
            };

            const response = await axios.post(`${API_BASE_URL}/chapters/ai/${chapterNumber}/plot-suggestion`, payload, config);

            if (response.data?.success === true) {
                const suggestionText = response.data?.data?.content;

                if (typeof suggestionText === "string" && suggestionText.trim()) {
                    const finalResultText = suggestionText.trim();
                    setOutlineAIResult(finalResultText);

                    toast.success("Gợi ý nội dung thành công!");
                } else {
                    toast.error("AI không trả về nội dung.");
                }
            } else {
                toast.error(response.data?.message || "Không thể tạo gợi ý nội dung.");
            }
        } catch (error) {
            console.error("❌ Lỗi gợi ý nội dung chương:", error);
            toast.error(error.response?.data?.message || "Không thể kết nối với hệ thống AI.");
        } finally {
            setIsPlotLoading(false);
        }
    };

    useEffect(() => {
        if (storyId && chapterNumber) {
            loadChapter();
        }
    }, [storyId, chapterNumber]);

    useEffect(() => {
        if (isHistoryOpen) {
            loadVersionHistory();
        }
    }, [isHistoryOpen]);

    if (loading) {
        return (
            <section className="h-screen flex items-center justify-center bg-[#0B1329]">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-blue-400" />
                    <span className="text-slate-400 text-sm">Đang tải không gian viết...</span>
                </div>
            </section>
        );
    }

    return (
        <section className="h-screen w-screen flex flex-col overflow-hidden bg-[#0A0F18] text-slate-100 antialiased relative">
            {/* 1. THANH ĐIỀU HƯỚNG CỐ ĐỊNH */}
            <header className="flex-none w-full border-b border-white/5 bg-[#10151E]/60 backdrop-blur-md px-6 py-3.5 select-none z-20">
                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 min-w-0">
                        <button onClick={() => navigate(`/stories/${storyId}/editor/overview`)} className="flex-none inline-flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all duration-200 active:scale-95" title="Quay lại">
                            <ChevronLeft size={20} />
                        </button>

                        <div className="min-w-0 w-[350px] sm:w-[480px] flex flex-row items-center gap-3">
                            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-widest whitespace-nowrap shrink-0">Chương {chapterNumber}</div>

                            <input type="text" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} placeholder="Nhập tên chương..." className="bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-blue-400 rounded-lg px-3 py-1.5 text-sm font-bold text-white outline-none transition flex-1 truncate shadow-inner placeholder-slate-400" title="Nhập trực tiếp để đổi tên chương" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 flex-none">
                        <button onClick={handleAIEnhance} disabled={isAILoading} className="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-md bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 border border-white/10 shadow-blue-500/10 disabled:opacity-50">
                            {isAILoading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>AI đang tối ưu...</span>
                                </>
                            ) : (
                                <>
                                    <Wand2 size={14} />
                                    <span>Kiểm tra chính tả</span>
                                </>
                            )}
                        </button>

                        <button onClick={handlePlotSuggest} disabled={isPlotLoading} className="px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-2 active:scale-95 shadow-md bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 border border-white/10 shadow-blue-500/10 disabled:opacity-50">
                            {isPlotLoading ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>AI đang viết gợi ý...</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={14} />
                                    <span>Gợi ý nội dung chương</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* 2. KHÔNG GIAN BỐ CỤC SOẠN THẢO CHÍNH */}
            <div className="flex-1 min-h-0 w-full flex bg-[#0D121F]/30 overflow-hidden p-6 gap-6 items-center relative">
                <div className="flex-none">
                    <button onClick={() => setShowAISidebar(!showAISidebar)} className="inline-flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all duration-200 active:scale-95">
                        {showAISidebar ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* CỘT TRÁI: KHUNG TRỢ LÝ AI */}
                <div className={`h-full flex flex-col min-h-0 transition-all duration-300 ease-in-out ${showAISidebar ? "w-[420px] opacity-100" : "w-0 opacity-0 pointer-events-none -mr-6"}`}>
                    <div className="flex-1 h-full rounded-3xl border border-white/5 bg-[#10151E]/60 shadow-xl overflow-y-auto custom-scroll flex flex-col">
                        <div className="flex items-center justify-between border-b border-white/5 px-6 py-4 select-none flex-none bg-blue-500/5">
                            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
                                <Sparkles size={14} />
                                <span>{isSpellCheckMode ? "Kết quả kiểm tra chính tả" : "Gợi ý nội dung từ trợ lý"}</span>
                            </div>

                            {outlineAIResult && (
                                <button
                                    onClick={() => {
                                        setContent(outlineAIResult);
                                        toast.success("Đã áp dụng nội dung từ AI vào chương!");
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/30 transition-all active:scale-95 shadow-sm"
                                    title="Chèn nội dung này vào khung soạn thảo"
                                >
                                    <Check size={13} />
                                    <span>Chấp nhận</span>
                                </button>
                            )}
                        </div>

                        {/* 🌟 CHỈ HIỂN THỊ THÔNG BÁO HIGHLIGHT KHI Ở CHẾ ĐỘ KIỂM TRA CHÍNH TẢ */}
                        {isSpellCheckMode && outlineAIResult && (
                            <div className={`mx-6 mt-4 px-3 py-2 rounded-lg border text-xs font-medium flex items-center gap-2 ${detectedErrorCount > 0 ? "bg-purple-500/10 border-purple-500/20 text-purple-300" : "bg-green-500/10 border-green-500/20 text-green-300"}`}>
                                {detectedErrorCount > 0 ? (
                                    <>
                                        <Sparkles size={14} /> Phát hiện {detectedErrorCount} điểm sửa đổi / lỗi chính tả.
                                    </>
                                ) : (
                                    <>
                                        <Check size={14} /> Tuyệt vời! Không phát hiện lỗi chính tả nào.
                                    </>
                                )}
                            </div>
                        )}

                        <div className="flex-1 px-6 py-4">
                            {/* 🌟 NẾU LÀ CHÍNH TẢ THÌ DÙNG HIGHLIGHT, NẾU LÀ GỢI Ý NỘI DUNG THÌ HIỆN TEXT THƯỜNG */}
                            {outlineAIResult ? isSpellCheckMode ? <div className="w-full min-h-full bg-transparent text-slate-200 text-[15px] leading-7 font-normal whitespace-pre-wrap selection:bg-blue-500/20">{highlightedAIElements}</div> : <textarea readOnly value={outlineAIResult} className="w-full min-h-full bg-transparent text-slate-300 text-[15px] leading-7 font-normal resize-none border-none focus:ring-0 p-0 focus:outline-none cursor-default selection:bg-blue-500/20" /> : <p className="text-slate-500 text-sm italic">Nội dung tối ưu từ AI sẽ hiển thị ở đây...</p>}
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: KHUNG SOẠN THẢO DUY NHẤT */}
                <div className="flex-1 h-full flex flex-col min-h-0 items-center justify-center">
                    <div className="w-full max-w-[1100px] h-full flex flex-col min-h-0 relative">
                        <div className="flex-1 h-full rounded-3xl border border-white/5 bg-[#10151E] shadow-2xl shadow-black/40 overflow-y-auto custom-scroll flex flex-col">
                            <div className="flex items-center justify-between border-b border-white/5 px-6 py-3 select-none flex-none">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <BookOpen size={14} className="text-slate-600" />
                                    <span>Nội dung tác phẩm</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button onClick={() => setIsHistoryOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all duration-200 active:scale-95 mr-1">
                                        <History size={14} />
                                        <span>Lịch sử phiên bản</span>
                                    </button>

                                    <button onClick={handleSaveContent} disabled={isSaving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/30 transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-md shadow-blue-500/10">
                                        {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        <span>Lưu thay đổi</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 px-8 md:px-10 py-6">
                                <textarea value={content} onChange={(e) => setContent(e.target.value)} disabled={isAILoading} placeholder="Bắt đầu gõ nội dung chương tại đây..." className={`w-full h-full bg-transparent text-slate-200 text-base leading-relaxed tracking-[0.01em] font-normal resize-none border-none focus:ring-0 p-0 placeholder-slate-700 focus:outline-none ${isAILoading ? "opacity-30 cursor-not-allowed" : ""}`} />
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 px-6 py-3 bg-black/20 select-none flex-none text-xs text-slate-400">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5">
                                        <FileText size={14} className="text-slate-500" />
                                        <b className="text-slate-300 font-semibold">{wordCount.toLocaleString()}</b> từ
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <CalendarDays size={13} />
                                    <span>Cập nhật: {updatedAt}</span>
                                    <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                                        <Sparkles size={10} /> {autoSaveStatus}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SIDEBAR/DRAWER LỊCH SỬ PHIÊN BẢN */}
                <div className={`absolute top-0 right-0 h-full bg-[#10151E] border-l border-white/10 shadow-2xl z-40 flex flex-col transition-all duration-300 ${isHistoryOpen ? "w-screen sm:w-full translate-x-0" : "w-0 translate-x-full overflow-hidden"}`}>
                    <div className="flex items-center justify-between px-6.5 py-4 border-b border-white/5 select-none bg-black/20 flex-none">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                            <History size={15} />
                            <span>Lịch sử phiên bản (Tối đa 10 bản)</span>
                        </div>
                        <button onClick={() => setIsHistoryOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden p-6 flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 flex flex-col gap-2 h-1/2 lg:h-full min-h-0 min-w-0">
                            <div className="text-xs font-bold text-amber-500/80 px-1 select-none uppercase tracking-wider flex-none">{previewVersion ? `Đang xem trước: ${previewVersion.versionName || previewVersion.version_name}` : "Bản xem trước nội dung"}</div>
                            {previewVersion ? <textarea readOnly value={previewVersion.content} className="flex-1 w-full p-5 bg-black/30 border border-white/5 rounded-2xl text-slate-300 text-base leading-relaxed resize-none focus:outline-none custom-scroll focus:border-amber-500/20 transition-all" /> : <div className="flex-1 w-full bg-black/10 border border-dashed border-white/5 rounded-2xl flex items-center justify-center text-sm text-slate-500 italic select-none">Chọn một phiên bản bên phải để xem trước nội dung chi tiết</div>}
                        </div>

                        <div className="w-full lg:w-[380px] flex-none flex flex-col gap-3 min-h-0 overflow-y-auto custom-scroll pr-1">
                            {isHistoryLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500 text-xs my-auto">
                                    <Loader2 size={24} className="animate-spin text-amber-500" />
                                    <span>Đang tìm phiên bản lưu...</span>
                                </div>
                            ) : versionHistory.length === 0 ? (
                                <div className="text-center py-12 text-sm text-slate-500 my-auto px-4">Chưa ghi nhận phiên bản nào. Bấm "Lưu thay đổi" để tạo mốc lịch sử.</div>
                            ) : (
                                versionHistory.map((ver) => {
                                    const isCurrentActive = restoredVersionId === ver.id;
                                    const isDraftItem = ver.id === "autosave-latest-draft";

                                    return (
                                        <div key={ver.id} onClick={() => setPreviewVersion(ver)} className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 group cursor-pointer relative overflow-hidden flex-none ${isCurrentActive ? "bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/5" : isDraftItem ? "bg-blue-600/10 border-blue-500/30 hover:border-blue-500/50" : previewVersion?.id === ver.id ? "bg-amber-500/5 border-amber-500/30" : "bg-white/5 border-white/5 hover:border-white/10"}`}>
                                            {isCurrentActive && (
                                                <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-md z-10">
                                                    <Check size={10} strokeWidth={3} />
                                                    <span>Đang sử dụng</span>
                                                </div>
                                            )}

                                            {isDraftItem && !isCurrentActive && <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-bl-lg">Autosave</div>}

                                            <div className="flex items-center justify-between gap-2 pr-14">
                                                <span className={`text-sm font-semibold transition-colors truncate flex-1 ${isCurrentActive ? "text-emerald-400" : isDraftItem ? "text-blue-400" : previewVersion?.id === ver.id ? "text-amber-400" : "text-slate-200 group-hover:text-amber-400"}`}>{ver.versionName || ver.version_name}</span>
                                            </div>

                                            <span className="text-[11px] text-slate-500">{ver.createdAt}</span>

                                            <div className="text-xs text-slate-400 line-clamp-2 bg-black/20 p-2.5 rounded-xl border border-white/5 font-normal italic leading-relaxed">"{ver.content}"</div>

                                            <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5 select-none">
                                                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                                    <FileText size={12} className="text-slate-600" />
                                                    {ver.wordCount || ver.word_count || 0} từ
                                                </span>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRestoreVersion(ver);
                                                    }}
                                                    disabled={isCurrentActive}
                                                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all active:scale-95 ${isCurrentActive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 cursor-default opacity-80" : isDraftItem ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/20" : "text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/20"}`}
                                                >
                                                    <RotateCcw size={12} />
                                                    <span>{isCurrentActive ? "Bản hiện tại" : "Khôi phục"}</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <RightSidebar isOpen={isRightOpen} setIsOpen={setIsRightOpen} />
        </section>
    );
}
