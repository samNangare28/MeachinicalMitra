import "./Dashboard.css";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {

    const { user } = useAuth();

    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 17) {
        greeting = "Good Afternoon";
    }

    const [stats, setStats] = useState({
        subjects: 0,
        chapters: 0,
        lectures: 0,
        students: 0
    });

    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [subjectsRes, chaptersRes, lecturesRes, purchasesRes] =
                await Promise.allSettled([
                    api.get("/subjects"),
                    api.get("/chapters"),
                    api.get("/lectures"),
                    api.get("/purchases")
                ]);

            const subjects =
                subjectsRes.status === "fulfilled"
                    ? subjectsRes.value.data.subjects || []
                    : [];

            const chapters =
                chaptersRes.status === "fulfilled"
                    ? chaptersRes.value.data.chapters || []
                    : [];

            const lectures =
                lecturesRes.status === "fulfilled"
                    ? lecturesRes.value.data.lectures || []
                    : [];

            const purchases =
                purchasesRes.status === "fulfilled"
                    ? purchasesRes.value.data.purchases || []
                    : [];

            const successfulPurchases = purchases.filter(
                (p) => p.paymentStatus === "Success" && p.studentId
            );

            // Unique students who have purchased at least one subject
            const uniqueStudentIds = new Set(
                successfulPurchases.map((p) => p.studentId._id)
            );

            setStats({
                subjects: subjects.length,
                chapters: chapters.length,
                lectures: lectures.length,
                students: uniqueStudentIds.size
            });

            // Build recent activity from the most recent purchases
            const activity = successfulPurchases
                .filter((p) => p.subjectId)
                .sort(
                    (a, b) =>
                        new Date(b.purchaseDate) - new Date(a.purchaseDate)
                )
                .slice(0, 5)
                .map((p) => ({
                    id: p._id,
                    text: `💳 ${p.studentId?.name || "A student"} purchased "${p.subjectId.subjectName}"`,
                    date: p.purchaseDate
                }));

            setRecentActivity(activity);
        }
        catch (error) {
            console.log("DASHBOARD FETCH ERROR:", error);
        }
        finally {
            setLoading(false);
        }
    };

    return (

        <>

                <div className="dashboard-top">

                    <div>
                        <h3>{greeting} 👋</h3>
                        <h1>
                            Welcome Back,
                            <span> {user?.name}</span>
                        </h1>
                        <p>Manage your Mechanical Mitra platform from one place.</p>
                    </div>

                    <div className="admin-profile">
                        <div className="profile-circle">
                            {user?.name?.charAt(0)}
                        </div>
                        <div>
                            <h4>{user?.name}</h4>
                            <span>Administrator</span>
                        </div>
                    </div>

                </div>

                <div className="stats-grid">

                    <Link to="/admin/subjects" className="stat-card subjects">
                        <div className="stat-icon">📚</div>
                        <h2>{loading ? "…" : stats.subjects}</h2>
                        <p>Total Subjects</p>
                    </Link>

                    <Link to="/admin/chapters" className="stat-card chapters">
                        <div className="stat-icon">📖</div>
                        <h2>{loading ? "…" : stats.chapters}</h2>
                        <p>Total Chapters</p>
                    </Link>

                    <Link to="/admin/lectures" className="stat-card lectures">
                        <div className="stat-icon">🎥</div>
                        <h2>{loading ? "…" : stats.lectures}</h2>
                        <p>Total Lectures</p>
                    </Link>

                    <Link to="/admin/students" className="stat-card students">
                        <div className="stat-icon">👨‍🎓</div>
                        <h2>{loading ? "…" : stats.students}</h2>
                        <p>Total Students</p>
                    </Link>

                </div>

                <div className="dashboard-row">

                    <div className="quick-actions">
                        <h2>⚡ Quick Actions</h2>
                        <div className="action-grid">

                            <Link to="/admin/subjects/add" className="action-card">
                                <span>📚</span>
                                <h3>Add Subject</h3>
                                <p>Create a new subject.</p>
                            </Link>

                            <Link to="/admin/chapters/add" className="action-card">
                                <span>📖</span>
                                <h3>Add Chapter</h3>
                                <p>Create chapters for subjects.</p>
                            </Link>

                            <Link to="/admin/lectures/add" className="action-card">
                                <span>🎥</span>
                                <h3>Add Lecture</h3>
                                <p>Upload lecture videos.</p>
                            </Link>

                            <Link to="/admin/students" className="action-card">
                                <span>👨‍🎓</span>
                                <h3>Students</h3>
                                <p>View registered students.</p>
                            </Link>

                        </div>
                    </div>

                    <div className="recent-activity">
                        <h2>📈 Recent Activity</h2>
                        <ul>
                            {loading ? (
                                <li>Loading...</li>
                            ) : recentActivity.length === 0 ? (
                                <li>No recent activity yet.</li>
                            ) : (
                                recentActivity.map((item) => (
                                    <li key={item.id}>{item.text}</li>
                                ))
                            )}
                        </ul>
                    </div>

                </div>

        </>

    );

}

export default Dashboard;