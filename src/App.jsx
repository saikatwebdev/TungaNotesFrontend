import React, { useState, useEffect } from "react";
import NotesCard from "./components/NotesCard";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "https://tunganotesbackend.onrender.com/api";

const App = () => {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");
  const [task, setTask] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      setTask(task.filter((t) => t._id !== id));
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="h-screen lg:flex bg-black text-white">
      <form
        onSubmit={submitHandler}
        className="flex lg:w-1/3 flex-col gap-4 items-start p-10"
      >
        <div className="flex justify-between w-full items-center">
          <h1 className="text-3xl font-medium">Add Notes</h1>
          <button
            type="button"
            onClick={handleLogout}
            className="bg-red-600 px-3 py-1 rounded text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="bg-red-500 text-white px-4 py-2 rounded text-sm w-full">
            {error}
          </div>
        )}

        <input
          type="text"
          placeholder="Enter Notes Heading"
          className="px-5 py-2 border-2 outline-none rounded w-full text-black"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Enter Details"
          className="w-full px-5 py-2 outline-none h-20 border-2 rounded text-black"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          required
        />

        <button className="bg-white w-full px-5 py-2 rounded text-black active:bg-gray-200 font-medium hover:bg-gray-100">
          Add Note
        </button>
      </form>

      <div className="lg:w-2/3 p-10 bg-gray-900 lg:border-l-2 flex flex-col">
        <h1 className="text-xl font-bold pb-5">Your Notes</h1>

        <div
          className="flex flex-wrap gap-6 overflow-y-auto pr-2"
          style={{ maxHeight: "100vh" }}
        >
          {loading ? (
            <p className="text-gray-400 text-sm">Loading notes...</p>
          ) : task.length === 0 ? (
            <p className="text-gray-400 text-sm">No notes added yet.</p>
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
  );
};

export default App;