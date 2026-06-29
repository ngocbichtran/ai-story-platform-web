export default function ChapterEditorPage() {
    const { chapterId } = useParams();
    <section className="h-full flex flex-col min-w-0 border-l border-white/5 relative overflow-hidden">
        <div className="flex-1 overflow-y-auto writing-canvas-scroll bg-black/10 px-4 pt-6 pb-24 flex flex-col rounded-2xl relative">
            <div className="w-full max-w-[1100px] mx-auto flex-1 flex flex-col h-full">
                {/* THANH ĐIỀU HƯỚNG TẬP TRUNG */}
                <div className="flex justify-between items-center gap-4 mb-6 pb-4 border-b border-white/5 flex-none select-none">
                    <div className="flex items-center gap-1 p-1 bg-slate-950/40 border border-white/5 rounded-xl backdrop-blur-sm shadow-inner">
                        {["outline", "draft", "final"].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 ${activeTab === tab ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/10" : "text-slate-400 hover:text-slate-200"}`}>
                                {tab === "outline" ? "Dàn ý" : tab === "draft" ? "Bản nháp" : "Hoàn thiện"}
                            </button>
                        ))}
                    </div>

                    <div className="w-[120px] flex justify-end">
                        {!isRightOpen && (
                            <button onClick={() => setIsRightOpen(true)} className="px-2.5 py-1.5 rounded-xl bg-[#131720] hover:bg-[#1d2433] text-[#a7c8ff] border border-[#1e2633] transition-all duration-200 active:scale-95 shadow-md shadow-black/40 flex items-center gap-1.5 text-xs font-medium animate-fadeIn">
                                <PanelRight size={14} /> <span>Tra cứu</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* NỘI DUNG VÙNG GÕ CHỮ CO GIÃN THÔNG MINH */}
                <div className="flex-1 flex flex-col h-full min-h-0 relative">
                    {/* TAB 1: OUTLINE - CHIA ĐÔI MÀN HÌNH RỘNG RÃI */}
                    {activeTab === "outline" && (
                        <div className="flex-1 grid grid-cols-2 gap-6 animate-fadeIn h-full min-h-0 w-full">
                            {/* NỬA BÊN TRÁI: KHU VỰC GÕ DÀN Ý THÔ */}
                            <div className="flex flex-col gap-2 h-full min-h-0 border-r border-white/5 pr-4">
                                <div className="flex items-center justify-between flex-none select-none min-h-[40px] pb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-[#8b919e]">Mô tả chương</h2>
                                    </div>

                                    {/* NÚT 1: PHÁT TRIỂN Ý TƯỞNG (GỌI N8N AI) */}
                                    <button onClick={handleDevelopIdeas} disabled={isAIThinking} className={`px-0.5 py-0.5 bg-gradient-to-r text-[#f5f7ff] text-xs font-bold rounded-full flex items-center  transition-all shadow-md border border-white/10 active:scale-95 duration-150 ${isAIThinking ? "from-gray-700 to-gray-800 shadow-none cursor-not-allowed" : "from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 shadow-pink-500/10"}`}>
                                        <span className={`material-symbols-outlined text-[14px] ${isAIThinking ? "animate-spin" : ""}`}>{isAIThinking ? "sync" : "lightbulb"}</span>
                                        <span>{isAIThinking ? "" : ""}</span>
                                    </button>
                                </div>
                                <textarea value={outlineContent} onChange={(e) => setOutlineContent(e.target.value)} placeholder="Bắt đầu lập dàn ý cốt truyện của bạn..." className="w-full flex-1 h-full bg-transparent text-[#e0e2eb]/90 font-['Inter'] text-base md:text-[18px] leading-relaxed resize-none border-none focus:ring-0 p-0 placeholder-[#c1c6d5]/20 focus:outline-none overflow-y-auto writing-canvas-scroll pr-1" />
                            </div>

                            {/* NỬA BÊN PHẢI: KẾT QUẢ AI & CHO PHÉP TÁC GIẢ TỰ CHỈNH SỬA */}
                            <div className="flex flex-col gap-2 h-full min-h-0 bg-slate-950/25 rounded-2xl border border-white/5 p-4 relative overflow-hidden">
                                <div className="flex items-center justify-between flex-none select-none border-b border-white/5 pb-2 mb-1 min-h-[40px]">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-sm font-bold uppercase tracking-wider text-pink-400">Dàn ý hoàn thiện</h2>
                                    </div>
                                    {isAIThinking && (
                                        <span className="text-[11px] text-pink-400/80 animate-pulse flex items-center gap-1 font-medium">
                                            <span className="w-1 h-1 rounded-full bg-pink-400 animate-ping" />
                                            BaoStory đang suy nghĩ...
                                        </span>
                                    )}
                                </div>
                                <textarea value={outlineAIResult} onChange={(e) => setOutlineAIResult(e.target.value)} placeholder="Kết quả gợi ý chi tiết từ AI sẽ hiển thị tại đây sau khi bạn bấm nút 'Phát triển ý tưởng' ở khung bên cạnh..." className="w-full flex-1 h-full bg-transparent text-[#c1c6d5] font-['Inter'] text-sm md:text-[15px] leading-relaxed resize-none border-none focus:ring-0 p-0 placeholder-[#c1c6d5]/20 focus:outline-none overflow-y-auto writing-canvas-scroll pr-1" />
                            </div>
                        </div>
                    )}

                    {/* TAB 2: DRAFT */}
                    {/* TAB 2: DRAFT */}
                    {activeTab === "draft" && (
                        <div className="flex-1 flex flex-col gap-2 animate-fadeIn h-full">
                            <h2 className="text-xl font-bold text-[#e0e2eb]/30 select-none flex-none">Draft Manuscript</h2>
                            <textarea
                                value={draftContent}
                                onChange={(e) => setDraftContent(e.target.value)}
                                disabled={isDraftEditing} // KHÓA TEXTAREA KHI AI ĐANG BIÊN TẬP
                                placeholder="Bắt đầu câu chuyện của bạn tại đây..."
                                className={`w-full flex-1 h-full bg-transparent text-[#e0e2eb]/90 font-['Inter'] text-base md:text-[18px] leading-relaxed resize-none border-none focus:ring-0 p-0 placeholder-[#c1c6d5]/20 focus:outline-none overflow-y-auto writing-canvas-scroll pr-1 ${isDraftEditing ? "opacity-50 cursor-not-allowed" : ""}`}
                            />
                        </div>
                    )}

                    {/* TAB 3: FINAL */}
                    {activeTab === "final" && (
                        <div className="flex-1 flex flex-col gap-2 animate-fadeIn h-full">
                            <h2 className="text-xl font-bold text-[#e0e2eb]/30 select-none flex-none">Final Edition</h2>
                            <textarea value={finalContent} onChange={(e) => setFinalContent(e.target.value)} placeholder="Nội dung kiểm tra và kết xuất tác phẩm hoàn chỉnh..." className="w-full flex-1 h-full bg-transparent text-[#e0e2eb]/90 font-['Inter'] text-base md:text-[16px] leading-relaxed resize-none border-none focus:ring-0 p-0 placeholder-[#c1c6d5]/20 focus:outline-none overflow-y-auto writing-canvas-scroll pr-1" />
                        </div>
                    )}
                </div>
            </div>

            {/* CỤM NÚT FLOAT BIÊN TẬP GHIM CỐ ĐỊNH Ở GÓC DƯỚI ĐÁY THEO TAB */}
            <div className="absolute bottom-6 right-8 z-30 select-none">
                {/* NÚT 2: TẠO BẢN NHÁP (TAB OUTLINE - GỌI N8N SỐ 2) */}
                {activeTab === "outline" && (
                    <button onClick={handleCreateDraft} disabled={isCreatingDraft} className={`px-5 py-3 bg-gradient-to-r text-[#f5f7ff] text-xs font-bold rounded-full flex items-center gap-2 transition-all shadow-lg border border-white/10 active:scale-95 duration-150 ${isCreatingDraft ? "from-gray-700 to-gray-800 shadow-none cursor-not-allowed" : "from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 shadow-pink-500/10"}`}>
                        <span className={`material-symbols-outlined text-[16px] ${isCreatingDraft ? "animate-spin" : ""}`}>{isCreatingDraft ? "sync" : "assignment_turned_in"}</span>
                        <span>{isCreatingDraft ? "Đang xử lý..." : "Tạo bản nháp"}</span>
                    </button>
                )}

                {/* NÚT 3: BIÊN TẬP CÙNG BAOSTORY (TAB DRAFT - GỌI N8N SỐ 3) */}
                {activeTab === "draft" && (
                    <button onClick={handleDraftEdit} disabled={isDraftEditing} className={`px-5 py-3 bg-gradient-to-r text-[#f5f7ff] text-xs font-bold rounded-full flex items-center gap-2 transition-all shadow-lg border border-white/10 active:scale-95 duration-150 ${isDraftEditing ? "from-gray-700 to-gray-800 shadow-none cursor-not-allowed" : "from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-blue-500/20"}`}>
                        <span className={`material-symbols-outlined text-[16px] ${isDraftEditing ? "animate-spin" : ""}`}>{isDraftEditing ? "sync" : "auto_awesome"}</span>
                        <span>{isDraftEditing ? "Đang biên tập..." : "Biên tập cùng BaoStory"}</span>
                    </button>
                )}

                {/* NÚT 4: Lưu */}
                {activeTab === "final" && (
                    <button onClick={handleFinalPublish} disabled={isFinalizing} className={`px-5 py-3 bg-gradient-to-r text-[#f5f7ff] text-xs font-bold rounded-full flex items-center gap-2 transition-all shadow-lg border border-white/10 active:scale-95 duration-150 ${isFinalizing ? "from-gray-700 to-gray-800 shadow-none cursor-not-allowed" : "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/10"}`}>
                        <span className={`material-symbols-outlined text-[16px] ${isFinalizing ? "animate-spin" : ""}`}>{isFinalizing ? "sync" : "rocket_launch"}</span>
                        <span>{isFinalizing ? "Đang lưu..." : "Lưu"}</span>
                    </button>
                )}
            </div>

            {/* BẢNG TRA CỨU DI ĐỘNG NỔI LÊN TRÊN */}
            <RightSidebar isOpen={isRightOpen} setIsOpen={setIsRightOpen} />
        </div>
    </section>;
}
