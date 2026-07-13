import React, { useState } from "react";
import { Save, ScrollText, PenSquare } from "lucide-react";
import { useParams } from "react-router-dom";

export default function PlotList() {
    const { storyId } = useParams();

    // =====================================================
    // TAB
    // =====================================================
    const [isEditing, setIsEditing] = useState(false);
    const [plotType, setPlotType] = useState("5sentence");

    // =====================================================
    // CONTENT
    // =====================================================
    const [form, setForm] = useState({
        oneSentence: "",
        fiveSentence: "",
        onePage: "",
        fivePage: "",
    });

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // =====================================================
    // SAVE
    // =====================================================
    const handleSave = () => {
        console.log(form);
    };

    // =====================================================
    // CURRENT CONTENT
    // =====================================================
    const getCurrentContent = () => {
        switch (plotType) {
            case "5sentence":
                return form.fiveSentence;
            case "1page":
                return form.onePage;
            case "5page":
                return form.fivePage;
            default:
                return "";
        }
    };

    const setCurrentContent = (value) => {
        switch (plotType) {
            case "5sentence":
                handleChange("fiveSentence", value);
                break;
            case "1page":
                handleChange("onePage", value);
                break;
            case "5page":
                handleChange("fivePage", value);
                break;
            default:
                break;
        }
    };

    // =====================================================
    // WORD COUNT
    // =====================================================
    const currentText = getCurrentContent();
    const wordCount = currentText.trim() === "" ? 0 : currentText.trim().split(/\s+/).length;
    const charCount = currentText.length;

    return (
        <div className="flex h-full flex-col overflow-hidden bg-[#080d1a] text-[#dae2fd]">
            {/* Background */}
            <div className="absolute top-[-20%] left-[-20%] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-20%] pointer-events-none" />

            <div className="flex-1 min-h-0 overflow-y-auto px-8 pt-2 pb-6 flex flex-col justify-between">
                {/* CHẾ ĐỘ VIẾT */}
                <section className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-[#131720] p-2 shrink-0">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button onClick={() => setPlotType("5sentence")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${plotType === "5sentence" ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                            Tóm tắt
                        </button>

                        <button onClick={() => setPlotType("1page")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${plotType === "1page" ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                            Chi tiết
                        </button>

                        <button onClick={() => setPlotType("5page")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${plotType === "5page" ? "bg-blue-500 text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                            Outline
                        </button>
                    </div>

                    {/* Action */}
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold hover:bg-[#0460b3] transition whitespace-nowrap">
                            <PenSquare size={16} />
                            Sửa
                        </button>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5 transition whitespace-nowrap">
                                Hủy
                            </button>

                            <button
                                onClick={() => {
                                    handleSave();
                                    setIsEditing(false);
                                }}
                                className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold hover:bg-[#0460b3] transition whitespace-nowrap"
                            >
                                <Save size={16} />
                                Lưu
                            </button>
                        </div>
                    )}
                </section>

                {/* EDITOR */}
                <section className="flex flex-1 min-h-0 flex-col rounded-3xl border border-white/10 bg-[#131720] p-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                                <ScrollText size={20} className="text-violet-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Nội dung cốt truyện</h2>
                        </div>

                        {/* Counter (Đã xóa mt-4 làm lệch dòng) */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 px-2">
                            <span>{wordCount} từ</span>
                            <span>{charCount} ký tự</span>
                        </div>
                    </div>
                    {/* Content Area with Fixed Screen Fit & Dynamic Scroll */}
                    {/* Content Area */}
                    {isEditing ? (
                        <textarea
                            value={getCurrentContent()}
                            onChange={(e) => setCurrentContent(e.target.value)}
                            placeholder="Hãy nhập cốt truyện..."
                            className="
            flex-1
            min-h-0
            w-full
            rounded-2xl
            border
            border-white/10
            bg-[#0F172A]
            p-6
            resize-none
            outline-none
            text-[16px]
            leading-8
            text-slate-200
            placeholder:text-slate-500
            focus:border-blue-500
            transition
            overflow-y-auto
            overflow-x-hidden
            custom-scroll
        "
                        />
                    ) : (
                        <div
                            className="
            flex-1
            min-h-0
            w-full
            rounded-2xl
            border
            border-white/10
            bg-[#0F172A]
            p-6
            overflow-y-auto
            overflow-x-hidden
            custom-scroll
        "
                        >
                            {currentText.trim() === "" ? (
                                <div className="flex h-full items-center justify-center">
                                    <span className="italic text-slate-500">Chưa có nội dung.</span>
                                </div>
                            ) : (
                                <p
                                    className="
                    whitespace-pre-wrap
                    break-words
                    leading-8
                    text-[16px]
                    text-slate-200
                "
                                >
                                    {currentText}
                                </p>
                            )}
                        </div>
                    )}{" "}
                </section>
            </div>
        </div>
    );
}
