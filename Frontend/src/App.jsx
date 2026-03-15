import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/layout/Layout";
import Auth from "./pages/Auth";

// Student Pages
import StudentHome from "./pages/student/StudentHome";
import Profile from "./pages/student/Profile";
import Applications from "./pages/student/Applications";
import Company from "./pages/student/Company";
import InterviewExperiences from "./pages/student/InterviewExperiences";
import Opportunities from "./pages/student/Opportunities";
import CodingProfiles from "./pages/student/CodingProfiles";
import ResumeBuilder from "./pages/student/ResumeBuilder";
import Practice from "./pages/student/Practice";
import PlacementInsights from "./pages/student/PlacementInsights";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentManagement from "./pages/admin/StudentManagement";
import CompanyAdd from "./pages/admin/CompanyAdd";
import AdminQuestions from "./pages/admin/Questions";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminProfile from "./pages/admin/AdminProfile";

// Recruiter Pages
import RecruiterDashboard from "./pages/recruiter/RecruiterDashboard";
import ShortlistedCandidates from "./pages/recruiter/ShortlistedCandidates";
import JAFDashboard from "./pages/recruiter/JAFDashboard";
import JAFCreationWizard from "./pages/recruiter/JAFCreationWizard";
import JAFDetail from "./pages/recruiter/JAFDetail";
import ActiveDrives from "./pages/recruiter/ActiveDrives";
import TnpConnect from "./pages/recruiter/TnpConnect";
import Broadcasts from "./pages/recruiter/Broadcasts";
import RecruiterProfile from "./pages/recruiter/RecruiterProfile";

// Shared Pages
import Calendar from "./pages/Calendar";

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "student") return <Navigate to="/student" replace />;
  if (user.role === "admin") return <Navigate to="/admin/students" replace />;
  if (user.role === "recruiter") return <Navigate to="/recruiter" replace />;
  return <Navigate to="/" replace />;
}

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Auth />} />

      {/* Protected Layout Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RoleRedirect />} />
        {/* Student Routes */}
        <Route path="student" element={<StudentHome />} />
        <Route path="student/profile" element={<Profile />} />
        <Route path="student/coding-profiles" element={<CodingProfiles />} />
        <Route path="student/resume-builder" element={<ResumeBuilder />} />{" "}
        {/* <--- NEW ROUTE ADDED HERE */}
        <Route path="student/applications" element={<Applications />} />
        <Route path="student/opportunities" element={<Opportunities />} />
        <Route path="student/company" element={<Company />} />
        <Route path="student/company/:id" element={<Company />} />
        <Route
          path="student/interview-experiences"
          element={<InterviewExperiences />}
        />
        <Route path="student/practice" element={<Practice />} />
        <Route path="student/placement-insights" element={<PlacementInsights />} />
        {/* Admin Routes */}
        <Route path="admin/dashboard" element={<AdminDashboard />} />
        <Route path="admin/students" element={<StudentManagement />} />
        <Route path="admin/company-add" element={<CompanyAdd />} />
        <Route path="admin/questions" element={<AdminQuestions />} />
        <Route path="admin/notifications" element={<AdminNotifications />} />
        <Route path="admin/profile" element={<AdminProfile />} />
        {/* Recruiter Routes */}
        <Route path="recruiter" element={<RecruiterDashboard />} />
        <Route path="recruiter/shortlisted" element={<ShortlistedCandidates />} />
        <Route path="recruiter/jafs" element={<JAFDashboard />} />
        <Route path="recruiter/jafs/new" element={<JAFCreationWizard />} />
        <Route path="recruiter/jafs/edit/:id" element={<JAFCreationWizard />} />
        <Route path="recruiter/jafs/:id" element={<JAFDetail />} />
        <Route path="recruiter/drives" element={<ActiveDrives />} />
        <Route path="recruiter/announcements" element={<Broadcasts />} />
        <Route path="recruiter/messages" element={<TnpConnect />} />
        <Route path="recruiter/profile" element={<RecruiterProfile />} />
        {/* Shared Routes */}
        <Route path="calendar" element={<Calendar />} />
        {/* Catch All */}
        <Route path="*" element={<RoleRedirect />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
