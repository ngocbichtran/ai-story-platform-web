import WorldForm from "../../components/WorldForm";

export default function CreateWorldPage() {
    const emptyWorld = {
        title: "",
        description: "",
        geography: [],
        history: "",
        culture: "",
        powerSystems: [],
        rules: [],
    };

    return <WorldForm mode="create" world={emptyWorld} />;
}
