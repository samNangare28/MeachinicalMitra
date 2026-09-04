import "./Chapters.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";

function Chapters() {

    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [subjectFilter, setSubjectFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    const navigate = useNavigate();

    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            const res = await api.get("/chapters");
            setChapters(res.data.chapters || []);
        }
        catch (error) {
            console.log("Fetch Chapters Error:", error);
            toast.error("Failed to load chapters");
        }
        finally {
            setLoading(false);
        }
    };

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
            console.log(error);
            toast.error(error.response?.data?.message || "Delete failed");
        }
    };

    // Unique subject list for the filter dropdown
    const subjectOptions = Array.from(
        new Map(
            chapters
                .filter((c) => c.subjectId)
                .map((c) => [c.subjectId._id, c.subjectId.subjectName])
        ).entries()
    );

    const publishedCount = chapters.filter((c) => c.isPublished).length;
    const draftCount = chapters.length - publishedCount;

    const filteredChapters = chapters
        .filter((chapter) => {
            const chapterName = chapter.chapterName?.toLowerCase() || "";
            const subjectName = chapter.subjectId?.subjectName?.toLowerCase() || "";
            const searchText = search.toLowerCase();

            const matchesSearch =
                chapterName.includes(searchText) ||
                subjectName.includes(searchText);

            const matchesSubject =
                subjectFilter === "all" ||
                chapter.subjectId?._id === subjectFilter;

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "published" && chapter.isPublished) ||
                (statusFilter === "draft" && !chapter.isPublished);

            return matchesSearch && matchesSubject && matchesStatus;
        })
        .sort((a, b) => {
            const subjA = a.subjectId?.subjectName || "";
            const subjB = b.subjectId?.subjectName || "";
            if (subjA !== subjB) return subjA.localeCompare(subjB);
            return (a.chapterNumber || 0) - (b.chapterNumber || 0);
        });

    return (
        <div className="admin-chapters">

            <div className="chapters-header">
                <div>
                    <h1>📖 Chapters</h1>
                    <p>Manage all chapters of Mechanical Mitra.</p>
                </div>

                <button
                    className="add-chapter-btn"
                    onClick={() => navigate("/admin/chapters/add")}
                >
                    + Add Chapter
                </button>
            </div>

            {/* Summary pills */}
            <div className="chapter-summary">
                <div className="summary-pill total">
                    <span>{chapters.length}</span> Total
                </div>
                <div className="summary-pill published">
                    <span>{publishedCount}</span> Published
                </div>
                <div className="summary-pill draft">
                    <span>{draftCount}</span> Draft
                </div>
            </div>

            <div className="chapter-toolbar">

                <input
                    type="text"
                    placeholder="Search chapter or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="chapter-search"
                />

                <select
                    className="chapter-filter"
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                >
                    <option value="all">All Subjects</option>
                    {subjectOptions.map(([id, name]) => (
                        <option key={id} value={id}>{name}</option>
                    ))}
                </select>

                <select
                    className="chapter-filter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>

                <div className="chapter-count">
                    Showing <strong>{filteredChapters.length}</strong> of {chapters.length}
                </div>

            </div>

            {loading ? (
                <div className="chapter-loading">
                    <div className="spinner"></div>
                    <p>Loading chapters...</p>
                </div>
            ) : filteredChapters.length === 0 ? (
                <div className="no-chapters">
                    <div className="no-chapter-icon">📖</div>
                    <h2>No Chapters Found</h2>
                    <p>
                        {search || subjectFilter !== "all" || statusFilter !== "all"
                            ? "No chapters match your filters."
                            : "Start by adding a chapter to a subject."}
                    </p>
                    <button onClick={() => navigate("/admin/chapters/add")}>
                        + Add Chapter
                    </button>
                </div>
            ) : (
                <div className="chapters-table-wrapper">
                    <table className="chapters-table">
                        <thead>
                            <tr>
                                <th>No.</th>
                                <th>Chapter</th>
                                <th>Subject</th>
                                <th>Semester</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredChapters.map((chapter) => (
                                <tr key={chapter._id}>
                                    <td>
                                        <span className="chapter-number">
                                            {chapter.chapterNumber}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="chapter-name">
                                            <span className="book-icon">📖</span>
                                            <strong>{chapter.chapterName}</strong>
                                        </div>
                                    </td>

                                    <td>
                                        <span className="subject-name">
                                            {chapter.subjectId?.subjectName || "Unknown Subject"}
                                        </span>
                                    </td>

                                    <td>
                                        Semester {chapter.subjectId?.semester || "-"}
                                    </td>

                                    <td>
                                        <p className="chapter-description">
                                            {chapter.description
                                                ? chapter.description.length > 45
                                                    ? chapter.description.substring(0, 45) + "..."
                                                    : chapter.description
                                                : "No description"}
                                        </p>
                                    </td>

                                    <td>
                                        {chapter.isPublished ? (
                                            <span className="status published">Published</span>
                                        ) : (
                                            <span className="status draft">Draft</span>
                                        )}
                                    </td>

                                    <td>
                                        <div className="chapter-actions">
                                            <button
                                                className="edit-btn"
                                                onClick={() =>
                                                    navigate(`/admin/chapters/edit/${chapter._id}`)
                                                }
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => deleteChapter(chapter._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}

export default Chapters;