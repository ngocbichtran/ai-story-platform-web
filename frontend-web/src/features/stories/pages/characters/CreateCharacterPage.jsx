import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, User, BadgeInfo, Eye, BookOpen, Target, Users, Trash2, Plus, X, Pencil, Loader2, Zap, TrendingUp, MapPin, Tag } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import CharacterAppearanceStudio from "../../components/CharacterAppearanceStudio";

export default function CreateCharacterPage() {
    const navigate = useNavigate();
    const { storyId } = useParams();

    const [infoTab, setInfoTab] = useState("figured");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRelationId, setEditingRelationId] = useState(null);
    const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [allCharacters, setAllCharacters] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        role: "Nhân vật chính",
        gender: "Nam",
        age: "",
        occupation: "",
        appearanceFinal: "",
        personality: "",
        background: "",
        goal: "",
        ability: "",
        development: "",
        currentLocation: "",
        avatar: "",
        tags: [],
        status: "alive",
        relationship: [],
    });

    const [tagInput, setTagInput] = useState("");

    const [modalData, setModalData] = useState({
        selectedCharId: "",
        relationType: "Đồng minh",
        description: "",
    });

    // Lấy danh sách nhân vật trong truyện để liên kết mối quan hệ
    useEffect(() => {
        const fetchAllCharactersInStory = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const res = await axios.get(`https://api.baostory.fun/api/characters/${storyId}/list`, config);
                if (res.data.success) {
                    setAllCharacters(res.data.data || []);
                }
            } catch (err) {
                console.error("Lỗi tải danh sách nhân vật liên kết:", err);
            }
        };
        if (storyId) fetchAllCharactersInStory();
    }, [storyId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleModalChange = (e) => {
        const { name, value } = e.target;
        setModalData((prev) => ({ ...prev, [name]: value }));
    };

    // Xử lý Thẻ (Tags)
    const handleAddTag = (e) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(tagInput.trim())) {
                setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            }
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const handleEditRelationshipClick = (item) => {
        setEditingRelationId(item.characterId || item.id);
        setModalData({
            selectedCharId: (item.characterId || item.id).toString(),
            relationType: item.relationType,
            description: item.description || "",
        });
        setIsModalOpen(true);
    };

    const handleSaveRelationship = (e) => {
        e.preventDefault();
        if (!modalData.selectedCharId) {
            toast.error("Vui lòng chọn một nhân vật!");
            return;
        }

        const targetChar = allCharacters.find((c) => c.id === modalData.selectedCharId || c.id === parseInt(modalData.selectedCharId));
        if (!targetChar) return;

        const relationPayload = {
            characterId: targetChar.id,
            name: targetChar.name,
            relationType: modalData.relationType,
            description: modalData.description,
        };

        if (editingRelationId) {
            setFormData((prev) => ({
                ...prev,
                relationship: prev.relationship.map((r) => ((r.characterId || r.id) === editingRelationId ? relationPayload : r)),
            }));
        } else {
            if (formData.relationship.some((r) => (r.characterId || r.id) === targetChar.id)) {
                toast.error("Mối quan hệ với nhân vật này đã tồn tại!");
                return;
            }
            setFormData((prev) => ({
                ...prev,
                relationship: [...prev.relationship, relationPayload],
            }));
        }

        setIsModalOpen(false);
        setEditingRelationId(null);
        setModalData({ selectedCharId: "", relationType: "Đồng minh", description: "" });
    };

    const handleDeleteRelationship = (id) => {
        setFormData((prev) => ({
            ...prev,
            relationship: prev.relationship.filter((item) => (item.characterId || item.id) !== id),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.role.trim()) {
            toast.error("Vui lòng điền đầy đủ tên nhân vật và vai trò.");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const payload = {
                storyId: Number(storyId),
                name: formData.name.trim(),
                role: formData.role.trim(),
                gender: formData.gender,
                age: formData.age ? Number(formData.age) : 0,
                occupation: formData.occupation,
                appearance: formData.appearanceFinal,
                personality: formData.personality,
                background: formData.background,
                goal: formData.goal,
                ability: formData.ability,
                development: formData.development,
                currentLocation: formData.currentLocation,
                avatar: formData.avatar,
                tags: formData.tags,
                status: formData.status,
                relationship: formData.relationship,
            };

            await axios.post("https://api.baostory.fun/api/characters", payload, config);
            toast.success("Khởi tạo nhân vật mới thành công!");
            navigate(`/stories/${storyId}/editor/characters`);
        } catch (err) {
            console.error("Lỗi tạo nhân vật:", err);
            const errorMsg = err.response?.data?.message || "Không thể khởi tạo nhân vật.";
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#070b14] text-white">
            <div className="absolute left-1/4 top-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

            <form onSubmit={handleSubmit} className="relative z-10 mx-auto max-w-7xl pt-2 flex-1 flex flex-col gap-4 w-full pb-6">
                {/* HEADER */}
                <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-xl shrink-0">
                    <div className="absolute -right-20 -top-20 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                    <div className="grid grid-cols-12 items-center gap-3 p-2 relative z-10 w-full">
                        <div className="col-span-12 md:col-span-1">
                            <button type="button" onClick={() => navigate(-1)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-slate-950/40 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-95">
                                <ArrowLeft size={15} /> Quay lại
                            </button>
                        </div>

                        <div className="col-span-12 md:col-span-4 flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/30 p-2">
                            {formData.avatar ? (
                                <img src={formData.avatar} alt="Avatar" className="h-10 w-10 shrink-0 rounded-xl object-cover border border-blue-500/20" />
                            ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                                    <User size={20} className="text-blue-400" />
                                </div>
                            )}
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-lg font-black">{formData.name ? formData.name : "Tạo nhân vật mới"}</h1>
                            </div>
                        </div>

                        <div className="hidden md:block md:col-span-5" />

                        <div className="col-span-12 md:col-span-2">
                            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 shadow-lg shadow-blue-500/10 disabled:opacity-50">
                                <Save size={15} /> {loading ? "Đang lưu..." : "Lưu nhân vật"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* CONTENT LAYOUT */}
                <section className="w-full flex-1 flex flex-col min-h-0">
                    <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-slate-900/30 backdrop-blur-xl shadow-xl overflow-hidden">
                        <div className="border-b border-white/10 p-2 shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="flex rounded-xl border border-white/10 bg-slate-950/40 p-1">
                                    <button type="button" onClick={() => setInfoTab("figured")} className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${infoTab === "figured" ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                        Hình tượng nhân vật
                                    </button>
                                    <button type="button" onClick={() => setInfoTab("storyline")} className={`rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${infoTab === "storyline" ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow" : "text-slate-400 hover:text-white"}`}>
                                        Tuyến nhân vật
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar min-h-0">
                            {/* TAB 1: HÌNH TƯỢNG NHÂN VẬT */}
                            {infoTab === "figured" && (
                                <div className="grid gap-5 lg:grid-cols-12 w-full">
                                    {/* THÔNG TIN CHUNG & TAGS */}
                                    <section className="lg:col-span-4 rounded-2xl border border-blue-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col gap-4">
                                        <div className="flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <User size={18} className="text-blue-400" />
                                            <h2 className="font-bold text-white">Thông tin chung</h2>
                                        </div>
                                        <div className="space-y-3.5 text-sm">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tên *</label>
                                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nhập tên nhân vật..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vai trò *</label>
                                                <select name="role" value={formData.role} onChange={handleChange} required className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition">
                                                    <option value="Nhân vật chính" className="bg-[#070b14]">
                                                        Nhân vật chính
                                                    </option>
                                                    <option value="Nhân vật phụ" className="bg-[#070b14]">
                                                        Nhân vật phụ
                                                    </option>
                                                    <option value="Nhân vật phản diện" className="bg-[#070b14]">
                                                        Nhân vật phản diện
                                                    </option>
                                                    <option value="Nhân vật khác" className="bg-[#070b14]">
                                                        Nhân vật khác
                                                    </option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-12 gap-2">
                                                <div className="col-span-4 flex flex-col gap-1.5">
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Giới tính</label>
                                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition">
                                                        <option value="Nam" className="bg-[#070b14]">
                                                            Nam
                                                        </option>
                                                        <option value="Nữ" className="bg-[#070b14]">
                                                            Nữ
                                                        </option>
                                                        <option value="Khác" className="bg-[#070b14]">
                                                            Khác
                                                        </option>
                                                    </select>
                                                </div>

                                                <div className="col-span-3 flex flex-col gap-1.5">
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tuổi</label>
                                                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Tuổi" className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-2 py-2 text-xs text-white text-center focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                                                </div>

                                                <div className="col-span-5 flex flex-col gap-1.5">
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</label>
                                                    <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition">
                                                        <option value="alive">Còn sống</option>
                                                        <option value="dead">Đã chết</option>
                                                        <option value="missing">Mất tích</option>
                                                        <option value="unknown">Không rõ</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nghề nghiệp</label>
                                                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Nghề nghiệp..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vị trí hiện tại</label>
                                                <input type="text" name="currentLocation" value={formData.currentLocation} onChange={handleChange} placeholder="Vị trí hiện tại..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">URL Ảnh đại diện (Avatar)</label>
                                                <input type="text" name="avatar" value={formData.avatar} onChange={handleChange} placeholder="https://..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                                            </div>

                                            {/* TAGS INPUT */}
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thẻ (Nhấn Enter để thêm)</label>
                                                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleAddTag} placeholder="Thêm tag và nhấn Enter..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                                                {formData.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                        {formData.tags.map((tag, idx) => (
                                                            <span key={idx} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-xs text-blue-300">
                                                                <Tag size={11} />
                                                                {tag}
                                                                <button type="button" onClick={() => handleRemoveTag(tag)} className="ml-1 text-slate-400 hover:text-white">
                                                                    <X size={12} />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </section>

                                    {/* NGOẠI HÌNH */}
                                    <section className="lg:col-span-4 rounded-2xl border border-violet-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[520px]">
                                        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <Eye size={18} className="text-violet-400" />
                                                <h2 className="font-bold text-violet-300">Ngoại hình</h2>
                                            </div>
                                            <button type="button" onClick={() => setIsAppearanceModalOpen(true)} className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-90 transition active:scale-95 flex items-center gap-2">
                                                Tính năng
                                            </button>
                                        </div>
                                        <textarea name="appearanceFinal" value={formData.appearanceFinal} onChange={handleChange} placeholder="Diện mạo hoàn chỉnh sau cùng của nhân vật..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 leading-7 focus:outline-none focus:border-violet-500/30 transition resize-none custom-scrollbar min-h-0" />
                                    </section>

                                    {/* TÍNH CÁCH & NĂNG LỰC */}
                                    <section className="lg:col-span-4 rounded-2xl border border-emerald-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[520px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <BadgeInfo size={18} className="text-emerald-400" />
                                            <h2 className="font-bold text-emerald-300">Tính cách & Năng lực</h2>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-4 min-h-0">
                                            <div className="flex-1 flex flex-col min-h-0">
                                                <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">Tính cách</label>
                                                <textarea name="personality" value={formData.personality} onChange={handleChange} placeholder="Mô tả diễn biến nội tâm, cá tính..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 leading-6 focus:outline-none focus:border-emerald-500/30 transition resize-none custom-scrollbar min-h-0" />
                                            </div>
                                            <div className="flex-1 flex flex-col min-h-0">
                                                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
                                                    <Zap size={13} /> Năng lực đặc biệt
                                                </label>
                                                <textarea name="ability" value={formData.ability} onChange={handleChange} placeholder="Mô tả siêu năng lực, kỹ năng chiến đấu..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 leading-6 focus:outline-none focus:border-cyan-500/30 transition resize-none custom-scrollbar min-h-0" />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            )}

                            {/* TAB 2: TUYẾN NHÂN VẬT */}
                            {infoTab === "storyline" && (
                                <div className="grid gap-5 lg:grid-cols-12 w-full">
                                    {/* MỤC TIÊU & PHÁT TRIỂN */}
                                    <section className="lg:col-span-4 rounded-2xl border border-yellow-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[520px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10">
                                                <Target size={18} className="text-yellow-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-yellow-300">Mục tiêu & Phát triển</h2>
                                                <p className="text-xs text-slate-400">Động lực và hành trình.</p>
                                            </div>
                                        </div>
                                        <div className="flex-1 flex flex-col gap-4 min-h-0">
                                            <div className="flex-1 flex flex-col min-h-0">
                                                <label className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-1">Mục tiêu</label>
                                                <textarea name="goal" value={formData.goal} onChange={handleChange} placeholder="Mục đích tối thượng..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 leading-6 focus:outline-none focus:border-yellow-500/30 transition resize-none custom-scrollbar min-h-0" />
                                            </div>
                                            <div className="flex-1 flex flex-col min-h-0">
                                                <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-1 flex items-center gap-1.5">
                                                    <TrendingUp size={13} /> Hành trình phát triển
                                                </label>
                                                <textarea name="development" value={formData.development} onChange={handleChange} placeholder="Quá trình thay đổi, trưởng thành..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-3 text-sm text-slate-300 placeholder-slate-600 leading-6 focus:outline-none focus:border-indigo-500/30 transition resize-none custom-scrollbar min-h-0" />
                                            </div>
                                        </div>
                                    </section>

                                    {/* TIỂU SỬ */}
                                    <section className="lg:col-span-4 rounded-2xl border border-cyan-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[520px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                                                <BookOpen size={18} className="text-cyan-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-cyan-300">Tiểu sử</h2>
                                                <p className="text-xs text-slate-400">Quá khứ, nguồn gốc xuất thân.</p>
                                            </div>
                                        </div>
                                        <textarea name="background" value={formData.background} onChange={handleChange} placeholder="Hoàn cảnh lịch sử đời tư..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 leading-7 focus:outline-none focus:border-cyan-500/30 transition resize-none custom-scrollbar min-h-0" />
                                    </section>

                                    {/* MỐI QUAN HỆ */}
                                    <section className="lg:col-span-4 rounded-2xl border border-white/10 bg-slate-900/30 backdrop-blur-xl shadow-xl flex flex-col h-[520px] overflow-hidden">
                                        <div className="mb-2 flex items-center justify-between border-b border-white/10 p-5 pb-3 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                                                    <Users size={18} className="text-blue-400" />
                                                </div>
                                                <div>
                                                    <h2 className="font-bold text-blue-300">Mối quan hệ</h2>
                                                    <p className="text-xs text-slate-400">Các nhân vật liên quan.</p>
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 active:scale-95 shadow-md shadow-blue-900/20">
                                                <Plus size={16} /> Thêm
                                            </button>
                                        </div>

                                        <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar min-h-0">
                                            {formData.relationship.length === 0 ? (
                                                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500 italic py-12">Chưa có mối quan hệ nào.</div>
                                            ) : (
                                                <div className="flex flex-col gap-2.5 w-full">
                                                    {formData.relationship.map((item, index) => {
                                                        const relId = item.characterId || item.id;
                                                        return (
                                                            <div key={index} className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/[0.04]">
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="min-w-0">
                                                                        <h3 className="text-sm font-semibold text-white truncate">{item.name || "Nhân vật liên kết"}</h3>
                                                                        <p className="mt-0.5 text-xs text-slate-400 truncate">{item.relationType}</p>
                                                                        {item.description && <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{item.description}</p>}
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2 shrink-0">
                                                                    <button type="button" onClick={() => handleEditRelationshipClick(item)} className="flex items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400 transition hover:border-blue-500/40 hover:bg-blue-500/20">
                                                                        <Pencil size={14} />
                                                                    </button>
                                                                    <button type="button" onClick={() => handleDeleteRelationship(relId)} className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20">
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </form>

            {/* MODAL THÊM / SỬA MỐI QUAN HỆ */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1120] p-6 shadow-2xl flex flex-col gap-5">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingRelationId(null);
                                setModalData({ selectedCharId: "", relationType: "Đồng minh", description: "" });
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                            <Users size={20} className="text-blue-400" />
                            <h3 className="text-lg font-bold text-white">{editingRelationId ? "Cập nhật mối quan hệ" : "Thêm mối quan hệ"}</h3>
                        </div>

                        <div className="space-y-4 text-sm">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chọn nhân vật sẵn có</label>
                                <select name="selectedCharId" value={modalData.selectedCharId} onChange={handleModalChange} className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition">
                                    <option value="" className="bg-[#070b14]">
                                        -- Chọn nhân vật từ câu chuyện --
                                    </option>
                                    {allCharacters.map((c) => (
                                        <option key={c.id} value={c.id} className="bg-[#070b14]">
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loại quan hệ</label>
                                <input type="text" name="relationType" value={modalData.relationType} onChange={handleModalChange} placeholder="Ví dụ: Đồng minh, Kẻ thù..." className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mô tả mối quan hệ (Tùy chọn)</label>
                                <input type="text" name="description" value={modalData.description} onChange={handleModalChange} placeholder="Chi tiết thêm về mối quan hệ..." className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end border-t border-white/10 pt-4 mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingRelationId(null);
                                    setModalData({ selectedCharId: "", relationType: "Đồng minh", description: "" });
                                }}
                                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 transition"
                            >
                                Hủy bỏ
                            </button>
                            <button type="button" onClick={handleSaveRelationship} className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white transition hover:opacity-90 active:scale-95">
                                {editingRelationId ? "Lưu thay đổi" : "Xác nhận thêm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isAppearanceModalOpen && <CharacterAppearanceStudio formData={formData} setFormData={setFormData} allCharacters={allCharacters} onClose={() => setIsAppearanceModalOpen(false)} />}
        </div>
    );
}
