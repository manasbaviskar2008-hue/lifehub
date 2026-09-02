import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Reminders() {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase()?.trim() || "";

  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("Pending");
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const API_URL = `${import.meta.env.VITE_API_URL}/reminders`;
  const STORAGE_KEY = userEmail ? `lifehub_reminders_data_${userEmail}` : "lifehub_reminders_data";
  const authHeader = userEmail ? { headers: { "X-User-Email": userEmail } } : {};

  // Fetch all reminders
  const fetchReminders = async () => {
    try {
      const response = await axios.get(API_URL, authHeader);
      const data = Array.isArray(response.data) ? response.data : [];
      setReminders(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Backend API offline, using local state:", error.message);
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          setReminders(JSON.parse(cached));
          return;
        } catch (e) {
          // fallback
        }
      }
      setReminders([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [userEmail]);

  const saveLocalReminders = (newReminders) => {
    setReminders(newReminders);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReminders));
  };

  // Add or Update Reminder
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !date) {
      alert("Please provide both a Title and Date/Time.");
      return;
    }

    const reminderPayload = {
      title,
      description,
      reminderDate: date,
      status,
      userEmail,
    };

    setLoading(true);

    try {
      if (editingReminderId) {
        await axios.put(`${API_URL}/${editingReminderId}`, reminderPayload, authHeader);
        setEditingReminderId(null);
      } else {
        const response = await axios.post(API_URL, reminderPayload, authHeader);
        saveLocalReminders([response.data, ...reminders]);
      }

      setTitle("");
      setDescription("");
      setDate("");
      setStatus("Pending");
      fetchReminders();
    } catch (error) {
      console.warn("Backend offline during reminder save:", error.message);
      if (editingReminderId) {
        const updated = reminders.map((r) =>
          r.id === editingReminderId ? { ...r, ...reminderPayload } : r
        );
        saveLocalReminders(updated);
        setEditingReminderId(null);
      } else {
        const newItem = { id: Date.now(), ...reminderPayload };
        saveLocalReminders([newItem, ...reminders]);
      }
      setTitle("");
      setDescription("");
      setDate("");
      setStatus("Pending");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (reminder) => {
    setEditingReminderId(reminder.id);
    setTitle(reminder.title);
    setDescription(reminder.description || "");
    setDate(reminder.reminderDate || "");
    setStatus(reminder.status || "Pending");
  };

  const cancelEdit = () => {
    setEditingReminderId(null);
    setTitle("");
    setDescription("");
    setDate("");
    setStatus("Pending");
  };

  const handleDelete = async (id) => {
    const updated = reminders.filter((r) => r.id !== id);
    saveLocalReminders(updated);
    try {
      await axios.delete(`${API_URL}/${id}`, authHeader);
    } catch (error) {
      console.warn("Backend delete offline:", error.message);
    }
  };

  const toggleStatus = async (reminder) => {
    const newStatus = reminder.status === "Completed" ? "Pending" : "Completed";
    const updated = { ...reminder, status: newStatus };
    const updatedList = reminders.map((r) => (r.id === reminder.id ? updated : r));
    saveLocalReminders(updatedList);

    try {
      await axios.put(`${API_URL}/${reminder.id}`, updated, authHeader);
    } catch (error) {
      console.warn("Backend status update offline:", error.message);
    }
  };

  const filteredReminders = reminders.filter((reminder) => {
    const matchesFilter =
      filter === "All" || reminder.status === filter;

    const matchesSearch =
      (reminder.title || "").toLowerCase().includes(search.toLowerCase()) ||
      (reminder.description || "").toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2>⏰ Reminder Center</h2>
        <p>Set alarms, track important schedules, and stay notified about upcoming events.</p>
      </div>

      <div className="tasks-layout">
        {/* Form Column */}
        <div className="glass-card">
          <h3 style={{ marginBottom: "1.25rem" }}>
            {editingReminderId ? "✏️ Edit Reminder" : "+ Add New Reminder"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Doctor's Appointment"
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
                placeholder="Add notes, location, or details..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date & Time</label>
              <input
                type="datetime-local"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
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
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingReminderId
                  ? "Update Reminder"
                  : "+ Add Reminder"}
              </button>
              {editingReminderId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Reminder List Column */}
        <div>
          {/* Header Controls: Filters & Search */}
          <div
            className="glass-card"
            style={{
              padding: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["All", "Pending", "Completed"].map((tab) => (
                <button
                  key={tab}
                  className={`btn btn-sm ${
                    filter === tab ? "btn-primary" : "btn-secondary"
                  }`}
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ minWidth: "200px" }}>
              <input
                className="input-field"
                style={{ padding: "0.4rem 0.85rem", fontSize: "0.85rem" }}
                type="text"
                placeholder="🔍 Search reminders..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Cards List */}
          {filteredReminders.length === 0 ? (
            <div
              className="glass-card"
              style={{ textAlign: "center", padding: "3rem 1.5rem" }}
            >
              <span style={{ fontSize: "2.5rem" }}>⏰</span>
              <h4 style={{ marginTop: "1rem" }}>No reminders found</h4>
              <p style={{ marginTop: "0.35rem" }}>
                Add a new reminder or clear your search filter.
              </p>
            </div>
          ) : (
            filteredReminders.map((reminder) => (
              <div key={reminder.id} className="task-item-card">
                <div className="task-details" style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.65rem",
                      marginBottom: "0.35rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <h4>{reminder.title}</h4>
                    <span
                      className={
                        reminder.status === "Completed"
                          ? "badge badge-completed"
                          : "badge badge-pending"
                      }
                    >
                      {reminder.status}
                    </span>
                  </div>

                  {reminder.description && <p>{reminder.description}</p>}

                  <div
                    style={{
                      fontSize: "0.825rem",
                      color: "var(--primary)",
                      fontWeight: 600,
                      marginTop: "0.35rem",
                    }}
                  >
                    📅 {formatDateTime(reminder.reminderDate)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button
                    className={`btn btn-sm ${
                      reminder.status === "Completed" ? "btn-secondary" : "btn-primary"
                    }`}
                    onClick={() => toggleStatus(reminder)}
                    title="Toggle Status"
                  >
                    {reminder.status === "Completed" ? "↩ Pending" : "✓ Done"}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEditClick(reminder)}
                    title="Edit reminder"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(reminder.id)}
                    title="Delete reminder"
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

export default Reminders;