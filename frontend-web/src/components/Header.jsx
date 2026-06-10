import React from "react";
import { Link, useLocation } from "react-router-dom";
import logoImage from "../assets/images/logo-white.png";
import { Search, LogOut, User } from "lucide-react";

export default function Header({ currentUser, search, setSearch, handleLogout }) {
    const location = useLocation();

    // Cụm Menu điều hướng từ HeroNavbar chuyển qua
    const navItems = [
        { name: "Trang chủ", path: "/home" },
        { name: "Truyện", path: "/stories" },
    ];

    return (
        <header
            className="
                fixed top-0 left-0 right-0
                z-50
                bg-[#0B1120]/80
                backdrop-blur-xl
                border-b border-white/10
            "
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
                {/* 1. CỤM TRÁI: LOGO + HERONAVBAR CÙNG HÀNG */}
                <div className="flex items-center gap-28 shrink-0">
                    {/* LOGO */}
                    <Link to="/home" className="flex items-center gap-2">
                        <img src={logoImage} alt="BaoStory" className="w-14 h-14 object-contain mt-2" />
                        <h1 className="font-bold text-xl text-white tracking-wide">BaoStory</h1>
                    </Link>

                    {/* MENU ĐIỀU HƯỚNG*/}
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                                        relative text-sm font-semibold py-5 transition-all duration-300
                                        ${isActive ? "text-white" : "text-slate-400 hover:text-white"}
                                    `}
                                >
                                    {item.name}

                                    {/* LINE DƯỚI CHÂN KHI ACTIVE */}
                                    {isActive && (
                                        <span
                                            className="
                                                absolute left-0 bottom-0
                                                w-full h-[2px]
                                                rounded-full
                                                bg-gradient-to-r
                                                from-blue-500 to-violet-500
                                            "
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* 2. CỤM PHẢI: THANH TÌM KIẾM THU NHỎ + THÔNG TIN USER */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                    {/* SEARCH - Đã bóp nhỏ kích thước lại (max-w-[240px] hoặc tùy bạn chỉnh) */}
                    <div className="relative w-full max-w-[240px] hidden lg:block focus-within:max-w-[280px] transition-all duration-300">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm truyện..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                                w-full h-10 rounded-xl
                                border border-white/10
                                bg-white/5
                                text-sm text-white
                                placeholder:text-slate-500
                                pl-10 pr-4
                                outline-none
                                focus:border-violet-500 focus:bg-white/10
                                transition-all duration-300
                            "
                        />
                    </div>

                    {/* USER INFO */}
                    <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-medium text-slate-200">{currentUser?.username}</span>
                    </div>

                    {/* NÚT ĐĂNG XUẤT */}
                    <button
                        onClick={handleLogout}
                        className="
                            h-10 px-3.5 rounded-xl
                            border border-white/10
                            bg-white/5
                            text-slate-300
                            hover:bg-red-500/10
                            hover:text-red-400
                            transition-all duration-300
                            flex items-center gap-2
                        "
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:block text-xs font-medium">Đăng xuất</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
