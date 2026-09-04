import "./AddSubject.css";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import api, { getApiErrorMessage } from "../../services/api";
import ImageUpload from "../../components/ImageUpload/ImageUpload";
import Loader from "../../components/Loader/Loader";

function EditSubject() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        subjectName: "",
        description: "",
        semester: "",
        price: ""
    });
    const [existingThumbnail, setExistingThumbnail] = useState("");
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSubject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSubject = async () => {
        try {
            const res = await api.get(`/subjects/${id}`);
            const subject = res.data.subject;
            setFormData({
                subjectName: subject.subjectName || "",
                description: subject.description || "",
                semester: subject.semester || "",
                price: subject.price ?? ""
            });
            setExistingThumbnail(subject.thumbnail || "");
        }
        catch (error) {
            toast.error(getApiErrorMessage(error, "Failed to load subject"));
        }
        finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = new FormData();
        payload.append("subjectName", formData.subjectName);
        payload.append("description", formData.description);
        payload.append("semester", formData.semester);
        payload.append("price", formData.price);
        // Only attach a new image if the admin actually picked one -
        // otherwise the existing Cloudinary thumbnail stays untouched.
        if (thumbnailFile) {
            payload.append("thumbnail", thumbnailFile);
        }

        try {
            setSaving(true);
            await api.put(`/subjects/${id}`, payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Subject updated successfully");
            navigate("/admin/subjects");
        }
        catch (error) {
            toast.error(getApiErrorMessage(error, "Update failed"));
        }
        finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader fullScreen={false} label="Loading subject..." />;

    return (

        <div className="add-subject-page">

            <div className="add-subject-card">

                <h2>Edit Subject</h2>
                <p>Update subject details</p>

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Subject Name</label>
                        <input
                            type="text"
                            name="subjectName"
                            value={formData.subjectName}
                            onChange={handleChange}
                            placeholder="Enter Subject Name"
                            minLength={2}
                            maxLength={120}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="5"
                            placeholder="Enter Subject Description"
                            maxLength={2000}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Semester</label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Semester</option>
                            <option value="1">Semester 1</option>
                            <option value="2">Semester 2</option>
                            <option value="3">Semester 3</option>
                            <option value="4">Semester 4</option>
                            <option value="5">Semester 5</option>
                            <option value="6">Semester 6</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Price (INR)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="Enter Price"
                            min="0"
                            step="1"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <ImageUpload
                            label="Thumbnail Image (leave as-is to keep the current one)"
                            initialPreview={existingThumbnail}
                            onFileSelect={setThumbnailFile}
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="save-btn" disabled={saving}>
                            {saving ? "Updating..." : "Update Subject"}
                        </button>
                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={() => navigate("/admin/subjects")}
                        >
                            Cancel
                        </button>
                    </div>

                </form>

            </div>

        </div>

    );

}

export default EditSubject;
