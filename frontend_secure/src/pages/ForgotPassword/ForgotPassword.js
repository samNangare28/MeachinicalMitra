import "./ForgotPassword.css";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { isValidEmail } from "../../utils/validation";

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isValidEmail(email)) {
            setError("Enter a valid email address");
            return;
        }
        setError("");

        try {
            setLoading(true);

            await api.post("/auth/forgot-password", { email: email.trim() });

            // Backend intentionally returns the same generic message whether
            // or not the account exists, to avoid leaking which emails are registered.
            toast.success("If that email is registered, an OTP has been sent.");

            navigate("/reset-password", { state: { email } });
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to send OTP");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Forgot Password</h1>
                <p>Enter your registered email to receive an OTP.</p>

                <form onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />
                        {error && <span className="field-error">{error}</span>}
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Sending..." : "Send OTP"}
                    </button>

                </form>

                <p className="auth-footer">
                    Remembered your password?{" "}
                    <span onClick={() => navigate("/login")}>Back to Login</span>
                </p>

            </div>
        </div>
    );
}

export default ForgotPassword;
