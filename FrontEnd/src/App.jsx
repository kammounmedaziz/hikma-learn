import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from 'react';
import "./index.css";
import Navbar from "./Components/MainNavbar";
import Home from "./Pages/Home";
import About from "./Pages/About"
import WelcomeScreen from "./Pages/WelcomeScreen";
import AnimatedBackground from "./Components/Background";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import AuthPage from './Components/Auth';
import StudyDashboard from './Pages/StudyDashboard';
import Inspiration from './Pages/Inspirations';
import Team from './Pages/Team';
import CommunityDashboard from './Pages/CommunityDashboard'
import Footer from './Components/Footer'
import AdminManageTeachers from './Pages/AdminManageTeachers';
import AdminDashboard from './Pages/AdminDashboard';
import TeacherDashboard from './Pages/TeacherDhasboard'


import CourseDetails from './Pages/CourseDetails';
import ContentDetail from './Pages/ContentDetail';





import { ensureValidToken } from './utils/api';

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
          {/* Background with lower z-index */}
          <div className="absolute inset-0 z-0">
            <AnimatedBackground />
          </div>
          

          <div className="relative z-10">
            <AuthPage/>
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
        <Route path="/StudydDashboard" element={<StudyDashboard />} />
        <Route path="/community" element={<CommunityDashboard />} />
        <Route path="/TeacherDashboard" element={<TeacherDashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/courses/:courseId/" element={<CourseDetails />} />
        <Route path="/courses/:courseId/chapters/:chapterId/contents/:contentId" element={<ContentDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
