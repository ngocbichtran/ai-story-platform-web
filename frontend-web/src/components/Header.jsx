import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logoImage from "../assets/images/logo-white.png";
import { Search, User, LogOut, LockKeyhole, ChevronDown } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
export default function Header({ currentUser, search, setSearch, handleLogout }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        if (value.trim() !== "" && location.pathname !== "/home" && location.pathname !== "/stories") {
            navigate("/stories");
        }
    };

    const navItems = [
        { name: "Trang chủ", path: "/home" },
        { name: "Truyện", path: "/stories" },
    ];

    return (
        <header className="app-header fixed top-0 left-0 right-0 z-50 bg-[#0B1120]/80 backdrop-blur-xl border-b border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
                {/* 1. CỤM TRÁI: LOGO + NAVIGATION */}
                <div className="flex items-center gap-28 shrink-0">
                    {/* LOGO */}
                    <Link to="/home" className="flex items-center gap-2">
                        <img src={logoImage} alt="BaoStory" className="app-header__logo w-14 h-14 object-contain mt-2" />
                        <h1 className="font-bold text-xl text-white tracking-wide">BaoStory</h1>
                    </Link>

                    {/* MENU ĐIỀU HƯỚNG */}
                    <nav className="hidden md:flex items-center gap-6">
                        {navItems.map((item) => {
                            const isActive = location.pathname.startsWith(item.path);

                            return (
                                <Link key={item.path} to={item.path} className={`relative text-sm font-semibold py-5 transition-all duration-300 ${isActive ? "text-white" : "text-slate-400 hover:text-white"}`}>
                                    {item.name}
                                    {/* LINE DƯỚI CHÂN KHI ACTIVE */}
                                    {isActive && <span className="absolute left-0 bottom-0 w-full h-[2px] rounded-full bg-gradient-to-r from-blue-500 to-violet-500 animate-fadeIn" />}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {/* avatar / notification / user... */}
                </div>
                {/* 2. CỤM PHẢI: THANH TÌM KIẾM ĐỒNG BỘ API + THÔNG TIN USER */}
                <div className="flex items-center gap-4 flex-1 justify-end">
                    {/* Ô TÌM KIẾM TỰ ĐỘNG TRIGGER EVENT ĐỒNG BỘ */}
                    <div className="relative w-full max-w-[240px] hidden lg:block focus-within:max-w-[280px] transition-all duration-300">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" placeholder="Tìm truyện..." value={search} onChange={handleSearchChange} className="w-full h-10 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-slate-500 pl-10 pr-4 outline-none focus:border-violet-500 focus:bg-white/10 transition-all duration-300" />
                    </div>

                    {/* USER PROFILE DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button onClick={() => setShowDropdown(!showDropdown)} className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl backdrop-blur-md hover:bg-white/10 transition-all">
                            <User className="w-4 h-4 text-slate-400" />
                            <span className="text-xs font-medium text-slate-200">{currentUser?.username}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
                        </button>

                        {showDropdown && (
                            <div className="absolute right-0 top-12 w-56 rounded-xl border border-white/10 bg-[#0B1120]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                                {/* Khối thông tin User */}
                                <div className="px-4 py-3 border-b border-white/10">
                                    <p className="text-sm font-semibold text-white truncate">{currentUser?.username}</p>
                                    <p className="text-xs text-slate-400 truncate mt-0.5">{currentUser?.email}</p>
                                </div>

                                {/* Menu chức năng: Đăng xuất */}
                                <button
                                    onClick={() => {
                                        setShowDropdown(false);
                                        handleLogout();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 border-t border-white/5 text-sm text-red-400 hover:bg-red-500/10 transition-all text-left font-semibold"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Đăng xuất
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
