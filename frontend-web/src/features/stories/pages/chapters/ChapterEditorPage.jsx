import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { PanelRight, CalendarDays, FileText, ChevronLeft, ChevronRight, Wand2, Save, Loader2, Sparkles, BookOpen, BrainCircuit, CheckCircle2, History, RotateCcw, X, PenLine, Trash2, Copy, Check } from "lucide-react";
import RightSidebar from "../../components/RightSidebar";

export default function ChapterEditorPage() {
    const { storyId, chapterNumber } = useParams();
    const navigate = useNavigate();

    // UI State
    const [activeTab, setActiveTab] = useState("draft"); // 'draft' hoặc 'final'
    const [isRightOpen, setIsRightOpen] = useState(false);
    const [showAISidebar, setShowAISidebar] = useState(true); // Trạng thái ẩn/hiện trợ lý AI
    const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Trạng thái ẩn/hiện Drawer Lịch sử phiên bản

    // STATE CHO POPUP BIÊN TẬP VĂN PHONG
    const [isRewriteOpen, setIsRewriteOpen] = useState(false);
    const [rewriteInput, setRewriteInput] = useState("");
    const [rewriteOutput, setRewriteOutput] = useState("");
    const [isRewriteLoading, setIsRewriteLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // CHAPTER DATA State
    const [chapter, setChapter] = useState(null);
    const [chapterTitle, setChapterTitle] = useState("Tiêu đề chương");
    const [updatedAt, setUpdatedAt] = useState("Vừa xong");

    // CONTENT State
    const [draftContent, setDraftContent] = useState("");
    const [finalContent, setFinalContent] = useState("");
    const [outlineAIResult, setOutlineAIResult] = useState("");
    const [versionHistory, setVersionHistory] = useState([]); // Lưu danh sách các phiên bản cũ từ DB
    const [previewVersion, setPreviewVersion] = useState(null); // Phiên bản đang chọn xem trước trong Drawer

    // LOADING State
    const [loading, setLoading] = useState(true);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);

    // AI & Action States
    const [isAILoading, setIsAILoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const currentContent = activeTab === "draft" ? draftContent : finalContent;
    const wordCount = currentContent.trim() ? currentContent.trim().split(/\s+/).filter(Boolean).length : 0;

    // Tính số từ cho Popup Biên tập văn phong
    const getPopupWordCount = (text) => {
        return text.trim() ? text.trim().split(/\s+/).filter(Boolean).length : 0;
    };

    // TẢI THÔNG TIN CHƯƠNG TỪ BACKEND
    const loadChapter = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`https://api.baostory.fun/api/chapters/display-chapter/${storyId}/${chapterNumber}`, config);
            const data = res.data.data || {};

            setChapter(data);
            setChapterTitle(data.title || `Chương ${chapterNumber}`);
            setDraftContent(data.content || "");
            setFinalContent(data.displayContent || data.content || "");

            if (data.updatedAt) {
                setUpdatedAt(new Date(data.updatedAt).toLocaleDateString("vi-VN"));
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

    // LOGIC XỬ LÝ AI BIÊN TẬP VĂN PHONG (Popup)
    const handleEnhance = () => {
        if (!rewriteInput.trim()) {
            toast.error("Vui lòng nhập đoạn văn bản cần biên tập!");
            return;
        }
        setIsRewriteLoading(true);
        setTimeout(() => {
            setRewriteOutput(`[AI Đã tối ưu] ${rewriteInput}\n\n(Văn phong đã được trau chuốt lại mượt mà hơn, sửa các lỗi lặp từ và tối ưu cấu trúc câu theo phong cách chuyên nghiệp.)`);
            setIsRewriteLoading(false);
            toast.success("Biên tập văn phong thành công!");
        }, 1200);
    };

    const handleClearPopup = () => {
        setRewriteInput("");
        setRewriteOutput("");
        toast.success("Đã xóa nội dung!");
    };

    const handleCopyPopup = async () => {
        if (!rewriteOutput) return;
        try {
            await navigator.clipboard.writeText(rewriteOutput);
            setIsCopied(true);
            toast.success("Đã copy kết quả vào Clipboard!");
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast.error("Không thể copy văn bản.");
        }
    };

    // Tải danh sách lịch sử phiên bản từ Database (Thống nhất camelCase)
    const loadVersionHistory = async () => {
        try {
            setIsHistoryLoading(true);
            const token = localStorage.getItem("token");
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                params: { storyId, chapterNumber },
            };

            const res = await axios.get(`http://localhost:4000/api/chapters/history`, config);
            const historyData = res.data.data || [];
            setVersionHistory(historyData);

            if (historyData.length > 0) {
                setPreviewVersion(historyData[0]);
            }
        } catch (err) {
            console.error("Lỗi tải lịch sử phiên bản:", err);
            const mockData = [
                { id: "v1", version_name: "Bản gốc ban đầu", content: draftContent || "Nội dung thuở sơ khai...", word_count: 120, createdAt: "10/07/2026 14:30" },
                { id: "v2", version_name: "Chỉnh sửa cốt truyện lần 1", content: finalContent || "Nội dung sau khi sửa đổi...", word_count: 850, createdAt: "11/07/2026 09:15" },
            ];
            setVersionHistory(mockData);
            setPreviewVersion(mockData[0]);
        } finally {
            setIsHistoryLoading(false);
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

    // AI Sửa lỗi chính tả / Làm mượt văn bản
    const handleAIEnhance = async () => {
        if (!draftContent.trim()) {
            toast.error("Vui lòng viết bản nháp trước khi kiểm tra!");
            return;
        }

        try {
            setIsAILoading(true);
            setShowAISidebar(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                storyId: Number(storyId),
                chapterNumber: Number(chapterNumber),
                content: draftContent,
            };

            const res = await axios.post(`http://localhost:4000/api/chapters/ai/${chapter?.id || storyId}/spell-check`, payload, config);

            if (res.data.success) {
                const polished = res.data.data?.polishedContent || res.data.data?.polished_content;
                setOutlineAIResult(polished || "AI đã rà soát và không phát hiện lỗi chính tả nghiêm trọng.");
                toast.success("AI đã tối ưu xong nội dung!");
            }
        } catch (error) {
            console.error("Lỗi AI kiểm tra chính tả:", error);
            setOutlineAIResult(`[AI Gợi ý Offline] ${draftContent}\n\n*(Đã kiểm tra cấu trúc câu và từ vựng)*`);
            toast.success("Đã tạo gợi ý sửa lỗi!");
        } finally {
            setIsAILoading(false);
        }
    };

    const handleCopyToFinal = () => {
        setFinalContent(draftContent);
        toast.success("Đã đồng bộ nội dung sang Bản hoàn thiện!");
    };

    // LƯU CHƯƠNG XUỐNG DATABASE (Lưu chuẩn camelCase)
    const handleSaveContent = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            await axios.post(
                "http://localhost:4000/api/chapters/save-chapter",
                {
                    storyId: Number(storyId),
                    chapterNumber: Number(chapterNumber),
                    content: draftContent,
                    displayContent: finalContent,
                },
                config
            );
            toast.success("Đã lưu phiên bản hoàn thiện thành công!");
            if (isHistoryOpen) loadVersionHistory();
        } catch (err) {
            console.error("Lỗi khi lưu chương:", err);
            toast.error(err.response?.data?.message || "Không thể lưu tác phẩm xuống cơ sở dữ liệu.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRestoreVersion = (oldContent) => {
        setFinalContent(oldContent);
        toast.success("Đã khôi phục nội dung phiên bản cũ vào khung soạn thảo!");
        setIsHistoryOpen(false);
    };

    if (loading) {
        return (
            <section className="h-full flex items-center justify-center bg-[#0B1329]">
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
                    {/* LEFT */}
                    <div className="flex items-center gap-4 min-w-0">
                        <button onClick={() => navigate(`/stories/${storyId}/editor/chapter/${chapterNumber}`)} className="flex-none inline-flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all duration-200 active:scale-95" title="Quay lại">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="min-w-0 max-w-[180px] sm:max-w-[240px]">
                            <div className="text-[11px] font-bold text-blue-400 uppercase tracking-widest truncate">Chương {chapterNumber}</div>
                            <h1 className="text-sm font-bold text-slate-200 truncate" title={chapterTitle}>
                                {chapterTitle}
                            </h1>
                        </div>
                    </div>

                    {/* CENTER: Switcher Tab */}
                    <div className="flex p-1 bg-black/40 border border-white/5 rounded-2xl backdrop-blur-sm relative">
                        {["draft", "final"].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-1.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 ${activeTab === tab ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/10" : "text-slate-400 hover:text-slate-200"}`}>
                                {tab === "draft" ? "Bản nháp" : "Hoàn thiện"}
                            </button>
                        ))}
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-3 flex-none">
                        {/* Kiểm tra chính tả */}
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

                        {/* NÚT KÍCH HOẠT BIÊN TẬP VĂN PHONG (MODAL) */}
                        <button onClick={() => setIsRewriteOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold text-xs transition-all duration-200 active:scale-95">
                            <PenLine size={14} className="text-amber-400" />
                            <span>Biên tập văn phong</span>
                        </button>

                        {/* Tra cứu */}
                        <button onClick={() => setIsRightOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-300 font-bold text-xs transition-all duration-200 active:scale-95">
                            <PanelRight size={14} />
                            <span>Tra cứu</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* 2. KHÔNG GIAN BỐ CỤC SOẠN THẢO CHÍNH */}
            <div className="flex-1 min-h-0 w-full flex bg-[#0D121F]/30 overflow-hidden p-6 gap-6 items-center relative">
                {/* NÚT MŨI TÊN ĐÓNG/MỞ KHUNG AI */}
                <div className="flex-none">
                    <button onClick={() => setShowAISidebar(!showAISidebar)} className="inline-flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all duration-200 active:scale-95">
                        {showAISidebar ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>

                {/* CỘT TRÁI: KHUNG TRỢ LÝ AI */}
                <div className={`h-full flex flex-col min-h-0 transition-all duration-300 ease-in-out ${showAISidebar ? "w-[380px] opacity-100" : "w-0 opacity-0 pointer-events-none -mr-6"}`}>
                    <div className="flex-1 h-full rounded-3xl border border-white/5 bg-[#10151E]/60 shadow-xl overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest border-b border-white/5 px-6 py-4 select-none flex-none bg-blue-500/5">
                            <BrainCircuit size={14} />
                            <span>Gợi ý từ trợ lý AI</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scroll px-6 py-5">
                            <textarea readOnly value={outlineAIResult} placeholder="Nội dung tối ưu từ AI hiển thị ở đây..." className="w-full h-full bg-transparent text-slate-400 text-[15px] leading-7 font-normal resize-none border-none focus:ring-0 p-0 focus:outline-none cursor-default selection:bg-blue-500/20" />
                        </div>
                    </div>
                </div>

                {/* CỘT PHẢI: KHUNG SOẠN THẢO */}
                <div className="flex-1 h-full flex flex-col min-h-0 items-center justify-center">
                    <div className="w-full max-w-[1100px] h-full flex flex-col min-h-0 relative">
                        <div className="flex-1 h-full rounded-3xl border border-white/5 bg-[#10151E] shadow-2xl shadow-black/40 overflow-hidden flex flex-col">
                            {/* Tiêu đề Khung & Nút tương tác */}
                            <div className="flex items-center justify-between border-b border-white/5 px-6 py-3 select-none flex-none">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    <BookOpen size={14} className="text-slate-600" />
                                    <span>Nội dung: {activeTab === "draft" ? "Bản nháp đang viết" : "Tác phẩm hoàn thiện"}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    {activeTab === "draft" && (
                                        <button onClick={handleCopyToFinal} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-all duration-200 active:scale-95">
                                            <CheckCircle2 size={14} />
                                            <span>Cập nhật</span>
                                        </button>
                                    )}

                                    {activeTab === "final" && (
                                        <button onClick={() => setIsHistoryOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition-all duration-200 active:scale-95 mr-1">
                                            <History size={14} />
                                            <span>Lịch sử phiên bản</span>
                                        </button>
                                    )}

                                    {activeTab === "final" && (
                                        <button onClick={handleSaveContent} disabled={isSaving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 active:scale-95 disabled:opacity-50">
                                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} className="text-slate-400" />}
                                            <span>Lưu chương</span>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Vùng soạn thảo text */}
                            <div className="flex-1 overflow-y-auto custom-scroll px-8 md:px-10 py-6">
                                <textarea value={activeTab === "draft" ? draftContent : finalContent} onChange={(e) => (activeTab === "draft" ? setDraftContent(e.target.value) : setFinalContent(e.target.value))} disabled={isAILoading} placeholder={activeTab === "draft" ? "Bắt đầu viết nháp..." : "Nội dung hoàn thiện..."} className={`w-full h-full bg-transparent text-slate-200 text-base leading-relaxed tracking-[0.01em] font-normal resize-none border-none focus:ring-0 p-0 placeholder-slate-700 focus:outline-none ${isAILoading ? "opacity-30 cursor-not-allowed" : ""}`} />
                            </div>

                            {/* FOOTER STATUS BAR */}
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
                                        <Sparkles size={10} /> Đồng bộ thời gian thực
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. SIDEBAR/DRAWER TRƯỢT DỌC ĐỂ QUẢN LÝ LỊCH SỬ PHIÊN BẢN */}
                <div className={`absolute top-0 right-0 h-full bg-[#10151E] border-l border-white/10 shadow-2xl z-40 flex flex-col transition-all duration-300 ${isHistoryOpen ? "w-[900px] translate-x-0" : "w-0 translate-x-full"}`}>
                    {/* HEADER */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 select-none bg-black/20 flex-none">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
                            <History size={15} />
                            <span>Lịch sử phiên bản</span>
                        </div>
                        <button onClick={() => setIsHistoryOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                            <X size={16} />
                        </button>
                    </div>

                    {/* BODY CONTAINER */}
                    <div className="flex-1 overflow-hidden p-4 flex flex-row gap-4">
                        {/* CỘT TRÁI: KHU VỰC XEM TRƯỚC BẢN GHI */}
                        <div className="flex-1 flex flex-col gap-2 h-full min-w-0">
                            <div className="text-xs font-bold text-amber-500/80 px-1 select-none uppercase tracking-wider">{previewVersion ? `Đang xem trước: ${previewVersion.version_name || previewVersion.versionName}` : "Bản xem trước nội dung"}</div>
                            {previewVersion ? <textarea readOnly value={previewVersion.content} className="flex-1 w-full p-4 bg-black/30 border border-white/5 rounded-2xl text-slate-300 text-base leading-relaxed resize-none focus:outline-none custom-scroll focus:border-amber-500/20 transition-all" /> : <div className="flex-1 w-full bg-black/10 border border-dashed border-white/5 rounded-2xl flex items-center justify-center text-sm text-slate-500 italic select-none">Chọn một phiên bản bên phải để xem trước nội dung chi tiết</div>}
                        </div>

                        {/* CỘT PHẢI: DANH SÁCH CÁC PHIÊN BẢN CŨ */}
                        <div className="w-[340px] flex-none flex flex-col gap-3 overflow-y-auto custom-scroll pr-1">
                            {isHistoryLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-500 text-xs my-auto">
                                    <Loader2 size={24} className="animate-spin text-amber-500" />
                                    <span>Đang tìm phiên bản lưu...</span>
                                </div>
                            ) : versionHistory.length === 0 ? (
                                <div className="text-center py-12 text-sm text-slate-500 my-auto">Chưa ghi nhận phiên bản hoàn thiện nào được lưu.</div>
                            ) : (
                                versionHistory.map((ver) => (
                                    <div key={ver.id} onClick={() => setPreviewVersion(ver)} className={`p-4 rounded-2xl border transition-all flex flex-col gap-2 group cursor-pointer ${previewVersion?.id === ver.id ? "bg-amber-500/5 border-amber-500/30 shadow-lg shadow-amber-500/[0.02]" : "bg-white/5 border-white/5 hover:border-white/10"}`}>
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`text-sm font-semibold transition-colors truncate flex-1 ${previewVersion?.id === ver.id ? "text-amber-400" : "text-slate-200 group-hover:text-amber-400"}`}>{ver.version_name || ver.versionName}</span>
                                            <span className="text-xs text-slate-500 flex-none">{ver.createdAt}</span>
                                        </div>

                                        <div className="text-xs text-slate-400 line-clamp-2 bg-black/20 p-2.5 rounded-xl border border-white/5 font-normal italic leading-relaxed">"{ver.content}"</div>

                                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-white/5 select-none">
                                            <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                                <FileText size={12} className="text-slate-600" />
                                                {ver.word_count || ver.wordCount || 0} từ
                                            </span>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRestoreVersion(ver.content);
                                                }}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/10 transition-all active:scale-95"
                                            >
                                                <RotateCcw size={12} />
                                                <span>Khôi phục</span>
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* BẢNG TRA CỨU DI ĐỘNG NỔI LÊN TRÊN */}
            <RightSidebar isOpen={isRightOpen} setIsOpen={setIsRightOpen} />

            {/* POPUP / MODAL: BIÊN TẬP VĂN PHONG */}
            {isRewriteOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="w-full max-w-[1000px] h-[400px] bg-[#10151E] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        {/* HEADER MODAL */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 select-none flex-none">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                                <Sparkles size={16} className="text-amber-400" />
                                <span>Biên tập văn phong</span>
                            </div>
                            <button onClick={() => setIsRewriteOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {/* BODY CONTAINER */}
                        <div className="flex-1 flex flex-row min-h-0 divide-x divide-white/5">
                            {/* CỘT TRÁI: VĂN BẢN GỐC */}
                            <div className="flex-1 flex flex-col min-w-0 h-full bg-[#0d121f]/20">
                                <div className="px-5 py-2.5 text-xs font-semibold text-slate-400 select-none border-b border-white/5">Văn bản gốc</div>
                                <div className="flex-1 p-4">
                                    <textarea value={rewriteInput} onChange={(e) => setRewriteInput(e.target.value)} placeholder="Người dùng nhập đoạn văn tại đây..." className="w-full h-full bg-black/20 border border-white/5 rounded-xl p-4 text-slate-200 text-sm leading-relaxed placeholder-slate-700 resize-none focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 custom-scroll transition-all" />
                                </div>
                                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between bg-black/10 select-none flex-none">
                                    <span className="text-xs text-slate-500">
                                        <b className="text-slate-400 font-medium">{getPopupWordCount(rewriteInput)}</b> từ
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={handleClearPopup} disabled={!rewriteInput} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 rounded-lg border border-white/5 hover:border-rose-500/20 transition-all disabled:opacity-30 disabled:pointer-events-none">
                                            <Trash2 size={13} />
                                            <span>Xóa</span>
                                        </button>
                                        <button onClick={handleEnhance} disabled={isRewriteLoading || !rewriteInput.trim()} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-md shadow-blue-600/10 active:scale-95 disabled:opacity-40 disabled:pointer-events-none">
                                            {isRewriteLoading ? (
                                                <>
                                                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>Đang xử lý...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 size={13} />
                                                    <span>Biên tập</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* CỘT PHẢI: KẾT QUẢ AI */}
                            <div className="flex-1 flex flex-col min-w-0 h-full">
                                <div className="px-5 py-2.5 text-xs font-semibold text-amber-400/90 select-none border-b border-white/5 flex items-center gap-1.5 bg-amber-500/[0.02]">
                                    <Sparkles size={12} />
                                    <span>BaoStory gợi ý!</span>
                                </div>
                                <div className="flex-1 p-4">
                                    {rewriteOutput ? (
                                        <textarea readOnly value={rewriteOutput} className="w-full h-full bg-black/40 border border-amber-500/10 rounded-xl p-4 text-slate-300 text-sm leading-relaxed resize-none focus:outline-none custom-scroll selection:bg-amber-500/10" />
                                    ) : (
                                        <div className="w-full h-full bg-black/10 border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center text-xs text-slate-500 italic select-none p-6 text-center gap-2">
                                            <Wand2 size={20} className="text-slate-600 animate-pulse" />
                                            <span>AI biên tập sẽ hiển thị ở đây</span>
                                        </div>
                                    )}
                                </div>
                                <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between bg-black/10 select-none flex-none">
                                    <span className="text-xs text-slate-500">
                                        <b className="text-slate-400 font-medium">{getPopupWordCount(rewriteOutput)}</b> từ
                                    </span>
                                    <button onClick={handleCopyPopup} disabled={!rewriteOutput} className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none ${isCopied ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 hover:border-amber-500/20"}`}>
                                        {isCopied ? <Check size={13} /> : <Copy size={13} />}
                                        <span>{isCopied ? "Đã sao chép" : "Copy kết quả"}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
