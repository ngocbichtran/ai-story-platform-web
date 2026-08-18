import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight, RotateCcw, ChevronLeft, Check, BookOpen, User } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import CustomModal from "../../../styles/CustomModal";

export default function DerivativeStoryPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(20);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [newStoryTitle, setNewStoryTitle] = useState("");
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [selectedStory, setSelectedStory] = useState("");

    const [sourceChapters, setSourceChapters] = useState([]);
    const [selectedChapterNumbers, setSelectedChapterNumbers] = useState([]);
    const [isFetchingChapters, setIsFetchingChapters] = useState(false);

    const [selectedCharacter, setSelectedCharacter] = useState("");
    const [storiesList, setStoriesList] = useState([]);
    const [isFetchingStories, setIsFetchingStories] = useState(false);
    const [charactersList, setCharactersList] = useState([]);
    const [isFetchingCharacters, setIsFetchingCharacters] = useState(false);
    const [derivativeCharacters, setDerivativeCharacters] = useState([]);
    const [aiResult, setAiResult] = useState(null);
    const [aiPlansResult, setAiPlansResult] = useState(null);
    const [plans, setPlans] = useState([
        { chapterNumber: 1, title: "Chương 1", summary: "Chưa có nội dung...", purpose: "", conflict: "", endingHook: "" },
        { chapterNumber: 2, title: "Chương 2", summary: "Chưa có nội dung...", purpose: "", conflict: "", endingHook: "" },
        { chapterNumber: 3, title: "Chương 3", summary: "Chưa có nội dung...", purpose: "", conflict: "", endingHook: "" },
        { chapterNumber: 4, title: "Chương 4", summary: "Chưa có nội dung...", purpose: "", conflict: "", endingHook: "" },
        { chapterNumber: 5, title: "Chương 5", summary: "Chưa có nội dung...", purpose: "", conflict: "", endingHook: "" },
    ]);
    const [fullCharacterData, setFullCharacterData] = useState({});
    const [charEditForm, setCharEditForm] = useState({
        name: "",
        role: "",
        appearance: "",
        personality: "",
        ability: "",
        goal: "",
        development: "",
        background: "",
    });
    const [activeStoryDetail, setActiveStoryDetail] = useState(null);
    const [storyOutline, setStoryOutline] = useState(null);

    useEffect(() => {
        const fetchStories = async () => {
            setIsFetchingStories(true);
            try {
                const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
                const response = await axios.get("https://api.baostory.fun/api/stories/list", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const allStories = response.data?.data || response.data || [];
                const validStories = allStories.filter((s) => s.chapter_count && s.chapter_count > 0);
                setStoriesList(validStories);
            } catch (err) {
                toast.error("Không thể tải danh sách truyện.");
            } finally {
                setIsFetchingStories(false);
            }
        };
        fetchStories();
    }, []);

    useEffect(() => {
        if (!selectedStory) {
            setActiveStoryDetail(null);
            setStoryOutline(null);
            setCharactersList([]);
            setSelectedCharacter("");
            setSourceChapters([]);
            setSelectedChapterNumbers([]);
            return;
        }

        const fetchStoryData = async () => {
            setIsFetchingCharacters(true);
            setIsFetchingChapters(true);
            const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
            const headers = { Authorization: `Bearer ${token}` };

            try {
                const chaptersRes = await axios.get(`https://api.baostory.fun/api/chapters/${selectedStory}/chapters`, { headers });
                const chList = chaptersRes.data?.data || chaptersRes.data || [];

                if (!chList || chList.length === 0) {
                    toast.error("Truyện này không có chương, không thể tạo phái sinh!");
                    setSelectedStory("");
                    setIsFetchingCharacters(false);
                    setIsFetchingChapters(false);
                    return;
                }

                const [detailRes, outlineRes, charRes] = await Promise.all([axios.get(`https://api.baostory.fun/api/stories/${selectedStory}`, { headers }).catch(() => ({})), axios.get(`https://api.baostory.fun/api/storyOutline/${selectedStory}/outline`, { headers }).catch(() => ({})), axios.get(`https://api.baostory.fun/api/characters/${selectedStory}/list`, { headers }).catch(() => ({}))]);

                setActiveStoryDetail(detailRes.data?.data || null);
                setStoryOutline(outlineRes.data?.data || null);
                setCharactersList(charRes.data?.data || []);

                chList.sort((a, b) => (a.chapterNumber || 0) - (b.chapterNumber || 0));
                setSourceChapters(chList);
                setSelectedChapterNumbers(chList.map((ch) => ch.chapterNumber));
            } catch (err) {
                console.error("Lỗi:", err);
                toast.error("Đã xảy ra lỗi khi kiểm tra truyện.");
                setSelectedStory("");
            } finally {
                setIsFetchingCharacters(false);
                setIsFetchingChapters(false);
            }
        };

        fetchStoryData();
    }, [selectedStory]);

    useEffect(() => {
        if (!selectedCharacter) {
            setFullCharacterData({});
            setCharEditForm({ name: "", role: "", appearance: "", personality: "", ability: "", goal: "", development: "", background: "" });
            setAiResult(null);
            return;
        }
        const activeChar = charactersList.find((c) => String(c._id || c.id) === String(selectedCharacter));
        if (activeChar) {
            setFullCharacterData(activeChar);
            setCharEditForm({
                name: activeChar.name || "",
                role: activeChar.role || "",
                appearance: activeChar.appearance || "",
                personality: activeChar.personality || "",
                ability: activeChar.ability || "",
                goal: activeChar.goal || "",
                development: activeChar.development || "",
                background: activeChar.background || "",
            });
            setAiResult(null);
        }
    }, [selectedCharacter, charactersList]);

    useEffect(() => {
        let timer;
        if (isLoading && countdown > 0) {
            timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
        } else if (countdown === 0) {
            clearInterval(timer);
        }
        return () => clearInterval(timer);
    }, [isLoading, countdown]);

    const handleNextStep = () => {
        if (step === 1 && !selectedStory) return toast.error("Vui lòng chọn truyện gốc!");
        if (step === 1 && selectedChapterNumbers.length === 0) return toast.error("Vui lòng chọn ít nhất một chương nguồn làm đầu vào!");
        if (step === 1 && !newStoryTitle.trim()) return toast.error("Vui lòng nhập tên truyện phái sinh!");
        if (step === 2 && derivativeCharacters.length === 0) return toast.error("Vui lòng thêm ít nhất 1 nhân vật vào danh sách tạm!");

        if (step < 3) {
            setStep(step + 1);
            toast.success(`Đã sang Bước ${step + 1}!`);
        } else {
            handleCreateDerivativeStory();
        }
    };

    const formatObjToString = (obj) => {
        if (!obj) return "";
        if (typeof obj === "string") return obj;
        if (typeof obj === "object") {
            return Object.entries(obj)
                .map(([k, v]) => `${k}: ${v}`)
                .join("\n");
        }
        return String(obj);
    };

    const handleRetryStep = async () => {
        if (step === 2) {
            if (!selectedCharacter) return toast.error("Vui lòng chọn nhân vật gốc trước khi chạy AI!");
            setIsLoading(true);
            setCountdown(20);
            try {
                const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";
                const res = await axios.post(`https://api.baostory.fun/api/characters/${selectedCharacter}/transform`, { storyId: selectedStory }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } });
                let rawData = res.data?.data?.data || res.data?.data || res.data;
                if (Array.isArray(rawData)) {
                    rawData = rawData[0] || {};
                }
                if (rawData && Object.keys(rawData).length > 0) {
                    const normalizedAiData = {
                        name: rawData.name || "",
                        role: rawData.role || "",
                        appearance: formatObjToString(rawData.appearance),
                        personality: formatObjToString(rawData.personality),
                        background: formatObjToString(rawData.background),
                        goal: formatObjToString(rawData.goal),
                        ability: formatObjToString(rawData.ability),
                        development: formatObjToString(rawData.development),
                    };
                    setAiResult(normalizedAiData);
                    toast.success("Hệ thống n8n đã tạo gợi ý nhân vật thành công! Bấm 'Chấp nhận' để đưa sang khung bên phải.");
                } else {
                    toast.warning("Dữ liệu n8n trả về trống.");
                }
            } catch (err) {
                console.error("Lỗi khi gọi n8n:", err);
                toast.error("Không thể kết nối tới hệ thống xử lý n8n.");
            } finally {
                setIsLoading(false);
                setCountdown(20);
            }
        } else if (step === 3) {
            handleSuggestChapterPlans();
        }
    };

    const handleSuggestChapterPlans = async () => {
        if (!selectedStory) return toast.error("Thiếu thông tin bộ truyện!");
        if (!selectedChapterNumbers || selectedChapterNumbers.length === 0) {
            return toast.error("Vui lòng chọn ít nhất một chương ở bước 1 làm đầu vào!");
        }
        if (!derivativeCharacters || derivativeCharacters.length === 0) {
            return toast.error("Vui lòng lưu ít nhất một nhân vật phái sinh ở bước 2!");
        }

        setIsLoading(true);
        setCountdown(20);
        try {
            const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || "";

            const res = await axios.post(
                `https://api.baostory.fun/api/chapterPlan/suggest`,
                {
                    storyId: selectedStory,
                    chapterNumber: selectedChapterNumbers,
                    characters: derivativeCharacters,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            let rawData = res.data?.data?.data || res.data?.data || res.data;
            if (Array.isArray(rawData) && rawData.length > 0 && Array.isArray(rawData[0])) {
                rawData = rawData[0];
            }
            const chaptersArray = rawData?.chapterPlans || (Array.isArray(rawData) ? rawData : null);
            if (chaptersArray && chaptersArray.length > 0) {
                setAiPlansResult(chaptersArray);
                toast.success("Hệ thống n8n đã gợi ý kế hoạch chương thành công!");
            } else {
                toast.error("Dữ liệu trả về từ n8n không đúng định dạng.");
            }
        } catch (err) {
            console.error("Lỗi gọi n8n kế hoạch chương:", err);
            toast.error("Hết token hoặc lỗi kết nối!");
        } finally {
            setIsLoading(false);
            setCountdown(20);
        }
    };

    const handleAcceptAiResult = async () => {
        if (step === 2) {
            if (!aiResult) {
                toast.error("Chưa có dữ liệu gợi ý từ AI để chấp nhận!");
                return;
            }
            setCharEditForm({
                name: aiResult.name || charEditForm.name,
                role: aiResult.role || charEditForm.role,
                appearance: aiResult.appearance || "",
                personality: aiResult.personality || "",
                background: aiResult.background || "",
                goal: aiResult.goal || "",
                ability: aiResult.ability || "",
                development: aiResult.development || "",
            });
            toast.success("Đã áp dụng kết quả AI sang cột chỉnh sửa bên phải!");
        } else if (step === 3) {
            if (!aiPlansResult || aiPlansResult.length === 0) {
                toast.error("Chưa có dữ liệu kế hoạch gợi ý từ AI!");
                return;
            }
            const newPlans = aiPlansResult.map((item, idx) => {
                return {
                    chapterNumber: item.chapterNumber || idx + 1,
                    title: item.title || `Chương ${idx + 1}`,
                    summary: item.summary || item.background || "",
                    purpose: item.purpose || "",
                    conflict: item.conflict || "",
                    endingHook: item.endingHook || "",
                };
            });
            setPlans(newPlans);
            toast.success("Đã đồng bộ kết quả AI vào cột chỉnh sửa kế hoạch bên phải!");
        }

        setShowAcceptModal(false);
    };

    const handleCreateDerivativeStory = async () => {
        if (!newStoryTitle.trim()) {
            return toast.error("Vui lòng nhập tên truyện phái sinh ở Bước 1!");
        }
        if (selectedChapterNumbers.length === 0) {
            return toast.error("Vui lòng chọn ít nhất một chương nguồn ở Bước 1!");
        }
        if (derivativeCharacters.length === 0) {
            return toast.error("Bạn chưa lưu nhân vật nào vào danh sách tạm ở Bước 2!");
        }
        setIsLoading(true);
        toast.loading("Đang khởi tạo truyện phái sinh, nhân vật và kế hoạch chương...");
        try {
            const token = localStorage.getItem("accessToken") || localStorage.getItem("token") || localStorage.getItem("user_token") || "";
            if (!token) {
                toast.dismiss();
                toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
                setIsLoading(false);
                return;
            }
            const payload = {
                title: newStoryTitle.trim(),
                originalStoryId: Number(selectedStory),
                sourceChapterNumbers: selectedChapterNumbers,
                characters: derivativeCharacters,
                chapterPlans: plans,
            };

            await axios.post("https://api.baostory.fun/api/derivativeStory/derivative", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            toast.dismiss();
            toast.success("Tạo truyện phái sinh và lưu toàn bộ dữ liệu thành công!");
            navigate("/stories");
        } catch (err) {
            toast.dismiss();
            console.error("Lỗi tạo truyện phái sinh:", err.response?.data || err.message);
            toast.error(err.response?.data?.message || "Lỗi hệ thống khi tạo truyện phái sinh.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCharacterProfile = () => {
        if (!charEditForm.name.trim()) {
            return toast.error("Vui lòng nhập tên nhân vật!");
        }
        const characterPayload = {
            ...fullCharacterData,
            ...charEditForm,
            tempId: selectedCharacter || Date.now(),
        };
        setDerivativeCharacters((prev) => {
            const index = prev.findIndex((c) => c.tempId === characterPayload.tempId);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = characterPayload;
                return updated;
            }
            return [...prev, characterPayload];
        });
        toast.success(`Đã thêm nhân vật "${charEditForm.name}" vào danh sách tạm!`);
    };

    const displayPlans = aiPlansResult || plans;

    return (
        <div className="h-screen w-screen bg-[#0A0F18] text-slate-100 flex flex-col overflow-hidden antialiased relative">
            <header className="flex-none w-full border-b border-white/5 bg-[#10151E]/60 backdrop-blur-md px-8 py-3.5 flex items-center justify-between select-none z-20">
                <button onClick={() => setShowCancelModal(true)} className="text-xs text-red-400 hover:text-red-300 underline transition font-medium">
                    Hủy quá trình
                </button>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                    {step === 1 && "Bước 1: Chọn truyện gốc, chương nguồn & Đặt tên"}
                    {step === 2 && "Bước 2: Chọn nhân vật & Biến đổi"}
                    {step === 3 && "Bước 3: Kế hoạch chương (5 kế hoạch)"}
                </h2>
                <div />
            </header>
            <div className="flex-none w-full bg-white/5 h-1.5 flex z-20">
                <div className="bg-gradient-to-r from-blue-600 to-violet-600 transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
            </div>
            <main className="flex-1 min-h-0 w-full flex bg-[#0D121F]/30 p-6 items-center justify-center relative overflow-hidden">
                <div className="w-full max-w-[1300px] h-full max-h-[950px] bg-[#10151E] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex-1 min-h-0 flex flex-col justify-center p-6">
                        {step === 1 && (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch h-full max-w-7xl mx-auto w-full">
                                <div className="md:col-span-4 rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-4 flex flex-col min-h-[350px]">
                                    <div className="text-[10px] uppercase font-black tracking-widest text-[#8b919e] mb-2.5 flex-none flex justify-between items-center">
                                        <span className="flex items-center gap-2">
                                            <BookOpen size={14} className="text-blue-400" />
                                            <span>Chọn tác phẩm gốc</span>
                                        </span>
                                        <span className="text-slate-500 normal-case font-medium">{storiesList.length} tác phẩm</span>
                                    </div>
                                    <div className="w-full flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scroll min-h-0">
                                        {isFetchingStories ? (
                                            <div className="text-xs text-slate-500 text-center py-6 italic">Đang tải danh sách truyện...</div>
                                        ) : storiesList.length === 0 ? (
                                            <div className="text-xs text-slate-500 text-center py-6 italic border border-dashed border-white/5 rounded-xl bg-slate-950/10">Chưa có tác phẩm gốc nào có chương.</div>
                                        ) : (
                                            storiesList.map((s) => {
                                                const isCurrentActive = String(selectedStory) === String(s.id);
                                                return (
                                                    <button key={s.id} onClick={() => setSelectedStory(s.id)} className={`w-full text-left px-3 py-2.5 rounded-xl text-xs md:text-sm transition-all duration-200 flex items-center gap-2 border ${isCurrentActive ? "bg-[#1d2433] text-[#a7c8ff] font-bold border-blue-500/30 shadow-sm" : "text-[#c1c6d5] border-transparent hover:bg-[#181d29] hover:text-white"}`}>
                                                        <span className={`w-2 h-2 rounded-full shrink-0 transition-all ${isCurrentActive ? "bg-blue-400 scale-110" : "bg-slate-600"}`} />
                                                        <span className="block truncate flex-1">{s.title || s.name}</span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-8 rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-6 flex flex-col justify-between relative overflow-hidden min-h-[350px]">
                                    <div className="space-y-4 overflow-y-auto custom-scroll pr-1">
                                        {activeStoryDetail ? (
                                            <div className="flex flex-col gap-4 relative z-10">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                                                            Chọn chương nguồn đầu vào ({selectedChapterNumbers.length}/{sourceChapters.length} đã chọn)
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    if (selectedChapterNumbers.length === sourceChapters.length) {
                                                                        setSelectedChapterNumbers([]);
                                                                    } else {
                                                                        setSelectedChapterNumbers(sourceChapters.map((ch) => ch.chapterNumber));
                                                                    }
                                                                }}
                                                                className="text-[11px] text-blue-400 hover:underline font-semibold"
                                                            >
                                                                {selectedChapterNumbers.length === sourceChapters.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="max-h-70 overflow-y-auto custom-scroll space-y-1.5 p-2.5 rounded-xl border border-white/5 bg-black/30">
                                                        {isFetchingChapters ? (
                                                            <div className="text-xs text-slate-500 text-center py-4 italic">Đang tải danh sách chương...</div>
                                                        ) : sourceChapters.length > 0 ? (
                                                            sourceChapters.map((ch) => {
                                                                const isChecked = selectedChapterNumbers.includes(ch.chapterNumber);
                                                                return (
                                                                    <div
                                                                        key={ch.chapterNumber}
                                                                        onClick={() => {
                                                                            if (isChecked) {
                                                                                setSelectedChapterNumbers(selectedChapterNumbers.filter((n) => n !== ch.chapterNumber));
                                                                            } else {
                                                                                setSelectedChapterNumbers([...selectedChapterNumbers, ch.chapterNumber]);
                                                                            }
                                                                        }}
                                                                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition border ${isChecked ? "bg-blue-600/20 border-blue-500/40 text-white font-medium" : "bg-transparent border-transparent text-slate-400 hover:bg-white/5"}`}
                                                                    >
                                                                        <span className="text-xs truncate">
                                                                            Chương {ch.chapterNumber}: {ch.title || "Không có tiêu đề"}
                                                                        </span>
                                                                        <input type="checkbox" checked={isChecked} onChange={() => {}} className="w-3.5 h-3.5 rounded text-blue-600 cursor-pointer" />
                                                                    </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <p className="text-xs text-center py-4 text-slate-500 italic">Truyện gốc này chưa có chương nào.</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 gap-2">
                                                <BookOpen size={28} className="text-slate-600 animate-pulse" />
                                                <span className="text-xs italic">Vui lòng chọn một tác phẩm ở danh sách bên trái.</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-[#1e2633] flex flex-col gap-1.5 flex-none mt-4">
                                        <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Tên truyện phái sinh của bạn</label>
                                        <input type="text" value={newStoryTitle || ""} onChange={(e) => setNewStoryTitle(e.target.value)} placeholder="Nhập tên mới cho tác phẩm phái sinh..." className="w-full bg-[#181d29] border border-blue-500/30 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-white outline-none transition" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="flex flex-col gap-4 h-full max-w-7xl mx-auto w-full min-h-0">
                                <div className="rounded-2xl bg-[#131720]/80 border border-[#1e2633] px-4 py-3 flex items-center justify-between gap-3 flex-none">
                                    <div className="flex items-center gap-3 flex-1">
                                        <span className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-[#8b919e] shrink-0">
                                            <User size={14} className="text-blue-400" />
                                            <span>Chọn nhân vật</span>
                                        </span>
                                        <select value={selectedCharacter} onChange={(e) => setSelectedCharacter(e.target.value)} className="flex-1 bg-[#181d29] border border-white/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-xs md:text-sm text-white outline-none transition cursor-pointer">
                                            <option value="" disabled>
                                                {isFetchingCharacters ? "-- Đang tải danh sách nhân vật... --" : charactersList.length === 0 ? "-- Không có nhân vật nào --" : "-- Lựa chọn nhân vật --"}
                                            </option>
                                            {charactersList.map((char) => (
                                                <option key={char._id || char.id} value={char._id || char.id}>
                                                    {char.name || `Nhân vật #${char.id}`}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl shrink-0">Đã lưu tạm: {derivativeCharacters.length} nhân vật</div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
                                    <div className="md:col-span-6 rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-4 flex flex-col justify-between relative overflow-hidden min-h-0">
                                        <div className="flex-1 flex flex-col min-h-0">
                                            <div className="text-[10px] uppercase font-black tracking-widest text-[#8b919e] mb-2.5 flex items-center justify-between flex-none">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                                    <span>Kết quả gợi ý (n8n AI)</span>
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={handleRetryStep} disabled={isLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 disabled:opacity-50">
                                                        <RotateCcw size={13} className={isLoading ? "animate-spin" : ""} />
                                                        <span>{isLoading ? `Đang xử lý (${countdown}s)` : "Chạy AI n8n"}</span>
                                                    </button>
                                                    {/* Nút chấp nhận ở Bước 2: Chỉ sáng khi đã có aiResult */}
                                                    <button type="button" disabled={!aiResult} onClick={() => setShowAcceptModal(true)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                                                        <Check size={13} /> Chấp nhận
                                                    </button>
                                                </div>
                                            </div>

                                            {aiResult ? (
                                                <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scroll min-h-0 text-xs md:text-sm">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Ngoại hình (appearance)</label>
                                                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-line">{aiResult.appearance || "Chưa có."}</div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Tính cách (personality)</label>
                                                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-line">{aiResult.personality || "Chưa có."}</div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Tiểu sử (background)</label>
                                                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-line">{aiResult.background || "Chưa có."}</div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">Mục tiêu (goal)</label>
                                                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-line">{aiResult.goal || "Chưa có."}</div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Năng lực đặc biệt (ability)</label>
                                                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-line">{aiResult.ability || "Chưa có."}</div>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Hành trình phát triển (development)</label>
                                                        <div className="w-full bg-black/40 border border-white/5 rounded-xl p-3 text-xs text-slate-300 leading-relaxed whitespace-pre-line">{aiResult.development || "Chưa có."}</div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 gap-2">
                                                    <User size={28} className="text-slate-600 animate-pulse" />
                                                    <span className="text-xs italic">Vui lòng chọn nhân vật và bấm "Chạy AI n8n".</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-6 rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-4 flex flex-col justify-between relative overflow-hidden min-h-0">
                                        <div className="flex-1 flex flex-col min-h-0">
                                            <div className="text-[10px] uppercase font-black tracking-widest text-[#8b919e] mb-2.5 flex items-center justify-between flex-none">
                                                <span className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                    <span>Chỉnh sửa hồ sơ nhân vật phái sinh</span>
                                                </span>
                                                <button type="button" onClick={handleSaveCharacterProfile} className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition flex items-center gap-1.5 shadow-lg shadow-blue-500/20">
                                                    <Check size={14} /> Lưu vào danh sách tạm
                                                </button>
                                            </div>
                                            <div className="flex-1 overflow-y-auto pr-2 space-y-3.5 custom-scroll min-h-0 text-xs md:text-sm">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tên nhân vật</label>
                                                        <input type="text" value={charEditForm.name} onChange={(e) => setCharEditForm({ ...charEditForm, name: e.target.value })} placeholder="Nhập tên..." className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 outline-none" />
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Vai trò (Role)</label>
                                                        <input type="text" value={charEditForm.role} onChange={(e) => setCharEditForm({ ...charEditForm, role: e.target.value })} placeholder="VD: Nhân vật chính..." className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-slate-200 outline-none" />
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Ngoại hình (appearance)</label>
                                                    <textarea value={charEditForm.appearance} onChange={(e) => setCharEditForm({ ...charEditForm, appearance: e.target.value })} className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 resize-none outline-none" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Tính cách (personality)</label>
                                                    <textarea value={charEditForm.personality} onChange={(e) => setCharEditForm({ ...charEditForm, personality: e.target.value })} className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 resize-none outline-none" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Tiểu sử (background)</label>
                                                    <textarea value={charEditForm.background} onChange={(e) => setCharEditForm({ ...charEditForm, background: e.target.value })} className="w-full h-20 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 resize-none outline-none" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold text-yellow-400 uppercase tracking-wider">Mục tiêu (goal)</label>
                                                    <textarea value={charEditForm.goal} onChange={(e) => setCharEditForm({ ...charEditForm, goal: e.target.value })} className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 resize-none outline-none" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Năng lực đặc biệt (ability)</label>
                                                    <textarea value={charEditForm.ability} onChange={(e) => setCharEditForm({ ...charEditForm, ability: e.target.value })} className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 resize-none outline-none" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Hành trình phát triển (development)</label>
                                                    <textarea value={charEditForm.development} onChange={(e) => setCharEditForm({ ...charEditForm, development: e.target.value })} className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-slate-200 resize-none outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="flex flex-col gap-4 h-full max-w-7xl mx-auto w-full min-h-0">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start flex-1 overflow-y-auto custom-scroll pr-1">
                                    <div className="md:col-span-6 rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-4 flex flex-col">
                                        <div className="text-[10px] uppercase font-black tracking-widest text-[#8b919e] mb-2.5 flex items-center justify-between flex-none">
                                            <span className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                                                <span>5 Kế hoạch gợi ý (n8n AI)</span>
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={handleSuggestChapterPlans} disabled={isLoading} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 disabled:opacity-50">
                                                    <RotateCcw size={13} className={isLoading ? "animate-spin" : ""} />
                                                    <span>{isLoading ? `Đang tạo (${countdown}s)` : "Tạo lại (AI)"}</span>
                                                </button>
                                                {/* Nút chấp nhận ở Bước 3: Chỉ sáng khi đã có aiPlansResult */}
                                                <button type="button" disabled={!aiPlansResult || aiPlansResult.length === 0} onClick={() => setShowAcceptModal(true)} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed">
                                                    <Check size={13} /> Chấp nhận
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-xs">
                                            {displayPlans.map((plan, index) => {
                                                const chapterNum = plan.chapterNumber || index + 1;
                                                const rawTitle = plan.title || `Chương ${chapterNum}`;
                                                const displayTitle = rawTitle.toLowerCase().includes("chương") ? rawTitle : `Kế hoạch chương ${chapterNum}: ${rawTitle}`;

                                                return (
                                                    <div key={index} className="p-3.5 rounded-xl bg-black/20 border border-white/5 space-y-2">
                                                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-400">{displayTitle}</h4>
                                                        <div className="space-y-1.5 text-slate-300 leading-relaxed">
                                                            {plan.purpose && (
                                                                <p className="whitespace-pre-line">
                                                                    <strong className="text-slate-400">Mục đích:</strong> {plan.purpose}
                                                                </p>
                                                            )}
                                                            {plan.conflict && (
                                                                <p className="whitespace-pre-line">
                                                                    <strong className="text-slate-400">Xung đột:</strong> {plan.conflict}
                                                                </p>
                                                            )}
                                                            {plan.endingHook && (
                                                                <p className="whitespace-pre-line">
                                                                    <strong className="text-slate-400">Hook:</strong> {plan.endingHook}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="md:col-span-6 rounded-2xl bg-[#131720]/80 border border-[#1e2633] p-4 flex flex-col">
                                        <div className="text-[10px] uppercase font-black tracking-widest text-[#8b919e] mb-2.5 flex items-center justify-between flex-none">
                                            <span className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                <span>Chỉnh sửa chi tiết 5 kế hoạch</span>
                                            </span>
                                        </div>

                                        <div className="space-y-3 text-xs overflow-y-auto custom-scroll pr-2 flex-1 max-h-[600px]">
                                            {plans.map((plan, index) => (
                                                <div key={index} className="p-3.5 rounded-xl bg-[#181d29]/50 border border-white/10 space-y-3">
                                                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-400">Chỉnh sửa kế hoạch {index + 1}</h4>

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-slate-400 font-semibold">Tiêu đề chương</label>
                                                        <input
                                                            type="text"
                                                            value={plan.title || ""}
                                                            onChange={(e) => {
                                                                const updated = [...plans];
                                                                updated[index].title = e.target.value;
                                                                setPlans(updated);
                                                            }}
                                                            className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-lg p-2 text-slate-200 outline-none"
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-slate-400 font-semibold">Mục đích</label>
                                                        <textarea
                                                            value={plan.purpose || ""}
                                                            onChange={(e) => {
                                                                const updated = [...plans];
                                                                updated[index].purpose = e.target.value;
                                                                setPlans(updated);
                                                            }}
                                                            className="w-full h-[70px] bg-black/40 border border-white/10 focus:border-blue-500 rounded-lg p-2 text-slate-200 resize-none outline-none custom-scroll"
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-slate-400 font-semibold">Xung đột</label>
                                                        <textarea
                                                            value={plan.conflict || ""}
                                                            onChange={(e) => {
                                                                const updated = [...plans];
                                                                updated[index].conflict = e.target.value;
                                                                setPlans(updated);
                                                            }}
                                                            className="w-full h-[70px] bg-black/40 border border-white/10 focus:border-blue-500 rounded-lg p-2 text-slate-200 resize-none outline-none custom-scroll"
                                                        />
                                                    </div>

                                                    <div className="space-y-1">
                                                        <label className="text-[10px] text-slate-400 font-semibold">Hook (Điểm thắt/Mở đầu)</label>
                                                        <textarea
                                                            value={plan.endingHook || ""}
                                                            onChange={(e) => {
                                                                const updated = [...plans];
                                                                updated[index].endingHook = e.target.value;
                                                                setPlans(updated);
                                                            }}
                                                            className="w-full h-[70px] bg-black/40 border border-white/10 focus:border-blue-500 rounded-lg p-2 text-slate-200 resize-none outline-none custom-scroll"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-none px-8 py-3 border-t border-white/5 bg-black/20 flex items-center justify-between select-none">
                        {step > 1 ? (
                            <button onClick={() => setStep(step - 1)} disabled={isLoading} className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/5 text-slate-300">
                                Quay lại
                            </button>
                        ) : (
                            <div />
                        )}
                        <button onClick={handleNextStep} disabled={isLoading} className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 border border-blue-500/30 shadow-lg shadow-blue-500/20">
                            {isLoading ? (
                                <>
                                    <Sparkles size={14} className="animate-spin" />
                                    <span>Đang xử lý... ({countdown}s)</span>
                                </>
                            ) : step === 3 ? (
                                <>
                                    <Check size={14} />
                                    <span>Đồng ý & Hoàn tất</span>
                                </>
                            ) : (
                                <>
                                    <span />
                                    <span>Ok, tiếp theo</span>
                                    <ArrowRight size={14} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </main>

            {showAcceptModal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl p-6 gap-5 flex flex-col">
                        <h3 className="text-sm font-bold text-white">Xác nhận thay đổi nội dung</h3>
                        <p className="text-xs text-slate-300">Bạn có chắc chắn muốn áp dụng kết quả từ AI không?</p>
                        <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                            <button onClick={() => setShowAcceptModal(false)} className="px-4 py-2 rounded-xl text-xs bg-white/5 text-slate-300">
                                Hủy
                            </button>
                            <button onClick={handleAcceptAiResult} className="px-5 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white">
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <CustomModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => {
                    toast.error("Đã hủy quá trình tạo truyện phái sinh.");
                    navigate("/stories");
                }}
                title="Xác nhận hủy quá trình"
                message="Nếu hủy, toàn bộ công sức nãy giờ sẽ mất và không được lưu lại. Bạn có chắc chắn muốn thoát không?"
                confirmText="Đồng ý hủy"
                cancelText="Tiếp tục làm việc"
                type="danger"
            />
        </div>
    );
}
