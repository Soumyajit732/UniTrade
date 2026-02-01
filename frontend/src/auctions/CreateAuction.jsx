import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

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
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ================= AI DESCRIPTION ================= */
  const generateDescriptionWithAI = async () => {
    if (!form.title || !form.category) {
      toast.warn("Please enter title and category first");
      return;
    }

    setAiLoading(true);
    const toastId = toast.loading("Generating description...");

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You write short, clear product descriptions for campus auctions."
              },
              {
                role: "user",
                content: `
Generate a concise product description.

Title: ${form.title}
Category: ${form.category}

Tone: student-friendly, honest, trustworthy.
Length: 3–4 lines.
`
              }
            ],
            temperature: 0.7
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "OpenAI error");
      }

      const description =
        data.choices?.[0]?.message?.content || "";

      setForm((prev) => ({
        ...prev,
        description
      }));

      toast.update(toastId, {
        render: "AI description generated",
        type: "success",
        isLoading: false,
        autoClose: 2000
      });
    } catch (err) {
      toast.update(toastId, {
        render: err.message || "AI generation failed",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setAiLoading(false);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Creating auction...");

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("base_price", Number(form.base_price));
      formData.append(
        "end_time",
        new Date(form.end_time).toISOString()
      );

      images.forEach((img) => formData.append("images", img));

      await API.post("/auctions/create", formData);

      toast.update(toastId, {
        render: "Auction created successfully",
        type: "success",
        isLoading: false,
        autoClose: 2500
      });

      navigate("/");
    } catch (err) {
      toast.update(toastId, {
        render:
          err.response?.data?.message ||
          "Failed to create auction",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 flex justify-center relative">

      {/* HOME */}
      <Link
        to="/"
        className="absolute top-6 left-6 text-sm text-slate-600 hover:text-blue-600 font-medium"
      >
        ← Home
      </Link>

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6 sm:p-8">

        <h2 className="text-3xl font-bold text-center mb-4">
          Create New Auction
        </h2>

        {/* TIPS */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 text-sm text-slate-600">
          <p className="font-semibold text-slate-800 mb-1">
            Tips for better auctions
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Upload clear images from multiple angles</li>
            <li>Set a realistic base price</li>
            <li>Choose an end time a few hours ahead</li>
            <li>You can use AI to generate a description</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TITLE */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full h-12 border rounded-xl px-4"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="w-full h-12 border rounded-xl px-4"
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

          {/* DESCRIPTION + AI */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <button
                type="button"
                onClick={generateDescriptionWithAI}
                disabled={aiLoading}
                className="text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                {aiLoading ? "Generating..." : "Generate with AI"}
              </button>
            </div>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full border rounded-xl px-4 py-3"
            />
          </div>

          {/* IMAGES */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Product Images
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setImages(files);
                setPreviews(
                  files.map((f) => URL.createObjectURL(f))
                );
              }}
              className="w-full border rounded-xl px-4 py-3 bg-white"
            />

            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {previews.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt="preview"
                    className="h-24 w-full object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* PRICE */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Base Price (₹)
            </label>
            <input
              type="number"
              name="base_price"
              value={form.base_price}
              onChange={handleChange}
              required
              className="w-full h-12 border rounded-xl px-4"
            />
          </div>

          {/* END TIME */}
          <div>
            <label className="text-sm font-semibold text-slate-700">
              End Time
            </label>
            <input
              type="datetime-local"
              name="end_time"
              value={form.end_time}
              onChange={handleChange}
              required
              className="w-full h-12 border rounded-xl px-4"
            />
          </div>

          <hr className="my-4 border-slate-200" />

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Auction"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default CreateAuction;
