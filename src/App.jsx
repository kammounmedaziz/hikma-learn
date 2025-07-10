import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from 'react';
import "./index.css";
import Navbar from "./Components/Navbar";
import StephenHawkingCard from "./Components/StephenHawkingCard";
import GhanimAlMuftahCard from "./Components/Ghanim Al Muftah"
import Home from "./Pages/Home";
import About from "./Pages/About"
import WelcomeScreen from "./Pages/WelcomeScreen";
import AnimatedBackground from "./Components/Background";
import { AnimatePresence } from "framer-motion";
import PropTypes from "prop-types";
import Signup from './Components/signup';
import login from './Components/signin';
import Signin from './Components/signin';
import Inspiration from './Pages/Inspirations';




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
          
          {/* Content with higher z-index */}
          <div className="relative z-10">
            <Navbar />
            <Home />
            <Inspiration/>
            <About />
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
         <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />



      </Routes>
    </BrowserRouter>
  );
}

export default App;
