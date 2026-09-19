import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from '../config/api';

const EnterMarksPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const classId = searchParams.get("class_id");
  const subjectCode = searchParams.get("subject_code");
  const examId = searchParams.get("exam_id");

  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [metadata, setMetadata] = useState({
    schoolName: "",
    schoolLogo: "",
    className: "",
    subjectName: "",
    subjectCode: "",
    examName: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isEntryClosed, setIsEntryClosed] = useState(false);

  const calculateGrade = (score) => {
    if (score === "" || score === null || score === undefined || isNaN(score)) return "-";
    const num = parseFloat(score);
    if (num >= 75) return "A";
    if (num >= 65) return "B";
    if (num >= 45) return "C";
    if (num >= 30) return "D";
    return "F";
  };

  const getAuthToken = () => {
    try {
      const savedUser = localStorage.getItem("school_user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.token) return parsed.token;
      }
    } catch (e) {
      console.error("Error reading token:", e);
    }
    return localStorage.getItem("token") || "";
  };

  useEffect(() => {
    const fetchStudents = async () => {
      const token = getAuthToken();
      if (!token) {
        navigate("/login");
        return;
      }
      if (!classId || !subjectCode || !examId) {
        setError("Missing required parameters in the URL.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(
          `${API_BASE_URL}/teacher/mark-entry-students?class_id=${classId}&subject_code=${subjectCode}&exam_id=${examId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok && data.status === "success") {
          setIsEntryClosed(false);
          const studentList = data.students || data.data || [];
          setStudents(studentList);
          if (data.metadata) {
            setMetadata({
              schoolName: data.metadata.school_name || "SCHOOL NAME",
              schoolLogo: data.metadata.school_logo || "",
              className: data.metadata.class_name || "CLASS",
              subjectName: data.metadata.subject_name || "SUBJECT",
              subjectCode: data.metadata.subject_code || subjectCode,
              examName: data.metadata.exam_name || "EXAMINATION",
            });
          }
          const initialMarks = {};
          studentList.forEach((std) => {
            const studentKey = std.index_no || std.student_registration_no;
            initialMarks[studentKey] = std.score !== null && std.score !== undefined ? std.score : "";
          });
          setMarksData(initialMarks);
        } else {
          const closed = res.status === 403 && Boolean(data.message?.toLowerCase().includes("time for entering this type of exam"));
          setIsEntryClosed(closed);
          setError(data.message || "Failed to load student list.");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [classId, subjectCode, examId, navigate]);

  const handleScoreChange = (indexNo, value) => {
    if (isEntryClosed) return;
    if (value === "") {
      setMarksData((prev) => ({ ...prev, [indexNo]: "" }));
      return;
    }
    const valNum = parseFloat(value);
    if (!isNaN(valNum) && valNum >= 0 && valNum <= 100) {
      setMarksData((prev) => ({
        ...prev,
        [indexNo]: value,
      }));
    }
  };

  const handleSaveMarks = async () => {
    if (isEntryClosed) return;
    setSaving(true);
    setError("");
    setSuccessMsg("");
    const token = getAuthToken();
    const marksPayload = Object.keys(marksData).map((indexNo) => ({
      student_registration_no: indexNo,
      score: marksData[indexNo] !== "" ? parseFloat(marksData[indexNo]) : null,
    }));

    try {
      const res = await fetch(`${API_BASE_URL}/teacher/enter-marks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          exam_id: parseInt(examId, 10),
          subject_code: subjectCode,
          class_id: parseInt(classId, 10),
          marks: marksPayload,
        }),
      });
      const data = await res.json();
      if (res.ok && data.status === "success") {
        setSuccessMsg("Marks saved successfully!");
      } else {
        setError(data.message || "Failed to save marks.");
      }
    } catch (err) {
      console.error("Save Error:", err);
      setError("Failed to connect to the server while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <p className="text-slate-600 font-medium text-sm">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 10mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-area {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          input {
            border: none !important;
            background: transparent !important;
            text-align: center !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Action Bar */}
      <div className="no-print bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <button
            onClick={() => navigate("/teacher-dashboard")}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 mb-2 inline-block cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Enter Student Marks</h1>
          <p className="text-slate-500 text-xs mt-1">
            Subject Code: <span className="font-semibold text-slate-700">{metadata.subjectCode}</span> | Subject:{" "}
            <span className="font-semibold text-slate-700">{metadata.subjectName}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition cursor-pointer flex items-center gap-2"
          >
            Print Preview Sheet
          </button>
          <button
            onClick={handleSaveMarks}
            disabled={saving || students.length === 0 || isEntryClosed}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm transition cursor-pointer"
          >
            {saving ? "Saving..." : "Save Marks"}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="no-print bg-red-50 text-red-600 border border-red-200 p-4 rounded-xl text-xs mb-6 font-semibold">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="no-print bg-emerald-50 text-emerald-600 border border-emerald-200 p-4 rounded-xl text-xs mb-6 font-semibold">
          {successMsg}
        </div>
      )}

      {/* Print / Printable Student Table Container */}
      <div className="print-area bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="text-center mb-6 pb-6 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-wide">{metadata.schoolName}</h2>
          <p className="text-sm font-bold text-slate-600 mt-1 uppercase">{metadata.examName}</p>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            CLASS: <span className="text-slate-800 uppercase">{metadata.className}</span> | SUBJECT:{" "}
            <span className="text-slate-800 uppercase">{metadata.subjectName} ({metadata.subjectCode})</span>
          </p>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200 text-left text-xs font-bold text-slate-700 uppercase">
              <th className="py-3 px-2 w-12 text-center">#</th>
              <th className="py-3 px-3">Index No</th>
              <th className="py-3 px-3">Full Name</th>
              <th className="py-3 px-2 text-center w-16">Sex</th>
              <th className="py-3 px-3 text-center w-28">Score (100)</th>
              <th className="py-3 px-3 text-center w-20">Grade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-800">
            {students.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-8 text-center text-slate-400 text-xs">
                  Hakuna wanafunzi waliopatikana kwenye darasa hili.
                </td>
              </tr>
            ) : (
              students.map((st, idx) => {
                const key = st.index_no || st.student_registration_no;
                const scoreVal = marksData[key] !== undefined ? marksData[key] : "";
                const grade = calculateGrade(scoreVal);

                return (
                  <tr key={key} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-2 text-center text-xs text-slate-400 font-semibold">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono text-xs text-slate-600">{st.index_no}</td>
                    <td className="py-3 px-3 uppercase font-semibold text-slate-700">{st.full_name}</td>
                    <td className="py-3 px-2 text-center text-xs text-slate-500 font-bold">{st.sex}</td>
                    <td className="py-3 px-3 text-center">
                      <input
                        disabled={isEntryClosed}
                        type="number"
                        min="0"
                        max="100"
                        value={scoreVal}
                        onChange={(e) => handleScoreChange(key, e.target.value)}
                        className="w-20 p-1.5 border border-slate-300 rounded-lg text-center font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{grade}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnterMarksPage;