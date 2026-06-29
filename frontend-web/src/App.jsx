import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import HomePage from "./features/dashboard/Home";
import CreateStory from "./features/stories/pages/CreateStory.jsx";
import EditStory from "./features/stories/pages/EditStory.jsx";
import DetailStory from "./features/stories/pages/StoryDetail.jsx";
import StoryEditorPage from "./features/stories/pages/StoryEditorPage";
import ChapterEditorPage from "./features/stories/pages/ChapterEditorPage";
import OverviewPage from "./features/stories/pages/OverviewPage";
import StoryList from "./features/stories/pages/StoryList";
import ChangePasswordPage from "./features/dashboard/pages/ChangePasswordPage";
import MainLayout from "./features/dashboard/layouts/MainLayouts.jsx";
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* DEFAULT */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                {/* LOGIN */}
                <Route path="/login" element={<LoginPage />} />
                {/* REGISTER */}
                <Route path="/register" element={<RegisterPage />} />
                {/* FORGOTPASSWORD */}
                <Route path="/forgotPassword" element={<ForgotPasswordPage />} />
                {/* CẤU TRÚC LAYOUT CỐ ĐỊNH*/}
                <Route element={<MainLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/stories" element={<StoryList />} />
                    <Route path="/changePassword" element={<ChangePasswordPage />} />
                </Route>

                {/* Create Story */}
                <Route path="/stories/create" element={<CreateStory />} />
                {/* Edit Story */}
                <Route path="/stories/:storyId/edit" element={<EditStory />} />
                {/* StoryEditorPage */}
                <Route path="/stories/:storyId/editor" element={<StoryEditorPage />}>
                    <Route index element={<Navigate to="overview" replace />} />

                    <Route path="overview" element={<OverviewPage />} />

                    <Route path="chapter/:chapterId" element={<ChapterEditorPage />} />
                </Route>
                {/* Detail Story */}
                <Route path="/stories/detail" element={<DetailStory />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
