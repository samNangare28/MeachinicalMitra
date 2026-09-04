import "./Footer.css";

import { Link } from "react-router-dom";

import {
    FaInstagram,
    FaYoutube,
    FaLinkedin,
    FaGithub,
    FaPhoneAlt,
    FaEnvelope,
    FaMapMarkerAlt,
    FaTools
} from "react-icons/fa";

function Footer() {

    return (

        <footer className="footer">

            <div className="footer-container">

                {/* Logo Section */}

                <div className="footer-box">

                    <div className="footer-logo">

                        <FaTools className="footer-logo-icon" />

                        <h2>
                            Mechanical Mitra
                        </h2>

                    </div>

                    <p>
                        Learn Mechanical Engineering smarter with
                        HD video lectures, notes and structured
                        semester-wise courses.
                    </p>

                    <div className="footer-contact">

                        <p>
                            <FaMapMarkerAlt />
                            Pune, Maharashtra
                        </p>

                        <p>
                            <FaPhoneAlt />
                            +91 9876543210
                        </p>

                        <p>
                            <FaEnvelope />
                            support@mechanicalmitra.com
                        </p>

                    </div>

                </div>


                {/* Quick Links */}

                <div className="footer-box">

                    <h3>Quick Links</h3>

                    <Link to="/">Home</Link>

                    <Link to="/subjects">Subjects</Link>

                    <Link to="/about">About</Link>

                    <Link to="/contact">Contact</Link>

                </div>


                {/* Student */}

                <div className="footer-box">

                    <h3>Student</h3>

                    <Link to="/login">Login</Link>

                    <Link to="/register">Register</Link>

                    <Link to="/dashboard">Dashboard</Link>

                    <Link to="/profile">Profile</Link>

                </div>


                {/* Follow Us */}

                <div className="footer-box">

                    <h3>Follow Us</h3>

                    <div className="social-icons">

                        <a
                            href="https://www.instagram.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                        >
                            <FaInstagram />
                        </a>

                        <a
                            href="https://www.youtube.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="YouTube"
                        >
                            <FaYoutube />
                        </a>

                        <a
                            href="https://www.linkedin.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                        >
                            <FaLinkedin />
                        </a>

                        <a
                            href="https://github.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                        >
                            <FaGithub />
                        </a>

                    </div>

                </div>

            </div>


            {/* Bottom */}

            <div className="footer-bottom">

                <p>
                    © 2026 Mechanical Mitra. All Rights Reserved.
                </p>

            </div>

        </footer>

    );

}

export default Footer;