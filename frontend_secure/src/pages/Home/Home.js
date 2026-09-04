import "./Home.css";
import { Link } from "react-router-dom";
import HeroImage from "../../assets/logo/logo.jpeg";

import {
    FaArrowRight,
    FaBookOpen,
    FaPlayCircle,
    FaFilePdf,
    FaBullseye,
    FaCogs,
    FaFire,
    FaTools,
    FaBolt,
    FaTint,
    FaDraftingCompass
} from "react-icons/fa";

const features = [
    {
        icon: <FaBookOpen />,
        title: "Structured Subjects",
        text: "Learn every semester with properly organized subjects, chapters and lectures."
    },
    {
        icon: <FaPlayCircle />,
        title: "HD Video Lectures",
        text: "Watch high quality lectures anytime and revise difficult concepts easily."
    },
    {
        icon: <FaFilePdf />,
        title: "Notes & PDFs",
        text: "Download handwritten notes, PDFs and study materials for every chapter."
    },
    {
        icon: <FaBullseye />,
        title: "Exam Focused",
        text: "Learn exactly what is required for MSBTE exams with practical explanations."
    }
];

const subjects = [
    {
        icon: <FaCogs />,
        title: "Engineering Mechanics",
        text: "Fundamentals of force, motion and equilibrium."
    },
    {
        icon: <FaFire />,
        title: "Thermodynamics",
        text: "Heat, work, energy and thermal systems."
    },
    {
        icon: <FaTools />,
        title: "Strength of Materials",
        text: "Stress, strain and material behaviour."
    },
    {
        icon: <FaBolt />,
        title: "Theory of Machines",
        text: "Mechanisms, gears and machine design."
    },
    {
        icon: <FaTint />,
        title: "Fluid Mechanics",
        text: "Fluid flow, pressure and hydraulic systems."
    },
    {
        icon: <FaDraftingCompass />,
        title: "Engineering Graphics",
        text: "Technical drawing and engineering design."
    }
];

function Home() {

    return (
        <>
            {/* HERO */}
            <section className="hero">
                <div className="hero-container">

                    <div className="hero-content">
                        <span className="hero-badge">
                            🚀 Maharashtra's Mechanical Learning Platform
                        </span>

                        <h1>
                            Learn Mechanical
                            <span> Diploma Smarter.</span>
                        </h1>

                        <p>
                            Master every Mechanical Engineering subject with
                            structured chapters, HD video lectures,
                            downloadable PDFs and exam-focused learning.
                        </p>

                        <div className="hero-buttons">
                            <Link to="/subjects" className="primary-btn">
                                Explore Subjects
                                <FaArrowRight />
                            </Link>

                            <Link to="/register" className="secondary-btn">
                                Get Started
                            </Link>
                        </div>
                    </div>

                    <div className="hero-image">
                        <img
                            src={HeroImage}
                            alt="Mechanical Mitra"
                            className="hero-img"
                        />
                    </div>

                </div>
            </section>

            {/* WHY CHOOSE US */}
            <section className="features">
                <div className="section-title">
                    <span>Why Choose Us</span>
                    <h2>Why Mechanical Mitra?</h2>
                    <p>
                        Everything you need to master Mechanical Engineering,
                        all in one platform.
                    </p>
                </div>

                <div className="features-container">
                    {features.map((feature, idx) => (
                        <div className="feature-card" key={idx}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3>{feature.title}</h3>
                            <p>{feature.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* SUBJECTS */}
            <section className="subjects">
                <div className="section-title">
                    <span>Our Subjects</span>
                    <h2>Popular Mechanical Subjects</h2>
                    <p>
                        Learn semester-wise Mechanical Engineering subjects
                        with HD lectures, notes and practical examples.
                    </p>
                </div>

                <div className="subjects-container">
                    {subjects.map((subject, idx) => (
                        <div className="subject-card" key={idx}>
                            <div className="subject-icon">{subject.icon}</div>
                            <h3>{subject.title}</h3>
                            <p>{subject.text}</p>
                        </div>
                    ))}
                </div>

                <div className="subjects-btn">
                    <Link to="/subjects" className="primary-btn">
                        Explore All Subjects
                        <FaArrowRight />
                    </Link>
                </div>
            </section>
        </>
    );
}

export default Home;