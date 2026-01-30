import React, { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";

function CreateAuction() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    base_price: "",
    end_time: ""
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      // Append form fields properly
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("base_price", Number(form.base_price));
      formData.append("end_time", new Date(form.end_time).toISOString());

      // Append images
      images.forEach((img) => {
        formData.append("images", img);
      });

      await API.post("/auctions/create", formData);

      alert("🎉 Auction created!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to create auction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8">

        <h2 className="text-2xl font-bold text-center mb-6">
          Create New Auction
        </h2>

        {error && (
          <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-1">Product Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImages([...e.target.files])}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select</option>
                <option value="Books & Study">Books & Study</option>
                <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                <option value="Hostel Essentials">Hostel Essentials</option>
                <option value="Clothing & Accessories">Clothing & Accessories</option>
                <option value="Kitchen & Food Items">Kitchen & Food Items</option>
                <option value="Sports & Fitness">Sports & Fitness</option>
                <option value="Transport & Mobility">Transport & Mobility</option>
                <option value="Personal Care">Personal Care</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Base Price (₹)</label>
              <input
                type="number"
                name="base_price"
                value={form.base_price}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* End Time */}
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <input
              type="datetime-local"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Auction"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreateAuction;
