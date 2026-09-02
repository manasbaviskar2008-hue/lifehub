import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Notes() {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase()?.trim() || "";

  const API_URL = `${import.meta.env.VITE_API_URL}/notes`;
  const STORAGE_KEY = userEmail ? `lifehub_notes_data_${userEmail}` : "lifehub_notes_data";
  const authHeader = userEmail ? { headers: { "X-User-Email": userEmail } } : {};

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("General");

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [errorMsg, setErrorMsg] = useState("");

  // ==============================
  // FETCH NOTES
  // ==============================
  const fetchNotes = async () => {
    try {
      const response = await axios.get(API_URL, authHeader);
      const data = Array.isArray(response.data) ? response.data : [];
      setNotes(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setErrorMsg("");
    } catch (error) {
      console.error("Error fetching notes:", error);
      setErrorMsg("Unable to connect to the Notes backend.");

      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          setNotes(JSON.parse(cached));
          return;
        } catch (e) {
          // ignore
        }
      }
      setNotes([]);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [userEmail]);

  // ==============================
  // ADD / UPDATE NOTE
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    const noteData = {
      title: title.trim(),
      content: body.trim(),
      category,
      userEmail,
    };

    try {
      if (editingNoteId) {
        // UPDATE
        await axios.put(`${API_URL}/${editingNoteId}`, noteData, authHeader);
        setEditingNoteId(null);
      } else {
        // ADD
        await axios.post(API_URL, noteData, authHeader);
      }

      resetForm();
      fetchNotes();

    } catch (error) {
      console.error("Error saving note:", error);
      setErrorMsg("Unable to save note. Make sure Spring Boot is running.");
    }
  };

  // ==============================
  // EDIT NOTE
  // ==============================
  const handleEdit = (note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setBody(note.content || "");
    setCategory(note.category || "General");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==============================
  // DELETE NOTE
  // ==============================
  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, authHeader);
      fetchNotes();
    } catch (error) {
      console.error("Error deleting note:", error);
      setErrorMsg("Unable to delete note.");
    }
  };

  // ==============================
  // RESET FORM
  // ==============================
  const resetForm = () => {
    setTitle("");
    setBody("");
    setCategory("General");
    setEditingNoteId(null);
  };

  // ==============================
  // SEARCH + FILTER
  // ==============================
  const filteredNotes = notes.filter((note) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      note.title.toLowerCase().includes(searchText) ||
      (note.content &&
        note.content.toLowerCase().includes(searchText));

    const matchesFilter =
      filter === "All" || note.category === filter;

    return matchesSearch && matchesFilter;
  });

  // ==============================
  // CATEGORY LIST
  // ==============================
  const categories = [
    "All",
    "General",
    "Study",
    "Work",
    "Projects",
    "Ideas",
    "Personal",
  ];

  return (
    <div>
      {/* PAGE HEADER */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>📝 Notes & Ideas</h2>
        <p>
          Jot down quick thoughts, project ideas, study notes, and important
          information.
        </p>
      </div>

      {/* ERROR MESSAGE */}
      {errorMsg && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            color: "var(--warning)",
          }}
        >
          ℹ️ {errorMsg}
        </div>
      )}

      {/* SUMMARY */}
      <div
        className="grid-3"
        style={{ marginBottom: "2rem" }}
      >
        <div className="glass-card">
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Total Notes
          </span>

          <h3
            style={{
              fontSize: "2rem",
              marginTop: "0.5rem",
              color: "var(--primary)",
            }}
          >
            {notes.length}
          </h3>
        </div>

        <div className="glass-card">
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Categories
          </span>

          <h3
            style={{
              fontSize: "2rem",
              marginTop: "0.5rem",
              color: "var(--success)",
            }}
          >
            {new Set(notes.map((note) => note.category)).size}
          </h3>
        </div>

        <div className="glass-card">
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            Showing
          </span>

          <h3
            style={{
              fontSize: "2rem",
              marginTop: "0.5rem",
              color: "var(--primary)",
            }}
          >
            {filteredNotes.length}
          </h3>
        </div>
      </div>

      <div className="tasks-layout">

        {/* ==============================
            LEFT SIDE - NOTE FORM
        ============================== */}

        <div className="glass-card">
          <h3 style={{ marginBottom: "1.25rem" }}>
            {editingNoteId ? "✏️ Edit Note" : "📝 New Note"}
          </h3>

          <form onSubmit={handleSubmit}>

            {/* TITLE */}
            <div className="form-group">
              <label className="form-label">
                Note Title
              </label>

              <input
                type="text"
                className="input-field"
                placeholder="e.g. Internship Ideas"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* CONTENT */}
            <div className="form-group">
              <label className="form-label">
                Content
              </label>

              <textarea
                rows="6"
                className="textarea-field"
                placeholder="Write your note here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>

            {/* CATEGORY */}
            <div className="form-group">
              <label className="form-label">
                Category
              </label>

              <select
                className="select-field"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="General">General</option>
                <option value="Study">Study</option>
                <option value="Work">Work</option>
                <option value="Projects">Projects</option>
                <option value="Ideas">Ideas</option>
                <option value="Personal">Personal</option>
              </select>
            </div>

            {/* BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
              >
                {editingNoteId
                  ? "Update Note"
                  : "+ Save Note"}
              </button>

              {editingNoteId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* ==============================
            RIGHT SIDE
        ============================== */}

        <div>

          {/* SEARCH + FILTER */}
          <div
            className="glass-card"
            style={{
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* SEARCH */}
            <input
              className="input-field"
              type="text"
              placeholder="🔍 Search notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                marginBottom: "1rem",
              }}
            />

            {/* FILTER */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                flexWrap: "wrap",
              }}
            >
              {categories.map((item) => (
                <button
                  key={item}
                  className={`btn btn-sm ${
                    filter === item
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  onClick={() => setFilter(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* NOTES */}
          {filteredNotes.length === 0 ? (
            <div
              className="glass-card"
              style={{
                textAlign: "center",
                padding: "3rem 1.5rem",
              }}
            >
              <span style={{ fontSize: "2.5rem" }}>
                📝
              </span>

              <h4 style={{ marginTop: "1rem" }}>
                No notes found
              </h4>

              <p style={{ marginTop: "0.35rem" }}>
                Create a new note or change your search/filter.
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="glass-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div>

                    {/* TITLE */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "1.15rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {note.title}
                      </h4>

                      <span className="badge badge-primary">
                        {note.category}
                      </span>
                    </div>

                    {/* CONTENT */}
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "var(--text-muted)",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.6,
                      }}
                    >
                      {note.content}
                    </p>
                  </div>

                  {/* ACTIONS */}
                  <div
                    style={{
                      marginTop: "1.25rem",
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "0.5rem",
                    }}
                  >
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(note)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteNote(note.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notes;