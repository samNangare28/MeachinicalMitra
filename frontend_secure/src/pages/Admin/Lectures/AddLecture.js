import "./AddLecture.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../services/api";

function AddLecture() {
    const navigate = useNavigate();
    const [chapters, setChapters] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [formData, setFormData] = useState({
        lectureTitle: "",
        lectureNumber: "",
        description: "",
        duration: "",
        isDemo: false,
        chapterId: ""
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // FETCH CHAPTERS
    useEffect(() => {
        fetchChapters();
    }, []);

    const fetchChapters = async () => {
        try {
            const res = await api.get("/chapters");
            setChapters(res.data.chapters || []);
        }
        catch (error) {
            console.log(
                "FETCH CHAPTERS ERROR:",
                error
            );
            toast.error(
                error.response?.data?.message ||
                "Failed to load chapters"
            );
        }
        finally {
            setLoading(false);
        }
    };

    // HANDLE NORMAL INPUT
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

    // HANDLE VIDEO
    const MAX_VIDEO_MB = 500;
    const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-matroska"];

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

    // HANDLE PDF
    const MAX_PDF_MB = 20;

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

    // CREATE LECTURE
    const handleSubmit = async (e) => {
        e.preventDefault();
        // Required fields
        if (
            !formData.lectureTitle ||
            !formData.lectureNumber ||
            !formData.chapterId ||
            !videoFile
        ) {
            toast.error(
                "Please fill all required fields and select a video"
            );
            return;
        }
        try {
            setSaving(true);
                    // CREATE FORMDATA
            const data = new FormData();
            // Text fields
            data.append(
                "lectureTitle",
                formData.lectureTitle
            );
            data.append(
                "lectureNumber",
                Number(formData.lectureNumber)
            );
            data.append(
                "description",
                formData.description
            );
            data.append(
                "duration",
                formData.duration
            );
            data.append(
                "isDemo",
                formData.isDemo
            );
            data.append(
                "chapterId",
                formData.chapterId
            );
                // VIDEO FILE
            data.append(
                "video",
                videoFile
            );
                  // PDF FILE
            if (pdfFile) {
                data.append(
                    "pdf",
                    pdfFile
                );
            }
                    // API REQUEST
            await api.post("/lectures", data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Lecture created successfully");
            navigate(
                "/admin/lectures"
            );
        }
        catch (error) {
            console.log(
                "CREATE LECTURE ERROR:",
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
                "Failed to create lecture"
            );
        }
        finally {
            setSaving(false);
        }
    };
    // LOADING
    if (loading) {
        return (
            <div className="admin-add-lecture">
                <h2>
                    Loading Chapters...
                </h2>
            </div>
        );
    }
    return (
        <div className="admin-add-lecture">
            <div className="lecture-form-card">
                <h1>
                    Add Lecture
                </h1>
                <p>
                    Create a new lecture for a chapter
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            Lecture Title
                        </label>
                        <input
                            type="text"
                            name="lectureTitle"
                            value={
                                formData.lectureTitle
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter lecture title"
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            Lecture Number
                        </label>
                        <input
                            type="number"
                            name="lectureNumber"
                            value={
                                formData.lectureNumber
                            }
                            onChange={
                                handleChange
                            }
                            min="1"
                            placeholder="Enter lecture number"
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            Chapter
                        </label>
                        <select
                            name="chapterId"
                            value={
                                formData.chapterId
                            }
                            onChange={
                                handleChange
                            }
                        >
                            <option value="">
                                Select Chapter
                            </option>
                            {chapters.map(
                                (chapter) => (
                                    <option
                                        key={
                                            chapter._id
                                        }
                                        value={
                                            chapter._id
                                        }
                                    >
                                        Chapter{" "}
                                        {
                                            chapter.chapterNumber
                                        }
                                        {" - "}
                                        {
                                            chapter.chapterName
                                        }
                                        {
                                            chapter.subjectId
                                                ?.subjectName
                                                ? ` (${chapter.subjectId.subjectName})`
                                                : ""
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={
                                formData.description
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Enter lecture description"
                            rows="5"
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            Lecture Video *
                        </label>
                        <input
                            type="file"
                            name="video"
                            accept="video/*"
                            onChange={
                                handleVideoChange
                            }
                        />
                        {videoFile && (
                            <small>
                                Selected:
                                {" "}
                                {videoFile.name}
                            </small>
                        )}
                        <small>
                            Video will be uploaded to
                            Cloudinary automatically.
                        </small>
                    </div>
                    <div className="form-group">
                        <label>
                            Lecture PDF
                        </label>
                        <input
                            type="file"
                            name="pdf"
                            accept="application/pdf"
                            onChange={
                                handlePdfChange
                            }
                        />
                        {pdfFile && (
                            <small>
                                Selected:
                                {" "}
                                {pdfFile.name}
                            </small>
                        )}
                        <small>
                            Optional lecture notes PDF.
                        </small>
                    </div>
                    <div className="form-group">
                        <label>
                            Duration
                        </label>
                        <input
                            type="text"
                            name="duration"
                            value={
                                formData.duration
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Example: 45 min"
                        />
                    </div>
                    <div className="checkbox-group">
                        <input
                            type="checkbox"
                            name="isDemo"
                            checked={
                                formData.isDemo
                            }
                            onChange={
                                handleChange
                            }
                            id="isDemo"
                        />
                        <label htmlFor="isDemo">
                            Make this a Demo Lecture
                        </label>
                    </div>
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
                                ? "Uploading..."
                                : "Create Lecture"
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddLecture;