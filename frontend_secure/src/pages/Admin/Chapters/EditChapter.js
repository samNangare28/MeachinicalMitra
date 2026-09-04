import "./EditChapter.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";

function EditChapter() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        chapterName: "",
        chapterNumber: "",
        description: "",
        subjectId: "",
        isPublished: true
    });

    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // =========================
    // FETCH CHAPTER + SUBJECTS
    // =========================

    useEffect(() => {

        const fetchChapter = async () => {

            try {

                const res = await api.get(`/chapters/${id}`);

                const chapter = res.data.chapter;

                setFormData({
                    chapterName: chapter.chapterName || "",

                    chapterNumber:
                        chapter.chapterNumber || "",

                    description:
                        chapter.description || "",

                    subjectId:
                        chapter.subjectId?._id ||
                        chapter.subjectId ||
                        "",

                    isPublished:
                        chapter.isPublished ?? true
                });

            } catch (error) {

                console.log(
                    "FETCH CHAPTER ERROR:",
                    error
                );

                toast.error(
                    error.response?.data?.message ||
                    "Failed to load chapter"
                );

            } finally {

                setLoading(false);

            }

        };

        const fetchSubjects = async () => {

            try {

                const res = await api.get("/subjects");

                setSubjects(
                    res.data.subjects || []
                );

            } catch (error) {

                console.log(
                    "FETCH SUBJECTS ERROR:",
                    error
                );

            }

        };

        fetchChapter();
        fetchSubjects();

    }, [id]);

    // =========================
    // HANDLE INPUT
    // =========================

    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;

        setFormData((prev) => ({

            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };

    // =========================
    // UPDATE CHAPTER
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (
            !formData.chapterName ||
            !formData.chapterNumber ||
            !formData.subjectId
        ) {

            toast.error(
                "Please fill all required fields"
            );

            return;

        }

        try {

            setSaving(true);

            await api.put(`/chapters/${id}`, {

                chapterName:
                    formData.chapterName,

                chapterNumber:
                    Number(formData.chapterNumber),

                description:
                    formData.description,

                subjectId:
                    formData.subjectId,

                isPublished:
                    formData.isPublished

            });

            toast.success(
                "Chapter updated successfully"
            );

            navigate("/admin/subjects");

        } catch (error) {

            console.log(
                "UPDATE CHAPTER ERROR:",
                error
            );

            console.log(
                "STATUS:",
                error.response?.status
            );

            console.log(
                "RESPONSE:",
                error.response?.data
            );

            toast.error(
                error.response?.data?.message ||
                "Failed to update chapter"
            );

        } finally {

            setSaving(false);

        }

    };

    if (loading) {

        return (

            <div className="admin-add-chapter">

                <h2>
                    Loading Chapter...
                </h2>

            </div>

        );

    }

    return (

        <div className="admin-add-chapter">

            <div className="chapter-form-card">

                <h1>
                    Edit Chapter
                </h1>

                <p>
                    Update chapter details
                </p>

                <form onSubmit={handleSubmit}>

                    {/* Chapter Name */}

                    <div className="form-group">

                        <label>
                            Chapter Name
                        </label>

                        <input
                            type="text"
                            name="chapterName"
                            value={formData.chapterName}
                            onChange={handleChange}
                            placeholder="Enter chapter name"
                        />

                    </div>

                    {/* Chapter Number */}

                    <div className="form-group">

                        <label>
                            Chapter Number
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

                    {/* Subject */}

                    <div className="form-group">

                        <label>
                            Subject
                        </label>

                        <select
                            name="subjectId"
                            value={formData.subjectId}
                            onChange={handleChange}
                        >

                            <option value="">
                                Select Subject
                            </option>

                            {subjects.map((subject) => (

                                <option
                                    key={subject._id}
                                    value={subject._id}
                                >

                                    {subject.subjectName}

                                    {" "} - Semester{" "}

                                    {subject.semester}

                                </option>

                            ))}

                        </select>

                    </div>

                    {/* Description */}

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

                    {/* Published */}

                    <div className="checkbox-group">

                        <input
                            type="checkbox"
                            name="isPublished"
                            checked={formData.isPublished}
                            onChange={handleChange}
                            id="isPublished"
                        />

                        <label htmlFor="isPublished">
                            Publish Chapter
                        </label>

                    </div>

                    {/* Buttons */}

                    <div className="form-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() =>
                                navigate(-1)
                            }
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={saving}
                        >

                            {saving
                                ? "Updating..."
                                : "Update Chapter"
                            }

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

export default EditChapter;