import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const NotesCard = ({ heading, explanation, onDelete }) => (
  <div className="bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 w-full sm:w-72 border border-gray-700">
    <div className="flex justify-between items-start mb-3">
      <h3 className="text-lg font-semibold text-white truncate flex-1">{heading}</h3>
      <button
        onClick={onDelete}
        className="ml-2 text-red-400 hover:text-red-300 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
    <p className="text-gray-300 text-sm leading-relaxed break-words">{explanation}</p>
  </div>
);

const App = () => {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [task, setTask] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topHeight, setTopHeight] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      axios
        .get(`${API_URL}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setTask(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          if (err.response?.status === 401) {
            localStorage.removeItem("token");
            navigate("/login");
          }
          setLoading(false);
        });
    }
  }, [token, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!title || !detail) return;

    setError("");
    try {
      const res = await axios.post(
        `${API_URL}/notes`,
        { title, content: detail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTask([res.data, ...task]);
      setTitle("");
      setDetail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add note");
      console.log(err);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTask((prevTasks) => prevTasks.filter((t) => t._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
    if (newHeight > 20 && newHeight < 80) {
      setTopHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mouseup", handleMouseUp);
      return () => document.removeEventListener("mouseup", handleMouseUp);
    }
  }, [isDragging]);

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        {/* Left Section - Add Notes */}
        <div className="w-1/3 flex flex-col border-r border-gray-700">
          <form onSubmit={submitHandler} className="flex flex-col gap-5 p-8 h-full">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Add Notes
              </h1>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-lg"
              >
                Logout
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-lg text-sm animate-pulse">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Note Title"
              className="px-5 py-3 bg-gray-800 border border-gray-700 outline-none rounded-lg w-full text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Write your note here..."
              className="w-full px-5 py-3 bg-gray-800 border border-gray-700 outline-none h-32 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
            />

            <button className="bg-gradient-to-r from-blue-600 to-purple-600 w-full px-5 py-3 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl active:scale-95">
              Add Note
            </button>
          </form>
        </div>

        {/* Right Section - Notes Display */}
        <div className="w-2/3 flex flex-col bg-gray-900/50">
          <div className="p-8 pb-4">
            <h1 className="text-2xl font-bold text-gray-100">Your Notes</h1>
            <p className="text-gray-400 text-sm mt-1">{task.length} note{task.length !== 1 ? 's' : ''} saved</p>
          </div>

          <div className="flex-1 px-8 pb-8 overflow-y-auto">
            <div className="flex flex-wrap gap-5">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p>Loading notes...</p>
                </div>
              ) : task.length === 0 ? (
                <div className="w-full text-center py-16">
                  <svg className="w-20 h-20 mx-auto text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No notes yet. Start adding some!</p>
                </div>
              ) : (
                task.map((elem) => (
                  <NotesCard
                    key={elem._id}
                    heading={elem.title}
                    explanation={elem.content}
                    onDelete={() => deleteNote(elem._id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout with Resizable Sections */}
      <div
        className="lg:hidden flex flex-col w-full relative"
        onMouseMove={handleMouseMove}
        onTouchMove={(e) => {
          if (!isDragging) return;
          const touch = e.touches[0];
          const container = e.currentTarget;
          const rect = container.getBoundingClientRect();
          const newHeight = ((touch.clientY - rect.top) / rect.height) * 100;
          if (newHeight > 20 && newHeight < 80) {
            setTopHeight(newHeight);
          }
        }}
      >
        {/* Top Section - Add Notes */}
        <div
          style={{ height: `${topHeight}%` }}
          className="flex flex-col overflow-hidden transition-all"
        >
          <form onSubmit={submitHandler} className="flex flex-col gap-4 p-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Add Notes
              </h1>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Note Title"
              className="px-4 py-2.5 bg-gray-800 border border-gray-700 outline-none rounded-lg w-full text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <textarea
              placeholder="Write your note here..."
              className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 outline-none h-24 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
            />

            <button className="bg-gradient-to-r from-blue-600 to-purple-600 w-full px-5 py-2.5 rounded-lg text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg active:scale-95">
              Add Note
            </button>
          </form>
        </div>

        {/* Resizable Divider */}
        <div
          className={`relative h-2 bg-gradient-to-r from-blue-600 to-purple-600 cursor-row-resize group ${
            isDragging ? "bg-blue-500" : ""
          }`}
          onMouseDown={handleMouseDown}
          onTouchStart={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onTouchEnd={() => setIsDragging(false)}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-1 bg-white/50 rounded-full group-hover:bg-white/80 transition-colors"></div>
          </div>
        </div>

        {/* Bottom Section - Notes Display */}
        <div
          style={{ height: `${100 - topHeight}%` }}
          className="flex flex-col bg-gray-900/50 overflow-hidden transition-all"
        >
          <div className="p-6 pb-3">
            <h1 className="text-xl font-bold text-gray-100">Your Notes</h1>
            <p className="text-gray-400 text-sm mt-1">{task.length} note{task.length !== 1 ? 's' : ''} saved</p>
          </div>

          <div className="flex-1 px-6 pb-6 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p>Loading notes...</p>
                </div>
              ) : task.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-gray-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">No notes yet</p>
                </div>
              ) : (
                task.map((elem) => (
                  <NotesCard
                    key={elem._id}
                    heading={elem.title}
                    explanation={elem.content}
                    onDelete={() => deleteNote(elem._id)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;