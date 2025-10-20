import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_API_URL || "http://localhost:5000/api";


const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/signup`, {
        name,
        email,
        password,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.log(`${API_URL}/api/auth/signup`);

      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 text-white">
      <h2 className="text-2xl mb-4 font-semibold">Sign Up</h2>
      <form onSubmit={handleSignup} className="flex flex-col gap-3 w-80">
        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500 text-white px-4 py-2 rounded text-sm">
            Signup successful! Redirecting to login...
          </div>
        )}
        <input
          type="text"
          placeholder="Full Name"
          className="border px-4 py-2 rounded text-black"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={loading || success}
        />
        <input
          type="email"
          placeholder="Email"
          className="border px-4 py-2 rounded text-black"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loading || success}
        />
        <input
          type="password"
          placeholder="Password"
          className="border px-4 py-2 rounded text-black"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          disabled={loading || success}
        />
        <button 
          className="bg-blue-600 text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || success}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <p
        className="text-blue-400 mt-3 cursor-pointer hover:underline"
        onClick={() => navigate("/login")}
      >
        Already have an account? Login
      </p>
    </div>
  );
};

export default Signup;