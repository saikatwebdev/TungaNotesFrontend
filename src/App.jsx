import React, { useState, useEffect, useRef } from "react";
import NotesCard from "./components/NotesCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

const App = () => {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [task, setTask] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [topHeight, setTopHeight] = useState(45); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
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
      await axios.delete(
        `${API_URL}/notes/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100;
    
    // Constrain between 20% and 80%
    if (newHeight >= 20 && newHeight <= 80) {
      setTopHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Left Sidebar - Desktop */}
      <div className="hidden lg:flex lg:w-1/3 xl:w-1/4 border-r border-gray-800 bg-black/40 backdrop-blur-sm">
        <form
          onSubmit={submitHandler}
          className="flex flex-col gap-5 items-start p-8 w-full"
        >
          <div className="flex justify-between w-full items-center mb-2">
            <div>
              <h1 className="text-3xl font-bold bg-green-400 bg-clip-text text-transparent">
                Add Notes
              </h1>
              <p className="text-gray-400 text-sm mt-1">Create your next note</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="bg-red-600/90 px-4 py-2 rounded-lg text-white hover:bg-red-600 transition-all duration-200 font-medium shadow-lg hover:shadow-red-600/50"
            >
              Logout
            </button>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm w-full backdrop-blur-sm animate-pulse">
              {error}
            </div>
          )}

          <div className="w-full space-y-2">
            <label className="text-sm text-gray-400 font-medium">Title</label>
            <input
              type="text"
              placeholder="Enter Notes Heading"
              className="px-5 py-3 border border-gray-700 bg-gray-800/50 outline-none rounded-lg w-full text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="w-full space-y-2 flex-1 flex flex-col">
            <label className="text-sm text-gray-400 font-medium">Content</label>
            <textarea
              placeholder="Enter Details"
              className="w-full px-5 py-3 outline-none border border-gray-700 bg-gray-800/50 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 flex-1 resize-none"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              required
            />
          </div>

          <button className="bg-green-400 w-full px-5 py-3 rounded-lg text-white font-semibold hover:bg-green-500 transition-all duration-200 shadow-lg hover:shadow-green-600/50 active:scale-95">
            Add Note
          </button>
        </form>
      </div>

      {/* Mobile Layout */}
      <div 
        ref={containerRef}
        className="flex-1 lg:hidden flex flex-col relative overflow-hidden"
      >
        {/* Top Section - Add Note Form */}
        <div 
          style={{ height: `${topHeight}%` }}
          className="overflow-y-auto transition-all duration-100"
        >
          <form
            onSubmit={submitHandler}
            className="flex flex-col gap-5 items-start p-6"
          >
            <div className="flex justify-between w-full items-center mb-2">
              <div>
                <h1 className="text-2xl font-bold bg-green-400 hover:bg-green-500 bg-clip-text text-transparent">
                  Add Notes
                </h1>
                <p className="text-gray-400 text-xs mt-1">Create your next note</p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-600/90 px-3 py-1.5 rounded-lg text-white hover:bg-red-600 transition-all duration-200 font-medium text-sm shadow-lg"
              >
                Logout
              </button>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm w-full backdrop-blur-sm">
                {error}
              </div>
            )}

            <div className="w-full space-y-2">
              <label className="text-sm text-gray-400 font-medium">Title</label>
              <input
                type="text"
                placeholder="Enter Notes Heading"
                className="px-4 py-2.5 border border-gray-700 bg-gray-800/50 outline-none rounded-lg w-full text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="w-full space-y-2">
              <label className="text-sm text-gray-400 font-medium">Content</label>
              <textarea
                placeholder="Enter Details"
                className="w-full px-4 py-2.5 outline-none h-24 border border-gray-700 bg-gray-800/50 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none"
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                required
              />
            </div>

            <button className="bg-green-400 w-full px-5 py-2.5 rounded-lg text-white font-semibold hover:bg-green-500 transition-all duration-200 shadow-lg active:scale-95">
              Add Note
            </button>
          </form>
        </div>

        {/* Resizable Divider */}
        <div
          onMouseDown={handleMouseDown}
          className={`h-1.5 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 cursor-row-resize hover:h-2 transition-all duration-200 relative group ${
            isDragging ? 'h-2' : ''
          }`}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-1 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-200"></div>
          </div>
        </div>

        {/* Bottom Section - Notes Display */}
        <div 
          style={{ height: `${100 - topHeight}%` }}
          className="bg-gray-900/50 backdrop-blur-sm flex flex-col overflow-hidden transition-all duration-100"
        >
          <div className="p-6 pb-3">
            <h1 className="text-xl font-bold">Your Notes</h1>
            <p className="text-gray-400 text-sm mt-1">
              {task.length} {task.length === 1 ? 'note' : 'notes'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="flex flex-wrap gap-4">
              {loading ? (
                <div className="text-gray-400 text-sm flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  Loading notes...
                </div>
              ) : task.length === 0 ? (
                <div className="text-gray-400 text-sm text-center w-full mt-8">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No notes added yet.</p>
                  <p className="text-xs mt-1">Create your first note above!</p>
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

      {/* Desktop Right Section - Notes Display */}
      <div className="hidden lg:flex lg:w-2/3 xl:w-3/4 bg-gray-900/30 backdrop-blur-sm flex-col overflow-hidden">
        <div className="p-8 pb-4 border-b border-gray-800">
          <h1 className="text-2xl font-bold">Your Notes</h1>
          <p className="text-gray-400 text-sm mt-1">
            {task.length} {task.length === 1 ? 'note' : 'notes'} saved
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="flex flex-wrap gap-6">
            {loading ? (
              <div className="text-gray-400 text-sm flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                Loading notes...
              </div>
            ) : task.length === 0 ? (
              <div className="text-gray-400 text-center w-full mt-20">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg">No notes added yet.</p>
                <p className="text-sm mt-2">Start by creating your first note!</p>
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
  );
};

export default App;