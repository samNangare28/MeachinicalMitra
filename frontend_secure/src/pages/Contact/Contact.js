import "./Contact.css";
import { useState } from "react";
import toast from "react-hot-toast";
import {
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaPaperPlane
} from "react-icons/fa";
import { isValidEmail } from "../../utils/validation";

function Contact() {

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.name.trim() || !formData.message.trim()) {
            toast.error("Please fill all fields");
            return;
        }

        if (!isValidEmail(formData.email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        // Opens the user's default mail client with the message pre-filled.
        // Replace this with an axios POST to a backend /api/contact route
        // once you have one set up to save/send messages via Brevo.
        const subject = encodeURIComponent(`New message from ${formData.name}`);
        const body = encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`
        );

        window.location.href = `mailto:siddheshnangare1012@gmail.com?subject=${subject}&body=${body}`;

        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
    };

    return (
        <section className="contact-page">

            <div className="contact-header">
                <span className="hero-badge">Get In Touch</span>
                <h1>Contact Us</h1>
                <p>
                    Have a question about a subject, a payment, or just want to
                    say hello? We'd love to hear from you.
                </p>
            </div>

            <div className="contact-container">

                {/* Info */}
                <div className="contact-info">

                    <div className="info-card">
                        <div className="info-icon"><FaEnvelope /></div>
                        <div>
                            <h3>Email</h3>
                            <p>siddheshnangare1012@gmail.com</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon"><FaPhoneAlt /></div>
                        <div>
                            <h3>Phone</h3>
                            <p>+91 86694 45540</p>
                        </div>
                    </div>

                    <div className="info-card">
                        <div className="info-icon"><FaMapMarkerAlt /></div>
                        <div>
                            <h3>Location</h3>
                            <p>Maharashtra, India</p>
                        </div>
                    </div>

                </div>

                {/* Form */}
                <div className="contact-form-card">

                    {submitted ? (
                        <div className="contact-success">
                            <h3>Thanks for reaching out! 🎉</h3>
                            <p>Your email app should have opened with your message ready to send.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>

                            <div className="form-group">
                                <label>Your Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your name"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Your Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Write your message..."
                                    rows="5"
                                    required
                                />
                            </div>

                            <button type="submit" className="contact-submit-btn">
                                Send Message
                                <FaPaperPlane />
                            </button>

                        </form>
                    )}

                </div>

            </div>

        </section>
    );
}

export default Contact;