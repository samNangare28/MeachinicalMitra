import "../Login/Login.css";
import HeroImage from "../../assets/logo/logo.jpeg";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { isValidEmail, isValidPhone, isValidName, passwordIssues } from "../../utils/validation";

function Register() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        const next = {};
        if (!isValidName(formData.name)) next.name = "Enter your full name (letters only, 2-60 characters)";
        if (!isValidEmail(formData.email)) next.email = "Enter a valid email address";
        if (!isValidPhone(formData.phone)) next.phone = "Enter a valid 10-digit phone number";

        const pwIssues = passwordIssues(formData.password);
        if (pwIssues.length > 0) next.password = `Password needs ${pwIssues.join(", ")}`;

        if (formData.password !== formData.confirmPassword) next.confirmPassword = "Passwords do not match";

        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            setLoading(true);

            const response = await api.post("/auth/register", {
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                password: formData.password
            });

            login(response.data.user);
            toast.success(response.data.message || "Account created!");
            navigate("/dashboard");
        }
        catch (error) {
            toast.error(error.response?.data?.message || "Registration Failed");
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

                    <h1>Create Account</h1>
                    <p>Join Mechanical Mitra and start learning today.</p>

                    <form onSubmit={handleSubmit} noValidate>

                        <div className="input-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={handleChange}
                                autoComplete="name"
                                maxLength={60}
                                required
                            />
                            {errors.name && <span className="field-error">{errors.name}</span>}
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                maxLength={254}
                                required
                            />
                            {errors.email && <span className="field-error">{errors.email}</span>}
                        </div>

                        <div className="input-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                placeholder="10-digit phone number"
                                value={formData.phone}
                                onChange={handleChange}
                                autoComplete="tel"
                                maxLength={10}
                                required
                            />
                            {errors.phone && <span className="field-error">{errors.phone}</span>}
                        </div>

                        <div className="input-group">
                            <label>Password</label>
                            <div className="password-box">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create a strong password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    maxLength={128}
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
                            <span className="field-hint">8+ characters, with an uppercase, lowercase and number</span>
                            {errors.password && <span className="field-error">{errors.password}</span>}
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>
                            <div className="password-box">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    autoComplete="new-password"
                                    maxLength={128}
                                    required
                                />
                                <button
                                    type="button"
                                    className="show-password-btn"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                        </div>

                        <button type="submit" className="login-btn" disabled={loading}>
                            {loading ? "Creating Account..." : "Register"}
                        </button>

                    </form>

                    <div className="register-link">
                        <p>
                            Already have an account?{" "}
                            <Link to="/login">Login</Link>
                        </p>
                    </div>

                </div>

            </div>

        </section>

    );

}

export default Register;
