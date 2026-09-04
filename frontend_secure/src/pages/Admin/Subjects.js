import "./Subjects.css";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../../services/api";

function Subjects() {

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            const res = await api.get("/subjects");
            setSubjects(res.data.subjects);
        }
        catch (error) {
            toast.error(getApiErrorMessage(error, "Failed to load subjects"));
        }
        finally {
            setLoading(false);
        }
    };

    const filteredSubjects = subjects.filter((subject) =>
        subject.subjectName
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    const deleteSubject = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this subject? This cannot be undone."
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/subjects/${id}`);
            toast.success("Subject deleted successfully");
            fetchSubjects();
        }
        catch (error) {
            toast.error(getApiErrorMessage(error, "Delete failed"));
        }
    };

    return (
        <div className="admin-subjects">

            <div className="header-actions">

                <input
                    type="text"
                    placeholder="Search Subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search-box"
                />

                <button
                    className="add-btn"
                    onClick={() => navigate("/admin/subjects/add")}
                >
                    + Add Subject
                </button>

            </div>

            {
                loading ? (
                    <h2>Loading...</h2>
                ) : filteredSubjects.length === 0 ? (
                    <div className="empty-state">
                        <p>No subjects found.</p>
                    </div>
                ) : (
                    <div className="subjects-grid">

                        {filteredSubjects.map((subject) => (

                            <div className="subject-card" key={subject._id}>

                                <img
                                    src={subject.thumbnail}
                                    alt={subject.subjectName}
                                    className="subject-image"
                                />

                                <div className="subject-content">

                                    <h2>{subject.subjectName}</h2>
                                    <p>Semester {subject.semester}</p>
                                    <h3>₹ {subject.price}</h3>

                                    <div className="subject-actions">

                                        <button
                                            className="view-btn"
                                            onClick={() =>
                                                navigate(`/admin/subjects/${subject._id}/chapters`)
                                            }
                                        >
                                            View Chapters
                                        </button>

                                        <button
                                            className="edit-btn"
                                            onClick={() =>
                                                navigate(`/admin/subjects/edit/${subject._id}`)
                                            }
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="delete-btn"
                                            onClick={() =>
                                                deleteSubject(subject._id)
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>
                )
            }

        </div>
    );
}

export default Subjects;
