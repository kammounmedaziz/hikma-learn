import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from 'react';
import "./index.css";
//import Navbar from "./Components/MainNavbar";
//import Home from "./Pages/Home";
//import About from "./Pages/About"
import WelcomeScreen from "./Pages/WelcomeScreen";
import AnimatedBackground from "./Components/Background";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import AuthPage from './Components/Auth';
import StudyDashboard from './Pages/StudyDashboard';
//import Inspiration from './Pages/Inspirations';
//import Team from './Pages/Team';
import CommunityDashboard from './Pages/CommunityDashboard'
//import Footer from './Components/Footer'
//import AdminManageTeachers from './Pages/AdminManageTeachers';
import AdminDashboard from './Pages/AdminDashboard';
import TeacherDashboard from './Pages/TeacherDhasboard'
//import MyCourses from './Pages/MyCourses';
//import WorkSpacePage from './Pages/WorkSpacePage'
import { getCurrentUser } from './services/auth';
import Unauthorized from './Components/Unauthorized';
//import XPBar from './Components/XPBar';
<<<<<<< HEAD
=======
import QuestionsFeed from './Pages/ForumTest';
>>>>>>> 98ef83a0c2dbba3014249d1cf9bc8345139fec5c
//import XPBar from './components/XPBar';
//import WorkspaceLayout from './components/WorkspaceLayout';
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const user = getCurrentUser();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.user_type)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  allowedRoles: PropTypes.array
};

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
        <Route path="/" element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Protected Routes */}
        <Route path="/StudydDashboard" element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudyDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/community" element={
          <ProtectedRoute allowedRoles={['student', 'teacher']}>
            <CommunityDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/TeacherDashboard" element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/AdminDashboard" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;