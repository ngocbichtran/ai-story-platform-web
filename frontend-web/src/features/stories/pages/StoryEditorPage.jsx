import LeftSidebar from "../components/LeftSidebar";
import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function StoryEditorPage() {
    const [activeTab, setActiveTab] = useState("draft");
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [draftContent, setDraftContent] = useState("");
    const [finalContent, setFinalContent] = useState("");

    const navigate = useNavigate();
    const { storyId } = useParams();
    useEffect(() => {
        if (!selectedChapter) return;

        loadChapter(selectedChapter);
    }, [selectedChapter]);
    const loadChapter = async (chapter) => {
        const res = await fetch(`http://localhost:4000/api/chapters/display-chapter?story_id=${chapter.storyId}&chapter_number=${chapter.chapterNumber}`);

        const result = await res.json();

        if (result.success) {
            setDraftContent(result.data.content || "");
            setFinalContent(result.data.displayContent || "");
        }
    };

    return (
        <div className="bg-[#080d1a] text-[#dae2fd] font-['Inter'] h-screen w-screen overflow-hidden selection:bg-[#a7c8ff]/30 relative flex flex-col p-4 md:p-6">
            <style>{`
                .writing-canvas-scroll::-webkit-scrollbar { width: 6px; }
                .writing-canvas-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.08); border-radius: 10px; }
                .writing-canvas-scroll::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.25); }
                .animate-fadeIn { animation: fadeIn 0.15s ease-out forwards; }
                @keyframes fadeIn { from { opacity: 0; transform: scale(0.995); } to { opacity: 1; transform: scale(1); } }
            `}</style>

            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[140px] pointer-events-none z-0" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[140px] pointer-events-none z-0" />

            <div className="flex-1 w-full grid grid-cols-[20%_80%] gap-4 overflow-hidden relative z-10 bg-[#0B1120]/75 backdrop-blur-lg border border-white/10 rounded-[28px] shadow-2xl p-4">
                <div className="h-full overflow-hidden">
                    <LeftSidebar storyId={storyId} setActiveTab={setActiveTab} setSelectedChapter={setSelectedChapter} />
                </div>

                <section
                    className="
        relative
        flex
        h-full
        overflow-hidden
        border-l
        border-white/5
    "
                >
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <Outlet />
                    </div>
                </section>
            </div>
        </div>
    );
}
