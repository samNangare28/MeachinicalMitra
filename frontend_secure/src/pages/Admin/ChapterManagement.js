import "./ChapterManagement.css";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../../services/api";

function ChapterManagement() {

    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    // =========================
    // FETCH CHAPTERS
    // =========================

    useEffect(() => {

        fetchChapters();

    }, []);

    const fetchChapters = async () => {

        try {

            const res = await api.get("/chapters");

            setChapters(res.data.chapters || []);

        }
        catch (error) {

            toast.error(getApiErrorMessage(error, "Failed to load chapters"));

        }
        finally {

            setLoading(false);

        }

    };


    // =========================
    // DELETE CHAPTER
    // =========================

    const deleteChapter = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this chapter?"
        );

        if (!confirmDelete) return;

        try {

            await api.delete(`/chapters/${id}`);

            toast.success("Chapter deleted successfully");

            fetchChapters();

        }
        catch (error) {

            toast.error(getApiErrorMessage(error, "Failed to delete chapter"));

        }

    };


    // =========================
    // SEARCH
    // =========================

    const filteredChapters = chapters.filter((chapter) => {

        const chapterName =
            chapter.chapterName?.toLowerCase() || "";

        const subjectName =
            chapter.subjectId?.subjectName?.toLowerCase() || "";

        return (
            chapterName.includes(search.toLowerCase()) ||
            subjectName.includes(search.toLowerCase())
        );

    });


    return (

        <div className="admin-chapters">

            {/* HEADER */}

            <div className="chapters-header">

                <div>

                    <h1>Chapter Management</h1>

                    <p>
                        Manage all chapters of your subjects.
                    </p>

                </div>

                <button
                    className="add-chapter-btn"
                    onClick={() =>
                        navigate("/admin/chapters/add")
                    }
                >
                    + Add Chapter
                </button>

            </div>


            {/* SEARCH */}

            <div className="chapter-toolbar">

                <input
                    type="text"
                    className="chapter-search"
                    placeholder="Search chapter or subject..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

                <div className="chapter-count">

                    Total Chapters:{" "}

                    <b>{chapters.length}</b>

                </div>

            </div>


            {/* LOADING */}

            {loading ? (

                <div className="chapter-loading">

                    <h2>Loading Chapters...</h2>

                </div>

            ) : filteredChapters.length === 0 ? (

                /* EMPTY */

                <div className="chapter-empty">

                    <div className="empty-icon">
                        📖
                    </div>

                    <h2>
                        No Chapters Found
                    </h2>

                    <p>
                        {search
                            ? "No chapters match your search."
                            : "Start by adding your first chapter."
                        }
                    </p>

                    {!search && (

                        <button
                            className="add-chapter-btn"
                            onClick={() =>
                                navigate("/admin/chapters/add")
                            }
                        >
                            + Add Chapter
                        </button>

                    )}

                </div>

            ) : (

                /* TABLE */

                <div className="chapters-table-wrapper">

                    <table className="chapters-table">

                        <thead>

                            <tr>

                                <th>No.</th>

                                <th>Chapter Name</th>

                                <th>Subject</th>

                                <th>Semester</th>

                                <th>Status</th>

                                <th>Actions</th>

                            </tr>

                        </thead>

                        <tbody>

                            {filteredChapters.map(
                                (chapter) => (

                                    <tr key={chapter._id}>

                                        {/* NUMBER */}

                                        <td>

                                            <div className="chapter-number">

                                                {chapter.chapterNumber}

                                            </div>

                                        </td>


                                        {/* NAME */}

                                        <td>

                                            <div className="chapter-name">

                                                <strong>
                                                    {chapter.chapterName}
                                                </strong>

                                                {chapter.description && (

                                                    <span>
                                                        {chapter.description}
                                                    </span>

                                                )}

                                            </div>

                                        </td>


                                        {/* SUBJECT */}

                                        <td>

                                            <span className="subject-badge">

                                                📚{" "}

                                                {chapter.subjectId?.subjectName ||
                                                    "Unknown Subject"}

                                            </span>

                                        </td>


                                        {/* SEMESTER */}

                                        <td>

                                            Semester{" "}

                                            {chapter.subjectId?.semester ||
                                                "-"}

                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            {chapter.isPublished ? (

                                                <span className="status published">
                                                    ● Published
                                                </span>

                                            ) : (

                                                <span className="status draft">
                                                    ● Draft
                                                </span>

                                            )}

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            <div className="chapter-actions">

                                                <button
                                                    className="edit-chapter-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/chapters/edit/${chapter._id}`
                                                        )
                                                    }
                                                >
                                                    ✏️ Edit
                                                </button>

                                                <button
                                                    className="delete-chapter-btn"
                                                    onClick={() =>
                                                        deleteChapter(
                                                            chapter._id
                                                        )
                                                    }
                                                >
                                                    🗑️ Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}

                        </tbody>

                    </table>

                </div>

            )}

        </div>

    );

}

export default ChapterManagement;