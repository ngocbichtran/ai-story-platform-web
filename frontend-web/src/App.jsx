import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import HomePage from "./features/dashboard/Home";
import CreateStory from "./features/stories/pages/CreateStory.jsx";
import StoryEditorPage from "./features/stories/pages/StoryEditorPage";
import StoryList from "./features/stories/pages/StoryList";
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
                {/* CẤU TRÚC LAYOUT CỐ ĐỊNH*/}
                <Route element={<MainLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/stories" element={<StoryList />} />
                </Route>
                {/* Create Story */}
                <Route path="/stories/create" element={<CreateStory />} />
                {/* StoryEditorPage */}
                <Route path="/stories/:storyId/editor" element={<StoryEditorPage />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
