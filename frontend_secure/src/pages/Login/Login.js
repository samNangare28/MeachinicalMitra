import "./Login.css";
import HeroImage from "../../assets/logo/logo.jpeg";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail } from "../../utils/validation";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({ email: "", password: "" });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        const next = {};
        if (!isValidEmail(formData.email)) next.email = "Enter a valid email address";
        if (!formData.password) next.password = "Password is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            const response = await api.post("/auth/login", formData);

            login(response.data.user);

            if (response.data.otherDeviceLoggedOut) {
                toast.success("Logged in! Your other device has been signed out.", { duration: 4500 });
            } else {
                toast.success(response.data.message || "Welcome back!");
            }

            if (response.data.user.role === "admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/dashboard");
            }
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Login Failed");
        }
        finally {
            setLoading(false);
        }
    };

    return (

        <section className="login-page">

            <div className="login-container">

                <div className="login-card">

                    <div className="login-logo">
                        <img src={HeroImage} alt="Mechanical Mitra Logo" />
                    </div>

                    <h1>Welcome Back 👋</h1>
                    <p>Login to continue your Mechanical Engineering learning journey.</p>

                    <form onSubmit={handleSubmit} noValidate>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                required
                            />
                            {errors.email && <span className="form-error">{errors.email}</span>}
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-box">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                />
                                <button
                                    type="button"
                                    className="show-password-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.password && <span className="form-error">{errors.password}</span>}
                        </div>

                        <div className="forgot-password">
                            <Link to="/forgot-password">Forgot Password?</Link>
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "Logging In..." : "Login"}
                        </button>

                    </form>

                    <div className="register-link">
                        <p>
                            Don't have an account?{" "}
                            <Link to="/register">Register Now</Link>
                        </p>
                    </div>

                </div>

            </div>

        </section>

    );

}

export default Login;
