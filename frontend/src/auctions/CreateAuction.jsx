import React, { useState } from "react";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowLeft, Sparkles, ImagePlus, X } from "lucide-react";

function CreateAuction() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", description: "", category: "",
    original_price: "", product_age_value: "", product_age_unit: "months",
    item_condition: "3", auction_duration_hours: "48", base_price: "", end_time: ""
  });

  const [confidence, setConfidence] = useState(null);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [descLoading, setDescLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  /* ── AI DESCRIPTION ─────────────────────────────── */
  const generateDescriptionWithAI = async () => {
    if (!form.title || !form.category) { toast.warn("Please enter title and category first"); return; }
    setDescLoading(true);
    const toastId = toast.loading("Generating description…");
    try {
      const res = await API.post("/ai/generate-description", {
        title: form.title,
        category: form.category
      });
      setForm((p) => ({ ...p, description: res.data.description || "" }));
      toast.update(toastId, { render: "Description generated", type: "success", isLoading: false, autoClose: 2000 });
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "AI generation failed", type: "error", isLoading: false });
    } finally {
      setDescLoading(false);
    }
  };

  /* ── AI PRICE ───────────────────────────────────── */
  const suggestPriceWithAI = async () => {
    if (!form.category || !form.original_price || !form.product_age_value || !form.auction_duration_hours) {
      toast.warn("Fill in category, original price, product age and auction duration first", { autoClose: 3000 });
      return;
    }
    setAiLoading(true);
    const toastId = toast.loading("Analyzing similar auctions…");
    try {
      const res = await API.post("/ai/predict-price", {
        item_category: form.category,
        original_price: Number(form.original_price),
        product_age_value: Number(form.product_age_value),
        product_age_unit: form.product_age_unit,
        item_condition: Number(form.item_condition),
        auction_duration_hours: Number(form.auction_duration_hours)
      });
      setForm((p) => ({ ...p, base_price: res.data.recommended_base_price }));
      setConfidence(res.data.confidence_score);
      toast.update(toastId, { render: "AI price applied", type: "success", isLoading: false, autoClose: 2000 });
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "AI pricing unavailable",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeOnClick: true
      });
    } finally {
      setAiLoading(false);
    }
  };

  /* ── SUBMIT ─────────────────────────────────────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Creating auction…");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append("images", img));
      await API.post("/auctions/create", fd);
      toast.update(toastId, { render: "Auction created!", type: "success", isLoading: false, autoClose: 2500 });
      navigate("/");
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Failed to create auction", type: "error", isLoading: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4">
            <ArrowLeft size={15} /> Back
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create New Auction</h1>
          <p className="text-slate-500 text-sm mt-1">List an item and let students bid in real time</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── SECTION: BASIC INFO ─────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Basic Info</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Title <span className="text-red-400">*</span></label>
                <input name="title" placeholder="e.g. Dell Laptop 8GB" value={form.title} onChange={handleChange} required className="input" />
              </div>
              <div>
                <label className="label">Category <span className="text-red-400">*</span></label>
                <select name="category" value={form.category} onChange={handleChange} required className="input">
                  <option value="">Select category</option>
                  {["Books & Study","Electronics & Gadgets","Hostel Essentials","Clothing & Accessories","Kitchen & Food Items","Sports & Fitness","Transport & Mobility","Personal Care","Miscellaneous"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Description <span className="text-red-400">*</span></label>
              <textarea
                name="description"
                placeholder="Describe condition, age, defects, reason for selling…"
                value={form.description}
                onChange={handleChange}
                rows={4}
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder-slate-400 resize-none transition-colors"
              />
              <button type="button" onClick={generateDescriptionWithAI} disabled={descLoading} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors disabled:opacity-50">
                <Sparkles size={12} />
                {descLoading ? "Generating…" : "Generate with AI"}
              </button>
            </div>
          </div>

          {/* ── SECTION: AI PRICING ─────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={16} className="text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">AI Price Recommendation</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Original Price (₹) <span className="text-red-400">*</span></label>
                <input type="number" name="original_price" placeholder="e.g. 25000" value={form.original_price} onChange={handleChange} required className="input" />
              </div>
              <div>
                <label className="label">Condition</label>
                <select name="item_condition" value={form.item_condition} onChange={handleChange} className="input">
                  <option value="5">Like New</option>
                  <option value="4">Very Good</option>
                  <option value="3">Good</option>
                  <option value="2">Used</option>
                  <option value="1">Poor</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="label">Product Age</label>
                <input type="number" name="product_age_value" placeholder="e.g. 6" value={form.product_age_value} onChange={handleChange} className="input" />
              </div>
              <div className="w-32">
                <label className="label">Unit</label>
                <select name="product_age_unit" value={form.product_age_unit} onChange={handleChange} className="input">
                  <option value="months">Months</option>
                  <option value="years">Years</option>
                  <option value="semesters">Semesters</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">Auction Duration (hours)</label>
              <input type="number" name="auction_duration_hours" min="12" max="168" placeholder="e.g. 48" value={form.auction_duration_hours} onChange={handleChange} className="input" />
            </div>

            <button type="button" onClick={suggestPriceWithAI} disabled={aiLoading} className="btn-primary w-full">
              <Sparkles size={15} />
              {aiLoading ? "Analyzing…" : "Suggest Base Price with AI"}
            </button>

            {confidence !== null && (
              <div className="flex items-center justify-center gap-2 py-2 bg-blue-50 rounded-xl border border-blue-100 text-sm">
                <span className="text-blue-600 font-semibold">AI Confidence:</span>
                <span className="font-bold text-blue-800">{confidence}%</span>
              </div>
            )}
          </div>

          {/* ── SECTION: PRICING & TIMING ───────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Pricing & Timing</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Base Price (₹) <span className="text-red-400">*</span></label>
                <input type="number" name="base_price" placeholder="Starting bid amount" value={form.base_price} onChange={handleChange} required className="input" />
              </div>
              <div>
                <label className="label">Auction Ends At <span className="text-red-400">*</span></label>
                <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} required className="input" />
              </div>
            </div>
          </div>

          {/* ── SECTION: IMAGES ─────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Photos</h2>

            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl p-8 cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200">
              <ImagePlus size={24} className="text-slate-400" />
              <span className="text-sm font-medium text-slate-600">Click to upload images</span>
              <span className="text-xs text-slate-400">JPG, PNG, WEBP • max 2 MB each</span>
              <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>

            {previews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="preview" className="h-20 w-full object-cover rounded-xl border border-slate-100" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── SUBMIT ──────────────────────────────── */}
          <button type="submit" disabled={loading} className="btn-primary w-full h-12 text-base">
            {loading ? "Creating…" : "Create Auction"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateAuction;
