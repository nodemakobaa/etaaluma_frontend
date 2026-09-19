import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const ALL_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const AcademicViewMarksSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentYearNum = new Date().getFullYear();

  // Filter States
  const [classes, setClasses] = useState([]);
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYearNum); // Mwaka wa sasa (mfano 2026)
  const [isAllYears, setIsAllYears] = useState(false); // Option ya kuona miaka yote
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');

  // Matrix Data States
  const [matrixHeader, setMatrixHeader] = useState(null);
  const [matrixSubjects, setMatrixSubjects] = useState([]);
  const [matrixStudents, setMatrixStudents] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const token =
    user?.token ||
    localStorage.getItem('token') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('accessToken');

  const parseArray = (data) => (Array.isArray(data) ? data : data?.data || []);

  // 1. Fetch Classes & Exams Mara ya Kwanza
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) {
        setErrorMessage('Tafadhali ingia tena (Log in) ili kupata matokeo.');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      };

      try {
        const [resCls, resEx] = await Promise.all([
          fetch(`${API_BASE_URL}/admin/classes`, { headers }),
          fetch(`${API_BASE_URL}/admin/exams`, { headers }),
        ]);

        if (resCls.ok) {
          const clsList = parseArray(await resCls.json());
          setClasses(clsList);
          if (clsList.length > 0 && !selectedClassId) {
            setSelectedClassId(clsList[0].ID || clsList[0].id);
          }
        }

        if (resEx.ok) {
          const exData = parseArray(await resEx.json());
          setExams(exData);
          setFilteredExams(exData);
        }
      } catch (err) {
        console.error('Initial data fetch error:', err);
      }
    };

    fetchInitialData();
  }, [token]);

  // 2. Chuja Mitihani kulingana na Year Stepper na Mwezi
  useEffect(() => {
    let result = exams;

    if (!isAllYears && selectedYear) {
      result = result.filter(
        (e) => String(e.year || e.Year || '') === String(selectedYear)
      );
    }

    if (selectedMonth) {
      result = result.filter(
        (e) =>
          (e.month || e.Month || '').toLowerCase() ===
          selectedMonth.toLowerCase()
      );
    }

    setFilteredExams(result);

    // Reset au chagua mtihani unaolingana
    if (!result.some((ex) => String(ex.ID || ex.id) === String(selectedExamId))) {
      setSelectedExamId(result.length > 0 ? String(result[0].ID || result[0].id) : '');
    }
  }, [selectedYear, isAllYears, selectedMonth, exams]);

  // Functions za Year Stepper (Kuongeza ^ na Kupunguza v)
  const handleIncreaseYear = () => {
    setIsAllYears(false);
    setSelectedYear((prev) => Number(prev) + 1);
  };

  const handleDecreaseYear = () => {
    setIsAllYears(false);
    setSelectedYear((prev) => Number(prev) - 1);
  };

  // 3. Fetch Matrix Data
  const handleFetchMatrix = async () => {
    if (!selectedClassId || !selectedExamId) {
      setErrorMessage('Tafadhali chagua Darasa na Mtihani husika.');
      return;
    }

    const selectedClassObj = classes.find(
      (c) => String(c.ID || c.id) === String(selectedClassId)
    );
    const classNameVal = selectedClassObj
      ? selectedClassObj.class_name || selectedClassObj.ClassName
      : '';

    try {
      setLoadingData(true);
      setErrorMessage(null);
      setHasSearched(true);

      const headers = {
        'Content-Type': 'application/json',
        Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}`,
      };

      const queryUrl = `${API_BASE_URL}/admin/exams/marks-matrix?class_id=${selectedClassId}&class_name=${encodeURIComponent(
        classNameVal
      )}&exam_id=${selectedExamId}`;

      const res = await fetch(queryUrl, { headers });
      const resData = await res.json();

      if (res.ok && (resData.status === 'success' || resData.success)) {
        const headerData = resData.header || resData.metadata || {};
        setMatrixHeader(headerData);
        setMatrixSubjects(resData.subjects || []);

        const rawStudents = resData.students || [];

        // Registration number halisi ya shule
        const schoolReg =
          headerData.registration_no ||
          headerData.school_registration_no ||
          user?.registration_no ||
          user?.school_registration_no ||
          (rawStudents.length > 0 && rawStudents[0].index_no
            ? rawStudents[0].index_no.split('/')[0]
            : '');

        // 1. Sort: Wasichana (F) kwanza A-Z, kisha Wavulana (M) A-Z
        const sorted = [...rawStudents].sort((a, b) => {
          const sexA = String(a.sex || a.Sex || '').toUpperCase();
          const sexB = String(b.sex || b.Sex || '').toUpperCase();
          const nameA = String(a.full_name || a.FullName || '').toLowerCase();
          const nameB = String(b.full_name || b.FullName || '').toLowerCase();

          if (sexA !== sexB) {
            return sexA === 'F' ? -1 : 1;
          }
          return nameA.localeCompare(nameB);
        });

        // 2. Re-Index: Tumia registration ya shule (e.g. S0488/0001, S0488/0002)
        const finalStudents = sorted.map((st, index) => {
          const paddedNumber = String(index + 1).padStart(4, '0');
          const prefix = schoolReg || 'S0000';
          return {
            ...st,
            computedIndexNo: `${prefix}/${paddedNumber}`,
          };
        });

        setMatrixStudents(finalStudents);

        if (finalStudents.length === 0) {
          setErrorMessage('Hakuna wanafunzi au alama zilizopatikana kwa darasa na mtihani huu.');
        }
      } else {
        setErrorMessage(resData.message || 'Imeshindikana kupata marks sheet matrix.');
      }
    } catch (err) {
      console.error('Matrix Fetch Error:', err);
      setErrorMessage('Hitilafu ya mtandao kufikia server.');
    } finally {
      setLoadingData(false);
    }
  };

  const logoUrl =
    matrixHeader?.school_logo ||
    matrixHeader?.SchoolLogo ||
    user?.school_logo ||
    user?.data?.school_logo;

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <Link
            to="/academic-dashboard"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-emerald-600 transition"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        {/* Filter Controls Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3">
            Marks Sheet Generation Setup
          </h2>

          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl font-semibold">
              ⚠️ {errorMessage}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* 1. SELECT CLASS */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Class
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Class --</option>
                {classes.map((cls) => (
                  <option key={cls.ID || cls.id} value={cls.ID || cls.id}>
                    {cls.class_name || cls.ClassName}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. YEAR STEPPER (V ILIYOBINUKA ^ NA V YA KAWAIDA) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Filter Year
                </label>
                <button
                  type="button"
                  onClick={() => setIsAllYears(!isAllYears)}
                  className={`text-[11px] font-bold underline cursor-pointer ${
                    isAllYears ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {isAllYears ? '✓ All Years' : 'View All'}
                </button>
              </div>

              <div className="relative flex items-center bg-slate-50 border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500">
                <input
                  type="number"
                  disabled={isAllYears}
                  value={isAllYears ? 'All' : selectedYear}
                  onChange={(e) => {
                    setIsAllYears(false);
                    setSelectedYear(e.target.value);
                  }}
                  className="w-full p-2.5 bg-transparent text-sm font-bold text-slate-800 outline-none pr-9 disabled:text-slate-400"
                  placeholder="Year"
                />

                {/* V ya juu (^) na V ya chini (v) */}
                <div className="absolute right-1 flex flex-col items-center justify-center border-l border-slate-200 pl-1 pr-1 bg-white rounded-r-lg">
                  {/* ^ (V iliyobinuka - Ongeza Mwaka) */}
                  <button
                    type="button"
                    onClick={handleIncreaseYear}
                    title="Ongeza Mwaka"
                    className="p-1 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition rounded text-[11px] leading-none font-extrabold cursor-pointer"
                  >
                    ▲
                  </button>
                  {/* v (V ya kawaida - Punguza Mwaka) */}
                  <button
                    type="button"
                    onClick={handleDecreaseYear}
                    title="Punguza Mwaka"
                    className="p-1 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition rounded text-[11px] leading-none font-extrabold cursor-pointer border-t border-slate-100"
                  >
                    ▼
                  </button>
                </div>
              </div>
            </div>

            {/* 3. ALL 12 MONTHS DROPDOWN */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Filter Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Months</option>
                {ALL_MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. SELECT EXAM */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Select Exam
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">-- Choose Exam --</option>
                {filteredExams.map((ex) => (
                  <option key={ex.ID || ex.id} value={ex.ID || ex.id}>
                    {ex.exam_type || ex.ExamType} - {ex.month || ex.Month}{' '}
                    {ex.year || ex.Year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleFetchMatrix}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer"
            >
              Generate Marks Sheet
            </button>
          </div>
        </div>

        {/* BROADSHEET MATRIX DISPLAY */}
        {loadingData ? (
          <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-slate-200">
            <p className="text-slate-600 font-bold animate-pulse text-base">
              🔄 Generating Marks Sheet Matrix...
            </p>
          </div>
        ) : matrixStudents.length > 0 ? (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            {/* Header with Logo */}
            <div className="relative flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="w-24 hidden md:block"></div>

              <div className="text-center flex-1 space-y-1">
                <h1 className="text-2xl md:text-3xl font-extrabold uppercase text-slate-900 tracking-wide">
                  {matrixHeader?.school_name || user?.school_name || 'MPWAYUNGU SECONDARY SCHOOL'}
                </h1>
                <h2 className="text-md md:text-lg font-bold text-slate-700">
                  {matrixHeader?.class_name || 'Class Marks Sheet'}
                </h2>
                <p className="text-xs md:text-sm font-semibold text-slate-600">
                  {matrixHeader?.exam_type || matrixHeader?.exam_name || 'Monthly Test'}
                </p>
                <p className="text-xs text-slate-500">
                  {matrixHeader?.month_year || `${selectedMonth} ${selectedYear}`}
                </p>
              </div>

              <div className="w-24 flex justify-end items-center">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="School Logo"
                    className="h-20 w-20 object-cover rounded-full border-2 border-slate-200 shadow-sm"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-xs font-bold text-center p-1">
                    LOGO
                  </div>
                )}
              </div>
            </div>

            {/* MARKS MATRIX TABLE */}
            <div className="overflow-x-auto border border-slate-300 rounded-lg">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                    <th className="p-2.5 border-r border-slate-300 text-left">Index No</th>
                    <th className="p-2.5 border-r border-slate-300 text-left min-w-[180px]">
                      Full Name
                    </th>
                    <th className="p-2.5 border-r border-slate-300">Sex</th>

                    {matrixSubjects.map((sub, idx) => {
                      const code = sub.code || sub.subject_code || sub.SubjectCode || '';
                      const name = sub.name || sub.subject_name || sub.SubjectName || '';
                      const short = sub.short_name || code || (name ? name.substring(0, 4) : 'SUB');
                      return (
                        <th key={code || idx} className="p-2.5 border-r border-slate-300 capitalize">
                          {short}
                        </th>
                      );
                    })}

                    <th className="p-2.5">Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {matrixStudents.map((st, sIdx) => {
                    const studentUniqueKey = st.id || st.ID || `st-${sIdx}`;
                    return (
                      <tr key={studentUniqueKey} className="hover:bg-slate-50 transition font-medium">
                        <td className="p-2 border-r border-slate-200 text-left font-mono font-bold text-indigo-700">
                          {st.computedIndexNo}
                        </td>
                        <td className="p-2 border-r border-slate-200 text-left font-semibold text-slate-800">
                          {st.full_name || st.FullName}
                        </td>
                        <td className="p-2 border-r border-slate-200 font-bold">
                          {st.sex || st.Sex}
                        </td>

                        {matrixSubjects.map((sub, subIdx) => {
                          const code = sub.code || sub.subject_code || sub.SubjectCode;
                          const scoresObj = st.scores || st.marks || {};
                          const score = scoresObj[code];
                          return (
                            <td
                              key={code || subIdx}
                              className="p-2 border-r border-slate-200 font-bold text-slate-700"
                            >
                              {score !== undefined && score !== null ? score : '-'}
                            </td>
                          );
                        })}

                        <td className="p-2 font-extrabold text-slate-900">
                          {st.average && st.average > 0 ? Number(st.average).toFixed(1) : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          hasSearched &&
          !loadingData && (
            <div className="bg-white p-8 rounded-2xl text-center shadow-sm border border-slate-200 text-slate-500 font-medium">
              📭 Hakuna matokeo yaliyopatikana kwa darasa na mtihani huu.
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default AcademicViewMarksSetup;