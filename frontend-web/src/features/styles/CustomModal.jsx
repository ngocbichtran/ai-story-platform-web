import React from "react";

export default function CustomModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Xác nhận",
    message = "Bạn có chắc chắn muốn thực hiện hành động này?",
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    type = "danger", // 'danger' (màu đỏ) hoặc 'primary' (màu xanh)
}) {
    if (!isOpen) return null; // Nếu không mở thì không render gì cả

    return (
        /* 1. Lớp phủ nền mờ full màn hình (Click ra ngoài gọi onClose) */
        <div onClick={onClose} className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 transition-all">
            {/* 2. Khung nội dung popup (Thêm e.stopPropagation() để click vào trong không bị đóng modal) */}
            <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-[#0F172A] border border-white/10 rounded-3xl p-6 gap-5 flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                <h3 className="text-sm font-bold text-white">{title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{message}</p>
                <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
                    <button onClick={onClose} className="px-4 py-2 rounded-xl text-xs bg-white/5 text-slate-300 hover:bg-white/10 transition">
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition ${type === "danger" ? "bg-red-600 hover:bg-red-500" : "bg-purple-600 hover:bg-purple-500"}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
