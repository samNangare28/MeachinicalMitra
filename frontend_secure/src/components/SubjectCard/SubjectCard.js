import "./SubjectCard.css";
import { useEffect, useState } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";

function Subjects() {

    const [subjects, setSubjects] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [semester, setSemester] = useState("All");

    // ================= FETCH SUBJECTS =================

    const fetchSubjects = async () => {

        try {

            const res = await api.get("/subjects");

            setSubjects(res.data.subjects);

        }

        catch (error) {

            console.log(error);

        }

        finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchSubjects();

    }, []);

    // ================= FILTER =================

    const filteredSubjects = subjects.filter((subject) => {

        const matchSearch = subject.subjectName
            .toLowerCase()
            .includes(search.toLowerCase());

        const matchSemester =
            semester === "All" ||
            subject.semester === Number(semester);

        return matchSearch && matchSemester;

    });

    return (

        <section className="subjects-page">

            {/* ================= HERO ================= */}

            <div className="subjects-hero">

                <h1>

                    Explore Mechanical Subjects

                </h1>

                <p>

                    Learn semester-wise Mechanical Engineering
                    with HD video lectures, notes and practical examples.

                </p>

            </div>

            {/* ================= SEARCH & FILTER ================= */}

            <div className="subjects-filter">

                <input

                    type="text"

                    placeholder="Search Subject..."

                    value={search}

                    onChange={(e) => setSearch(e.target.value)}

                />

                <select

                    value={semester}

                    onChange={(e) => setSemester(e.target.value)}

                >

                    <option value="All">All Semesters</option>

                    <option value="1">Semester 1</option>

                    <option value="2">Semester 2</option>

                    <option value="3">Semester 3</option>

                    <option value="4">Semester 4</option>

                    <option value="5">Semester 5</option>

                    <option value="6">Semester 6</option>

                </select>

            </div>

            {/* ================= SUBJECTS ================= */}

            <div className="subjects-container">

                    {

                        loading ? (

                            <h2 className="loading">

                                Loading Subjects...

                            </h2>

                        ) : filteredSubjects.length === 0 ? (

                            <h2 className="loading">

                                No Subjects Found

                            </h2>

                        ) : (

                            filteredSubjects.map((subject) => (

                                <div

                                    className="subject-card"

                                    key={subject._id}

                                >

                                    <img

                                        src={

                                            subject.thumbnail && subject.thumbnail.trim() !== ""

                                                ? subject.thumbnail

                                                : "/assets/logo/logo.jpeg"

                                        }

                                        alt={subject.subjectName}

                                    />

                                    <div className="subject-content">

                                        <span className="semester-badge">

                                            Semester {subject.semester}

                                        </span>

                                        <h3>

                                            {subject.subjectName}

                                        </h3>

                                        <p>

                                            {subject.description}

                                        </p>

                                        <div className="subject-footer">

                                            <h4>

                                                ₹{subject.price}

                                            </h4>

                                            <Link

                                                to={`/subjects/${subject._id}`}

                                            >

                                                <button>

                                                    View Details

                                                </button>

                                            </Link>

                                        </div>

                                    </div>

                                </div>

                            ))

                        )

                    }

            </div>

        </section>

    );

}

export default Subjects;