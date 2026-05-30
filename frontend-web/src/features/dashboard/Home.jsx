import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import HeroNavbar from "../../components/HeroNavbar";
import Header from "../../components/Header";

import backgroundHome from "../../assets/images/background-home.png";
import banner from "../../assets/images/banner.png";

import { Plus } from "lucide-react";

export default function HomePage() {
    const navigate = useNavigate();

    const [stories, setStories] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login");
            return;
        }

        fetchCurrentUser();
        fetchStories();
    }, []);

    // GET CURRENT USER
    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem("token");

            const res = await axios.get(
                "http://api.baostory.fun/api/auth/me",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCurrentUser(res.data.user);
        } catch (error) {
            console.error(error);

            localStorage.removeItem("token");

            navigate("/login");
        }
    };

    // MOCK STORIES
    const fetchStories = async () => {
        setStories([
            {
                id: 1,
                title: "Hành Trình Bánh Bao",
                author: "Ngọc Bích",
                summary:
                    "Một thế giới giả tưởng nơi những người kể chuyện có thể tạo nên sinh vật bằng trí tưởng tượng.",
                coverUrl:
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1200&auto=format&fit=crop",
            },

            {
                id: 2,
                title: "Khu Rừng Ký Ức",
                author: "BaoStory",
                summary:
                    "Nơi ký ức có thể biến thành quái vật và người kể chuyện là người duy nhất cứu lấy thế giới.",
                coverUrl:
                    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop",
            },
        ]);
    };

    // LOGOUT
    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // FILTER STORIES
    const filteredStories = stories.filter((story) => {
        return (
            story.title?.toLowerCase().includes(search.toLowerCase()) ||
            story.author?.toLowerCase().includes(search.toLowerCase())
        );
    });

    return (
        <div className="min-h-screen bg-[#0B1120] text-white relative overflow-hidden">
            {/* BACKGROUND */}
            <div
                className="absolute inset-0 scale-105"
                style={{
                    backgroundImage: `url(${backgroundHome})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "blur(2px)",
                }}
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-[#0B1120]/60" />

            {/* HEADER */}
            <Header
                currentUser={currentUser}
                search={search}
                setSearch={setSearch}
                handleLogout={handleLogout}
            />

            {/* MAIN */}
            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-8">
                {/* NAVBAR */}
                <HeroNavbar />

                {/* HERO */}
                <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl mb-4 animate-fadeIn">
                    {/* BANNER */}
                    <img
                        src={banner}
                        alt=""
                        className="w-full h-[420px] object-cover opacity-90 hover:scale-[1.02] transition-transform duration-[4000ms]"
                    />

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/90 to-transparent" />

                    {/* CONTENT */}
                    <div className="absolute inset-0 flex items-center px-10">
                        <div className="max-w-2xl">
                            <h2 className="text-5xl font-black leading-tight mb-5 animate-slideUp">
                                Có những thế giới chỉ tồn tại khi bạn bắt đầu viết.
                            </h2>

                            <p className="text-slate-300 text-lg leading-relaxed mb-8 animate-slideUpDelay">
                                Người kể chuyện xứng đáng có một người đồng hành.
                            </p>

                            <Link
                                to="/generate"
                                className="inline-flex items-center gap-2 h-12 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-105 text-white font-semibold shadow-2xl transition-all duration-300"
                            >
                                <Plus className="w-4 h-4" />
                                Tạo truyện mới
                            </Link>
                        </div>
                    </div>
                </section>

                {/* AUTHORS */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-full h-[1px] bg-white/10" />

                    <div className="relative z-10 px-5 py-1 bg-[#0B1120] text-center">
                        <p className="text-slate-500 text-[8px] tracking-[0.25em] uppercase mb-[2px]">
                            Create By
                        </p>

                        <h3 className="text-white text-sm font-medium tracking-wide">
                            Trần Ngọc Bích
                            <span className="mx-2 text-violet-400 text-[10px]">
                                ✦
                            </span>
                            Nguyễn Trí Hào
                        </h3>
                    </div>
                </div>

                {/* SECTION TITLE */}
                <div className="flex items-end justify-between mb-4">
                    <h2 className="text-3xl font-black text-white">
                        Kho truyện
                    </h2>

                    <p className="text-slate-400 text-sm">
                        {filteredStories.length} truyện
                    </p>
                </div>

                {/* STORIES */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStories.map((story) => (
                        <div
                            key={story.id}
                            className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden hover:border-violet-500/40 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300"
                        >
                            {/* IMAGE */}
                            <div className="aspect-[16/10] overflow-hidden">
                                <img
                                    src={story.coverUrl}
                                    alt={story.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            </div>

                            {/* CONTENT */}
                            <div className="p-5">
                                <h3 className="text-xl font-bold mb-2">
                                    {story.title}
                                </h3>

                                <p className="text-sm text-slate-400 mb-3">
                                    {story.author}
                                </p>

                                <p className="text-sm text-slate-300 mb-5 line-clamp-3">
                                    {story.summary}
                                </p>

                                <Link
                                    to={`/workspace/${story.id}`}
                                    className="inline-flex items-center justify-center h-11 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:scale-105 text-white font-semibold transition-all duration-300"
                                >
                                    Viết tiếp
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}