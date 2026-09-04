import "../ForgotPassword/ForgotPassword.css";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { isValidEmail, passwordIssues } from "../../utils/validation";

function ResetPassword() {

    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState(location.state?.email || "");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const next = {};
        if (!isValidEmail(email)) next.email = "Enter a valid email address";
        if (!/^[0-9]{6}$/.test(otp)) next.otp = "Enter the 6-digit OTP";

        const pwIssues = passwordIssues(newPassword);
        if (pwIssues.length > 0) next.newPassword = `Password needs ${pwIssues.join(", ")}`;
        if (newPassword !== confirmPassword) next.confirmPassword = "Passwords do not match";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            await api.post("/auth/reset-password", {
                email: email.trim(),
                otp: otp.trim(),
                newPassword
            });

            toast.success("Password reset successfully");
            navigate("/login");
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Failed to reset password");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Reset Password</h1>
                <p>Enter the OTP sent to your email and set a new password.</p>

                <form onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            autoComplete="email"
                            required
                        />
                        {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>

                    <div className="form-group">
                        <label>OTP</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            required
                        />
                        {errors.otp && <span className="field-error">{errors.otp}</span>}
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            autoComplete="new-password"
                            maxLength={128}
                            required
                        />
                        {errors.newPassword && <span className="field-error">{errors.newPassword}</span>}
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            autoComplete="new-password"
                            maxLength={128}
                            required
                        />
                        {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                    </button>

                </form>

                <p className="auth-footer">
                    Didn't get the OTP?{" "}
                    <span onClick={() => navigate("/forgot-password")}>Resend OTP</span>
                </p>

            </div>
        </div>
    );
}

export default ResetPassword;
