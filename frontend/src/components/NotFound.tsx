import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-6xl font-extrabold text-white mb-4">404</h1>
      <p className="text-xl sm:text-2xl text-white font-semibold mb-2">
        Oops! Page not found.
      </p>
      <p className="text-white mb-6 max-w-md">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
      >
        <span className="text-lg">🔙</span>
        <span>Go back home</span>
      </button>
    </>
  );
};

export default NotFound;
