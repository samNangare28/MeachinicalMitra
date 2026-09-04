import "./About.css";
import { Link } from "react-router-dom";
import HeroImage from "../../assets/logo/logo.jpeg";

import {
    FaArrowRight,
    FaGraduationCap,
    FaUsers,
    FaLaptopCode,
    FaHeart
} from "react-icons/fa";

const values = [
    {
        icon: <FaGraduationCap />,
        title: "Student First",
        text: "Every subject, chapter and lecture is built around what students actually need to clear their MSBTE exams."
    },
    {
        icon: <FaLaptopCode />,
        title: "Practical Learning",
        text: "We focus on real explanations, not just theory — practical examples that make concepts stick."
    },
    {
        icon: <FaUsers />,
        title: "Built by Students",
        text: "Mechanical Mitra was created to solve a real problem — scattered, hard-to-find study material for Mechanical Engineering diploma students."
    },
    {
        icon: <FaHeart />,
        title: "Affordable Access",
        text: "Quality education shouldn't be expensive. We keep our pricing fair so every student can learn without barriers."
    }
];

function About() {

    return (
        <>
            {/* HERO */}
            <section className="about-hero">
                <div className="about-hero-container">

                    <div className="about-hero-content">
                        <span className="hero-badge">
                            About Mechanical Mitra
                        </span>

                        <h1>
                            Helping Mechanical Students
                            <span> Learn Smarter, Not Harder.</span>
                        </h1>

                        <p>
                            Mechanical Mitra is a learning platform built specifically
                            for Mechanical Engineering diploma students — bringing
                            structured subjects, HD lectures and downloadable notes
                            together in one place.
                        </p>

                        <Link to="/subjects" className="primary-btn">
                            Explore Subjects
                            <FaArrowRight />
                        </Link>
                    </div>

                    <div className="about-hero-image">
                        <img
                            src={HeroImage}
                            alt="Mechanical Mitra"
                            className="about-hero-img"
                        />
                    </div>

                </div>
            </section>

            {/* MISSION */}
            <section className="mission">
                <div className="section-title">
                    <span>Our Mission</span>
                    <h2>Why We Started Mechanical Mitra</h2>
                    <p>
                        Diploma students often struggle to find well-organized,
                        exam-focused material for Mechanical Engineering subjects.
                        We built Mechanical Mitra to fix exactly that — one platform,
                        every semester, everything you need.
                    </p>
                </div>
            </section>

            {/* VALUES */}
            <section className="values">
                <div className="section-title">
                    <span>What We Stand For</span>
                    <h2>Our Core Values</h2>
                </div>

                <div className="values-container">
                    {values.map((value, idx) => (
                        <div className="value-card" key={idx}>
                            <div className="value-icon">{value.icon}</div>
                            <h3>{value.title}</h3>
                            <p>{value.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="about-cta">
                <div className="about-cta-container">
                    <h2>Ready to Start Learning?</h2>
                    <p>Join Mechanical Mitra today and access every subject you need.</p>
                    <Link to="/register" className="primary-btn">
                        Get Started
                        <FaArrowRight />
                    </Link>
                </div>
            </section>
        </>
    );
}

export default About;