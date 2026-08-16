import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../../../components/Header";
import backgroundHome from "../../../assets/images/background-home.png";

export default function MainLayouts() {
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState(null);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        if (currentUser) {
            setLoading(false);
        }

        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("https://api.baostory.fun/api/auth/me", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCurrentUser(res.data.user);
        } catch (error) {
            console.error(error);
            localStorage.removeItem("token");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // CHỈ HIỂN THỊ LOADING Ở LẦN ĐẦU TIÊN VÀO APP, KHÔNG HIỂN THỊ KHI CHUYỂN TAB
    if (loading && !currentUser) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center font-['Inter'] transition-colors duration-300">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm app-text-secondary font-medium tracking-wide">Đang tải hệ thống...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app-shell min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative overflow-hidden font-['Inter'] transition-colors duration-300">
            {/* BACKGROUND & OVERLAY */}
            <div
                className="app-shell__background absolute inset-0 scale-105 pointer-events-none opacity-30 dark:opacity-50 transition-opacity"
                style={{
                    backgroundImage: `url(${backgroundHome})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(2px)",
                }}
            />
            {/* HEADER */}
            <Header currentUser={currentUser} search={search} setSearch={setSearch} handleLogout={handleLogout} />

            {/* KHUNG CHỨA NỘI DUNG CHÍNH */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-8">
                <div className="pt-2">
                    <Outlet context={{ search, setSearch, currentUser }} />
                </div>
            </main>
        </div>
    );
}
