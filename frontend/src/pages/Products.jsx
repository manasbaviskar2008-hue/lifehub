import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function Products() {
  const { user } = useAuth();
  const userEmail = user?.email?.toLowerCase()?.trim() || "";

const API_URL = `${import.meta.env.VITE_API_URL}/products`;
  const STORAGE_KEY = userEmail ? `lifehub_products_data_${userEmail}` : "lifehub_products_data";
  const authHeader = userEmail ? { headers: { "X-User-Email": userEmail } } : {};

  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [price, setPrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyDate, setWarrantyDate] = useState("");
  const [status, setStatus] = useState("Active");
  const [notes, setNotes] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const categories = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Appliances",
    "Vehicles",
    "Books",
    "Accessories",
    "Other",
  ];

  const fetchProducts = async () => {
    try {
      const response = await axios.get(API_URL, authHeader);
      const data = Array.isArray(response.data) ? response.data : [];

      setProducts(data);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
      );
    } catch (error) {
      console.warn(
        "Backend unavailable, loading local products:",
        error.message
      );

      const cached = localStorage.getItem(STORAGE_KEY);

      if (cached) {
        try {
          setProducts(JSON.parse(cached));
          return;
        } catch (e) {
          console.warn("Invalid local product data");
        }
      }

      setProducts([]);

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([])
      );
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [userEmail]);

  const saveLocalState = (data) => {
    setProducts(data);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  };

  const resetForm = () => {
    setName("");
    setCategory("Electronics");
    setPrice("");
    setPurchaseDate("");
    setWarrantyDate("");
    setStatus("Active");
    setNotes("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim() || !price || !purchaseDate) {
      alert("Please enter Product Name, Price and Purchase Date.");
      return;
    }

    const payload = {
      name,
      category,
      price: Number(price),
      purchaseDate,
      warrantyDate,
      status,
      notes,
      userEmail,
    };

    setLoading(true);

    try {
      if (editingId) {
        const response = await axios.put(
          `${API_URL}/${editingId}`,
          payload,
          authHeader
        );

        const updated = products.map((product) =>
          product.id === editingId
            ? response.data
            : product
        );

        saveLocalState(updated);
      } else {
        const response = await axios.post(
          API_URL,
          payload,
          authHeader
        );

        saveLocalState([
          response.data,
          ...products,
        ]);
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      console.warn(
        "Backend unavailable, saving product locally:",
        error.message
      );

      if (editingId) {
        const updated = products.map((product) =>
          product.id === editingId
            ? {
                ...product,
                ...payload,
              }
            : product
        );

        saveLocalState(updated);
      } else {
        const newProduct = {
          id: Date.now(),
          ...payload,
        };

        saveLocalState([
          newProduct,
          ...products,
        ]);
      }

      resetForm();
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name || "");
    setCategory(product.category || "Electronics");
    setPrice(
      product.price !== undefined
        ? product.price.toString()
        : ""
    );
    setPurchaseDate(product.purchaseDate || "");
    setWarrantyDate(product.warrantyDate || "");
    setStatus(product.status || "Active");
    setNotes(product.notes || "");
  };

  const handleDelete = async (id) => {
    const updated = products.filter(
      (product) => product.id !== id
    );

    saveLocalState(updated);

    try {
      await axios.delete(`${API_URL}/${id}`, authHeader);
    } catch (error) {
      console.warn(
        "Backend delete unavailable:",
        error.message
      );
    }
  };

  const toggleStatus = async (product) => {
    const newStatus =
      product.status === "Active"
        ? "Inactive"
        : "Active";

    const updatedProduct = {
      ...product,
      status: newStatus,
    };

    const updatedList = products.map((item) =>
      item.id === product.id
        ? updatedProduct
        : item
    );

    saveLocalState(updatedList);

    try {
      await axios.put(
        `${API_URL}/${product.id}`,
        updatedProduct,
        authHeader
      );
    } catch (error) {
      console.warn(
        "Backend status update unavailable:",
        error.message
      );
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Electronics":
        return "💻";
      case "Furniture":
        return "🪑";
      case "Clothing":
        return "👕";
      case "Appliances":
        return "🏠";
      case "Vehicles":
        return "🚗";
      case "Books":
        return "📚";
      case "Accessories":
        return "🎧";
      default:
        return "📦";
    }
  };

  const totalValue = products.reduce(
    (sum, product) =>
      sum + Number(product.price || 0),
    0
  );

  const activeProducts = products.filter(
    (product) => product.status === "Active"
  );

  const filteredProducts = products.filter(
    (product) => {
      const matchesCategory =
        filterCategory === "All" ||
        product.category === filterCategory;

      const matchesStatus =
        filterStatus === "All" ||
        product.status === filterStatus;

      const searchText = search.toLowerCase();

      const matchesSearch =
        (product.name || "")
          .toLowerCase()
          .includes(searchText) ||
        (product.category || "")
          .toLowerCase()
          .includes(searchText) ||
        (product.notes || "")
          .toLowerCase()
          .includes(searchText);

      return (
        matchesCategory &&
        matchesStatus &&
        matchesSearch
      );
    }
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h2>📦 Product Manager</h2>

        <p>
          Track your personal products, purchases,
          warranty dates, and important product details.
        </p>
      </div>

      {/* Summary Cards */}
      <div
        className="grid-3"
        style={{ marginBottom: "2rem" }}
      >
        <div
          className="glass-card"
          style={{ padding: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Total Products
            </span>

            <span style={{ fontSize: "1.25rem" }}>
              📦
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            {products.length}
          </h3>

          <span
            className="badge badge-primary"
            style={{ marginTop: "0.5rem" }}
          >
            Products Stored
          </span>
        </div>

        <div
          className="glass-card"
          style={{ padding: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Total Product Value
            </span>

            <span style={{ fontSize: "1.25rem" }}>
              💰
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            ₹{totalValue.toFixed(2)}
          </h3>

          <span
            className="badge badge-completed"
            style={{ marginTop: "0.5rem" }}
          >
            Current Value
          </span>
        </div>

        <div
          className="glass-card"
          style={{ padding: "1.25rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
              }}
            >
              Active Products
            </span>

            <span style={{ fontSize: "1.25rem" }}>
              ✅
            </span>
          </div>

          <h3
            style={{
              fontSize: "1.8rem",
              marginTop: "0.5rem",
            }}
          >
            {activeProducts.length}
          </h3>

          <span
            className="badge badge-pending"
            style={{ marginTop: "0.5rem" }}
          >
            Out of {products.length}
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="tasks-layout">
        {/* Form */}
        <div className="glass-card">
          <h3 style={{ marginBottom: "1.25rem" }}>
            {editingId
              ? "✏️ Edit Product"
              : "+ Add Product"}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                Product Name
              </label>

              <input
                type="text"
                className="input-field"
                placeholder="e.g. Laptop, Phone, Headphones"
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
                  setCategory(e.target.value)
                }
              >
                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Price / Cost (₹)
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                className="input-field"
                placeholder="e.g. 50000"
                value={price}
                onChange={(e) =>
                  setPrice(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Purchase Date
              </label>

              <input
                type="date"
                className="input-field"
                value={purchaseDate}
                onChange={(e) =>
                  setPurchaseDate(e.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Warranty / Expiry Date
              </label>

              <input
                type="date"
                className="input-field"
                value={warrantyDate}
                onChange={(e) =>
                  setWarrantyDate(e.target.value)
                }
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
                  setStatus(e.target.value)
                }
              >
                <option value="Active">
                  Active
                </option>

                <option value="Inactive">
                  Inactive
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Notes
              </label>

              <input
                type="text"
                className="input-field"
                placeholder="e.g. Purchased from Amazon"
                value={notes}
                onChange={(e) =>
                  setNotes(e.target.value)
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
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Product"
                  : "+ Add Product"}
              </button>

              {editingId && (
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

        {/* Product List */}
        <div>
          {/* Filters */}
          <div
            className="glass-card"
            style={{
              padding: "1.25rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
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
                  "Inactive",
                ].map((item) => (
                  <button
                    key={item}
                    className={`btn btn-sm ${
                      filterStatus === item
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                    onClick={() =>
                      setFilterStatus(item)
                    }
                  >
                    {item}
                  </button>
                ))}
              </div>

              <input
                className="input-field"
                style={{
                  minWidth: "200px",
                  padding: "0.4rem 0.85rem",
                  fontSize: "0.85rem",
                }}
                placeholder="🔍 Search products..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.4rem",
              }}
            >
              <button
                className={`btn btn-sm ${
                  filterCategory === "All"
                    ? "btn-primary"
                    : "btn-secondary"
                }`}
                onClick={() =>
                  setFilterCategory("All")
                }
              >
                All Categories
              </button>

              {categories.map((item) => (
                <button
                  key={item}
                  className={`btn btn-sm ${
                    filterCategory === item
                      ? "btn-primary"
                      : "btn-secondary"
                  }`}
                  onClick={() =>
                    setFilterCategory(item)
                  }
                >
                  {getCategoryIcon(item)} {item}
                </button>
              ))}
            </div>
          </div>

          {/* Products */}
          {filteredProducts.length === 0 ? (
            <div
              className="glass-card"
              style={{
                textAlign: "center",
                padding: "3rem 1.5rem",
              }}
            >
              <span
                style={{ fontSize: "2.5rem" }}
              >
                📦
              </span>

              <h4
                style={{
                  marginTop: "1rem",
                }}
              >
                No Products Found
              </h4>

              <p
                style={{
                  marginTop: "0.35rem",
                }}
              >
                Add your first product or change
                your filters.
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div
                key={product.id}
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
                      gap: "0.65rem",
                      marginBottom: "0.35rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "1.25rem",
                      }}
                    >
                      {getCategoryIcon(
                        product.category
                      )}
                    </span>

                    <h4>{product.name}</h4>

                    <span
                      className={
                        product.status === "Active"
                          ? "badge badge-completed"
                          : "badge badge-primary"
                      }
                    >
                      {product.status}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      flexWrap: "wrap",
                      margin: "0.35rem 0",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          "var(--text-main)",
                        fontSize: "1rem",
                      }}
                    >
                      ₹
                      {Number(
                        product.price || 0
                      ).toFixed(2)}
                    </span>

                    <span
                      style={{
                        fontSize: "0.825rem",
                        color:
                          "var(--text-muted)",
                      }}
                    >
                      📅 Purchased:{" "}
                      {product.purchaseDate ||
                        "N/A"}
                    </span>
                  </div>

                  {product.warrantyDate && (
                    <div
                      style={{
                        fontSize: "0.825rem",
                        color:
                          "var(--primary)",
                        fontWeight: 600,
                      }}
                    >
                      🛡️ Warranty / Expiry:{" "}
                      {product.warrantyDate}
                    </div>
                  )}

                  {product.notes && (
                    <p
                      style={{
                        fontSize: "0.825rem",
                        marginTop: "0.35rem",
                      }}
                    >
                      📝 {product.notes}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className={
                      `btn btn-sm ${
                        product.status === "Active"
                          ? "btn-secondary"
                          : "btn-primary"
                      }`
                    }
                    onClick={() =>
                      toggleStatus(product)
                    }
                  >
                    {product.status === "Active"
                      ? "⏸ Disable"
                      : "▶ Activate"}
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() =>
                      handleEdit(product)
                    }
                  >
                    ✏️ Edit
                  </button>

                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() =>
                      handleDelete(product.id)
                    }
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

export default Products;