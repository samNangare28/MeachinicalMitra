import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import "./Purchases.css";

function statusClass(status) {
    if (status === "Success") return "badge badge-success";
    if (status === "Failed") return "badge badge-danger";
    return "badge badge-pending";
}

function Purchases() {

    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchPurchases();
    }, []);

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const res = await api.get("/purchases");
            setPurchases(res.data.purchases || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to load purchases");
        } finally {
            setLoading(false);
        }
    };

    const filtered = purchases.filter((p) => {
        const term = search.toLowerCase();
        return (
            p.studentId?.name?.toLowerCase().includes(term) ||
            p.studentId?.email?.toLowerCase().includes(term) ||
            p.subjectId?.subjectName?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="admin-page">
            <div className="page-header">
                <div>
                    <h1>Purchases</h1>
                    <p className="page-subtitle">All subject purchase orders and their payment status.</p>
                </div>
                <input
                    className="search-input"
                    placeholder="Search by student or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="table-card">
                {loading ? (
                    <p className="empty-state">Loading purchases...</p>
                ) : filtered.length === 0 ? (
                    <p className="empty-state">No purchases found.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="mm-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Subject</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => (
                                    <tr key={p._id}>
                                        <td>
                                            <div className="cell-primary">{p.studentId?.name || "Unknown"}</div>
                                            <div className="cell-secondary">{p.studentId?.email}</div>
                                        </td>
                                        <td>{p.subjectId?.subjectName || "Deleted subject"}</td>
                                        <td>₹{p.amount}</td>
                                        <td><span className={statusClass(p.paymentStatus)}>{p.paymentStatus}</span></td>
                                        <td>{p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Purchases;
