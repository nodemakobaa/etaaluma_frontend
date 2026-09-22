import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
//import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AcademicDashboard from './pages/AcademicDashboard';
import ClassManagement from './pages/ClassManagement';
import TeacherManagement from './pages/TeacherManagement';
import SubjectManagement from './pages/SubjectManagement';
import ProtectedRoute from './components/ProtectedRoute';
import AssignSubjectManagement from './pages/AssignSubjectManagement';
import StudentManagement from './pages/StudentManagement';
import ExamManagement from './pages/ExamManagement';
import ViewMarksPage from './components/ViewMarksModal';

// 1. Import TeacherDashboard kutoka pages
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherSettings from './pages/TeacherSettings';
import EnterMarksPage from './pages/EnterMarksPage';
import ViewMarks from './pages/ViewMarks';
import AcademicViewMarksSetup from './pages/AcademicViewMarksSetup';
import AcademicViewMarks from './pages/AcademicViewMarks';
import AcademicGenerateResults from './pages/AcademicGenerateResults';
import StudentReport from './pages/StudentReport';
import IsoSheetManagement from './pages/IsoSheetManagement';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import SubscriptionManagement from './pages/SubscriptionManagement';
import AssignClassTeacher from './pages/AssignClassTeacher';
import ClassTeacherPanel from './pages/ClassTeacherPanel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes for super_admin */}
          <Route element={<ProtectedRoute allowedRole="super_admin" />}>
            <Route path="/super-admin/dashboard" element={<SuperAdminDashboard />} />
          </Route>

          {/* Protected Routes for school_admin */}
          <Route element={<ProtectedRoute allowedRole="school_admin" />}>
            <Route path="/academic-dashboard" element={<AcademicDashboard />} />
            <Route path="/academic/classes" element={<ClassManagement />} />
            <Route path="/academic/teachers" element={<TeacherManagement />} />
            <Route path="/academic/subjects" element={<SubjectManagement />} />
            <Route path="/assign-subjects" element={<AssignSubjectManagement />} />
            <Route path="/register-students" element={<StudentManagement />} />
            <Route path="/exam-management" element={<ExamManagement />} />
            <Route path="/view-marks" element={<ViewMarksPage />} />
            <Route path="/academic/view-marks" element={<AcademicViewMarksSetup />} />
            <Route path="/academic/view-marks-details" element={<AcademicViewMarks />} />
            <Route path="/academic/generate-results" element={<AcademicGenerateResults />} /> 
            <Route path="/academic-dashboard" element={<AcademicDashboard />} /> 
            <Route path="/academic/student-report" element={<StudentReport />} /> 
            <Route path="/academic/iso-sheet-management" element={<IsoSheetManagement />} />
            <Route path="/academic/subscription" element={<SubscriptionManagement />} />
            <Route path="/academic/assign-class-teacher" element={<AssignClassTeacher />} />
          </Route>

          {/* 2. Protected Routes for teacher */}
          <Route element={<ProtectedRoute allowedRole="teacher" />}>
            <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/enter-marks" element={<EnterMarksPage />} />
            <Route path="/teacher/view-marks" element={<ViewMarks />} />
            <Route path="/teacher/settings" element={<TeacherSettings />} />
            <Route path="/teacher/class-panel" element={<ClassTeacherPanel />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
