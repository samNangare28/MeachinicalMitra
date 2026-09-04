import { useRef, useState } from "react";
import toast from "react-hot-toast";
import "./ImageUpload.css";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Replaces a plain "paste a URL" text field with an actual file picker:
// the browser enforces the accept filter, and we double-check type/size
// client-side too (the backend re-validates regardless, this is just to
// give the admin fast feedback instead of a failed request).
function ImageUpload({ label = "Thumbnail Image", initialPreview = "", onFileSelect, required = false }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(initialPreview);

    const handleChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        if (!ALLOWED_TYPES.includes(file.type)) {
            toast.error("Please choose a JPG, PNG or WEBP image");
            e.target.value = "";
            return;
        }

        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
            toast.error(`Image must be under ${MAX_SIZE_MB}MB`);
            e.target.value = "";
            return;
        }

        setPreview(URL.createObjectURL(file));
        onFileSelect(file);
    };

    return (
        <div className="image-upload">
            <label>{label}</label>
            <div className="image-upload-box" onClick={() => inputRef.current?.click()}>
                {preview ? (
                    <img src={preview} alt="Preview" className="image-upload-preview" />
                ) : (
                    <div className="image-upload-placeholder">
                        <span>Click to upload an image</span>
                        <small>JPG, PNG or WEBP - up to {MAX_SIZE_MB}MB</small>
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleChange}
                required={required && !preview}
                hidden
            />
        </div>
    );
}

export default ImageUpload;
