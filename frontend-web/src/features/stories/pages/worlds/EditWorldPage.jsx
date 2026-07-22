import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import WorldForm from "../../components/WorldForm";

export default function EditWorldPage() {
    const { storyId, worldId } = useParams();
    const navigate = useNavigate();

    const [world, setWorld] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWorldDetail = async () => {
            try {
                setLoading(true);

                const token = localStorage.getItem("token");
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const res = await axios.get(`https://api.baostory.fun/api/world/detail/${worldId}`, config);
                if (res.data.success) {
                    setWorld(res.data.data);
                }
            } catch (err) {
                console.error("Lỗi tải chi tiết thế giới:", err);
                toast.error("Không thể tải thông tin bối cảnh thế giới.");
            } finally {
                setLoading(false);
            }
        };

        if (worldId && worldId !== "create") {
            // Tránh trường hợp route "create" bị bắt nhầm thành worldId
            fetchWorldDetail();
        }
    }, [worldId]);

    // 2. HÀM XỬ LÝ CẬP NHẬT (Đặc tả 011_F1)
    const handleUpdateWorld = async (formData) => {
        // Bước 1: Kiểm tra tính hợp lệ của trường title
        if (!formData.title || !formData.title.trim()) {
            toast.error("Tên thế giới không được bỏ trống");
            return;
        }

        try {
            // Bước 2: Gom nhóm toàn bộ thông tin thay đổi vào Request Body
            const payload = {
                title: formData.title.trim(),
                description: formData.description || "",
                history: formData.history || "",
                culture: formData.culture || "",
                geography: formData.geography || [],
                powerSystems: formData.powerSystems || [],
                rules: formData.rules || [],
            };

            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Bước 3: Kích hoạt HTTP PUT Request lên Server
            const res = await axios.put(`https://api.baostory.fun/api/world/${worldId}`, payload, config);

            // Bước 4: Xử lý thành công
            if (res.data.success) {
                toast.success("Cập nhật thế giới thành công");
                // Điều hướng màn hình về danh sách tổng quan bối cảnh
                navigate(`/stories/${storyId}/editor/worlds`);
            }
        } catch (err) {
            // Xử lý thất bại (Catch)
            console.error("Lỗi cập nhật thế giới:", err);
            const errorMsg = err.response?.data?.message || "Cập nhật thất bại";
            toast.error(errorMsg);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#070b14] text-slate-400 gap-2">
                <Loader2 size={28} className="animate-spin text-blue-500" />
                <span>Đang tải dữ liệu thế giới...</span>
            </div>
        );
    }

    return <WorldForm mode="edit" initialData={world} onSubmit={handleUpdateWorld} onCancel={() => navigate(`/stories/${storyId}/editor/maps`)} />;
}
