import Header from "../components/write/Header";
import LeftSidebar from "../components/write/LeftSidebar";
import Editor from "../components/write/Editor";
import RightSidebar from "../components/write/RightSidebar";
import AIAssistant from "../components/write/AIAssistant";

export default function WriteStory() {
    return (
        <div className="bg-background text-on-surface h-screen overflow-hidden">
            <Header />

            <main className="pt-16 h-full flex overflow-hidden">
                <LeftSidebar />

                <section className="flex-1 ml-[280px] mr-[320px] h-full flex flex-col relative">
                    <Editor />
                </section>

                <RightSidebar />

                <AIAssistant />
            </main>
        </div>
    );
}