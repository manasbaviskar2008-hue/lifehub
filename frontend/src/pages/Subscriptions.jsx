import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Subscriptions() {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase()?.trim() || "";

  const API_URL = `${import.meta.env.VITE_API_URL}/subscriptions`;
  const STORAGE_KEY = userEmail ? `lifehub_subscriptions_data_${userEmail}` : "lifehub_subscriptions_data";
  const BUDGET_KEY = userEmail ? `lifehub_subscription_budget_${userEmail}` : "lifehub_subscription_budget";
  const authHeader = userEmail ? { headers: { "X-User-Email": userEmail } } : {};

  const [subscriptions, setSubscriptions] = useState([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("OTT & Entertainment");
  const [price, setPrice] = useState("");
  const [billingCycle, setBillingCycle] = useState("Monthly");
  const [nextBillingDate, setNextBillingDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Monthly budget
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [budgetInput, setBudgetInput] = useState("");

  const categoriesList = [
    "OTT & Entertainment",
    "SaaS & Software",
    "Courses & Learning",
    "Fitness & Gym",
    "Cloud Storage",
    "Utilities & Others",
  ];

  // Fetch subscriptions
  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(API_URL, authHeader);
      const data = Array.isArray(response.data) ? response.data : [];

      setSubscriptions(data);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn(
        "Backend unavailable, loading local state:",
        error.message
      );

      const cached = localStorage.getItem(STORAGE_KEY);

      if (cached) {
        try {
          setSubscriptions(JSON.parse(cached));
          return;
        } catch (e) {
          // Invalid local storage data
        }
      }

      setSubscriptions([]);
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    }
  };

  // Load budget and subscriptions
  useEffect(() => {
    fetchSubscriptions();

    const savedBudget = localStorage.getItem(BUDGET_KEY);

    if (savedBudget) {
      setMonthlyBudget(savedBudget);
      setBudgetInput(savedBudget);
    }
  }, [userEmail]);

  const saveLocalState = (newSubs) => {
    setSubscriptions(newSubs);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newSubs)
    );
  };

  // Save monthly budget
 const handleBudgetSave = (e) => {
  e.preventDefault();

  const budget = parseFloat(budgetInput);

  if (isNaN(budget) || budget < 0) {
    alert("Please enter a valid budget amount.");
    return;
  }

  setMonthlyBudget(budget.toString());

  localStorage.setItem(
    BUDGET_KEY,
    budget.toString()
  );

  // Tell the application that subscription budget changed
  window.dispatchEvent(
    new Event("subscriptionBudgetUpdated")
  );
};

  // Add or Update Subscription
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price || !nextBillingDate) {
      alert(
        "Please enter Name, Price, and Next Billing Date."
      );
      return;
    }

    const payload = {
      name,
      category,
      price: parseFloat(price),
      billingCycle,
      nextBillingDate,
      status,
      notes,
      userEmail,
    };

    setLoading(true);

    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/${editingId}`,
          payload,
          authHeader
        );

        setEditingId(null);
      } else {
        await axios.post(API_URL, payload, authHeader);
      }

      resetForm();
      fetchSubscriptions();
    } catch (error) {
      console.warn(
        "Backend offline during save, performing local mutation:",
        error.message
      );

      if (editingId) {
        const updatedList = subscriptions.map((s) =>
          s.id === editingId
            ? { ...s, ...payload }
            : s
        );

        saveLocalState(updatedList);

        setEditingId(null);
      } else {
        const newItem = {
          id: Date.now(),
          ...payload,
        };

        saveLocalState([
          newItem,
          ...subscriptions,
        ]);
      }

      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCategory("OTT & Entertainment");
    setPrice("");
    setBillingCycle("Monthly");
    setNextBillingDate("");
    setStatus("Active");
    setNotes("");
  };

  const handleEdit = (sub) => {
    setEditingId(sub.id);

    setName(sub.name);

    setCategory(
      sub.category || "OTT & Entertainment"
    );

    setPrice(
      sub.price
        ? sub.price.toString()
        : ""
    );

    setBillingCycle(
      sub.billingCycle || "Monthly"
    );

    setNextBillingDate(
      sub.nextBillingDate || ""
    );

    setStatus(
      sub.status || "Active"
    );

    setNotes(
      sub.notes || ""
    );
  };

  const handleDelete = async (id) => {
    const updated = subscriptions.filter(
      (s) => s.id !== id
    );

    saveLocalState(updated);

    try {
      await axios.delete(
        `${API_URL}/${id}`,
        authHeader
      );
    } catch (error) {
      console.warn(
        "Backend delete offline:",
        error.message
      );
    }
  };

  const toggleStatus = async (sub) => {
    const newStatus =
      sub.status === "Active"
        ? "Paused"
        : "Active";

    const updatedSub = {
      ...sub,
      status: newStatus,
    };

    const updatedList = subscriptions.map(
      (s) =>
        s.id === sub.id
          ? updatedSub
          : s
    );

    saveLocalState(updatedList);

    try {
      await axios.put(
        `${API_URL}/${sub.id}`,
        updatedSub,
        authHeader
      );
    } catch (error) {
      console.warn(
        "Backend status update offline:",
        error.message
      );
    }
  };

  // Helper calculation
  const getMonthlyEquivalent = (sub) => {
    const cost = Number(sub.price) || 0;

    if (sub.billingCycle === "Yearly") {
      return cost / 12;
    }

    if (sub.billingCycle === "Weekly") {
      return cost * 4.33;
    }

    return cost;
  };

  const activeSubs = subscriptions.filter(
    (s) => s.status === "Active"
  );

  const totalMonthlySpend =
    activeSubs.reduce(
      (sum, s) =>
        sum + getMonthlyEquivalent(s),
      0
    );

  const totalYearlySpend =
    totalMonthlySpend * 12;

  const budgetValue =
    Number(monthlyBudget) || 0;

  const remainingBudget =
    budgetValue - totalMonthlySpend;

  const budgetUsedPercentage =
    budgetValue > 0
      ? (totalMonthlySpend /
          budgetValue) *
        100
      : 0;

  // Next upcoming renewal
  const upcomingSub = [
    ...activeSubs,
  ].sort((a, b) =>
    (a.nextBillingDate || "").localeCompare(
      b.nextBillingDate || ""
    )
  )[0];

  // Filters
  const filteredSubscriptions =
    subscriptions.filter((sub) => {
      const matchesCategory =
        filterCategory === "All" ||
        sub.category === filterCategory;

      const matchesStatus =
        filterStatus === "All" ||
        sub.status === filterStatus;

      const matchesSearch =
        (sub.name || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        (sub.notes || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        (sub.category || "")
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      return (
        matchesCategory &&
        matchesStatus &&
        matchesSearch
      );
    });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "OTT & Entertainment":
        return "🎬";

      case "SaaS & Software":
        return "💻";

      case "Courses & Learning":
        return "🎓";

      case "Fitness & Gym":
        return "🏋️";

      case "Cloud Storage":
        return "☁️";

      case "Utilities & Others":
        return "⚡";

      default:
        return "💳";
    }
  };

  return (
    <div>
      {/* Header */}
      <div
        style={{
          marginBottom: "2rem",
        }}
      >
        <h2>
          💳 Subscription Manager
        </h2>

        <p>
          Track recurring OTT, SaaS, course,
          gym, and cloud subscriptions & avoid
          surprise billings.
        </p>
      </div>

      {/* Budget Section */}
      <div
        className="glass-card"
        style={{
          padding: "1.25rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h3>
              💰 Monthly Subscription Budget
            </h3>

            <p
              style={{
                marginTop: "0.35rem",
                fontSize: "0.875rem",
              }}
            >
              Set your own monthly spending
              limit for subscriptions.
            </p>
          </div>

          <form
            onSubmit={handleBudgetSave}
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              className="input-field"
              placeholder="Enter budget ₹"
              value={budgetInput}
              onChange={(e) =>
                setBudgetInput(
                  e.target.value
                )
              }
              style={{
                width: "180px",
              }}
            />

            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Budget
            </button>
          </form>
        </div>

        {budgetValue > 0 && (
          <div
            style={{
              marginTop: "1.25rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                flexWrap: "wrap",
                gap: "0.5rem",
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
              }}
            >
              <span>
                Budget: ₹
                {budgetValue.toFixed(2)}
              </span>

              <span>
                Used: ₹
                {totalMonthlySpend.toFixed(
                  2
                )}
              </span>

              <span
                style={{
                  fontWeight: 700,
                  color:
                    remainingBudget >= 0
                      ? "var(--primary)"
                      : "#ef4444",
                }}
              >
                {remainingBudget >= 0
                  ? `Remaining: ₹${remainingBudget.toFixed(
                      2
                    )}`
                  : `Over Budget: ₹${Math.abs(
                      remainingBudget
                    ).toFixed(2)}`}
              </span>
            </div>

            <div
              style={{
                width: "100%",
                height: "10px",
                background:
                  "var(--bg-secondary)",
                borderRadius: "999px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    budgetUsedPercentage,
                    100
                  )}%`,
                  height: "100%",
                  background:
                    remainingBudget < 0
                      ? "#ef4444"
                      : "var(--primary)",
                  borderRadius:
                    "999px",
                  transition:
                    "width 0.3s ease",
                }}
              />
            </div>

            <div
              style={{
                marginTop: "0.5rem",
                fontSize: "0.8rem",
                color:
                  "var(--text-muted)",
              }}
            >
              {budgetUsedPercentage.toFixed(
                1
              )}
              % of your monthly budget
              used
            </div>
          </div>
        )}
      </div>

      {/* KPI Financial Overview */}
      <div
        className="grid-4"
        style={{
          marginBottom: "2rem",
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
          }}
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
                fontSize:
                  "0.875rem",
                fontWeight: 600,
              }}
            >
              Monthly Spend
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              💵
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            ₹
            {totalMonthlySpend.toFixed(
              2
            )}
          </h3>

          <span
            className="badge badge-primary"
            style={{
              marginTop: "0.5rem",
            }}
          >
            Active recurring total
          </span>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
          }}
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
                fontSize:
                  "0.875rem",
                fontWeight: 600,
              }}
            >
              Yearly Projection
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              📈
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            ₹
            {totalYearlySpend.toFixed(
              2
            )}
          </h3>

          <span
            className="badge badge-completed"
            style={{
              marginTop: "0.5rem",
            }}
          >
            Annualized cost
          </span>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
          }}
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
                fontSize:
                  "0.875rem",
                fontWeight: 600,
              }}
            >
              Active Subscriptions
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              💳
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            {activeSubs.length}
          </h3>

          <span
            className="badge badge-pending"
            style={{
              marginTop: "0.5rem",
            }}
          >
            Out of{" "}
            {subscriptions.length} total
          </span>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "1.25rem",
          }}
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
                fontSize:
                  "0.875rem",
                fontWeight: 600,
              }}
            >
              Next Renewal
            </span>

            <span
              style={{
                fontSize: "1.25rem",
              }}
            >
              📅
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.1rem",
              marginTop: "0.5rem",
              whiteSpace:
                "nowrap",
              overflow:
                "hidden",
              textOverflow:
                "ellipsis",
            }}
          >
            {upcomingSub
              ? upcomingSub.name
              : "None Due"}
          </h3>

          <span
            className="badge badge-primary"
            style={{
              marginTop: "0.5rem",
            }}
          >
            {upcomingSub
              ? upcomingSub.nextBillingDate
              : "N/A"}
          </span>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div className="tasks-layout">
        {/* Form Column */}
        <div className="glass-card">
          <h3
            style={{
              marginBottom: "1.25rem",
            }}
          >
            {editingId
              ? "✏️ Edit Subscription"
              : "+ Add Subscription"}
          </h3>

          <form
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label className="form-label">
                Service Name
              </label>

              <input
                type="text"
                className="input-field"
                placeholder="e.g. Netflix, Spotify, AWS"
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
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
                {categoriesList.map(
                  (cat) => (
                    <option
                      key={cat}
                      value={cat}
                    >
                      {cat}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Price / Cost (₹)
              </label>

              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                placeholder="e.g. 649"
                value={price}
                onChange={(e) =>
                  setPrice(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Billing Cycle
              </label>

              <select
                className="select-field"
                value={
                  billingCycle
                }
                onChange={(e) =>
                  setBillingCycle(
                    e.target.value
                  )
                }
              >
                <option value="Monthly">
                  Monthly
                </option>

                <option value="Yearly">
                  Yearly
                </option>

                <option value="Weekly">
                  Weekly
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Next Renewal Date
              </label>

              <input
                type="date"
                className="input-field"
                value={
                  nextBillingDate
                }
                onChange={(e) =>
                  setNextBillingDate(
                    e.target.value
                  )
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Status
              </label>

              <select
                className="select-field"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >
                <option value="Active">
                  Active
                </option>

                <option value="Paused">
                  Paused
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Notes / Payment Method
              </label>

              <input
                type="text"
                className="input-field"
                placeholder="e.g. Card ending 1234, Shared plan"
                value={notes}
                onChange={(e) =>
                  setNotes(
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
                style={{
                  flex: 1,
                }}
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Subscription"
                  : "+ Add Subscription"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setEditingId(
                      null
                    );
                    resetForm();
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Subscriptions List Column */}
        <div>
          {/* Controls Bar */}
          <div
            className="glass-card"
            style={{
              padding: "1.25rem",
              marginBottom:
                "1.5rem",
              display: "flex",
              flexDirection:
                "column",
              gap: "1rem",
            }}
          >
            {/* Top row */}
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                flexWrap:
                  "wrap",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                }}
              >
                {[
                  "All",
                  "Active",
                  "Paused",
                  "Cancelled",
                ].map((tab) => (
                  <button
                    key={tab}
                    className={`btn btn-sm ${
                      filterStatus ===
                      tab
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                    onClick={() =>
                      setFilterStatus(
                        tab
                      )
                    }
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div
                style={{
                  minWidth:
                    "200px",
                }}
              >
                <input
                  className="input-field"
                  style={{
                    padding:
                      "0.4rem 0.85rem",
                    fontSize:
                      "0.85rem",
                  }}
                  type="text"
                  placeholder="🔍 Search subscriptions..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>

            {/* Category filters */}
            <div
              style={{
                display: "flex",
                flexWrap:
                  "wrap",
                gap: "0.4rem",
              }}
            >
              <button
                className={`btn btn-sm ${
                  filterCategory ===
                  "All"
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
                style={{
                  fontSize:
                    "0.75rem",
                  padding:
                    "0.25rem 0.65rem",
                }}
                onClick={() =>
                  setFilterCategory(
                    "All"
                  )
                }
              >
                All Categories
              </button>

              {categoriesList.map(
                (cat) => (
                  <button
                    key={cat}
                    className={`btn btn-sm ${
                      filterCategory ===
                      cat
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                    style={{
                      fontSize:
                        "0.75rem",
                      padding:
                        "0.25rem 0.65rem",
                    }}
                    onClick={() =>
                      setFilterCategory(
                        cat
                      )
                    }
                  >
                    {getCategoryIcon(
                      cat
                    )}{" "}
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Subscription Items */}
          {filteredSubscriptions.length ===
          0 ? (
            <div
              className="glass-card"
              style={{
                textAlign:
                  "center",
                padding:
                  "3rem 1.5rem",
              }}
            >
              <span
                style={{
                  fontSize:
                    "2.5rem",
                }}
              >
                💳
              </span>

              <h4
                style={{
                  marginTop:
                    "1rem",
                }}
              >
                No subscriptions
                found
              </h4>

              <p
                style={{
                  marginTop:
                    "0.35rem",
                }}
              >
                Add your first
                subscription
                or adjust
                search filters.
              </p>
            </div>
          ) : (
            filteredSubscriptions.map(
              (sub) => (
                <div
                  key={sub.id}
                  className="task-item-card"
                >
                  <div
                    className="task-details"
                    style={{
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        gap:
                          "0.65rem",
                        marginBottom:
                          "0.35rem",
                        flexWrap:
                          "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize:
                            "1.25rem",
                        }}
                      >
                        {getCategoryIcon(
                          sub.category
                        )}
                      </span>

                      <h4>
                        {sub.name}
                      </h4>

                      <span
                        className={
                          sub.status ===
                          "Active"
                            ? "badge badge-completed"
                            : sub.status ===
                              "Paused"
                            ? "badge badge-pending"
                            : "badge badge-primary"
                        }
                      >
                        {sub.status}
                      </span>
                    </div>

                    <div
                      style={{
                        display:
                          "flex",
                        gap:
                          "1rem",
                        flexWrap:
                          "wrap",
                        margin:
                          "0.35rem 0",
                      }}
                    >
                      <span
                        style={{
                          fontWeight:
                            700,
                          color:
                            "var(--text-main)",
                          fontSize:
                            "1rem",
                        }}
                      >
                        ₹
                        {Number(
                          sub.price
                        ).toFixed(
                          2
                        )}

                        <span
                          style={{
                            fontSize:
                              "0.8rem",
                            color:
                              "var(--text-muted)",
                            fontWeight:
                              500,
                          }}
                        >
                          /
                          {sub.billingCycle.toLowerCase()}
                        </span>
                      </span>

                      {sub.billingCycle !==
                        "Monthly" && (
                        <span
                          style={{
                            fontSize:
                              "0.825rem",
                            color:
                              "var(--text-muted)",
                          }}
                        >
                          (~₹
                          {getMonthlyEquivalent(
                            sub
                          ).toFixed(
                            2
                          )}
                          /mo)
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize:
                          "0.825rem",
                        color:
                          "var(--primary)",
                        fontWeight:
                          600,
                      }}
                    >
                      📅 Next Due:{" "}
                      {
                        sub.nextBillingDate
                      }
                    </div>

                    {sub.notes && (
                      <p
                        style={{
                          fontSize:
                            "0.825rem",
                          marginTop:
                            "0.35rem",
                        }}
                      >
                        📝{" "}
                        {sub.notes}
                      </p>
                    )}
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      gap:
                        "0.5rem",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <button
                      className={`btn btn-sm ${
                        sub.status ===
                        "Active"
                          ? "btn-secondary"
                          : "btn-primary"
                      }`}
                      onClick={() =>
                        toggleStatus(
                          sub
                        )
                      }
                      title="Toggle Active/Paused"
                    >
                      {sub.status ===
                      "Active"
                        ? "⏸ Pause"
                        : "▶ Resume"}
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() =>
                        handleEdit(
                          sub
                        )
                      }
                      title="Edit subscription"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(
                          sub.id
                        )
                      }
                      title="Delete subscription"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Subscriptions;