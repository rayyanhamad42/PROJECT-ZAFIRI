import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { FaPlusSquare, FaArrowLeft, FaListAlt } from "react-icons/fa";
import "./AddIngredients.css";

const AddIngredients = () => {
  const navigate = useNavigate();
  const [token] = useState(localStorage.getItem("access_token"));
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    test_type: "Microbiology",
  });
  const [ingredients, setIngredients] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showIngredients, setShowIngredients] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No authentication token found. Please log in.");
      navigate("/");
      return;
    }

    const fetchIngredients = async () => {
      try {
        console.log("Fetching ingredients with token:", token.substring(0, 10) + "..."); // Log partial token
        const response = await fetch("http://192.168.1.180:8000/api/ingredients/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Fetch response status:", response.status);
        const text = await response.text(); // Get raw response first
        console.log("Fetch response text:", text);
        const data = text ? JSON.parse(text) : {};
        if (response.ok) {
          setIngredients(data.ingredients || []); // Extract 'ingredients' field
        } else {
          setError(`Failed to fetch ingredients: ${data.message || text}`);
        }
      } catch (err) {
        setError(`Error fetching ingredients: ${err.message}`);
        console.error("Fetch error details:", err);
      }
    };

    fetchIngredients();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("No authentication token. Please log in.");
      return;
    }

    try {
      const body = {
        name: formData.name,
        price: parseFloat(formData.price),
        test_type: formData.test_type,
      };
      console.log("Submitting ingredient:", body);
      const response = await fetch("http://192.168.1.180:8000/api/ingredients/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      console.log("Post response status:", response.status);
      const text = await response.text();
      console.log("Post response text:", text);
      const data = text ? JSON.parse(text) : {};
      if (!response.ok) {
        throw new Error(data.message || `Failed to add ingredient: ${text}`);
      }
      const newIngredient = data.ingredient;
      setSuccess("Ingredient added successfully!");
      setIngredients([...ingredients, newIngredient]);
      setFormData({ name: "", price: "", test_type: "Microbiology" });
    } catch (err) {
      setError(err.message);
      console.error("Post error details:", err);
    }
  };

  const handleBack = () => {
    navigate("/admin-dashboard");
  };

  const toggleIngredientsList = () => {
    setShowIngredients(!showIngredients);
  };

  return (
    <Layout menuItems={[
      { name: 'Dashboard', path: '/admin-dashboard', icon: <FaListAlt /> },
      { name: 'Add Ingredients', path: '/add-ingredients', icon: <FaPlusSquare /> },
      { name: 'Manage Users', path: '/manage-users', icon: <FaListAlt /> },
    ]}>
      <button className="back-btn" onClick={handleBack}>
        <FaArrowLeft /> Back to Dashboard
      </button>
      <main className="page-content">
        <section className="add-form-container">
          <h2 className="section-title">
            <FaPlusSquare className="title-icon" /> Add New Ingredient
          </h2>
          {error && <p className="status-message error-message">{error}</p>}
          {success && <p className="status-message success-message">{success}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Ingredient Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Blood Agar Base"
              />
            </div>
            <div className="form-group">
              <label htmlFor="price">Price (KES)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="e.g., 250.00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="test_type">Test Type</label>
              <select
                id="test_type"
                name="test_type"
                value={formData.test_type}
                onChange={handleInputChange}
                required
              >
                <option value="Microbiology">Microbiology</option>
                <option value="Chemistry">Chemistry</option>
              </select>
            </div>
            <button type="submit" className="submit-btn">
              <FaPlusSquare className="btn-icon" /> Add Ingredient
            </button>
          </form>
          <button onClick={toggleIngredientsList} className="view-list-btn">
            <FaListAlt className="btn-icon" />
            {showIngredients ? "Hide Existing Ingredients" : "View Existing Ingredients"}
          </button>
        </section>

        {showIngredients && (
          <section className="ingredients-list-container">
            <h2 className="section-title">
              <FaListAlt className="title-icon" /> Existing Ingredients
            </h2>
            {ingredients.length > 0 ? (
              <div className="table-wrapper">
                <table className="ingredients-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Price (KES)</th>
                      <th>Test Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient) => (
                      <tr key={ingredient.id}>
                        <td>{ingredient.name}</td>
                        <td>{ingredient.price}</td>
                        <td>{ingredient.test_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-ingredients-message">No ingredients found or access denied.</p>
            )}
          </section>
        )}
      </main>
    </Layout>
  );
};

export default AddIngredients;