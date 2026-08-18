import { useEffect, useState } from "react";

export default function ThemeToggle() {
    const [darkMode, setDarkMode] = useState(() => {
        // Tối là giao diện mặc định; vẫn tôn trọng lựa chọn sáng của người dùng.
        return localStorage.getItem("theme") !== "light";
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
        document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    }, [darkMode]);

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            type="button"
            aria-label={darkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            title={darkMode ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
            className="theme-toggle
                w-10 h-10
                rounded-full

                bg-[#222731]
                text-white
                hover:bg-[#2d333d]

                transition
            "
        >
            <i className={darkMode ? "bi bi-sun-fill" : "bi bi-moon-fill"} />
        </button>
    );
}
