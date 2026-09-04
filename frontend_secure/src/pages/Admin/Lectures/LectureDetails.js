import "./LectureDetails.css";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";

function LectureDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [lecture, setLecture] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLecture();
    }, [id]);

    const fetchLecture = async () => {

        try {

            const res = await api.get(`/lectures/${id}`);

            setLecture(res.data.lecture);

        } catch (error) {

            console.log("FETCH LECTURE ERROR:", error);

            toast.error(
                error.response?.data?.message ||
                "Failed to load lecture"
            );

        } finally {

            setLoading(false);

        }
    };

    if (loading) {
        return (
            <div className="lecture-details-page">
                <h2>Loading Lecture...</h2>
            </div>
        );
    }

    if (!lecture) {
        return (
            <div className="lecture-details-page">
                <h2>Lecture Not Found</h2>
            </div>
        );
    }

    return (

        <div className="lecture-details-page">

            <button
                className="back-btn"
                onClick={() => navigate(-1)}
            >
                ← Back
            </button>

            <div className="lecture-details-card">

                <div className="lecture-header">

                    <div>

                        <span className="lecture-number">
                            Lecture {lecture.lectureNumber}
                        </span>

                        <h1>
                            {lecture.lectureTitle}
                        </h1>

                        {lecture.chapterId && (
                            <p className="chapter-info">
                                Chapter {lecture.chapterId.chapterNumber}
                                {" - "}
                                {lecture.chapterId.chapterName}
                            </p>
                        )}

                    </div>

                    {lecture.isDemo && (
                        <span className="demo-badge">
                            Demo Lecture
                        </span>
                    )}

                </div>


                {/* VIDEO */}

                <div className="video-container">

                    <video
                        controls
                        controlsList="nodownload"
                        className="lecture-video"
                    >
                        <source
                            src={lecture.videoUrl}
                            type="video/mp4"
                        />

                        Your browser does not support video playback.

                    </video>

                </div>


                {/* DETAILS */}

                <div className="lecture-info">

                    <div className="info-item">

                        <span>Duration</span>

                        <strong>
                            {lecture.duration || "Not specified"}
                        </strong>

                    </div>

                    <div className="info-item">

                        <span>Lecture Number</span>

                        <strong>
                            {lecture.lectureNumber}
                        </strong>

                    </div>

                </div>


                {/* DESCRIPTION */}

                <div className="lecture-description">

                    <h2>About this Lecture</h2>

                    <p>
                        {lecture.description ||
                            "No description available."
                        }
                    </p>

                </div>


                {/* PDF */}

                {lecture.pdfUrl && (

                    <div className="pdf-section">

                        <h2>Lecture Notes</h2>

                        <iframe
                            src={lecture.pdfUrl}
                            title="Lecture Notes"
                            className="lecture-pdf"
                        >
                        </iframe>

                    </div>

                )}

            </div>

        </div>
    );
}

export default LectureDetails;