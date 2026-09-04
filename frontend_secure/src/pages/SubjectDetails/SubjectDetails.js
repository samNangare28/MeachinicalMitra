import "./SubjectDetails.css";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../services/api";

function SubjectDetails() {

    const { id } = useParams();

    const [subject, setSubject] = useState(null);

    const [loading, setLoading] = useState(true);

    const [chapters, setChapters] = useState([]);

    useEffect(() => {

        const fetchSubject = async () => {

            try {

                const res =
                    await api.get(`/subjects/${id}`);

                setSubject(
                    res.data.subject
                );

            } catch (error) {

                console.log(error);

            } finally {

                setLoading(false);

            }

        };

        const fetchChapters = async () => {

            try {

                const res =
                    await api.get(
                        `/chapters/subject/${id}`
                    );

                setChapters(
                    res.data.chapters || []
                );

            } catch (error) {

                console.log(error);

            }

        };

        fetchSubject();
        fetchChapters();

    }, [id]);

    if (loading) {

        return (

            <h2 className="loading">
                Loading Subject...
            </h2>

        );

    }

    if (!subject) {

        return (

            <h2 className="loading">
                Subject not found.
            </h2>

        );

    }

    return (

        <section className="subject-details-page">

            <div className="subject-banner">

                <img
                    src={
                        subject.thumbnail &&
                        subject.thumbnail.trim() !== ""

                            ? subject.thumbnail

                            : "/assets/logo/logo.jpeg"
                    }

                    alt={subject.subjectName}
                />

                <div className="subject-info">

                    <span className="semester">

                        Semester {subject.semester}

                    </span>

                    <h1>

                        {subject.subjectName}

                    </h1>

                    <p>

                        {subject.description}

                    </p>

                    <h2>

                        ₹{subject.price}

                    </h2>

                    <Link
                        to={`/purchase/${subject._id}`}
                    >

                        <button>
                            Buy Now
                        </button>

                    </Link>

                </div>

            </div>

            {/* ================= CHAPTERS ================= */}

            <div className="chapters-section">

                <h2>
                    Course Chapters
                </h2>

                {chapters.length === 0 ? (

                    <p className="no-chapters">
                        No Chapters Available
                    </p>

                ) : (

                    chapters.map(
                        (chapter, index) => (

                            <div
                                className="chapter-card"
                                key={chapter._id}
                            >

                                <div className="chapter-number">

                                    {index + 1}

                                </div>

                                <div className="chapter-info">

                                    <h3>

                                        {chapter.chapterName}

                                    </h3>

                                    <p>

                                        {chapter.description}

                                    </p>

                                </div>

                            </div>

                        )
                    )

                )}

            </div>

        </section>

    );

}

export default SubjectDetails;