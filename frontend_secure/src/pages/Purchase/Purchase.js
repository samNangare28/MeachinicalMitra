import "./Purchase.css";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import Loader from "../../components/Loader/Loader";

function Purchase() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [subject, setSubject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchSubject();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const fetchSubject = async () => {
        try {
            const res = await api.get(`/subjects/${id}`);
            setSubject(res.data.subject);
        } catch (error) {
            console.log(error);
            toast.error("Failed to load subject");
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = async () => {
        setProcessing(true);

        try {
            // 1. Create Razorpay order via backend (auth cookie sent automatically)
            const { data } = await api.post("/purchases", { subjectId: subject._id });

            if (!data.success) {
                toast.error(data.message);
                setProcessing(false);
                return;
            }

            // 2. Open Razorpay Checkout
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "Mechanical Mitra",
                description: `Purchase: ${subject.subjectName}`,
                order_id: data.orderId,
                handler: (response) => verifyPayment(response, data.purchaseId),
                modal: {
                    ondismiss: () => setProcessing(false)
                },
                theme: { color: "#F97316" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Purchase failed");
            setProcessing(false);
        }
    };

    const verifyPayment = async (response, purchaseId) => {
        try {
            const verifyRes = await api.post("/purchases/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                purchaseId
            });

            if (verifyRes.data.success) {
                toast.success("Payment successful! Subject unlocked.");
                navigate("/dashboard");
            } else {
                toast.error("Payment verification failed");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Payment verification failed");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <Loader label="Loading subject..." />;
    }

    return (
        <section className="purchase-page">
            <div className="purchase-container">
                <div className="purchase-left">
                    <img
                        src={
                            subject.thumbnail && subject.thumbnail.trim() !== ""
                                ? subject.thumbnail
                                : "/assets/logo/logo.jpeg"
                        }
                        alt={subject.subjectName}
                    />
                    <h1>{subject.subjectName}</h1>
                    <span>Semester {subject.semester}</span>
                    <p>{subject.description}</p>
                </div>

                <div className="purchase-right">
                    <h2>\u20b9{subject.price}</h2>
                    <ul>
                        <li>Lifetime Access</li>
                        <li>HD Video Lectures</li>
                        <li>Downloadable PDF Notes</li>
                        <li>Practical Examples</li>
                        <li>Mobile & Desktop Access</li>
                    </ul>
                    <button onClick={handlePurchase} disabled={processing}>
                        {processing ? "Processing..." : "Proceed to Purchase"}
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Purchase;
