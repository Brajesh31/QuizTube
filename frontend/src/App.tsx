import { Routes, Route, Link, useNavigate } from "react-router-dom";
import Home from "./components/Home";
import Workspace from "./components/Workspace";
import Leaderboard from "./components/Leaderboard";
import Signup from "./components/Signup";
import "./App.css";
import { useState, useEffect } from "react";
import AuthModal from "./components/AuthModal";
import NotFound from "./components/NotFound.tsx";

function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="app-container">
      <nav className="navbar">
        <Link to="/" className="logo">
          BrainTube
        </Link>
        <div className="nav-right">
          {isLoggedIn ? (
            <button
              onClick={() => navigate("/leaderboard")}
              className="signup-button"
            >
              Leaderboard
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="signup-button"
            >
              Sign Up
            </button>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/workspace/:id" element={<Workspace />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </main>
    </div>
  );
}

export default App;
