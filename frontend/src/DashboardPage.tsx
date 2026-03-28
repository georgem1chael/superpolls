import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import type { Survey } from "./types";
import { getSurveys, createSurvey, getCurrentUser, deleteSurvey, BACKEND_URL } from "./api";
import { AuthContext } from "./AuthContext";

interface NewSurveyForm {
    title: string;
    description: string;
    timeslots: string[];
}

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [currentUserName, setCurrentUserName] = useState<string>("");
    const [newSurvey, setNewSurvey] = useState<NewSurveyForm>({
        title: "",
        description: "",
        timeslots: [""],
    });
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const userData = await getCurrentUser();
                setCurrentUserName(userData.name);
                const surveys = await getSurveys();
                setSurveys(surveys);
            } catch (error) {
                navigate("/login");
            }
        };
        fetchData();
    }, [navigate]);

    const handleCreateSurvey = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const timeslots = newSurvey.timeslots
                .filter((t) => t.trim())
                .map((day) => ({
                    slot_id: day.toLowerCase().replace(/\s+/g, "_"),
                    day: day.trim(),
                }));

            const survey = await createSurvey(
                newSurvey.title,
                newSurvey.description,
                [currentUserName],
                timeslots,
            );
            setSurveys([...surveys, survey]);
            setNewSurvey({ title: "", description: "", timeslots: [""] });
            setShowCreateForm(false);
        } catch (error) {
            alert("Failed to create survey");
        }
    };

    const handleDeleteSurvey = async (id: number) => {
        try {
            await deleteSurvey(id);
            setSurveys(surveys.filter((survey) => survey.id !== id));
        } catch (error) {
            alert("Failed to delete survey");
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${BACKEND_URL}/users/logout`, {
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout error:", error);
        }
        window.location.href = "/login";
    };

    return (
        <div className="wrapper">
            <div className="dashboard">
                <header className="dashboard-header">
                    <h1>SuperPolls Dashboard</h1>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                        }}
                    >
                        <span style={{ fontSize: "0.9rem", color: "#666" }}>
                            Logged in as: <strong>{currentUserName}</strong>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="btn btn-secondary"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                <div className="dashboard-content">
                    <div className="surveys-section">
                        <div className="section-header">
                            <h2>My Surveys</h2>
                            <button
                                onClick={() => {
                                    setNewSurvey({
                                        title: "",
                                        description: "",
                                        timeslots: [""],
                                    });
                                    setShowCreateForm(true);
                                }}
                                className="btn btn-primary"
                            >
                                Create New Survey
                            </button>
                        </div>

                        {showCreateForm && (
                            <div className="modal-overlay">
                                <form
                                    onSubmit={handleCreateSurvey}
                                    className="create-form"
                                >
                                    <h3>Create New Survey</h3>
                                    <div className="form-group">
                                        <label>Title*</label>
                                        <input
                                            type="text"
                                            value={newSurvey.title}
                                            onChange={(e) =>
                                                setNewSurvey({
                                                    ...newSurvey,
                                                    title: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <textarea
                                            value={newSurvey.description}
                                            onChange={(e) =>
                                                setNewSurvey({
                                                    ...newSurvey,
                                                    description: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Time Slots</label>
                                        {newSurvey.timeslots.map(
                                            (timeslot, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: "flex",
                                                        gap: "0.5rem",
                                                        marginBottom: "0.5rem",
                                                    }}
                                                >
                                                    <input
                                                        type="text"
                                                        placeholder="Day/Time (e.g., Friday 3pm)"
                                                        value={timeslot}
                                                        onChange={(e) => {
                                                            const updated = [
                                                                ...newSurvey.timeslots,
                                                            ];
                                                            updated[index] =
                                                                e.target.value;
                                                            setNewSurvey({
                                                                ...newSurvey,
                                                                timeslots:
                                                                    updated,
                                                            });
                                                        }}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const updated =
                                                                newSurvey.timeslots.filter(
                                                                    (_, i) =>
                                                                        i !==
                                                                        index,
                                                                );
                                                            setNewSurvey({
                                                                ...newSurvey,
                                                                timeslots:
                                                                    updated,
                                                            });
                                                        }}
                                                        className="btn btn-danger btn-small"
                                                        disabled={
                                                            newSurvey.timeslots
                                                                .length === 1
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ),
                                        )}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setNewSurvey({
                                                    ...newSurvey,
                                                    timeslots: [
                                                        ...newSurvey.timeslots,
                                                        "",
                                                    ],
                                                })
                                            }
                                            className="btn btn-secondary btn-small"
                                        >
                                            Add Time Slot
                                        </button>
                                    </div>

                                    <div className="form-actions">
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            Create
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowCreateForm(false);
                                                setNewSurvey({
                                                    title: "",
                                                    description: "",
                                                    timeslots: [""],
                                                });
                                            }}
                                            className="btn btn-secondary"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="surveys-grid">
                            {surveys.map((survey) => (
                                <div key={survey.id} className="survey-card">
                                    <h3>{survey.title}</h3>
                                    {survey.description && (
                                        <p>{survey.description}</p>
                                    )}
                                    <div className="survey-actions">
                                        <Link
                                            to={`/survey/${survey.id}`}
                                            className="btn btn-primary btn-small"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            View Survey
                                        </Link>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const surveyUrl = `${window.location.origin}/survey/${survey.id}`;
                                                navigator.clipboard.writeText(surveyUrl);
                                                const btn = e.currentTarget;
                                                const originalText = btn.textContent;
                                                btn.textContent = 'Copied!';
                                                setTimeout(() => {
                                                    btn.textContent = originalText;
                                                }, 2000);
                                            }}
                                            className="btn btn-secondary btn-small"
                                        >
                                            Copy URL
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteSurvey(survey.id);
                                            }}
                                            className="btn btn-danger btn-small"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
