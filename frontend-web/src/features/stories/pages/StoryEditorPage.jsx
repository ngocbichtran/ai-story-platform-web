import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import React, { useState, useEffect } from "react";
import { ArrowLeft, PanelRight } from "lucide-react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

export default function StoryEditorPage() {
    const [activeTab, setActiveTab] = useState("draft");
    const [isRightOpen, setIsRightOpen] = useState(false);
    const [selectedChapter, setSelectedChapter] = useState(null);
    // Quản lý trạng thái loading riêng biệt cho từng nút/n8n nhằm tối ưu UX
    const [isAIThinking, setIsAIThinking] = useState(false); // Cho n8n Phát triển ý tưởng
    const [isCreatingDraft, setIsCreatingDraft] = useState(false); // Cho n8n Tạo bản nháp
    const [isDraftEditing, setIsDraftEditing] = useState(false); // Cho n8n Biên tập cùng BaoStory
    const [isFinalizing, setIsFinalizing] = useState(false); // Cho n8n Hoàn thiện (nếu có sau này)
    const [outlineContent, setOutlineContent] = useState("");
    const [draftContent, setDraftContent] = useState("");
    const [finalContent, setFinalContent] = useState("");
    const [outlineAIResult, setOutlineAIResult] = useState("");
    const navigate = useNavigate();
    const { storyId } = useParams();
    useEffect(() => {
        if (!selectedChapter) return;

        loadChapter(selectedChapter);
    }, [selectedChapter]);
    const loadChapter = async (chapter) => {
        const res = await fetch(`https://api.baostory.fun/api/chapters/display-chapter?story_id=${chapter.story_id}&chapter_number=${chapter.chapter_number}`);

        const result = await res.json();

        console.log("Chapter Data:", result);

        if (result.success) {
            setDraftContent(result.data.content || "");
            setFinalContent(result.data.displayContent || "");
        } else {
            setDraftContent("");
            setFinalContent("");
        }
    };
    // =========================================================================
    // N8N LỒNG 1: DÀNH RIÊNG CHO NÚT "PHÁT TRIỂN Ý TƯỞNG" (GỌI AI PHÂN TÍCH)
    // =========================================================================
    const handleDevelopIdeas = async () => {
        setIsAIThinking(true);
        const N8N_DEVELOP_IDEAS_URL = "https://your-n8n-instance.com/webhook/baostory-ai-develop";

        try {
            const response = await fetch(N8N_DEVELOP_IDEAS_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chapterTitle: "Chapter 12: The Forgotten Road",
                    action: "develop_ideas",
                    rawOutline: outlineContent,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setOutlineAIResult(data.aiSuggestion || data.content || "Đã phân tích xong dữ liệu dàn ý!");
            } else {
                alert("Không thể kết nối với AI Phát triển ý tưởng. Hãy kiểm tra lại n8n.");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối máy chủ n8n (Phát triển ý tưởng).");
        } finally {
            setIsAIThinking(false);
        }
    };

    // =========================================================================
    // N8N LỒNG 2: DÀNH RIÊNG CHO NÚT "TẠO BẢN NHÁP" (ĐÓNG GÓI DÀN Ý SANG BẢN NHÁP)
    // =========================================================================
    const handleCreateDraft = async () => {
        setIsCreatingDraft(true);
        const N8N_CREATE_DRAFT_URL = "https://your-n8n-instance.com/webhook/baostory-create-draft";

        try {
            const response = await fetch(N8N_CREATE_DRAFT_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chapterTitle: "Chapter 12: The Forgotten Road",
                    action: "generate_initial_draft",
                    userOutline: outlineContent,
                    aiOutlineApproved: outlineAIResult,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                alert("Đã gửi dữ liệu qua n8n [Tạo bản nháp] thành công!");
            } else {
                alert("Gửi dữ liệu Tạo bản nháp thất bại. Hãy kiểm tra n8n.");
            }
        } catch (error) {
            console.error(error);
            alert("Lỗi kết nối máy chủ n8n (Tạo bản nháp).");
        } finally {
            setIsCreatingDraft(false);
        }
    };

    // =========================================================================
    // N8N 3: DÀNH RIÊNG CHO NÚT "BIÊN TẬP CÙNG BAOSTORY" (XỬ LÝ VĂN BẢN TRONG TAB DRAFT)
    // =========================================================================
    const handleDraftEdit = async () => {
        if (!selectedChapter) {
            toast.error("Vui lòng chọn chương");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            toast.error("Bạn chưa đăng nhập hoặc token không tồn tại");
            return;
        }

        if (!draftContent.trim()) {
            toast.error("Nội dung bản nháp trống, không thể biên tập!");
            return;
        }

        const chapterSnapshot = { ...selectedChapter };
        const currentStoryId = chapterSnapshot.story_id;
        const currentChapterNumber = chapterSnapshot.chapter_number;
        const chapterId = chapterSnapshot.id;

        setIsDraftEditing(true);

        try {
            const response = await fetch(`https://api.baostory.fun/api/chapters/${chapterId}/spell-check`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    story_id: currentStoryId,
                    chapter_number: currentChapterNumber,
                    content: draftContent,
                }),
            });

            let result;

            try {
                result = await response.json();
            } catch {
                throw new Error("Backend trả về dữ liệu không hợp lệ.");
            }

            console.log("Spell Check Result:", result);

            if (!response.ok) {
                throw new Error(result.message || "Không thể kích hoạt tiến trình biên tập.");
            }

            // Chờ n8n xử lý xong rồi tải lại chương
            setTimeout(async () => {
                try {
                    await loadChapter(chapterSnapshot);
                    setActiveTab("final");

                    toast.success("Biên tập thành công");
                } catch (err) {
                    console.error("Lỗi khi tải lại chương:", err);
                    toast.error("Đã gửi yêu cầu nhưng không thể tải lại dữ liệu.");
                } finally {
                    setIsDraftEditing(false);
                }
            }, 500);
        } catch (error) {
            console.error(error);
            toast.error(error.message || "Có lỗi xảy ra.");
            setIsDraftEditing(false);
        }
    };

    // HÀM PHỤ TRỢ: Xử lý nút xuất bản ở tab Final (giữ cấu trúc đồng bộ)
    const handleFinalPublish = async () => {
        setIsFinalizing(true);
        try {
            // Giữ nguyên logic xử lý final cũ của bạn hoặc thêm URL n8n thứ 4 nếu cần
            alert("Đã kích hoạt luồng xuất bản ấn phẩm hoàn thiện!");
        } finally {
            setIsFinalizing(false);
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

                {/* CENTER - Middle */}
                <section className="h-full border-l border-white/5 relative overflow-hidden">
                    <Outlet />

                    <RightSidebar isOpen={isRightOpen} setIsOpen={setIsRightOpen} />
                </section>
            </div>
        </div>
    );
}
