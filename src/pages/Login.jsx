import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("https://tunganotesbackend.onrender.com/api/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 text-white">
      <h2 className="text-2xl mb-4 font-semibold">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-3 w-80">
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}
        <input
          type="email"
          placeholder="Email"
          className="border px-4 py-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading}
        />
        <input
          type="password"
          placeholder="Password"
          className="border px-4 py-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading}
        />
        <button 
          className="bg-green-600 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p
        className="text-blue-400 mt-3 cursor-pointer hover:underline"
        onClick={() => navigate("/signup")}
      >
        Don't have an account? Sign up
      </p>
    </div>
  );
};

export default Login;