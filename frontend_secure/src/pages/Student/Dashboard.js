import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./Dashboard.css";

function Dashboard() {

    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await api.get("/purchases/my");
            setPurchases(res.data.purchases);
        }
        catch (error) {
            console.log(error);
        }
        finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <h2>Loading Dashboard...</h2>
            </div>
        );
    }

    // Filter out purchases whose subject no longer exists (deleted subject, bad data, etc.)
    const validPurchases = purchases.filter((purchase) => purchase.subjectId);

    return (
        <section className="dashboard">

            {/* Welcome */}
            <div className="dashboard-header">
                <h1>
                    Welcome Back,
                    <span> {user?.name}</span>
                </h1>
                <p>
                    Continue your learning journey.
                </p>
            </div>

            {/* Statistics */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Purchased Subjects</h3>
                    <h2>
                        {validPurchases.length}
                    </h2>
                </div>
            </div>

            {/* My Courses */}
            <div className="dashboard-courses">
                <h2>
                    My Courses
                </h2>

                {
                    validPurchases.length === 0 ?
                    (
                        <div className="empty-course">
                            <p>
                                You haven't purchased any subjects yet.
                            </p>

                            <Link
                                to="/subjects"
                                className="browse-btn"
                            >
                                Browse Subjects
                            </Link>
                        </div>
                    )
                    :
                    (
                        validPurchases.map((purchase) => (
                            <div
                                key={purchase._id}
                                className="course-card"
                            >
                                <img
                                    src={
                                        purchase.subjectId.thumbnail ||
                                        "/assets/logo/logo.jpeg"
                                    }
                                    alt={purchase.subjectId.subjectName}
                                />

                                <div className="course-info">
                                    <h3>
                                        {purchase.subjectId.subjectName}
                                    </h3>
                                    <p>
                                        Semester {purchase.subjectId.semester}
                                    </p>
                                </div>

                                <Link
                                    to={`/learning/${purchase.subjectId._id}`}
                                    className="learn-btn"
                                >
                                    Start Learning
                                </Link>
                            </div>
                        ))
                    )
                }
            </div>
        </section>
    );
}

export default Dashboard;
