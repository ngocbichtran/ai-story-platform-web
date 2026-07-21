import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// auth
import LoginPage from "./features/auth/pages/LoginPage";
import RegisterPage from "./features/auth/pages/RegisterPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ChangePasswordPage from "./features/dashboard/pages/ChangePasswordPage";

// Khung main
import HomePage from "./features/dashboard/Home";
import MainLayout from "./features/dashboard/layouts/MainLayouts";

// Stories
import StoryEditorPage from "./features/stories/pages/StoryEditorPage"; // Layout chính của Editor
import OverviewPage from "./features/stories/pages/OverviewPage";
import StoryList from "./features/stories/pages/StoryList";
import CreateStory from "./features/stories/pages/CreateStory";
import EditStory from "./features/stories/pages/EditStory";

// Chapters
import ChapterEditorPage from "./features/stories/pages/chapters/ChapterEditorPage";
import ChapterDetail from "./features/stories/pages/chapters/ChapterDetail";

// Worlds
import WorldListPage from "./features/stories/pages/worlds/WorldListPage";
import EditWorldPage from "./features/stories/pages/worlds/EditWorldPage";
import CreateWorldPage from "./features/stories/pages/worlds/CreateWorldPage";
import DetailWorldPage from "./features/stories/pages/worlds/DetailWorldPage";

// Characters
import CharacterListPage from "./features/stories/pages/characters/CharacterListPage";
import CreateCharacterPage from "./features/stories/pages/characters/CreateCharacterPage";
import CharacterDetailPage from "./features/stories/pages/characters/CharacterDetailPage";
import EditCharacterPage from "./features/stories/pages/characters/EditCharacterPage";

// Plots
import PlotList from "./features/stories/pages/plots/PlotList";

// Plans
import ChapterSceneManager from "./features/stories/pages/plans/PlanDetail";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Default */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgotPassword" element={<ForgotPasswordPage />} />

                {/* Dashboard */}
                <Route element={<MainLayout />}>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/stories" element={<StoryList />} />
                    <Route path="/changePassword" element={<ChangePasswordPage />} />
                </Route>

                {/* Story Editor (Chứa Outlet / Sidebar bên trái) */}
                <Route path="/stories/:storyId/editor" element={<StoryEditorPage />}>
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<OverviewPage />} />
                    <Route path="worlds" element={<WorldListPage />} />
                    <Route path="characters" element={<CharacterListPage />} />
                    <Route path="plot" element={<PlotList />} />

                    {/*ROUTE XEM CHI TIẾT CHƯƠNG (Nằm trong Layout Sidebar Editor) */}
                    <Route path="chapter/:chapterNumber" element={<ChapterDetail />} />
                </Route>

                {/* Story */}
                <Route path="/stories/create" element={<CreateStory />} />
                <Route path="/stories/:storyId/edit" element={<EditStory />} />

                {/* Worlds */}
                <Route path="/stories/:storyId/worlds/create" element={<CreateWorldPage />} />
                <Route path="/stories/:storyId/editor/worlds/:worldId" element={<DetailWorldPage />} />
                <Route path="/stories/:storyId/editor/worlds/:worldId/edit" element={<EditWorldPage />} />

                {/* Characters */}
                <Route path="/stories/:storyId/editor/characters/:characterId" element={<CharacterDetailPage />} />
                <Route path="/stories/:storyId/editor/characters/create" element={<CreateCharacterPage />} />
                <Route path="/stories/:storyId/editor/characters/edit/:characterId" element={<EditCharacterPage />} />

                {/* Plans */}
                <Route path="/stories/:storyId/editor/plan" element={<ChapterSceneManager />} />

                {/* Chapters */}
                {/* ROUTE CHỈNH SỬA CHƯƠNG (Trang soạn thảo Full Screen) */}
                <Route path="/stories/:storyId/editor/chapter/:chapterNumber/edit" element={<ChapterEditorPage />} />

                {/* ROUTE XEM CHI TIẾT CHƯƠNG */}
                <Route path="/stories/:storyId/chapters/:chapterNumber/detail" element={<ChapterDetail />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
