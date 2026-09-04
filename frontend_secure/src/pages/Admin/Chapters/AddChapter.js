import "./AddChapter.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";

function AddChapter() {

    const navigate = useNavigate();

    const [subjects, setSubjects] = useState([]);

    const [formData, setFormData] = useState({
        chapterName: "",
        chapterNumber: "",
        description: "",
        subjectId: "",
        isPublished: true
    });

    const [loading, setLoading] = useState(false);
    const [subjectsLoading, setSubjectsLoading] = useState(true);

    // =========================
    // FETCH SUBJECTS
    // =========================

    useEffect(() => {

        fetchSubjects();

    }, []);

    const fetchSubjects = async () => {

        try {

            const res = await api.get("/subjects");

            setSubjects(res.data.subjects || []);

        }
        catch (error) {

            console.log("Fetch Subjects Error:", error);

            toast.error("Unable to load subjects");

        }
        finally {

            setSubjectsLoading(false);

        }

    };

    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));

    };

    // =========================
    // CREATE CHAPTER
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!formData.chapterName.trim()) {

            toast.error("Please enter chapter name");
            return;

        }

        if (!formData.chapterNumber || Number(formData.chapterNumber) < 1) {

            toast.error("Please enter a valid chapter number");
            return;

        }

        if (!formData.subjectId) {

            toast.error("Please select a subject");
            return;

        }

        try {

            setLoading(true);

            await api.post("/chapters", {
                chapterName: formData.chapterName.trim(),
                chapterNumber: Number(formData.chapterNumber),
                description: formData.description.trim(),
                subjectId: formData.subjectId,
                isPublished: formData.isPublished
            });

            toast.success("Chapter created successfully");

            navigate(
                `/admin/subjects/${formData.subjectId}/chapters`
            );

        }
        catch (error) {
            console.log("CREATE CHAPTER ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to create chapter"
            );
        }
        finally {

            setLoading(false);

        }

    };

    return (

        <div className="add-chapter-page">

            <div className="add-chapter-card">

                <div className="page-header">

                    <div>

                        <h1>📖 Add Chapter</h1>

                        <p>
                            Create a new chapter for a subject.
                        </p>

                    </div>

                </div>

                <form onSubmit={handleSubmit}>

                    {/* SUBJECT */}

                    <div className="form-group">

                        <label>
                            Subject <span>*</span>
                        </label>

                        <select
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleChange}
                            disabled={subjectsLoading}
                        >

                            <option value="">
                                {subjectsLoading
                                    ? "Loading subjects..."
                                    : "Select Subject"
                                }
                            </option>

                            {subjects.map((subject) => (

                                <option
                                    key={subject._id}
                                    value={subject._id}
                                >

                                    {subject.subjectName}
                                    {" "}— Semester {subject.semester}

                                </option>

                            ))}

                        </select>

                    </div>

                    {/* CHAPTER NUMBER */}

                    <div className="form-group">

                        <label>
                            Chapter Number <span>*</span>
                        </label>

                        <input
                            type="number"
                            name="chapterNumber"
                            value={formData.chapterNumber}
                            onChange={handleChange}
                            min="1"
                            placeholder="Enter chapter number"
                        />

                    </div>

                    {/* CHAPTER NAME */}

                    <div className="form-group">

                        <label>
                            Chapter Name <span>*</span>
                        </label>

                        <input
                            type="text"
                            name="chapterName"
                            value={formData.chapterName}
                            onChange={handleChange}
                            placeholder="Enter chapter name"
                        />

                    </div>

                    {/* DESCRIPTION */}

                    <div className="form-group">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter chapter description"
                            rows="5"
                        />

                    </div>

                    {/* PUBLISHED */}

                    <div className="publish-row">

                        <label className="switch-label">

                            <input
                                type="checkbox"
                                name="isPublished"
                                checked={formData.isPublished}
                                onChange={handleChange}
                            />

                            <span className="slider"></span>

                        </label>

                        <div>

                            <strong>
                                Publish Chapter
                            </strong>

                            <p>
                                Students can access this chapter.
                            </p>

                        </div>

                    </div>

                    {/* BUTTONS */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate(-1)}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="create-btn"
                            disabled={loading}
                        >

                            {loading
                                ? "Creating..."
                                : "Create Chapter"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default AddChapter;
