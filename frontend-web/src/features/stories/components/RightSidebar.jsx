import React, { useState } from "react";
import { PanelRightClose, User, MapPin, Sparkles, ChevronDown } from "lucide-react";

export default function RightSidebar({ isOpen, setIsOpen }) {
    // THAY ĐỔI: Sử dụng một chuỗi string duy nhất để lưu tab đang mở thay vì Object
    // Giá trị có thể là: "characters" | "locations" | "notifications" | null
    const [activeTab, setActiveTab] = useState("");

    const characters = [
        { name: "Kaelen", desc: "Pháp sư lang thang, nắm giữ cổ ngữ cổ đại." },
        { name: "Lyra", desc: "Nữ cung thủ hoàng gia bị trục xuất khỏi bờ cõi." },
        { name: "Brak", desc: "Chiến binh Orc trung thành, thân hình thô kệch." },
        { name: "Evelyn", desc: "Công chúa mất tích của vương triều cũ sụp đổ." },
        { name: "Zane", desc: "Sát thủ bóng đêm lẩn trốn trong sương." },
        { name: "Valerie", desc: "Nữ tướng tiên phong kiên cường." },
    ];

    const locations = [
        { name: "Bãi Lầy Cổ Xưa", desc: "Vùng đất chết bị nguyền rủa nghìn năm qua." },
        { name: "Tháp Tinh Tú", desc: "Nơi trú ngụ của các học giả ma thuật tối cao." },
        { name: "Rừng Sương Mù", desc: "Lối vào không gian dị giới bị bóp méo." },
        { name: "Thành Thạch Anh", desc: "Pháo đài kiên cố nhất bờ tây lục địa." },
        { name: "Đầm Lầy Chết", desc: "Vùng nước độc không lối thoát." },
    ];

    const notifications = [
        { type: "location", message: 'Phát hiện địa danh mới: "Bãi Lầy Cổ Xưa"' },
        { type: "character", message: 'Phát hiện nhân vật mới: "Kaelen"' },
        { type: "character", message: 'Phát hiện nhân vật mới: "Lyra"' },
        { type: "location", message: 'Phát hiện địa danh mới: "Tháp Tinh Tú"' },
        { type: "character", message: 'Phát hiện nhân vật mới: "Zane"' },
    ];

    // Hàm xử lý đóng mở: Nếu bấm vào tab đang mở thì đóng lại (null), ngược lại thì mở tab mới
    const toggleCard = (cardName) => {
        setActiveTab(activeTab === cardName ? null : cardName);
    };

    if (!isOpen) return null;

    return (
        <aside className="absolute top-4 right-4 z-50 w-[380px]  flex flex-col gap-2 select-none overflow-hidden p-3 bg-[#0B1120]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 animate-fadeIn">
            {/* TIÊU ĐỀ & NÚT ĐÓNG POPUP (Bấm vào bất kỳ đâu trên thanh này đều đóng được) */}
            <div onClick={() => setIsOpen(false)} className="flex items-center justify-between p-2 bg-slate-950/40 border border-white/5 rounded-xl flex-none cursor-pointer hover:bg-slate-950/60 transition duration-150 active:scale-[0.99] select-none" title="Click để đóng bảng tra cứu">
                {/* Phần thông tin bên trái */}
                <div className="flex items-center gap-2 pl-1.5">
                    <Sparkles size={14} className="text-violet-400" />
                    <span className="text-xs font-bold text-[#a7c8ff] tracking-wide">Bảng Dữ Liệu Tra Cứu</span>
                </div>

                {/* Icon đóng bên phải */}
                <div className="p-1.5 rounded-lg text-slate-400 group-hover:text-white transition">
                    <PanelRightClose size={16} />
                </div>
            </div>

            {/* --- DROPDOWN 1: NHÂN VẬT --- */}
            {/* CẢI TIẾN: Nếu đang active thì nhận flex-1 để chiếm không gian trống, ngược lại nhận flex-none */}
            <div className={`rounded-xl bg-[#131720]/80 border border-[#1e2633] flex flex-col overflow-hidden transition-all duration-300 ${activeTab === "characters" ? "flex-1" : "flex-none"}`}>
                <button onClick={() => toggleCard("characters")} className="w-full flex items-center justify-between p-3 text-xs uppercase tracking-wider text-[#8b919e] font-bold bg-slate-950/10 hover:bg-slate-950/30 transition duration-150 flex-none">
                    <div className="flex items-center gap-1.5">
                        <User size={13} className="text-blue-400" />
                        <span className={activeTab === "characters" ? "text-white" : ""}>Nhân vật truyện</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeTab === "characters" ? "rotate-180 text-white" : ""}`} />
                </button>

                {activeTab === "characters" && (
                    <div className="overflow-y-auto max-h-[248px] p-2.5 space-y-1.5 writing-canvas-scroll animate-fadeIn border-t border-white/5 flex-1">
                        {characters.map((char, index) => (
                            <div key={index} className="p-2 rounded-xl bg-[#181d29] hover:bg-[#1d2433] transition duration-200 border border-transparent hover:border-white/5">
                                <h4 className="text-sm font-bold text-[#a7c8ff] leading-snug">{char.name}</h4>
                                <p className="text-xs text-[#c1c6d5] line-clamp-1 mt-0.5 opacity-90">{char.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- DROPDOWN 2: ĐỊA DANH --- */}
            <div className={`rounded-xl bg-[#131720]/80 border border-[#1e2633] flex flex-col overflow-hidden transition-all duration-300 ${activeTab === "locations" ? "flex-1" : "flex-none"}`}>
                <button onClick={() => toggleCard("locations")} className="w-full flex items-center justify-between p-3 text-xs uppercase tracking-wider text-[#8b919e] font-bold bg-slate-950/10 hover:bg-slate-950/30 transition duration-150 flex-none">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-emerald-400" />
                        <span className={activeTab === "locations" ? "text-white" : ""}>Địa danh & Thiết lập</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeTab === "locations" ? "rotate-180 text-white" : ""}`} />
                </button>

                {activeTab === "locations" && (
                    <div className="overflow-y-auto max-h-[248px] p-2.5 space-y-1.5 writing-canvas-scroll animate-fadeIn border-t border-white/5 flex-1">
                        {locations.map((loc, index) => (
                            <div key={index} className="p-2 rounded-xl bg-[#181d29] hover:bg-[#1d2433] transition duration-200 border border-transparent hover:border-white/5">
                                <h4 className="text-sm font-bold text-[#a7c8ff] leading-snug">{loc.name}</h4>
                                <p className="text-xs text-[#c1c6d5] line-clamp-1 mt-0.5 opacity-90">{loc.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- DROPDOWN 3: HỆ THỐNG QUÉT THỰC THỜI --- */}
            <div className={`rounded-xl bg-[#131720]/80 border border-[#1e2633] flex flex-col overflow-hidden transition-all duration-300 ${activeTab === "notifications" ? "flex-1" : "flex-none"}`}>
                <button onClick={() => toggleCard("notifications")} className="w-full flex items-center justify-between p-3 text-xs uppercase tracking-wider text-[#8b919e] font-bold bg-slate-950/10 hover:bg-slate-950/30 transition duration-150 flex-none">
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                        <span className={activeTab === "notifications" ? "text-white" : ""}>Hệ thống quét thực thời</span>
                    </div>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${activeTab === "notifications" ? "rotate-180 text-white" : ""}`} />
                </button>

                {activeTab === "notifications" && (
                    <div className="overflow-y-auto max-h-[248px] p-2.5 space-y-2 writing-canvas-scroll animate-fadeIn border-t border-white/5 flex-1">
                        {notifications.map((note, index) => (
                            <div key={index} className={`p-2.5 rounded-xl text-xs border leading-relaxed transition-all duration-300 hover:translate-x-0.5 ${note.type === "location" ? "bg-blue-950/20 border-blue-500/20 text-blue-300" : "bg-purple-950/20 border-purple-500/20 text-purple-300"}`}>
                                <div className="font-bold uppercase text-[9px] tracking-wider opacity-70 mb-0.5 flex items-center gap-1.5">{note.type === "location" ? "✦ Địa danh mới phát hiện" : "✦ Nhân vật mới phát hiện"}</div>
                                <div className="font-medium text-[#dae2fd]/90">{note.message}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </aside>
    );
}
