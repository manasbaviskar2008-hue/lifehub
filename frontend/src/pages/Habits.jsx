
import { useState, useEffect } from "react";
import axios from "axios";

function Habits() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Health & Fitness");
  const [frequency, setFrequency] = useState("Daily");
  const [targetGoal, setTargetGoal] = useState("");
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");

  const API_URL = `${import.meta.env.VITE_API_URL}/habits`;
  const BASE_STORAGE_KEY = "lifehub_habits_data";

  const getActiveUserEmail = () => {
    try {
      const userStr = localStorage.getItem("lifehub_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user?.email?.toLowerCase().trim() || "";
      }
    } catch (e) {}
    return "";
  };

  const getStorageKey = () => {
    const email = getActiveUserEmail();
    return email ? `${BASE_STORAGE_KEY}_${email}` : BASE_STORAGE_KEY;
  };

  // Helper to format date YYYY-MM-DD using local time
  const getLocalDateStr = (d = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateStr();

  // Convert backend completedDates string into frontend array
  const normalizeHabit = (habit) => {
    let completedDates = habit.completedDates;

    if (typeof completedDates === "string") {
      if (completedDates.trim() === "") {
        completedDates = [];
      } else {
        completedDates = completedDates
          .split(",")
          .map((date) => date.trim())
          .filter(Boolean);
      }
    }

    if (!Array.isArray(completedDates)) {
      completedDates = [];
    }

    return {
      ...habit,
      completedDates,
    };
  };

  // Convert frontend habit into backend format
  const prepareHabitForBackend = (habit) => {
    return {
      id: habit.id,
      name: habit.name,
      category: habit.category,
      frequency: habit.frequency,
      targetGoal: habit.targetGoal || "",
      completedDates: Array.isArray(habit.completedDates)
        ? habit.completedDates.join(",")
        : "",
      createdAt: habit.createdAt || todayStr,
      userEmail: getActiveUserEmail(),
    };
  };

  // Get last 7 days array
  const getPast7Days = () => {
    const days = [];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);

      const dateStr = getLocalDateStr(d);

      days.push({
        dateStr,
        dayName: dayNames[d.getDay()],
        dayNum: d.getDate(),
        isToday: dateStr === todayStr,
      });
    }

    return days;
  };

  const past7Days = getPast7Days();

  // Fetch habits from backend and sync with local storage
  const fetchHabits = async () => {
    const storageKey = getStorageKey();
    const userEmail = getActiveUserEmail();
    let localHabits = [];
    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        localHabits = JSON.parse(cached).map(normalizeHabit);
      }
    } catch (e) {
      console.warn("Could not read local habit data.");
    }

    try {
      const response = await axios.get(API_URL, {
        headers: { "X-User-Email": userEmail },
      });

      const backendHabits = Array.isArray(response.data)
        ? response.data.map(normalizeHabit)
        : [];

      // If backend has items, combine backend items with any local unsynced items
      if (backendHabits.length > 0) {
        const backendIds = new Set(backendHabits.map((h) => String(h.id)));
        const backendNames = new Set(backendHabits.map((h) => h.name.trim().toLowerCase()));

        const unsyncedLocals = localHabits.filter(
          (h) => !backendIds.has(String(h.id)) && !backendNames.has(h.name.trim().toLowerCase())
        );

        // Sync unsynced local habits to backend
        const newlySynced = [];
        for (const localHabit of unsyncedLocals) {
          try {
            const backendHabit = prepareHabitForBackend(localHabit);
            const res = await axios.post(API_URL, backendHabit, {
              headers: { "X-User-Email": userEmail },
            });
            if (res.data) {
              newlySynced.push(normalizeHabit(res.data));
            }
          } catch (err) {
            newlySynced.push(localHabit);
          }
        }

        const merged = [...backendHabits, ...newlySynced];
        setHabits(merged);
        localStorage.setItem(storageKey, JSON.stringify(merged));
      } else if (localHabits.length > 0) {
        // Backend is empty but we have local habits: push them to backend
        setHabits(localHabits);
        for (const localHabit of localHabits) {
          try {
            const backendHabit = prepareHabitForBackend(localHabit);
            await axios.post(API_URL, backendHabit, {
              headers: { "X-User-Email": userEmail },
            });
          } catch (err) {
            console.warn("Failed to sync local habit to backend:", err.message);
          }
        }
      } else {
        setHabits([]);
        localStorage.setItem(storageKey, JSON.stringify([]));
      }
    } catch (error) {
      console.warn(
        "Backend API offline, loading habits from local storage:",
        error.message
      );
      setHabits(localHabits);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  // Save habits locally
  const saveLocalHabits = (newHabits) => {
    setHabits(newHabits);
    localStorage.setItem(getStorageKey(), JSON.stringify(newHabits));
  };

  // Streak Math Helper
  const calculateStreakInfo = (completedDates = []) => {
    if (!Array.isArray(completedDates) || completedDates.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        isCompletedToday: false,
      };
    }

    const isCompletedToday = completedDates.includes(todayStr);
    const dateSet = new Set(completedDates);

    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();

    if (!isCompletedToday) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (dateSet.has(getLocalDateStr(checkDate))) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Calculate best streak
    const sortedDates = Array.from(dateSet).sort();

    let bestStreak = 0;
    let tempStreak = 0;
    let prevDateObj = null;

    for (const dStr of sortedDates) {
      const parts = dStr.split("-").map(Number);

      const dObj = new Date(
        parts[0],
        parts[1] - 1,
        parts[2]
      );

      if (prevDateObj) {
        const diffDays = Math.round(
          (dObj - prevDateObj) / (1000 * 60 * 60 * 24)
        );

        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }

      prevDateObj = dObj;

      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    }

    return {
      currentStreak,
      bestStreak,
      isCompletedToday,
    };
  };

  // Create or Update Habit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) return;

    if (editingHabitId) {
      const existing = habits.find(
        (h) => h.id === editingHabitId
      );

      if (!existing) return;

      const updatedHabit = {
        ...existing,
        name,
        category,
        frequency,
        targetGoal,
      };

      const backendHabit = prepareHabitForBackend(updatedHabit);

      try {
        const response = await axios.put(
          `${API_URL}/${editingHabitId}`,
          backendHabit,
          { headers: { "X-User-Email": getActiveUserEmail() } }
        );

        const returnedHabit = normalizeHabit(response.data);

        const updated = habits.map((h) =>
          h.id === editingHabitId
            ? returnedHabit
            : h
        );

        saveLocalHabits(updated);
      } catch (error) {
        console.warn(
          "Backend API put error, saving locally:",
          error.message
        );

        const updated = habits.map((h) =>
          h.id === editingHabitId
            ? updatedHabit
            : h
        );

        saveLocalHabits(updated);
      }

      setEditingHabitId(null);
    } else {
      const newHabit = {
        name: name.trim(),
        category,
        frequency,
        targetGoal,
        completedDates: [],
        createdAt: todayStr,
      };

      try {
        const backendHabit =
          prepareHabitForBackend(newHabit);

        const response = await axios.post(
          API_URL,
          backendHabit,
          { headers: { "X-User-Email": getActiveUserEmail() } }
        );

        const returnedHabit =
          normalizeHabit(response.data);

        saveLocalHabits([
          returnedHabit,
          ...habits,
        ]);
      } catch (error) {
        console.warn(
          "Backend API post error, saving locally:",
          error.message
        );

        const localHabit = {
          id: Date.now(),
          ...newHabit,
        };

        saveLocalHabits([
          localHabit,
          ...habits,
        ]);
      }
    }

    setName("");
    setCategory("Health & Fitness");
    setFrequency("Daily");
    setTargetGoal("");
  };

  // Toggle completion for a specific date
  const toggleDateCompletion = async (
    habitId,
    dateStr
  ) => {
    const targetHabit = habits.find(
      (h) => h.id === habitId
    );

    if (!targetHabit) return;

    const currentDates =
      Array.isArray(targetHabit.completedDates)
        ? targetHabit.completedDates
        : [];

    let updatedDates;

    if (currentDates.includes(dateStr)) {
      updatedDates = currentDates.filter(
        (d) => d !== dateStr
      );
    } else {
      updatedDates = [
        ...currentDates,
        dateStr,
      ];
    }

    const updatedHabit = {
      ...targetHabit,
      completedDates: updatedDates,
    };

    const updatedHabits = habits.map((h) =>
      h.id === habitId
        ? updatedHabit
        : h
    );

    // Update UI immediately
    saveLocalHabits(updatedHabits);

    try {
      const backendHabit =
        prepareHabitForBackend(updatedHabit);

      const response = await axios.put(
        `${API_URL}/${habitId}`,
        backendHabit,
        { headers: { "X-User-Email": getActiveUserEmail() } }
      );

      const savedHabit =
        normalizeHabit(response.data);

      const finalHabits = updatedHabits.map((h) =>
        h.id === habitId
          ? savedHabit
          : h
      );

      saveLocalHabits(finalHabits);
    } catch (error) {
      console.warn(
        "Backend update error:",
        error.message
      );
    }
  };

  const handleEditClick = (habit) => {
    setEditingHabitId(habit.id);
    setName(habit.name);
    setCategory(
      habit.category || "Health & Fitness"
    );
    setFrequency(
      habit.frequency || "Daily"
    );
    setTargetGoal(
      habit.targetGoal || ""
    );
  };

  const cancelEdit = () => {
    setEditingHabitId(null);
    setName("");
    setCategory("Health & Fitness");
    setFrequency("Daily");
    setTargetGoal("");
  };

  const deleteHabit = async (id) => {
    const updated = habits.filter(
      (h) => h.id !== id
    );

    saveLocalHabits(updated);

    try {
      await axios.delete(
        `${API_URL}/${id}`,
        { headers: { "X-User-Email": getActiveUserEmail() } }
      );
    } catch (error) {
      console.warn(
        "Backend delete error:",
        error.message
      );
    }
  };

  // Filtering
  const filteredHabits = habits.filter(
    (habit) => {
      const matchesCategory =
        filterCategory === "All" ||
        habit.category === filterCategory;

      const matchesSearch =
        (habit.name || "")
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        (habit.targetGoal || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      return (
        matchesCategory &&
        matchesSearch
      );
    }
  );

  // Overall Stats
  const totalHabits = habits.length;

  const completedTodayCount =
    habits.filter((h) =>
      (h.completedDates || []).includes(
        todayStr
      )
    ).length;

  const todayProgressPercent =
    totalHabits > 0
      ? Math.round(
          (completedTodayCount /
            totalHabits) *
            100
        )
      : 0;

  const maxStreakAcrossHabits =
    habits.reduce((max, h) => {
      const { bestStreak } =
        calculateStreakInfo(
          h.completedDates
        );

      return bestStreak > max
        ? bestStreak
        : max;
    }, 0);

  return (
    <div>
      {/* Header Banner */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>🔥 Habit Streak Tracker</h2>

        <p>
          Build discipline, track field habit
          data, and maintain consistency with
          daily check-ins.
        </p>
      </div>

      {/* Summary Cards */}
      <div
        className="grid-4"
        style={{ marginBottom: "2rem" }}
      >
        <div
          className="glass-card"
          style={{ padding: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color:
                  "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Active Habits
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              🎯
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            {totalHabits}
          </h3>

          <span
            className="badge badge-primary"
            style={{ marginTop: "0.5rem" }}
          >
            Tracked Field Data
          </span>
        </div>

        <div
          className="glass-card"
          style={{ padding: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color:
                  "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Completed Today
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              ✅
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            {completedTodayCount} /{" "}
            {totalHabits}
          </h3>

          <span
            className="badge badge-completed"
            style={{ marginTop: "0.5rem" }}
          >
            {todayProgressPercent}%
            {" "}Completed
          </span>
        </div>

        <div
          className="glass-card"
          style={{ padding: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color:
                  "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Best Overall Streak
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              🔥
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            {maxStreakAcrossHabits} Days
          </h3>

          <span
            className="badge badge-pending"
            style={{ marginTop: "0.5rem" }}
          >
            All Time Record
          </span>
        </div>

        <div
          className="glass-card"
          style={{ padding: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color:
                  "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Daily Discipline
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              ⚡
            </span>
          </div>

          <div
            style={{
              marginTop: "0.75rem",
              background:
                "rgba(226, 232, 240, 0.3)",
              borderRadius: "999px",
              height: "10px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${todayProgressPercent}%`,
                background:
                  "linear-gradient(90deg, #10b981, #6366f1)",
                height: "100%",
                transition:
                  "width 0.4s ease",
              }}
            />
          </div>

          <span
            className="badge badge-primary"
            style={{ marginTop: "0.75rem" }}
          >
            Consistency Goal
          </span>
        </div>
      </div>

      <div className="tasks-layout">
        {/* Left Column */}
        <div className="glass-card">
          <h3
            style={{
              marginBottom: "1.25rem",
            }}
          >
            {editingHabitId
              ? "✏️ Edit Habit"
              : "+ Add New Habit"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Habit Name / Goal
              </label>

              <input
                type="text"
                className="input-field"
                placeholder="e.g. Drink 2L Water, Read 20 pages"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Category
              </label>

              <select
                className="select-field"
                value={category}
                onChange={(e) =>
                  setCategory(
                    e.target.value
                  )
                }
              >
                <option value="Health & Fitness">
                  Health & Fitness
                </option>

                <option value="Mindfulness">
                  Mindfulness
                </option>

                <option value="Productivity">
                  Productivity
                </option>

                <option value="Learning">
                  Learning
                </option>

                <option value="Personal">
                  Personal
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Frequency
              </label>

              <select
                className="select-field"
                value={frequency}
                onChange={(e) =>
                  setFrequency(
                    e.target.value
                  )
                }
              >
                <option value="Daily">
                  Daily
                </option>

                <option value="Weekdays">
                  Weekdays
                </option>

                <option value="Weekends">
                  Weekends
                </option>

                <option value="Weekly">
                  Weekly
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Target / Note (Optional)
              </label>

              <input
                type="text"
                className="input-field"
                placeholder="e.g. 15 mins, 2 Liters, 1 Chapter"
                value={targetGoal}
                onChange={(e) =>
                  setTargetGoal(
                    e.target.value
                  )
                }
              />
            </div>

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
                {editingHabitId
                  ? "Update Habit"
                  : "+ Track Habit"}
              </button>

              {editingHabitId && (
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

        {/* Right Column */}
        <div>
          {/* Controls Bar */}
          <div
            className="glass-card"
            style={{
              padding: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              alignItems: "center",
              justifyContent:
                "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
              }}
            >
              {[
                "All",
                "Health & Fitness",
                "Mindfulness",
                "Productivity",
                "Learning",
                "Personal",
              ].map((cat) => (
                <button
                  key={cat}
                  className={`btn btn-sm ${
                    filterCategory === cat
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  onClick={() =>
                    setFilterCategory(cat)
                  }
                >
                  {cat}
                </button>
              ))}
            </div>

            <div
              style={{
                minWidth: "180px",
              }}
            >
              <input
                className="input-field"
                style={{
                  padding:
                    "0.4rem 0.85rem",
                  fontSize: "0.85rem",
                }}
                type="text"
                placeholder="🔍 Search habits..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          </div>

          {/* List of Habits */}
          {filteredHabits.length === 0 ? (
            <div
              className="glass-card"
              style={{
                textAlign: "center",
                padding:
                  "3rem 1.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "2.5rem",
                }}
              >
                🔥
              </span>

              <h4
                style={{
                  marginTop: "1rem",
                }}
              >
                No habits found
              </h4>

              <p
                style={{
                  marginTop: "0.35rem",
                }}
              >
                Create your first habit
                or adjust your filter
                parameters.
              </p>
            </div>
          ) : (
            filteredHabits.map((habit) => {
              const {
                currentStreak,
                bestStreak,
                isCompletedToday,
              } =
                calculateStreakInfo(
                  habit.completedDates
                );

              return (
                <div
                  key={habit.id}
                  className="task-item-card"
                  style={{
                    flexDirection:
                      "column",
                    gap: "1rem",
                  }}
                >
                  {/* Top Row */}
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: "1rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "0.6rem",
                          flexWrap:
                            "wrap",
                        }}
                      >
                        <h4
                          style={{
                            margin: 0,
                          }}
                        >
                          {habit.name}
                        </h4>

                        <span className="badge badge-primary">
                          {habit.category ||
                            "General"}
                        </span>

                        {habit.targetGoal && (
                          <span
                            style={{
                              fontSize:
                                "0.8rem",
                              color:
                                "var(--text-muted)",
                              fontWeight: 500,
                            }}
                          >
                            🎯{" "}
                            {
                              habit.targetGoal
                            }
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "0.75rem",
                          marginTop:
                            "0.5rem",
                        }}
                      >
                        <span className="badge badge-pending">
                          🔥{" "}
                          {currentStreak}{" "}
                          Day Streak
                        </span>

                        <span
                          style={{
                            fontSize:
                              "0.8rem",
                            color:
                              "var(--text-muted)",
                          }}
                        >
                          Best:{" "}
                          <strong>
                            {bestStreak}{" "}
                            days
                          </strong>
                        </span>

                        <span
                          style={{
                            fontSize:
                              "0.8rem",
                            color:
                              "var(--text-muted)",
                          }}
                        >
                          Freq:{" "}
                          <strong>
                            {habit.frequency ||
                              "Daily"}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems:
                          "center",
                        gap: "0.5rem",
                      }}
                    >
                      <button
                        className={`btn btn-sm ${
                          isCompletedToday
                            ? "btn-primary"
                            : "btn-secondary"
                        }`}
                        onClick={() =>
                          toggleDateCompletion(
                            habit.id,
                            todayStr
                          )
                        }
                      >
                        {isCompletedToday
                          ? "✓ Completed Today"
                          : "Mark Complete"}
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          handleEditClick(
                            habit
                          )
                        }
                        title="Edit habit"
                      >
                        ✏️
                      </button>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                          deleteHabit(
                            habit.id
                          )
                        }
                        title="Delete habit"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {/* 7-Day Tracker */}
                  <div
                    style={{
                      width: "100%",
                      paddingTop:
                        "0.75rem",
                      borderTop:
                        "1px dashed var(--border)",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      flexWrap:
                        "wrap",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontSize:
                          "0.8rem",
                        color:
                          "var(--text-muted)",
                        fontWeight: 600,
                      }}
                    >
                      7-Day Log:
                    </span>

                    <div
                      style={{
                        display: "flex",
                        gap: "0.5rem",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      {past7Days.map(
                        (day) => {
                          const isDone =
                            (
                              habit.completedDates ||
                              []
                            ).includes(
                              day.dateStr
                            );

                          return (
                            <button
                              key={
                                day.dateStr
                              }
                              onClick={() =>
                                toggleDateCompletion(
                                  habit.id,
                                  day.dateStr
                                )
                              }
                              title={`${day.dayName} (${day.dateStr}): ${
                                isDone
                                  ? "Completed"
                                  : "Not completed"
                              } - Click to toggle`}
                              style={{
                                display:
                                  "flex",
                                flexDirection:
                                  "column",
                                alignItems:
                                  "center",
                                justifyContent:
                                  "center",
                                width:
                                  "36px",
                                height:
                                  "44px",
                                borderRadius:
                                  "8px",
                                border:
                                  day.isToday
                                    ? "2px solid var(--primary)"
                                    : "1px solid var(--border)",
                                background:
                                  isDone
                                    ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                                    : "var(--surface-solid)",
                                color:
                                  isDone
                                    ? "#ffffff"
                                    : "var(--text-main)",
                                cursor:
                                  "pointer",
                                transition:
                                  "all 0.15s ease",
                                boxShadow:
                                  isDone
                                    ? "0 2px 8px rgba(16, 185, 129, 0.25)"
                                    : "none",
                              }}
                            >
                              <span
                                style={{
                                  fontSize:
                                    "0.65rem",
                                  fontWeight:
                                    700,
                                  opacity:
                                    isDone
                                      ? 0.9
                                      : 0.6,
                                }}
                              >
                                {
                                  day.dayName
                                }
                              </span>

                              <span
                                style={{
                                  fontSize:
                                    "0.85rem",
                                  fontWeight:
                                    800,
                                  marginTop:
                                    "1px",
                                }}
                              >
                                {isDone
                                  ? "✓"
                                  : day.dayNum}
                              </span>
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Habits;

