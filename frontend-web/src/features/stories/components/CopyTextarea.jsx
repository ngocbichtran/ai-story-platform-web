import { Copy, Check } from "lucide-react";

export default function CopyTextarea({ value, placeholder, copyKey, copied, onCopy }) {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => onCopy(copyKey, value)}
                className="
                    absolute
                    top-3
                    right-3
                    z-10
                    flex
                    items-center
                    justify-center
                    w-9
                    h-9
                    rounded-lg
                    border
                    border-white/10
                    bg-black/40
                    text-slate-400
                    transition-all
                    hover:bg-violet-600
                    hover:text-white
                "
            >
                {copied === copyKey ? <Check size={18} /> : <Copy size={18} />}
            </button>

            <textarea
                readOnly
                value={value}
                placeholder={placeholder}
                className="
                    h-40
                    w-full
                    resize-none
                    rounded-2xl
                    border
                    border-white/10
                    bg-white/5
                    p-4
                    pr-16
                    text-white
                    placeholder:text-slate-500
                    custom-scroll
                    outline-none
                "
            />
        </div>
    );
}
