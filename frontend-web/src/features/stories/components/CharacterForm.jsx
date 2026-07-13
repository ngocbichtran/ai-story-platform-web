import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, User, BadgeInfo, Eye, BookOpen, Target, Users, Trash2, Plus, X, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import CharacterAppearanceStudio from "./CharacterAppearanceStudio";
export default function CharacterForm() {
    const navigate = useNavigate();
    const { storyId, characterId } = useParams();
    const isEditMode = Boolean(characterId);

    // TABS & MODAL STATE
    const [infoTab, setInfoTab] = useState("figured");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRelationId, setEditingRelationId] = useState(null); // null: Thêm mới, có ID: Đang sửa
    const [isAppearanceModalOpen, setIsAppearanceModalOpen] = useState(false);
    // MOCK ALL CHARACTERS IN STORY (Dùng cho Popup select)
    const [allCharacters] = useState([
        { id: 2, name: "Elena Vance" },
        { id: 3, name: "Victor Malum" },
        { id: 4, name: "Thomas Thorne" },
        { id: 5, name: "Luna" },
        { id: 6, name: "Linh Lan" },
        { id: 7, name: "Ông Giáo" },
    ]);

    // FORM & MODAL STATE
    const [formData, setFormData] = useState({
        name: "",
        gender: "Nam",
        age: "",
        occupation: "",
        role: "Nhân vật chính",
        appearance: "",
        personality: "",
        background: "",
        goal: "",
        relationship: [],
    });

    const [modalData, setModalData] = useState({
        selectedCharId: "",
        relationType: "Đồng minh",
    });

    // Giả lập Fetch dữ liệu cũ khi Edit
    useEffect(() => {
        if (isEditMode) {
            setFormData({
                name: "Alex Thorne",
                gender: "Nam",
                age: 34,
                occupation: "Thanh tra",
                role: "Nhân vật chính",
                appearance: "Dáng người cao khoảng 1m82, mái tóc đen được cắt gọn gàng, ánh mắt sắc bén cùng vết sẹo nhỏ trên chân mày trái. Thường mặc áo khoác dài màu đen và găng tay da.",
                personality: "Điềm tĩnh, quyết đoán, thông minh và luôn giữ bình tĩnh trong mọi tình huống. Có khả năng quan sát rất tốt và luôn đặt lợi ích của người khác lên trước bản thân.",
                background: "Sinh ra trong gia đình truyền thống làm cảnh sát.Sau biến cố em gái mất tích, Alex quyết định trở thành thanh tra hình sự để điều tra sự thật.Anh dành gần như toàn bộ cuộc đời mình cho công việc và luôn theo đuổi công lý.",
                goal: "Khám phá bí mật phía sau tổ chức ngầm Black Raven và tìm lại em gái đã mất tích suốt nhiều năm.",
                relationship: [
                    { id: 2, name: "Elena Vance", relationType: "Đồng minh" },
                    { id: 3, name: "Victor Malum", relationType: "Kẻ thù" },
                    { id: 4, name: "Thomas Thorne", relationType: "Cha" },
                    { id: 5, name: "Luna", relationType: "Đồng đội" },
                ],
            });
        }
    }, [isEditMode, characterId]);

    // =====================================
    // HANDLERS
    // =====================================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleGenerateAI = () => {
        // Giả lập AI đang xử lý
        setTimeout(() => {
            setFormData((prev) => ({
                ...prev,
                appearanceReverse: `
- Mái tóc dài màu trắng bạc thay vì đen.
- Đôi mắt đỏ rực, ánh nhìn lạnh lùng.
- Mặc áo giáp đen với hoa văn đỏ.
- Gương mặt góc cạnh và sắc bén hơn.
- Toát ra khí chất phản diện, nguy hiểm.
            `.trim(),
            }));
        }, 1200);
    };
    const handleModalChange = (e) => {
        const { name, value } = e.target;
        setModalData((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditRelationshipClick = (item) => {
        setEditingRelationId(item.id);
        setModalData({
            selectedCharId: item.id.toString(),
            relationType: item.relationType,
        });
        setIsModalOpen(true);
    };

    const handleSaveRelationship = (e) => {
        e.preventDefault();
        if (!modalData.selectedCharId) return alert("Vui lòng chọn một nhân vật!");

        const targetChar = allCharacters.find((c) => c.id === parseInt(modalData.selectedCharId));
        if (!targetChar) return;

        if (editingRelationId) {
            // CHẾ ĐỘ SỬA: Cập nhật lại item trong mảng
            setFormData((prev) => ({
                ...prev,
                relationship: prev.relationship.map((r) => (r.id === editingRelationId ? { ...r, id: targetChar.id, name: targetChar.name, relationType: modalData.relationType } : r)),
            }));
        } else {
            // CHẾ ĐỘ THÊM MỚI: Check trùng rồi thêm vào mảng
            if (formData.relationship.some((r) => r.id === targetChar.id)) {
                return alert("Mối quan hệ với nhân vật này đã tồn tại!");
            }
            setFormData((prev) => ({
                ...prev,
                relationship: [...prev.relationship, { id: targetChar.id, name: targetChar.name, relationType: modalData.relationType }],
            }));
        }

        // Reset trạng thái sau khi đóng popup
        setIsModalOpen(false);
        setEditingRelationId(null);
        setModalData({ selectedCharId: "", relationType: "Đồng minh" });
    };

    const handleDeleteRelationship = (id) => {
        setFormData((prev) => ({
            ...prev,
            relationship: prev.relationship.filter((item) => item.id !== id),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Dữ liệu gửi đi:", formData);
        alert(isEditMode ? "Cập nhật thành công!" : "Tạo mới thành công!");
        navigate(`/stories/${storyId}/editor/characters`);
    };

    return (
        <div className="relative min-h-screen flex flex-col overflow-hidden bg-[#070b14] text-white">
            {/* Background */}
            <div className="absolute left-1/4 top-10 h-96 w-96 rounded-full bg-blue-600/10 blur-[150px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

            <form onSubmit={handleSubmit} className="relative z-10 mx-auto max-w-7xl pt-2 flex-1 flex flex-col gap-4 w-full pb-6">
                {/* ==========================================
                    HEADER
                ========================================== */}
                <section className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl shadow-xl shrink-0">
                    <div className="absolute -right-20 -top-20 h-28 w-28 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
                    <div className="grid grid-cols-12 items-center gap-3 p-2 relative z-10 w-full">
                        {/* BACK */}
                        <div className="col-span-12 md:col-span-1">
                            <button type="button" onClick={() => navigate(-1)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/5 bg-slate-950/40 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white active:scale-95">
                                <ArrowLeft size={15} /> Quay lại
                            </button>
                        </div>

                        {/* TITLE */}
                        <div className="col-span-12 md:col-span-4 flex items-center gap-3 rounded-xl border border-white/5 bg-slate-950/30 p-2">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
                                <User size={20} className="text-blue-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate text-lg font-black">{isEditMode ? "Chỉnh sửa nhân vật" : "Tạo nhân vật"}</h1>
                            </div>
                        </div>

                        <div className="hidden md:block md:col-span-5" />

                        {/* SAVE BUTTON */}
                        <div className="col-span-12 md:col-span-2">
                            <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-bold text-white transition hover:opacity-90 active:scale-95 shadow-lg shadow-blue-500/10">
                                <Save size={15} /> {isEditMode ? "Lưu thay đổi" : "Lưu nhân vật"}
                            </button>
                        </div>
                    </div>
                </section>

                {/* ==========================================
                    CONTENT LAYOUT
                ========================================== */}
                <section className="w-full flex-1 flex flex-col min-h-0">
                    <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-slate-900/30 backdrop-blur-xl shadow-xl overflow-hidden">
                        {/* SUB TABS TRONG TAB INFO */}
                        <div className="border-b border-white/10 p-2 shrink-0">
                            <div className="flex items-center justify-between">
                                {/* TAB */}
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

                        {/* VÙNG CHỨA INPUT / TEXTAREA CÓ SCROLLBAR ĐẦY ĐỦ */}
                        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar min-h-0">
                            {/* PHÂN HỆ: HÌNH TƯỢNG NHÂN VẬT */}
                            {infoTab === "figured" && (
                                <div className="grid gap-5 lg:grid-cols-12 w-full">
                                    {/* THÔNG TIN CƠ BẢN */}
                                    <section className="lg:col-span-4 rounded-2xl border border-blue-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col gap-4">
                                        <div className="flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <User size={18} className="text-blue-400" />
                                            <h2 className="font-bold text-white">Thông tin</h2>
                                        </div>
                                        <div className="space-y-3.5 text-sm">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tên</label>
                                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="Nhập tên nhân vật..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Vai trò</label>
                                                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition">
                                                    <option value="Nhân vật chính" className="bg-[#070b14]">
                                                        Nhân vật chính
                                                    </option>
                                                    <option value="Nhân vật phụ" className="bg-[#070b14]">
                                                        Nhân vật phụ
                                                    </option>
                                                    <option value="Phản diện" className="bg-[#070b14]">
                                                        Phản diện
                                                    </option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Giới tính</label>
                                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition">
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
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tuổi</label>
                                                    <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Tuổi..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Nghề nghiệp</label>
                                                <input type="text" name="occupation" value={formData.occupation} onChange={handleChange} placeholder="Nghề nghiệp..." className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                                            </div>
                                        </div>
                                    </section>

                                    {/* NGOẠI HÌNH */}
                                    <section className="lg:col-span-4 rounded-2xl border border-violet-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[415px]">
                                        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
                                            <div className="flex items-center gap-3">
                                                <Eye size={18} className="text-violet-400" />
                                                <h2 className="font-bold text-violet-300">Ngoại hình</h2>
                                            </div>{" "}
                                            {/* NÚT STUDIO AI */}
                                            <button type="button" onClick={() => setIsAppearanceModalOpen(true)} className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-90 transition active:scale-95 flex items-center gap-2">
                                                Tính năng
                                            </button>
                                        </div>
                                        <textarea name="appearanceFinal" value={formData.appearanceFinal} onChange={handleChange} placeholder="Diện mạo hoàn chỉnh sau cùng của nhân vật..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 leading-7 focus:outline-none focus:border-violet-500/30 transition resize-none custom-scrollbar min-h-0" />
                                    </section>

                                    {/* TÍNH CÁCH */}
                                    <section className="lg:col-span-4 rounded-2xl border border-emerald-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[415px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <BadgeInfo size={18} className="text-emerald-400" />
                                            <h2 className="font-bold text-emerald-300">Tính cách</h2>
                                        </div>
                                        <textarea name="personality" value={formData.personality} onChange={handleChange} placeholder="Mô tả diễn biến nội tâm, cá tính, thói quen hành vi độc bản..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 leading-7 focus:outline-none focus:border-emerald-500/30 transition resize-none custom-scrollbar min-h-0" />
                                    </section>
                                </div>
                            )}

                            {/* PHÂN HỆ: TUYẾN NHÂN VẬT */}
                            {infoTab === "storyline" && (
                                <div className="grid gap-5 lg:grid-cols-12 w-full">
                                    {/* MỤC TIÊU */}
                                    <section className="lg:col-span-4 rounded-2xl border border-yellow-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[415px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10">
                                                <Target size={18} className="text-yellow-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-yellow-300">Mục tiêu</h2>
                                                <p className="text-xs text-slate-400">Động lực cốt lõi.</p>
                                            </div>
                                        </div>
                                        <textarea name="goal" value={formData.goal} onChange={handleChange} placeholder="Mục đích tối thượng hoặc khát khao nhân vật cần thực hiện là gì?..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 leading-7 focus:outline-none focus:border-yellow-500/30 transition resize-none custom-scrollbar min-h-0" />
                                    </section>

                                    {/* TIỂU SỬ */}
                                    <section className="lg:col-span-4 rounded-2xl border border-cyan-500/10 bg-slate-950/30 p-5 shadow-sm flex flex-col h-[415px]">
                                        <div className="mb-4 flex items-center gap-3 border-b border-white/10 pb-3 shrink-0">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                                                <BookOpen size={18} className="text-cyan-400" />
                                            </div>
                                            <div>
                                                <h2 className="font-bold text-cyan-300">Tiểu sử</h2>
                                                <p className="text-xs text-slate-400">Quá khứ, nguồn gốc xuất thân của nhân vật.</p>
                                            </div>
                                        </div>
                                        <textarea name="background" value={formData.background} onChange={handleChange} placeholder="Hoàn cảnh lịch sử đời tư, bước ngoặt cuộc đời trong quá khứ..." className="flex-1 w-full bg-slate-950/40 border border-white/5 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-600 leading-7 focus:outline-none focus:border-cyan-500/30 transition resize-none custom-scrollbar min-h-0" />
                                    </section>

                                    {/* MỐI QUAN HỆ */}
                                    <section className="lg:col-span-4 rounded-2xl border border-white/10 bg-slate-900/30 backdrop-blur-xl shadow-xl flex flex-col h-[415px] overflow-hidden">
                                        {/* Header box quan hệ cố định */}
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

                                        {/* Vùng cuộn danh sách mối quan hệ */}
                                        <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar min-h-0">
                                            {formData.relationship.length === 0 ? (
                                                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500 italic py-12">Chưa có mối quan hệ nào.</div>
                                            ) : (
                                                <div className="flex flex-col gap-2.5 w-full">
                                                    {formData.relationship.map((item) => (
                                                        <div key={item.id} className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-3 transition-all duration-300 hover:border-blue-500/30 hover:bg-blue-500/[0.04]">
                                                            {/* Thông tin nhân vật bên trái */}
                                                            <div className="flex items-center gap-4 min-w-0">
                                                                <div className="min-w-0">
                                                                    <h3 className="text-sm font-semibold text-white truncate">{item.name}</h3>
                                                                    <p className="mt-0.5 text-xs text-slate-400 truncate">{item.relationType}</p>
                                                                </div>
                                                            </div>

                                                            {/* Hành động sửa/xóa bên phải */}
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <button type="button" onClick={() => handleEditRelationshipClick(item)} className="flex items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 p-2 text-blue-400 transition hover:border-blue-500/40 hover:bg-blue-500/20">
                                                                    <Pencil size={14} />
                                                                </button>
                                                                <button type="button" onClick={() => handleDeleteRelationship(item.id)} className="flex items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 p-2 text-red-400 transition hover:border-red-500/40 hover:bg-red-500/20">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
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

            {/* ==========================================
                POPUP DIALOG (MODAL THÊM / SỬA MỐI QUAN HỆ)
            ========================================== */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1120] p-6 shadow-2xl flex flex-col gap-5 animate-scale-up">
                        {/* Close button */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                setEditingRelationId(null);
                                setModalData({ selectedCharId: "", relationType: "Đồng minh" });
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
                        >
                            <X size={18} />
                        </button>

                        {/* Tiêu đề tự động đổi theo trạng thái Thêm / Sửa */}
                        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                            <Users size={20} className="text-blue-400" />
                            <h3 className="text-lg font-bold text-white">{editingRelationId ? "Cập nhật mối quan hệ" : "Thêm mối quan hệ"}</h3>
                        </div>

                        <div className="space-y-4 text-sm">
                            {/* Chọn nhân vật có sẵn */}
                            <div className="flex flex-col gap-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Chọn nhân vật sẵn có</label>
                                    {!editingRelationId && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                navigate(`/stories/${storyId}/editor/characters/create`);
                                            }}
                                            className="text-xs font-bold text-blue-400 hover:underline flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Tạo mới nhân vật
                                        </button>
                                    )}
                                </div>

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

                            {/* Nhập hoặc lựa chọn loại quan hệ */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loại quan hệ</label>
                                <input type="text" name="relationType" value={modalData.relationType} onChange={handleModalChange} placeholder="Ví dụ: Đồng minh, Kẻ thù, Cha, Đồng đội..." className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition placeholder-slate-600" />
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-3 justify-end border-t border-white/10 pt-4 mt-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setEditingRelationId(null);
                                    setModalData({ selectedCharId: "", relationType: "Đồng minh" });
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
            {/* TRANG PHÁT TRIỂN DIỆN MẠO KHỔ LỚN */}
            {isAppearanceModalOpen && <CharacterAppearanceStudio formData={formData} setFormData={setFormData} allCharacters={allCharacters} onClose={() => setIsAppearanceModalOpen(false)} />}
        </div>
    );
}
