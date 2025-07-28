import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import "./index.css";
import Navbar from "./Components/MainNavbar";
import Home from "./Pages/Home";
import About from "./Pages/About";
import WelcomeScreen from "./Pages/WelcomeScreen";
import AnimatedBackground from "./Components/Background";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import AuthPage from './Components/Auth';
import StudyDashboard from './Pages/StudyDashboard';
import Inspiration from './Pages/Inspirations';
import Team from './Pages/Team';
import CommunityDashboard from './Pages/CommunityDashboard';
import Footer from './Components/Footer';
import AdminManageTeachers from './Pages/AdminManageTeachers';
import AdminDashboard from './Pages/AdminDashboard';
import TeacherDashboard from './Pages/TeacherDashboard'; // Fixed typo: TeacherDhasboard → TeacherDashboard
import ExamsQuizzes from './Pages/teacher-quiz/ExamsQuizzes';
import CreateQuiz from './Pages/teacher-quiz/CreateQuiz';
import EditQuiz from './Pages/teacher-quiz/EditQuiz';
import TeacherSettings from './Components/TeacherSettings';
import PlaceholderPage from './Components/PlaceholderPage';

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

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />}
        />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/StudyDashboard" element={<StudyDashboard />} /> {/* Fixed typo: StudydDashboard → StudyDashboard */}
        <Route path="/community" element={<CommunityDashboard />} />
        <Route path="/teacherdashboard" element={<TeacherDashboard />}>
          <Route index element={<div />} /> {/* Placeholder for index route; TeacherDashboard handles it */}
          <Route path="overview" element={<div />} /> {/* Placeholder; TeacherDashboard handles it */}
          <Route path="quizzes" element={<ExamsQuizzes />} />
          <Route path="quizzes/create" element={<CreateQuiz />} />
           <Route path="quizzes/edit/:id" element={<EditQuiz />} />  {/* ✅ New route added here */}
          <Route path="settings" element={<TeacherSettings />} />
          <Route
            path="courses"
            element={<PlaceholderPage title="My Courses" description="Manage your courses and curriculum" />}
          />
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
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;