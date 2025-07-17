import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
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

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage showWelcome={showWelcome} setShowWelcome={setShowWelcome} />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/study-dashboard" element={<StudyDashboard />} />
        <Route path="/community" element={<CommunityDashboard />} />
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
