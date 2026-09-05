import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";

import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import AdminLayout from "./pages/components/AdminLayout";
import VerifyDevice from "./pages/VerifyDevice/VerifyDevice";

// Public Pages
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

// Student Pages
import Dashboard from "./pages/Student/Dashboard";
import StudentSubjects from "./components/SubjectCard/SubjectCard";
import SubjectDetails from "./pages/SubjectDetails/SubjectDetails";
import Purchase from "./pages/Purchase/Purchase";
import Learning from "./pages/Learning/Learning";

// Admin Pages
import AdminDashboard from "./pages/Admin/Dashboard";
import Chapters from "./pages/Admin/Chapters/Chapters";
import AdminSubjects from "./pages/Admin/Subjects";
import AddSubject from "./pages/Admin/AddSubject";
import EditSubject from "./pages/Admin/EditSubject";
import ChapterManagement from "./pages/Admin/ChapterManagement";
import AddChapter from "./pages/Admin/Chapters/AddChapter";
import EditChapter from "./pages/Admin/Chapters/EditChapter";
import LectureManagement from "./pages/Admin/Lectures/LectureManagement";
import AddLecture from "./pages/Admin/Lectures/AddLecture";
import LectureDetails from "./pages/Admin/Lectures/LectureDetails";
import EditLecture from "./pages/Admin/Lectures/EditLecture";
import Students from "./pages/Admin/Students";
import AdminPurchases from "./pages/Admin/Purchases";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";

// Wraps every /admin/* page in the shared sidebar layout, so each admin
// page file only has to render its own content instead of re-implementing
// navigation. Also guards it behind AdminRoute in one place.
function Admin({ children }) {
    return (
        <AdminRoute>
            <AdminLayout>{children}</AdminLayout>
        </AdminRoute>
    );
}

function App() {

    return (

        <BrowserRouter>

            <Toaster position="top-center" toastOptions={{ duration: 3500 }} />

            <Navbar />

            <Routes>

                {/* Public */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/subjects" element={<StudentSubjects />} />
                <Route path="/subjects/:id" element={<SubjectDetails />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/verify-device" element={<VerifyDevice />} />

                {/* Student */}
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/purchase/:id" element={<ProtectedRoute><Purchase /></ProtectedRoute>} />
                <Route path="/learning/:subjectId" element={<ProtectedRoute><Learning /></ProtectedRoute>} />

                {/* Admin */}
                <Route path="/admin/dashboard" element={<Admin><AdminDashboard /></Admin>} />
                <Route path="/admin/subjects" element={<Admin><AdminSubjects /></Admin>} />
                <Route path="/admin/subjects/add" element={<Admin><AddSubject /></Admin>} />
                <Route path="/admin/subjects/edit/:id" element={<Admin><EditSubject /></Admin>} />
                <Route path="/admin/chapters" element={<Admin><ChapterManagement /></Admin>} />
                <Route path="/admin/subjects/:subjectId/chapters" element={<Admin><Chapters /></Admin>} />
                <Route path="/admin/chapters/add" element={<Admin><AddChapter /></Admin>} />
                <Route path="/admin/chapters/edit/:id" element={<Admin><EditChapter /></Admin>} />
                <Route path="/admin/lectures" element={<Admin><LectureManagement /></Admin>} />
                <Route path="/admin/lectures/add" element={<Admin><AddLecture /></Admin>} />
                <Route path="/admin/lectures/view/:id" element={<Admin><LectureDetails /></Admin>} />
                <Route path="/admin/lectures/edit/:id" element={<Admin><EditLecture /></Admin>} />
                <Route path="/admin/students" element={<Admin><Students /></Admin>} />
                <Route path="/admin/purchases" element={<Admin><AdminPurchases /></Admin>} />
            </Routes>

            <Footer />

        </BrowserRouter>

    );

}

export default function AppWithProviders() {
    return (
        <AuthProvider>
            <App />
        </AuthProvider>
    );
}
