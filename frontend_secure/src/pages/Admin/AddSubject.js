import "./AddSubject.css";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../../services/api";
import ImageUpload from "../../components/ImageUpload/ImageUpload";

function AddSubject() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        subjectName: "",
        description: "",
        semester: "",
        price: ""
    });

    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!thumbnailFile) {
            toast.error("Please upload a thumbnail image");
            return;
        }

        // multipart/form-data so the actual image bytes travel with the
        // request instead of a client-supplied URL string.
        const payload = new FormData();
        payload.append("subjectName", formData.subjectName);
        payload.append("description", formData.description);
        payload.append("semester", formData.semester);
        payload.append("price", formData.price);
        payload.append("thumbnail", thumbnailFile);

        try {
            setSaving(true);
            await api.post("/subjects", payload, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Subject added successfully");
            navigate("/admin/subjects");
        }
        catch (error) {
            toast.error(getApiErrorMessage(error, "Failed to add subject"));
        }
        finally {
            setSaving(false);
        }
    };

    return (

        <div className="add-subject-page">

            <div className="add-subject-card">

                <h1>Add New Subject</h1>
                <p>Fill all the details to create a new subject.</p>

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
                            label="Thumbnail Image"
                            onFileSelect={setThumbnailFile}
                            required
                        />
                    </div>

                    <div className="button-group">
                        <button type="submit" className="save-btn" disabled={saving}>
                            {saving ? "Saving..." : "Save Subject"}
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

export default AddSubject;
