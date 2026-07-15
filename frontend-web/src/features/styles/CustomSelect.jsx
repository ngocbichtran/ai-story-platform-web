import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function CustomSelect({ options = [], value, onChange, placeholder = "Chọn...", loading = false, className = "" }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const selected = options.find((item) => item.value === value);

    return (
        <div ref={ref} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="
                    flex
                    items-center
                    justify-between
                    w-full
                    h-12
                    px-4
                    rounded-xl
                    border
                    border-white/10
                    bg-white/5
                    text-white
                    hover:bg-white/10
                    transition
                "
            >
                <span className="truncate">{loading ? "Đang tải..." : selected?.label || placeholder}</span>

                <ChevronDown size={18} className={`transition ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    className="
                        absolute
                        left-0
                        right-0
                        top-14
                        z-50
                        rounded-xl
                        border
                        border-white/10
                        bg-[#111827]
                        shadow-xl
                        overflow-hidden
                    "
                >
                    <div
                        className="
                            max-h-36
                            overflow-y-auto
                            custom-scroll
                        "
                    >
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-slate-400">Không có dữ liệu</div>
                        ) : (
                            options.map((item) => (
                                <button
                                    key={item.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(item.value);
                                        setOpen(false);
                                    }}
                                    className={`
                                        flex
                                        items-center
                                        justify-between
                                        w-full
                                        px-4
                                        py-3
                                        text-left
                                        transition
                                        ${value === item.value ? "bg-violet-600 text-white" : "text-slate-300 hover:bg-white/10"}
                                    `}
                                >
                                    <span className="truncate">{item.label}</span>

                                    {value === item.value && <Check size={16} />}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
