import React, { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";

import Header from "../../../components/Header";

// Import assets hình ảnh theo đúng đường dẫn thư mục src
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

        // TỐI ƯU: Nếu đã có thông tin dữ liệu user cũ rồi thì không cần bật màn hình loading nữa
        if (currentUser) {
            setLoading(false);
        }

        fetchCurrentUser();
    }, []); // Chỉ chạy kiểm tra nghiêm ngặt 1 lần duy nhất khi nạp Layout

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
            // Đảm bảo dù thành công hay thất bại thì luôn luôn tắt Loading để hiện trang
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
            <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center font-['Inter']">
                <div className="flex flex-col items-center gap-3">
                    {/* Tạo vòng xoay loading cho chuyên nghiệp thay vì chữ thô sơ */}
                    <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-400 font-medium tracking-wide">Đang tải hệ thống...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-white relative overflow-hidden font-['Inter']">
            {/* BACKGROUND & OVERLAY TĨNH CỐ ĐỊNH */}
            <div
                className="absolute inset-0 scale-105 pointer-events-none"
                style={{
                    backgroundImage: `url(${backgroundHome})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(2px)",
                }}
            />
            <div className="absolute inset-0 bg-[#0B1120]/60 pointer-events-none" />

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
