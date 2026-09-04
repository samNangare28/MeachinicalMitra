import "./EditLecture.css";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];
const MAX_VIDEO_MB = 500;
const MAX_PDF_MB = 20;

function EditLecture() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [chapters, setChapters] = useState([]);

    const [formData, setFormData] = useState({
        lectureTitle: "",
        lectureNumber: "",
        description: "",
        duration: "",
        isDemo: false,
        chapterId: ""
    });

    // Existing files (read-only, shown for reference) vs. new replacement
    // files the admin can optionally pick — the raw URL text inputs that
    // used to be here let anyone point a lecture at an arbitrary external
    // URL; content can now only come from an actual uploaded file.
    const [existingVideoUrl, setExistingVideoUrl] = useState("");
    const [existingPdfUrl, setExistingPdfUrl] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchLecture();
        fetchChapters();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchLecture = async () => {
        try {
            const res = await api.get(`/lectures/${id}`);
            const lecture = res.data.lecture;

            setFormData({
                lectureTitle: lecture.lectureTitle || "",
                lectureNumber: lecture.lectureNumber || "",
                description: lecture.description || "",
                duration: lecture.duration || "",
                isDemo: lecture.isDemo ?? false,
                chapterId: lecture.chapterId?._id || lecture.chapterId || ""
            });

            setExistingVideoUrl(lecture.videoUrl || "");
            setExistingPdfUrl(lecture.pdfUrl || "");
        }
        catch (error) {
            console.log("FETCH LECTURE ERROR:", error);
            toast.error(error.response?.data?.message || "Failed to load lecture");
        }
    };

    const fetchChapters = async () => {
        try {
            const res = await api.get("/chapters");
            setChapters(res.data.chapters || []);
        }
        catch (error) {
            console.log("FETCH CHAPTERS ERROR:", error);
        }
        finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
            toast.error("Video must be MP4, WebM, MOV or MKV");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
            toast.error(`Video must be under ${MAX_VIDEO_MB}MB`);
            e.target.value = "";
            return;
        }
        setVideoFile(file);
    };

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== "application/pdf") {
            toast.error("Please select a valid PDF file");
            e.target.value = "";
            return;
        }
        if (file.size > MAX_PDF_MB * 1024 * 1024) {
            toast.error(`PDF must be under ${MAX_PDF_MB}MB`);
            e.target.value = "";
            return;
        }
        setPdfFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.lectureTitle || !formData.lectureNumber || !formData.chapterId) {
            toast.error("Please fill all required fields");
            return;
        }

        try {
            setSaving(true);

            const data = new FormData();
            data.append("lectureTitle", formData.lectureTitle);
            data.append("lectureNumber", Number(formData.lectureNumber));
            data.append("description", formData.description);
            data.append("duration", formData.duration);
            data.append("isDemo", formData.isDemo);
            data.append("chapterId", formData.chapterId);

            // Only attach a file if the admin actually picked a
            // replacement — otherwise the existing Cloudinary asset stays.
            if (videoFile) data.append("video", videoFile);
            if (pdfFile) data.append("pdf", pdfFile);

            await api.put(`/lectures/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Lecture updated successfully");
            navigate("/admin/lectures");
        }
        catch (error) {
            console.log("UPDATE LECTURE ERROR:", error);
            toast.error(error.response?.data?.message || "Failed to update lecture");
        }
        finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-edit-lecture">
                <h2>Loading Lecture...</h2>
            </div>
        );
    }

    return (
        <div className="admin-edit-lecture">
            <div className="lecture-form-card">
                <h1>Edit Lecture</h1>
                <p>Update lecture details</p>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Lecture Title</label>
                        <input
                            type="text"
                            name="lectureTitle"
                            value={formData.lectureTitle}
                            onChange={handleChange}
                            placeholder="Enter lecture title"
                        />
                    </div>

                    <div className="form-group">
                        <label>Lecture Number</label>
                        <input
                            type="number"
                            name="lectureNumber"
                            value={formData.lectureNumber}
                            onChange={handleChange}
                            min="1"
                            placeholder="Enter lecture number"
                        />
                    </div>

                    <div className="form-group">
                        <label>Chapter</label>
                        <select name="chapterId" value={formData.chapterId} onChange={handleChange}>
                            <option value="">Select Chapter</option>
                            {chapters.map((chapter) => (
                                <option key={chapter._id} value={chapter._id}>
                                    Chapter {chapter.chapterNumber} - {chapter.chapterName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter lecture description"
                            rows="5"
                        />
                    </div>

                    <div className="form-group">
                        <label>Lecture Video</label>
                        {existingVideoUrl && !videoFile && (
                            <small className="current-file-note">
                                Current video is set. Choose a file below only to replace it.
                            </small>
                        )}
                        <input
                            type="file"
                            name="video"
                            accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
                            onChange={handleVideoChange}
                        />
                        {videoFile && <small>New file selected: {videoFile.name}</small>}
                    </div>

                    <div className="form-group">
                        <label>Lecture PDF</label>
                        {existingPdfUrl && !pdfFile && (
                            <small className="current-file-note">
                                Current notes PDF is set. Choose a file below only to replace it.
                            </small>
                        )}
                        <input
                            type="file"
                            name="pdf"
                            accept="application/pdf"
                            onChange={handlePdfChange}
                        />
                        {pdfFile && <small>New file selected: {pdfFile.name}</small>}
                    </div>

                    <div className="form-group">
                        <label>Duration</label>
                        <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            placeholder="Example: 45 min"
                        />
                    </div>

                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            name="isDemo"
                            checked={formData.isDemo}
                            onChange={handleChange}
                            id="isDemo"
                        />
                        <label htmlFor="isDemo">Make this a Demo Lecture</label>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={() => navigate(-1)}>
                            Cancel
                        </button>
                        <button type="submit" className="submit-btn" disabled={saving}>
                            {saving ? "Updating..." : "Update Lecture"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default EditLecture;
