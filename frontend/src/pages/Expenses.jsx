import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Expenses() {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase()?.trim() || "";

  const API_URL = `${import.meta.env.VITE_API_URL}/expenses`;

  const BUDGET_KEY = userEmail ? `lifehub_expense_budget_${userEmail}` : "lifehub_expense_budget";
  const STORAGE_KEY = userEmail ? `lifehub_expenses_data_${userEmail}` : "lifehub_expenses_data";
  const authHeader = userEmail ? { headers: { "X-User-Email": userEmail } } : {};

  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Food");
  const [date, setDate] = useState("");

  const [budget, setBudget] = useState(() => {
    const savedBudget = localStorage.getItem(BUDGET_KEY);
    return savedBudget ? Number(savedBudget) : 10000;
  });

  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(() => {
    const savedBudget = localStorage.getItem(BUDGET_KEY);
    return savedBudget ? Number(savedBudget) : 10000;
  });

  const [editingExpenseId, setEditingExpenseId] = useState(null);

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(API_URL, authHeader);

      const data = Array.isArray(response.data) ? response.data : [];
      setExpenses(data);
      setErrorMsg("");

      // Also save expenses locally so Dashboard can use them
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error(error);
      setErrorMsg("Unable to connect with Spring Boot Backend.");

      // Load cached expenses if backend is unavailable
      const cached = localStorage.getItem(STORAGE_KEY);

      if (cached) {
        try {
          setExpenses(JSON.parse(cached));
        } catch (e) {
          console.error("Unable to read cached expenses");
        }
      } else {
        setExpenses([]);
      }
    }
  };

  useEffect(() => {
    fetchExpenses();

    // Load saved budget
    const savedBudget = localStorage.getItem(BUDGET_KEY);

    if (savedBudget) {
      const value = Number(savedBudget);
      setBudget(value);
      setBudgetInput(value);
    }
  }, [userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    const expense = {
      title,
      amount: Number(amount),
      category,
      date,
      userEmail,
    };

    try {
      if (editingExpenseId) {
        await axios.put(
          `${API_URL}/${editingExpenseId}`,
          expense,
          authHeader
        );

        setEditingExpenseId(null);
      } else {
        await axios.post(API_URL, expense, authHeader);
      }

      await fetchExpenses();
    } catch (error) {
      console.error(error);
    }

    setTitle("");
    setAmount("");
    setCategory("Food");
    setDate("");
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`, authHeader);

      await fetchExpenses();
    } catch (error) {
      console.error(error);
    }
  };

  const editExpense = (expense) => {
    setEditingExpenseId(expense.id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
    setDate(expense.date);
  };
const saveBudget = () => {
  const newBudget = Number(budgetInput);

  if (isNaN(newBudget) || newBudget < 0) {
    alert("Please enter a valid budget.");
    return;
  }

  setBudget(newBudget);

  localStorage.setItem(
    BUDGET_KEY,
    newBudget.toString()
  );

  // Tell Dashboard that the expense budget changed
  window.dispatchEvent(new Event("expenseBudgetUpdated"));

  setEditingBudget(false);
};

  const filteredExpenses = expenses.filter((expense) => {
    const matchCategory =
      filter === "All"
        ? true
        : expense.category === filter;

    const matchSearch =
      (expense.title || "")
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  const totalExpense = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const remainingBalance = budget - totalExpense;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>💰 Expense Tracker</h2>
        <p>
          Track and manage your daily expenses professionally.
        </p>
      </div>

      {/* Summary Cards */}
      <div
        className="grid-3"
        style={{ marginBottom: "2rem" }}
      >
        {/* Total Expenses */}
        <div className="glass-card">
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Total Expenses
          </span>

          <h2
            style={{
              marginTop: ".5rem",
              color: "var(--danger)",
            }}
          >
            ₹{totalExpense.toFixed(2)}
          </h2>
        </div>

        {/* Monthly Budget */}
        <div className="glass-card">
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Monthly Budget
          </span>

          {editingBudget ? (
            <div style={{ marginTop: ".5rem" }}>
              <input
                className="input-field"
                type="number"
                min="0"
                value={budgetInput}
                onChange={(e) =>
                  setBudgetInput(e.target.value)
                }
              />

              <div
                style={{
                  display: "flex",
                  gap: ".5rem",
                  marginTop: ".75rem",
                }}
              >
                <button
                  className="btn btn-primary btn-sm"
                  onClick={saveBudget}
                >
                  Save
                </button>

                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setBudgetInput(budget);
                    setEditingBudget(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: ".5rem" }}>
              <h2
                style={{
                  color: "var(--success)",
                }}
              >
                ₹{budget.toFixed(2)}
              </h2>

              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setBudgetInput(budget);
                  setEditingBudget(true);
                }}
              >
                ✏ Change Budget
              </button>
            </div>
          )}
        </div>

        {/* Remaining Balance */}
        <div className="glass-card">
          <span
            style={{
              color: "var(--text-muted)",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Remaining Balance
          </span>

          <h2
            style={{
              marginTop: ".5rem",
              color:
                remainingBalance < 0
                  ? "var(--danger)"
                  : "var(--primary)",
            }}
          >
            ₹{remainingBalance.toFixed(2)}
          </h2>
        </div>
      </div>

      <div className="tasks-layout">
        {/* LEFT SIDE */}
        <div className="glass-card">
          <h3 style={{ marginBottom: "1.2rem" }}>
            {editingExpenseId
              ? "✏ Edit Expense"
              : "+ Log New Expense"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Expense Title
              </label>

              <input
                className="input-field"
                placeholder="Expense Title"
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Amount
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                placeholder="Enter Amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value)
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
                  setCategory(e.target.value)
                }
              >
                <option>Food</option>
                <option>Shopping</option>
                <option>Travel</option>
                <option>Bills</option>
                <option>Entertainment</option>
                <option>Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Date
              </label>

              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) =>
                  setDate(e.target.value)
                }
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
            >
              {editingExpenseId
                ? "Update Expense"
                : "+ Add Expense"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE */}
        <div>
          <div
            className="glass-card"
            style={{
              marginBottom: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: ".5rem",
                flexWrap: "wrap",
              }}
            >
              {[
                "All",
                "Food",
                "Shopping",
                "Travel",
                "Bills",
                "Entertainment",
                "Other",
              ].map((item) => (
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

            <input
              className="input-field"
              style={{
                maxWidth: "220px",
              }}
              placeholder="🔍 Search Expense"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          {filteredExpenses.length === 0 ? (
            <div
              className="glass-card"
              style={{
                textAlign: "center",
                padding: "3rem 1.5rem",
              }}
            >
              <span style={{ fontSize: "2.5rem" }}>
                💰
              </span>

              <h4 style={{ marginTop: "1rem" }}>
                No Expenses Found
              </h4>

              <p style={{ marginTop: ".5rem" }}>
                Add your first expense to start tracking.
              </p>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="task-item-card"
              >
                <div
                  className="task-details"
                  style={{ flex: 1 }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".75rem",
                      marginBottom: ".35rem",
                    }}
                  >
                    <h4>{expense.title}</h4>

                    <span className="badge badge-primary">
                      {expense.category}
                    </span>
                  </div>

                  <p>
                    ₹
                    {Number(expense.amount).toFixed(2)}
                  </p>

                  <small
                    style={{
                      color: "var(--text-muted)",
                    }}
                  >
                    {expense.date}
                  </small>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                  }}
                >
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      editExpense(expense)
                    }
                  >
                    ✏ Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      deleteExpense(expense.id)
                    }
                  >
                    🗑 Delete
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

export default Expenses;