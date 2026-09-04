import "./LectureManagement.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";

function LectureManagement() {

    const [lectures, setLectures] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const navigate = useNavigate();


    // =========================
    // FETCH LECTURES
    // =========================

    useEffect(() => {

        fetchLectures();

    }, []);


    const fetchLectures = async () => {

        try {

            const res = await api.get("/lectures");

            setLectures(
                res.data.lectures || []
            );

        }

        catch (error) {

            console.log(
                "FETCH LECTURES ERROR:",
                error
            );

        }

        finally {

            setLoading(false);

        }

    };


    // =========================
    // SEARCH
    // =========================

    const filteredLectures =
        lectures.filter((lecture) =>

            lecture.lectureTitle
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                )

        );


    // =========================
    // DELETE LECTURE
    // =========================

    const deleteLecture = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this lecture?"
            );

        if (!confirmDelete) return;


        try {

            await api.delete(`/lectures/${id}`);

            toast.success("Lecture deleted successfully");


            fetchLectures();

        }

        catch (error) {

            console.log(
                "DELETE LECTURE ERROR:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                "Delete failed"
            );

        }

    };


    return (

        <div className="admin-lectures">


            {/* =========================
                HEADER
            ========================= */}

            <div className="lecture-header">

                <div>

                    <h1>
                        🎥 Lecture Management
                    </h1>

                    <p>
                        Manage all lectures of Mechanical Mitra
                    </p>

                </div>


                <button
                    className="add-lecture-btn"
                    onClick={() =>
                        navigate(
                            "/admin/lectures/add"
                        )
                    }
                >
                    + Add Lecture
                </button>

            </div>


            {/* =========================
                SEARCH
            ========================= */}

            <div className="lecture-search">

                <input
                    type="text"
                    placeholder="Search lecture..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>


            {/* =========================
                CONTENT
            ========================= */}

            {
                loading ? (

                    <div className="lecture-loading">

                        <h2>
                            Loading Lectures...
                        </h2>

                    </div>

                ) : filteredLectures.length === 0 ? (

                    <div className="no-lectures">

                        <div>
                            🎥
                        </div>

                        <h2>
                            No Lectures Found
                        </h2>

                        <p>
                            Add your first lecture to get started.
                        </p>

                        <button
                            onClick={() =>
                                navigate(
                                    "/admin/lectures/add"
                                )
                            }
                        >
                            + Add Lecture
                        </button>

                    </div>

                ) : (

                    <div className="lectures-grid">

                        {
                            filteredLectures.map(
                                (lecture) => (

                                    <div
                                        className="lecture-card"
                                        key={lecture._id}
                                    >


                                        {/* Lecture Icon */}

                                        <div className="lecture-icon">

                                            🎥

                                        </div>


                                        {/* Content */}

                                        <div className="lecture-content">

                                            <span className="lecture-number">

                                                Lecture {
                                                    lecture.lectureNumber
                                                }

                                            </span>


                                            <h2>

                                                {
                                                    lecture.lectureTitle
                                                }

                                            </h2>


                                            <p className="lecture-description">

                                                {
                                                    lecture.description ||
                                                    "No description available."
                                                }

                                            </p>


                                            {/* Chapter */}

                                            <div className="lecture-info">

                                                <span>

                                                    📖

                                                    {" "}

                                                    {
                                                        lecture.chapterId
                                                            ?.chapterName ||
                                                        "Chapter"
                                                    }

                                                </span>

                                            </div>


                                            {/* Demo */}

                                            <div className="lecture-status">

                                                {
                                                    lecture.isDemo ? (

                                                        <span className="demo-badge">

                                                            🟢 Free Demo

                                                        </span>

                                                    ) : (

                                                        <span className="paid-badge">

                                                            🔒 Premium

                                                        </span>

                                                    )

                                                }

                                            </div>


                                            {/* Duration */}

                                            {
                                                lecture.duration && (

                                                    <p className="lecture-duration">

                                                        ⏱️{" "}

                                                        {
                                                            lecture.duration
                                                        }

                                                    </p>

                                                )
                                            }


                                            {/* Actions */}

                                            <div className="lecture-actions">


                                                <button
                                                    className="view-btn"
                                                    onClick={() =>
                                                        navigate(`/admin/lectures/view/${lecture._id}`)
                                                    }
                                                >
                                                    View
                                                </button>


                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/lectures/edit/${lecture._id}`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        deleteLecture(
                                                            lecture._id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </div>

                                    </div>

                                )
                            )
                        }

                    </div>

                )
            }

        </div>

    );

}

export default LectureManagement;