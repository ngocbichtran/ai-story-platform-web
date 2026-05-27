import React from "react";
import { Link } from "react-router-dom";

import logoImage from "../assets/images/logo-white.png";

import {
    Search,
    LogOut,
    User,
} from "lucide-react";

export default function Header({
    currentUser,
    search,
    setSearch,
    handleLogout,
}) {
    return (
        <header
            className="
        fixed top-0 left-0 right-0
        z-50
        bg-[#0B1120]/60
        backdrop-blur-xl
        border-b border-white/10
    "
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">

                {/* LOGO */}
                <Link
                    to="/home"
                    className="flex items-center gap-2 shrink-0"
                >
                    <img
                        src={logoImage}
                        alt="BaoStory"
                        className="w-14 h-14 object-contain mt-2"
                    />

                    <h1 className="font-bold text-xl text-white">
                        BaoStory
                    </h1>
                </Link>

                {/* SEARCH */}
                <div className="relative flex-1 max-w-3xl hidden lg:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                    <input
                        type="text"
                        placeholder="Tìm truyện..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="
                            w-full h-12 rounded-2xl
                            border border-white/10
                            bg-white/5
                            text-white
                            placeholder:text-slate-400
                            pl-11 pr-4
                            outline-none
                            focus:border-violet-500
                            transition-all duration-300
                        "
                    />
                </div>

                {/* USER */}
                <div className="flex items-center gap-3 shrink-0">

                    <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl backdrop-blur-md">
                        <User className="w-4 h-4 text-slate-400" />

                        <span className="text-sm font-medium text-slate-200">
                            {currentUser?.username}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="
                            h-11 px-4 rounded-xl
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

                        <span className="hidden sm:block text-sm font-medium">
                            Đăng xuất
                        </span>
                    </button>
                </div>
            </div>
        </header>
    );
}