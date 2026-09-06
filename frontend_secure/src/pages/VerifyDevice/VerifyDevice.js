import "../ForgotPassword/ForgotPassword.css";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDeviceId } from "../../utils/deviceId";

function VerifyDevice() {

    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Arrives via navigate("/verify-device", { state: { email } }) from
    // Login.js - if someone lands here directly without that state, send
    // them back to log in properly instead of showing a broken form.
    const email = location.state?.email || "";

    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!email) {
        navigate("/login");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!/^\d{6}$/.test(otp.trim())) {
            setError("Enter the 6-digit code from your email");
            return;
        }
        setError("");

        try {
            setLoading(true);

            const deviceId = getDeviceId();

            const response = await api.post("/auth/verify-device", {
                email,
                otp: otp.trim(),
                deviceId
            });

            login(response.data.user);

            if (response.data.otherDeviceLoggedOut) {
                toast.success("Device verified! Your other device has been signed out.", { duration: 4500 });
            } else {
                toast.success(response.data.message || "Device verified!");
            }

            if (response.data.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard");
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || "Verification failed");
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <h1>Verify This Device</h1>
                <p>
                    We sent a 6-digit code to <b>{email}</b> because we don't recognize this
                    browser. Enter it below to finish logging in.
                </p>

                <form onSubmit={handleSubmit} noValidate>

                    <div className="form-group">
                        <label>Verification Code</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(""); }}
                            placeholder="Enter 6-digit code"
                            autoComplete="one-time-code"
                            required
                        />
                        {error && <span className="field-error">{error}</span>}
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Verifying..." : "Verify & Continue"}
                    </button>

                </form>

                <p className="auth-footer">
                    Didn't request this?{" "}
                    <span onClick={() => navigate("/login")}>Back to Login</span>
                </p>

            </div>
        </div>
    );
}

export default VerifyDevice;