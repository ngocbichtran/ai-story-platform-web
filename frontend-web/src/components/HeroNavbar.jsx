import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function HeroNavbar() {
    const location = useLocation();

    const navItems = [
        {
            name: "Trang chủ",
            path: "/home",
        },
        {
            name: "Truyện",
            path: "/stories",
        },
    ];

    return (
        <div className="flex justify-center mb-6">
            <div className="flex items-center gap-10">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`
                                relative text-sm font-semibold
                                transition-all duration-300
                                
                                ${isActive
                                    ? "text-white"
                                    : "text-slate-400 hover:text-white"
                                }
                            `}
                        >
                            {item.name}

                            {/* ACTIVE LINE */}
                            {isActive && (
                                <span
                                    className="
                                        absolute left-0 -bottom-2
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
            </div>
        </div>
    );
}