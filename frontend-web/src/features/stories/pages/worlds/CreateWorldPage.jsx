import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import WorldForm from "../../components/WorldForm.jsx";

export default function CreateWorldPage() {
    const { storyId } = useParams();
    const navigate = useNavigate();

    const handleFormSubmit = async (formData) => {
        try {
            const token = localStorage.getItem("token");
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                storyId: Number(storyId),
                ...formData,
            };

            const res = await axios.post("https://api.baostory.fun/api/world", payload, config);

            if (res.data.success) {
                toast.success("Khởi tạo thế giới mới thành công");
                navigate(`/stories/${storyId}/editor/worlds`);
            }
        } catch (err) {
            console.error("Lỗi tạo thế giới:", err);
            toast.error(err.response?.data?.message || "Không thể lưu dữ liệu thế giới.");
        }
    };

    return <WorldForm mode="create" onSubmit={handleFormSubmit} />;
}
