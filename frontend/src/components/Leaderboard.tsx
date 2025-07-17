import { useState, useEffect } from "react";
import axios from "axios";
import { b_link } from "./Baselink";

interface LeaderboardUser {
  name: string;
  score: number;
  totalTestCount: number;
  _id?: string;
}

interface CurrentUser extends LeaderboardUser {
  rank: number;
}

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${b_link}/auth/leaderboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setLeaderboardData(response.data.topUsers);
        setCurrentUser(response.data.currentUser);
      } catch (err) {
        setError("Failed to load leaderboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading)
    return <div className="text-center mt-10 text-lg">Loading...</div>;
  if (error)
    return <div className="text-center mt-10 text-red-500">{error}</div>;

  const isUserInTopTen =
    currentUser && leaderboardData.some((user) => user._id === currentUser._id);

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-section">
        <h2 className="text-4xl font-bold">Leaderboard</h2>
        <div className="w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800 text-white rounded-t-lg font-semibold">
            <div className="text-center">Rank</div>
            <div>Username</div>
            <div className="text-center">Average Points</div>
            <div className="text-center">Tests Taken</div>
          </div>

          <div className="leaderboard-list">
            {leaderboardData.map((user, index) => (
              <div
                key={index}
                className={`grid grid-cols-4 gap-4 p-4 items-center ${
                  user._id === currentUser?._id
                    ? "bg-blue-100 dark:bg-blue-900"
                    : "bg-white dark:bg-gray-800"
                }`}
              >
                <div className="text-center font-bold">#{index + 1}</div>
                <div>{user.name}</div>
                <div className="text-center text-green-600 dark:text-green-400 font-semibold">
                  {user.score} pts
                </div>
                <div className="text-center">{user.totalTestCount}</div>
              </div>
            ))}
          </div>

          {currentUser && !isUserInTopTen && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Your Ranking</h3>
              <div className="grid grid-cols-4 gap-4 p-4 items-center bg-blue-100 dark:bg-blue-900 rounded-lg">
                <div className="text-center font-bold">#{currentUser.rank}</div>
                <div>{currentUser.name}</div>
                <div className="text-center text-green-600 dark:text-green-400 font-semibold">
                  {currentUser.score} pts
                </div>
                <div className="text-center">{currentUser.totalTestCount}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
