import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import './index.css';
import Navbar from './Components/MainNavbar';
import Home from './Pages/Home';
import About from './Pages/About';
import WelcomeScreen from './Pages/WelcomeScreen';
import AnimatedBackground from './Components/Background';
import { AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import AuthPage from './Components/Auth';
import StudyDashboard from './Pages/StudyDashboard';
import Inspiration from './Pages/Inspirations';
import Team from './Pages/Team';
import CommunityDashboard from './Pages/CommunityDashboard';
import Footer from './Components/Footer';
import AdminManageTeachers from './Pages/AdminManageTeachers';
import AdminDashboard from './Pages/AdminDashboard';
import TeacherDashboard from './Pages/TeacherDashboard';
import ExamsQuizzes from './Pages/teacher-quiz/ExamsQuizzes';
import CreateQuiz from './Pages/teacher-quiz/CreateQuiz';
import EditQuiz from './Pages/teacher-quiz/EditQuiz';
import TeacherSettings from './Components/TeacherSettings';
import PlaceholderPage from './Components/PlaceholderPage';
import StudentResultPage from './Pages/student-quiz/QuizResults';
import StudyOverview from './Pages/StudyOverview';
import QuizList from './Pages/student-quiz/QuizList';
import QuizView from './Pages/student-quiz/QuizView';
import CourseDetails from './Pages/CourseDetails';
import ContentDetail from './Pages/ContentDetail';
import { ensureValidToken } from './utils/api';
import MyCoursesTeacher from './Pages/MyCoursesTeacher.jsx';
import MyCourses from './Pages/MyCourses.jsx';
import AllCoursesStudent from './Pages/AllCoursesStudent.jsx';
import AllCoursesTeacher from './Pages/AllCoursesTeacher.jsx';
import AdminManageStudents from './Pages/AdminManageStudents.jsx';

const LandingPage = ({ showWelcome, setShowWelcome }) => {
  return (
    <>
      <AnimatePresence mode="wait">
        {showWelcome && (
          <WelcomeScreen onLoadingComplete={() => setShowWelcome(false)} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        <div className="relative">
          <div className="absolute inset-0 z-0">
            <AnimatedBackground />
          </div>
          <div className="relative z-10">
            <AuthPage />
          </div>
        </div>
      )}
    </>
  );
};

LandingPage.propTypes = {
  showWelcome: PropTypes.bool.isRequired,
  setShowWelcome: PropTypes.func.isRequired,
};

const getRedirectPath = () => {
  const userType = localStorage.getItem('userType');
  if (userType === 'student') return '/StudydDashboard';
  if (userType === 'teacher') return '/TeacherDashboard';
  if (userType === 'admin') return '/AdminDashboard';
  return '/auth';
};

function App() {
  const [authReady, setAuthReady] = useState(false);
  const [redirectPath, setRedirectPath] = useState('/auth');

  useEffect(() => {
    const init = async () => {
      const ok = await ensureValidToken();
      setRedirectPath(ok ? getRedirectPath() : '/auth');
      setAuthReady(true);
    };
    init();

    const sync = () => init();
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  if (!authReady) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={redirectPath} replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/StudydDashboard" element={<StudyDashboard />}>
          <Route index element={<StudyOverview />} />
          <Route path="quizzes" element={<QuizList />} />
          <Route path="quizzes/:id" element={<QuizView />} />
          <Route path="quizzes/:id/result" element={<StudentResultPage />} />
          <Route path="courses" element={<MyCourses/>} />
          <Route path="all-courses" element={<AllCoursesStudent/>} />
          <Route path="settings" element={<PlaceholderPage title="settings" description="Track and submit assignments" />} />
          <Route path="assignments" element={<PlaceholderPage title="Assignments" description="Track and submit assignments" />} />
          <Route path="schedule" element={<PlaceholderPage title="Schedule" description="Daily and weekly learning schedule" />} />
          <Route path="progress" element={<PlaceholderPage title="Progress & Analytics" description="Your learning analytics and goals" />} />
          <Route path="achievements" element={<PlaceholderPage title="Achievements" description="Your badges and certificates" />} />
          <Route path="library" element={<PlaceholderPage title="Resource Library" description="Extra resources and materials" />} />
          <Route path="forum" element={<PlaceholderPage title="Discussion Forum" description="Ask and answer questions" />} />
          <Route path="study_groups" element={<PlaceholderPage title="Study Groups" description="Join or create study circles" />} />
          <Route path="notifications" element={<PlaceholderPage title="Notifications" description="Alerts and important messages" />} />
          <Route path="support" element={<PlaceholderPage title="Support Center" description="Ask for help or report issues" />} />
          <Route
            path="*"
            element={<PlaceholderPage title="Page Not Found" description="This section is under development" />}
          />
        </Route>
        <Route path="/community" element={<CommunityDashboard />} />
        <Route path="/teacherdashboard" element={<TeacherDashboard />}>
          <Route index element={<div />} />
          <Route path="overview" element={<div />} />
          <Route path="quizzes" element={<ExamsQuizzes />} />
          <Route path="quizzes/create" element={<CreateQuiz />} />
          <Route path="quizzes/edit/:id" element={<EditQuiz />} />
          <Route path="settings" element={<TeacherSettings />} />
          <Route path="courses" element={<MyCoursesTeacher/>} />
          <Route path="all-courses" element={<AllCoursesTeacher/>} />
          <Route
            path="grading"
            element={<PlaceholderPage title="Grading Center" description="Review and grade submissions" />}
          />
          <Route
            path="attendance"
            element={<PlaceholderPage title="Attendance" description="Track student attendance" />}
          />
          <Route
            path="analytics"
            element={<PlaceholderPage title="Analytics" description="Student performance analytics" />}
          />
          <Route
            path="schedule"
            element={<PlaceholderPage title="Class Schedule" description="Manage your teaching schedule" />}
          />
          <Route
            path="content"
            element={<PlaceholderPage title="Content Library" description="Course materials and resources" />}
          />
          <Route
            path="live_classes"
            element={<PlaceholderPage title="Live Classes" description="Conduct virtual classes" />}
          />
          <Route
            path="forums"
            element={<PlaceholderPage title="Discussion Forums" description="Moderate class discussions" />}
          />
          <Route
            path="notifications"
            element={<PlaceholderPage title="Notifications" description="System alerts and updates" />}
          />
          <Route
            path="support"
            element={<PlaceholderPage title="Support" description="Get help and report issues" />}
          />
          <Route
            path="*"
            element={<PlaceholderPage title="Page Not Found" description="This section is under development" />}
          />
        </Route>
        <Route path="/AdminDashboard" element={<AdminDashboard />}>
          <Route index element={<AdminDashboard />} />
          <Route path="overview" element={<AdminDashboard />} />
          <Route path="AdminManagingStudents" element={<AdminManageStudents />} />
          <Route path="AdminManageTeachers" element={<AdminManageTeachers />} />
          <Route path="course_management" element={<AdminDashboard />} />
          <Route path="institution_settings" element={<PlaceholderPage title="Institution Settings" description="Configure institutional parameters" />} />
          <Route path="analytics" element={<PlaceholderPage title="Analytics & Reports" description="Platform analytics and reporting" />} />
          <Route path="financial" element={<PlaceholderPage title="Financial Overview" description="Revenue and financial metrics" />} />
          <Route path="system_logs" element={<PlaceholderPage title="System Logs" description="View system activity logs" />} />
          <Route path="backup_restore" element={<PlaceholderPage title="Backup & Restore" description="Data backup and recovery" />} />
          <Route path="scheduling" element={<PlaceholderPage title="System Scheduling" description="Manage system maintenance" />} />
          <Route path="content_moderation" element={<PlaceholderPage title="Content Moderation" description="Review and moderate content" />} />
          <Route path="notifications" element={<PlaceholderPage title="System Notifications" description="Platform-wide notifications" />} />
          <Route path="email_management" element={<PlaceholderPage title="Email Management" description="Configure email settings" />} />
          <Route path="support" element={<PlaceholderPage title="Support Center" description="Admin support and documentation" />} />
          <Route path="settings" element={<PlaceholderPage title="System Settings" description="Configure platform settings" />} />
          <Route
            path="*"
            element={<PlaceholderPage title="Page Not Found" description="This section is under development" />}
          />
        </Route>
        <Route path="/courses/:courseId/" element={<CourseDetails />} />
        <Route path="/courses/:courseId/chapters/:chapterId/contents/:contentId" element={<ContentDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;