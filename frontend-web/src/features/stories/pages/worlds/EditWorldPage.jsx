import { useParams, useNavigate } from "react-router-dom";
import WorldForm from "../../components/WorldForm";

export default function EditWorldPage() {
    const { storyId, worldId } = useParams();
    const navigate = useNavigate();

    // Lấy dữ liệu từ API hoặc state
    const world = {
        title: "Đại lục Thiên Huyền",
        description: "Đại lục Thiên Huyền là một đại lục",
        history: "Đại lục Thiên Huyền là một đại lục",
        culture: "Đại lục Thiên Huyền là một đại lục",
        geography: ["Bắc Cảnh", "Nam Hải"],
        powerSystems: [
            {
                name: "Ma pháp",
                description: "Sử dụng ma lực...",
            },
        ],
        rules: ["Mỗi người chỉ có một hệ"],
    };

    const handleEdit = async (data) => {
        console.log(data);

        // await worldApi.update(worldId, data);

        navigate(`/stories/${storyId}/worlds/${worldId}`);
    };

    return <WorldForm mode="edit" initialData={world} onSubmit={handleEdit} onCancel={() => navigate("/stories/storyId/editor/worlds/worldId")} />;
}
