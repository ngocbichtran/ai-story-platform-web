import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { ArrowLeft, BookOpen, CalendarDays, Clock3, Edit3, FileText, Loader2, Download } from "lucide-react";

export default function ChapterDetailPage() {
    const navigate = useNavigate();
    const { storyId, chapterNumber } = useParams();
    const [loading, setLoading] = useState(true);
    const [chapter, setChapter] = useState(null);
    const [chapterTitle, setChapterTitle] = useState("");
    const [displayContent, setDisplayContent] = useState("");

    // LOAD DATA
    const loadChapter = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`https://api.baostory.fun/api/chapters/display-chapter/${storyId}/${chapterNumber}`);
            const data = res.data.data || {};
            setChapter(data);
            setChapterTitle(data.title || "Chưa đặt tên");
            setDisplayContent(data.displayContent || data.content || "");
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải nội dung chương.");
            setChapter(null);
            setChapterTitle("");
            setDisplayContent("");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (storyId && chapterNumber) {
            loadChapter();
        }
    }, [storyId, chapterNumber]);

    const handleGoToEditor = () => {
        navigate(`/stories/${storyId}/editor/chapter/${chapterNumber}/edit`);
    };

    const handleExportWord = () => {
        if (!displayContent || !displayContent.trim()) {
            toast.error("Chương hiện tại đang trống, không thể xuất file!");
            return;
        }

        const cleanTitle = (chapterTitle || `chuong-${chapterNumber}`).replace(/[\/\\?%*:|"<>]/g, "").trim();

        const wordHtmlContent = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${chapterTitle}</title>
                <style>
                    body { font-family: 'Times New Roman', Times, serif; font-size: 14pt; line-height: 1.6; color: #000; margin: 20mm; }
                    h1 { text-align: center; font-size: 18pt; margin-bottom: 20px; }
                    p { text-align: justify; text-indent: 30px; margin-bottom: 10px; }
                </style>
            </head>
            <body>
                <h1>Chương ${chapterNumber}: ${chapterTitle}</h1>
                ${displayContent
                    .split("\n")
                    .map((para) => `<p>${para || "&nbsp;"}</p>`)
                    .join("")}
            </body>
            </html>
        `;

        const blob = new Blob(["\ufeff" + wordHtmlContent], { type: "application/msword" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${cleanTitle}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Đã xuất file Word thành công!");
    };

    const wordCount = useMemo(() => {
        if (!displayContent) return 0;
        return displayContent.trim().split(/\s+/).filter(Boolean).length;
    }, [displayContent]);

    const updatedAt = useMemo(() => {
        if (!chapter?.updatedAt) {
            return new Date().toLocaleDateString("vi-VN");
        }
        return new Date(chapter.updatedAt).toLocaleDateString("vi-VN");
    }, [chapter]);

    const status = useMemo(() => {
        if (chapter?.final || chapter?.finalContent)
            return {
                label: "Hoàn thiện",
                color: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
            };

        if (chapter?.draft)
            return {
                label: "Bản nháp",
                color: "bg-blue-500/10 text-blue-300 border-blue-500/20",
            };

        return {
            label: "Chưa có nội dung",
            color: "bg-slate-500/10 text-slate-300 border-slate-500/20",
        };
    }, [chapter]);

    // LOADING UI
    if (loading) {
        return (
            <section className="h-full flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={40} className="animate-spin text-blue-400" />
                    <span className="text-slate-400 text-sm">Đang tải nội dung chương...</span>
                </div>
            </section>
        );
    }

    return (
        <section className="h-full flex flex-col overflow-hidden border-l border-white/5 bg-black/10">
            <div className="flex-1 overflow-y-auto custom-scroll px-6 py-6">
                <div className="mx-auto flex h-full flex-col">
                    {/* HEADER */}
                    <div className="mb-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            {/* Khối thông tin bên trái */}
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                                    <span className="inline-block shrink-0 w-fit rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-400">Chương {chapterNumber}</span>
                                    <h1 className="text-xl font-black text-white md:text-2xl break-words line-clamp-1 hover:line-clamp-none transition-all">{chapterTitle}</h1>
                                </div>

                                {/* Metadata */}
                                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <CalendarDays size={16} className="text-slate-500" />
                                        <span>{updatedAt}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-slate-500" />
                                        <span>{wordCount.toLocaleString()} từ</span>
                                    </div>
                                </div>
                            </div>

                            {/* Cụm nút bấm bên phải: Xuất file Word & Chỉnh sửa */}
                            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                                {/* Nút Xuất file Word trực tiếp */}
                                <button onClick={handleExportWord} className="flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 px-4 py-2.5 text-sm font-bold text-slate-200 transition active:scale-95 flex-1 sm:flex-initial" title="Tải xuống file Word">
                                    <Download size={16} className="text-emerald-400" />
                                    <span>Xuất file Word</span>
                                </button>

                                {/* Nút Chỉnh sửa */}
                                <button onClick={handleGoToEditor} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/10 transition hover:from-blue-500 hover:to-violet-500 active:scale-95 flex-1 sm:flex-initial">
                                    <Edit3 size={16} />
                                    <span>Chỉnh sửa</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT CARD */}
                    <div className="flex-1 min-h-0 flex flex-col">
                        <div className="flex-1 rounded-3xl border border-white/10 bg-[#10151E] shadow-2xl shadow-black/20 overflow-hidden">
                            <div className="h-full overflow-hidden">
                                {displayContent ? (
                                    <div className="h-full overflow-y-auto custom-scroll px-5 py-4">
                                        <article className="whitespace-pre-wrap break-words text-[18px] leading-9 tracking-[0.01em] text-slate-200 font-normal">{displayContent}</article>
                                    </div>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center px-8">
                                        <div className="rounded-full bg-slate-800/50 p-6 border border-white/5">
                                            <FileText size={42} className="text-slate-500" />
                                        </div>

                                        <p className="mt-3 max-w-md text-center text-sm leading-7 text-slate-400">
                                            Chương này hiện chưa được viết.
                                            <br />
                                            Nhấn <span className="font-semibold text-blue-400">"Chỉnh sửa"</span> để bắt đầu sáng tác.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
