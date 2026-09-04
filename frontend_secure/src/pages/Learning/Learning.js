import "./Learning.css";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { FaPlayCircle, FaFilePdf } from "react-icons/fa";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import useContentProtection from "../../hooks/useContentProtection";
import Watermark from "../../components/Watermark/Watermark";
import Loader from "../../components/Loader/Loader";

function Learning() {

    const { subjectId } = useParams();
    const { user } = useAuth();

    // Extra deterrents (blur on tab-blur) on top of the site-wide ones,
    // since this is the actual paid video content.
    useContentProtection({ scope: "content" });

    const [chapters, setChapters] = useState([]);
    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lectures, setLectures] = useState([]);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [activeChapter, setActiveChapter] = useState(null);

    useEffect(() => {
        fetchLearningData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [subjectId]);

    const fetchLearningData = async () => {
        try {
            const subjectRes = await api.get(`/subjects/${subjectId}`);
            setSubject(subjectRes.data.subject);

            const chapterRes = await api.get(`/chapters/subject/${subjectId}`);
            setChapters(chapterRes.data.chapters);
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to load this course");
        }
        finally {
            setLoading(false);
        }
    };

    const fetchLectures = async (chapterId) => {
        try {
            const res = await api.get(`/lectures/chapter/${chapterId}`);
            setLectures(res.data.lectures);
            setActiveChapter(chapterId);
            setSelectedLecture(res.data.lectures.length > 0 ? res.data.lectures[0] : null);
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to load lectures");
        }
    };

    if (loading) {
        return <Loader label="Loading your course..." />;
    }

    const watermarkLabel = user ? `${user.name} \u2022 ${user.email}` : "";

    return (
        <section className="learning">

            {/* Left Sidebar */}
            <div className="learning-sidebar">
                <h2>{subject?.subjectName}</h2>
                <p>Semester {subject?.semester}</p>
                <hr />
                {
                    chapters.length === 0 ? (
                        <p className="empty-note">No Chapters Available</p>
                    ) : (
                        chapters.map((chapter) => (
                            <div key={chapter._id} className="chapter-card">
                                <div
                                    className="chapter-title"
                                    onClick={() => fetchLectures(chapter._id)}
                                >
                                    <h3>Chapter {chapter.chapterNumber}</h3>
                                    <p>{chapter.chapterName}</p>
                                </div>

                                {
                                    activeChapter === chapter._id &&
                                    lectures.map((lecture) => (
                                        <div
                                            key={lecture._id}
                                            className={`lecture-item ${selectedLecture?._id === lecture._id ? "active" : ""}`}
                                            onClick={() => setSelectedLecture(lecture)}
                                        >
                                            <FaPlayCircle />
                                            <span>{lecture.lectureTitle}</span>
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    )
                }
            </div>

            {/* Right Section */}
            <div className="learning-content">
                {
                    selectedLecture ? (
                        <>
                            <h2>{selectedLecture.lectureTitle}</h2>
                            <p>{selectedLecture.description}</p>

                            <div className="protected-content video-shell">
                                <video
                                    controls
                                    controlsList="nodownload noremoteplayback"
                                    disablePictureInPicture
                                    onContextMenu={(e) => e.preventDefault()}
                                    width="100%"
                                    className="lecture-video"
                                >
                                    <source src={selectedLecture.videoUrl} type="video/mp4" />
                                </video>
                                <Watermark label={watermarkLabel} />
                            </div>

                            {
                                selectedLecture.pdfUrl && (
                                    <a
                                        href={selectedLecture.pdfUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="pdf-btn"
                                    >
                                        <FaFilePdf /> View Notes (PDF)
                                    </a>
                                )
                            }
                        </>
                    ) : (
                        <div className="learning-placeholder">
                            <h2>Select a Lecture</h2>
                            <p>Choose any lecture from the left panel.</p>
                        </div>
                    )
                }
            </div>
        </section>
    );
}

export default Learning;
