import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Tasks() {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase()?.trim() || "";

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const API_URL = `${import.meta.env.VITE_API_URL}/tasks`; 
  
  const STORAGE_KEY = userEmail ? `lifehub_tasks_data_${userEmail}` : "lifehub_tasks_data";
  const authHeader = userEmail ? { headers: { "X-User-Email": userEmail } } : {};

  // Fetch all tasks with local storage fallback
  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL, authHeader);
      setTasks(Array.isArray(response.data) ? response.data : []);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
    } catch (error) {
      console.warn("Backend API offline, using local state:", error.message);
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          setTasks(JSON.parse(cached));
          return;
        } catch (e) {
          // fallback
        }
      }
      setTasks([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [userEmail]);

  const saveLocalTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTasks));
  };

  // Add or Update Task
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = { title, description, status, userEmail };

    try {
      if (editingTaskId) {
        await axios.put(`${API_URL}/${editingTaskId}`, payload, authHeader);
        setEditingTaskId(null);
      } else {
        const response = await axios.post(API_URL, payload, authHeader);
        saveLocalTasks([response.data, ...tasks]);
      }
      setTitle("");
      setDescription("");
      setStatus("Pending");
      fetchTasks();
    } catch (error) {
      console.warn("Error communicating with backend during save:", error.message);
      if (editingTaskId) {
        const updated = tasks.map((t) => (t.id === editingTaskId ? { ...t, ...payload } : t));
        saveLocalTasks(updated);
        setEditingTaskId(null);
      } else {
        const newTask = { id: Date.now(), ...payload };
        saveLocalTasks([newTask, ...tasks]);
      }
      setTitle("");
      setDescription("");
      setStatus("Pending");
    }
  };

  const handleEditClick = (task) => {
    setEditingTaskId(task.id);
    setTitle(task.title);
    setDescription(task.description || "");
    setStatus(task.status || "Pending");
  };

  const cancelEdit = () => {
    setEditingTaskId(null);
    setTitle("");
    setDescription("");
    setStatus("Pending");
  };

  const deleteTask = async (id) => {
    const updated = tasks.filter((task) => task.id !== id);
    saveLocalTasks(updated);
    try {
      await axios.delete(`${API_URL}/${id}`, authHeader);
    } catch (error) {
      console.warn("Backend delete offline:", error.message);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter = filter === "All" || task.status === filter;
    const matchesSearch =
      (task.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (task.description || "").toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2>📋 Task Management</h2>
        <p>Organize, track, update, and manage your daily tasks efficiently.</p>
      </div>

      <div className="tasks-layout">
        {/* Left Column: Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: "1.25rem" }}>
            {editingTaskId ? "✏️ Edit Task" : "+ Create New Task"}
          </h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Task Title</label>
              <input
                className="input-field"
                type="text"
                placeholder="e.g. Design Database Schema"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="textarea-field"
                rows="3"
                placeholder="Add brief task details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Task Status</label>
              <select
                className="select-field"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                {editingTaskId ? "Update Task" : "+ Add Task"}
              </button>
              {editingTaskId && (
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Task List */}
        <div>
          <div
            className="glass-card"
            style={{ padding: "1.25rem", marginBottom: "1.5rem", display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between" }}
          >
            {/* Filter Tabs */}
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["All", "Pending", "Completed"].map((tab) => (
                <button
                  key={tab}
                  className={`btn btn-sm ${filter === tab ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search Box */}
            <div style={{ minWidth: "200px" }}>
              <input
                className="input-field"
                style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}
                type="text"
                placeholder="🔍 Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Tasks List */}
          {filteredTasks.length === 0 ? (
            <div className="glass-card" style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
              <span style={{ fontSize: "2.5rem" }}>🎯</span>
              <h4 style={{ marginTop: "1rem" }}>No tasks found</h4>
              <p style={{ marginTop: "0.35rem" }}>Try creating a new task or adjust your search filter.</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task.id} className="task-item-card">
                <div className="task-details" style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.35rem" }}>
                    <h4>{task.title}</h4>
                    <span className={task.status === "Completed" ? "badge badge-completed" : "badge badge-pending"}>
                      {task.status}
                    </span>
                  </div>
                  {task.description && <p>{task.description}</p>}
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditClick(task)}
                    title="Edit task"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteTask(task.id)}
                    title="Delete task"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Tasks;