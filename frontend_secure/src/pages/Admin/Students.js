import "./Students.css";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api, { getApiErrorMessage } from "../../services/api";

function Students() {

    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            const res = await api.get("/purchases");
            setPurchases(res.data.purchases || []);
        }
        catch (error) {
            toast.error(getApiErrorMessage(error, "Failed to load students"));
        }
        finally {
            setLoading(false);
        }
    };

    // Only show completed purchases — Pending/Failed aren't real enrollments
    const successfulPurchases = purchases.filter(
        (p) => p.paymentStatus === "Success" && p.studentId && p.subjectId
    );

    // Group purchases by student
    const groupedByStudent = successfulPurchases.reduce((acc, purchase) => {
        const studentId = purchase.studentId._id;

        if (!acc[studentId]) {
            acc[studentId] = {
                student: purchase.studentId,
                subjects: []
            };
        }

        acc[studentId].subjects.push({
            subjectName: purchase.subjectId.subjectName,
            semester: purchase.subjectId.semester,
            amount: purchase.amount,
            purchaseDate: purchase.purchaseDate
        });

        return acc;
    }, {});

    const students = Object.values(groupedByStudent);

    const filteredStudents = students.filter((entry) =>
        entry.student.name?.toLowerCase().includes(search.toLowerCase()) ||
        entry.student.email?.toLowerCase().includes(search.toLowerCase()) ||
        entry.student.phone?.includes(search)
    );

    if (loading) {
        return (
            <div className="students-loading">
                <h2>Loading Students...</h2>
            </div>
        );
    }

    return (
        <div className="admin-students">

            <div className="students-header">
                <div>
                    <h1>Students</h1>
                    <p>Students who have purchased subjects.</p>
                </div>

                <div className="students-count">
                    Total Students: <b>{students.length}</b>
                </div>
            </div>

            <input
                type="text"
                className="students-search"
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {filteredStudents.length === 0 ? (

                <div className="students-empty">
                    <div className="empty-icon">👨‍🎓</div>
                    <h2>No Students Found</h2>
                    <p>
                        {search
                            ? "No students match your search."
                            : "No subjects have been purchased yet."}
                    </p>
                </div>

            ) : (

                <div className="students-table-wrapper">
                    <table className="students-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Subjects Purchased</th>
                                <th>Total Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(({ student, subjects }) => {
                                const totalSpent = subjects.reduce(
                                    (sum, s) => sum + s.amount,
                                    0
                                );

                                return (
                                    <tr key={student._id}>
                                        <td>{student.name}</td>
                                        <td>{student.email}</td>
                                        <td>{student.phone}</td>
                                        <td>
                                            <div className="subject-tags">
                                                {subjects.map((s, idx) => (
                                                    <span
                                                        className="subject-tag"
                                                        key={idx}
                                                    >
                                                        {s.subjectName} (Sem {s.semester})
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td>₹ {totalSpent}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

            )}

        </div>
    );
}

export default Students;