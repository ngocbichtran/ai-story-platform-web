import React, { useState, useEffect } from "react";
import { Save, ScrollText, PenSquare, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function PlotList() {
    const { storyId } = useParams();

    // =====================================================
    // UI CONTROL STATE
    // =====================================================
    const [isEditing, setIsEditing] = useState(false);
    const [plotType, setPlotType] = useState("5sentence"); // 5sentence | 1page | 5page
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // =====================================================
    // CONTENT FORM STATE (Đồng bộ chuẩn DB Mongo)
    // =====================================================
    const [form, setForm] = useState({
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

    // =====================================================
    // API: TẢI DỮ LIỆU KHUNG SƯỜN BAN ĐẦU
    // =====================================================
    const fetchOutlineData = async () => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.get(`https://api.baostory.fun/api/storyOutline/${storyId}/outline`, config);

            if (res.data.success && res.data.data) {
                const data = res.data.data;
                setForm({
                    fiveSentences: data.fiveSentences || "",
                    onePage: data.onePage || "",
                    fourPages: data.fourPages || "",
                });
            }
        } catch (err) {
            console.error("Lỗi tải khung sườn truyện:", err);
            toast.error(err.response?.data?.message || "Không thể tải dữ liệu đề cương tác phẩm.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (storyId) fetchOutlineData();
    }, [storyId]);

    // =====================================================
    // API: LƯU THAY ĐỔI VÀO MONGODB
    // =====================================================
    const handleSave = async () => {
        try {
            setIsSaving(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const res = await axios.put(`https://api.baostory.fun/api/storyOutline/${storyId}/outline`, form, config);

            if (res.data.success) {
                toast.success("Lưu đề cương khung sườn thành công!");
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Lỗi cập nhật khung sườn truyện:", err);
            toast.error(err.response?.data?.message || "Lưu thay đổi thất bại.");
        } finally {
            setIsSaving(false);
        }
    };

    // =====================================================
    // MAPPING CONTENT THEO TỪNG TAB GIAO DIỆN
    // =====================================================
    const getCurrentContent = () => {
        switch (plotType) {
            case "5sentence":
                return form.fiveSentences;
            case "1page":
                return form.onePage;
            case "5page":
                return form.fourPages;
            default:
                return "";
        }
    };

    const setCurrentContent = (value) => {
        switch (plotType) {
            case "5sentence":
                handleChange("fiveSentences", value);
                break;
            case "1page":
                handleChange("onePage", value);
                break;
            case "5page":
                handleChange("fourPages", value);
                break;
            default:
                break;
        }
    };

    // =====================================================
    // WORD COUNTER LOGIC
    // =====================================================
    const currentText = getCurrentContent();
    const wordCount = currentText.trim() === "" ? 0 : currentText.trim().split(/\s+/).length;
    const charCount = currentText.length;

    if (isLoading) {
        return (
            <div className="flex h-full flex-1 flex-col items-center justify-center bg-[#080d1a] text-slate-400">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
                <p className="text-sm">Đang đồng bộ tập hồ sơ đề cương tác phẩm...</p>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-1 flex-col overflow-hidden bg-[#080d1a] text-[#dae2fd]">
            <div className="flex-1 min-h-0 overflow-y-auto px-8 pt-2 pb-6 flex flex-col justify-between">
                {/* CHẾ ĐỘ BIÊN TẬP / HÀNH ĐỘNG */}
                <section className="mb-5 flex items-center justify-between rounded-2xl border border-white/10 bg-[#131720] p-2 shrink-0">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button onClick={() => setPlotType("5sentence")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${plotType === "5sentence" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                            Tóm tắt (5 Câu)
                        </button>

                        <button onClick={() => setPlotType("1page")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${plotType === "1page" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                            Chi tiết (1 Trang)
                        </button>

                        <button onClick={() => setPlotType("5page")} className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${plotType === "5page" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-white/5"}`}>
                            Outline (4 Trang)
                        </button>
                    </div>

                    {/* Action Buttons */}
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold hover:bg-[#0460b3] transition whitespace-nowrap active:scale-95">
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
                                disabled={isSaving}
                                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm hover:bg-white/5 transition whitespace-nowrap disabled:opacity-50"
                            >
                                Hủy
                            </button>

                            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 rounded-xl bg-[#0571d3] px-4 py-2.5 text-sm font-semibold hover:bg-[#0460b3] transition whitespace-nowrap active:scale-95 disabled:opacity-50">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSaving ? "Đang lưu..." : "Lưu"}
                            </button>
                        </div>
                    )}
                </section>

                {/* CANVAS EDITOR DISPLAY */}
                <section className="flex flex-1 min-h-0 flex-col rounded-3xl border border-white/10 bg-[#131720] p-6">
                    {/* Header Section */}
                    <div className="flex items-center justify-between mb-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-violet-500/10 flex items-center justify-center">
                                <ScrollText size={20} className="text-violet-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white">
                                {plotType === "5sentence" && "Tóm tắt cốt truyện 5 câu ngắn"}
                                {plotType === "1page" && "Ý tưởng phân cảnh chi tiết trong 1 trang"}
                                {plotType === "5page" && "Đề cương phát triển khung sườn truyện nâng cao"}
                            </h2>
                        </div>

                        {/* Thống kê đếm chữ */}
                        <div className="flex items-center gap-4 text-sm text-slate-500 px-2 font-medium">
                            <span>{wordCount} từ</span>
                            <span>{charCount} ký tự</span>
                        </div>
                    </div>

                    {/* Văn bản ghi nhận thay đổi */}
                    {isEditing ? (
                        <textarea value={getCurrentContent()} onChange={(e) => setCurrentContent(e.target.value)} placeholder="Hãy áp dụng phương pháp Snowflake để viết khung sườn cốt truyện tại đây..." className="flex-1 min-h-0 w-full rounded-2xl border border-white/10 bg-[#0F172A] p-6 resize-none outline-none text-[16px] leading-8 text-slate-200 placeholder:text-slate-500 focus:border-blue-500 transition overflow-y-auto overflow-x-hidden custom-scroll" />
                    ) : (
                        <div className="flex-1 min-h-0 w-full rounded-2xl border border-white/10 bg-[#0F172A] p-6 overflow-y-auto overflow-x-hidden custom-scroll">
                            {currentText.trim() === "" ? (
                                <div className="flex h-full items-center justify-center">
                                    <span className="italic text-slate-500">Bộ khung sườn phân đoạn này chưa được soạn thảo nội dung.</span>
                                </div>
                            ) : (
                                <p className="whitespace-pre-wrap break-words leading-8 text-[16px] text-slate-200">{currentText}</p>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
