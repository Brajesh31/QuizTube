import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthModal from "./AuthModal";
import axios from "axios";
import { b_link } from "./Baselink.js";

type QuizFormat = "mcq" | "summarize";

const Home = () => {
  const navigate = useNavigate();
  const [youtubeLink, setYoutubeLink] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<QuizFormat>("mcq");
  const [questionCount, setQuestionCount] = useState(10);
  const [wordCount, setWordCount] = useState(250);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFormatChange = (format: QuizFormat) => {
    setSelectedFormat(format);
    if (format === "mcq") {
      setQuestionCount(10);
    } else {
      setWordCount(250);
    }
  };

  const getDescription = () => {
    if (selectedFormat === "summarize") {
      return `A ${wordCount}-word summary of the video content`;
    } else {
      return `${questionCount} multiple choice questions to test understanding`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(
        `${b_link}/api/addworkspace`,
        {
          videoUrl: youtubeLink,
          type: selectedFormat,
          count: selectedFormat === "summarize" ? wordCount : questionCount,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;
      navigate(`/workspace/${data.workspaceId}`);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="home-container">
      <h1>Welcome to BrainTube</h1>
      <p>Create and take quizzes from YouTube videos</p>

      {isLoading && (
        <div className="loading-container">
          <img src="/loading.svg" alt="Loading..." />
          <p>Generating your workspace...</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="video-form">
        <div className="input-group">
          <input
            type="text"
            value={youtubeLink}
            onChange={(e) => setYoutubeLink(e.target.value)}
            placeholder="Paste YouTube video link here"
            className="video-input"
            required
          />
        </div>

        <div className="format-options">
          <label className="format-option">
            <input
              type="radio"
              name="format"
              value="mcq"
              checked={selectedFormat === "mcq"}
              onChange={(e) => handleFormatChange(e.target.value as QuizFormat)}
            />
            <div className="format-option-content">
              <span className="format-label">Multiple Choice</span>
              <span className="count-limit">Max 25 questions</span>
            </div>
          </label>

          <label className="format-option">
            <input
              type="radio"
              name="format"
              value="summarize"
              checked={selectedFormat === "summarize"}
              onChange={(e) => handleFormatChange(e.target.value as QuizFormat)}
            />
            <div className="format-option-content">
              <span className="format-label">Summarize</span>
              <span className="count-limit">100-1000 words</span>
            </div>
          </label>
        </div>

        <div className="count-selector">
          {selectedFormat === "summarize" ? (
            <div className="count-input">
              <label htmlFor="wordCount">Word Count</label>
              <div className="count-display">{wordCount}</div>
              <div className="slider-container">
                <input
                  type="range"
                  id="wordCount"
                  min="100"
                  max="1000"
                  step="50"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                />
                <div className="slider-labels">
                  <span>100</span>
                  <span>1000</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="count-input">
              <label htmlFor="questionCount">Number of Questions</label>
              <div className="count-display">{questionCount}</div>
              <div className="slider-container">
                <input
                  type="range"
                  id="questionCount"
                  min="1"
                  max="25"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                />
                <div className="slider-labels">
                  <span>1</span>
                  <span>25</span>
                </div>
              </div>
            </div>
          )}
          <div className="count-description">{getDescription()}</div>
        </div>

        <button type="submit" className="generate-button" disabled={isLoading}>
          {isLoading
            ? "Generating..."
            : selectedFormat === "mcq"
            ? "Generate Quiz"
            : "Generate Summary"}
        </button>
      </form>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
};

export default Home;
