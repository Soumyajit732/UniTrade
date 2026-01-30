import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    roll_no: "",
    branch: "",
    year: "",
    phone: ""
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("FORM"); // FORM | OTP
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ================= STEP 1: SIGNUP FORM ================= */

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/signup", form);
      setStep("OTP"); // move to OTP screen
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 2: VERIFY OTP ================= */

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/verify-signup-otp", {
        email: form.email,
        otp
      });

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT INTRO SECTION */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-16 py-20 flex-col justify-center items-center relative overflow-hidden text-center">

        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-500 opacity-20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-indigo-500 opacity-20 rounded-full blur-3xl"></div>

        <h1 className="text-5xl font-extrabold tracking-tight mb-4">
          UniBid
        </h1>

        <p className="text-xl text-slate-300 mb-10 max-w-md">
          A smart marketplace built exclusively for campus trading & real-time auctions.
        </p>

        <div className="space-y-4 text-slate-200 text-lg">
          <p>⚡ Live bidding with instant updates</p>
          <p>🤖 AI-assisted price suggestions</p>
          <p>🔒 Secure student-only access</p>
          <p>📊 Analytics & smart insights</p>
        </div>
      </div>

      {/* RIGHT FORM SECTION */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-8">

          <h2 className="text-2xl font-bold text-center mb-6">
            {step === "FORM" ? "Create Your Account" : "Verify OTP 🔐"}
          </h2>

          {error && (
            <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}

          {/* ================= SIGNUP FORM ================= */}
          {step === "FORM" && (
            <form
              onSubmit={handleSignupSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >

              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                name="roll_no"
                placeholder="Roll Number"
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                name="branch"
                placeholder="Branch"
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                name="year"
                placeholder="Year (e.g. 3)"
                onChange={handleChange}
                required
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              />

              <input
                name="phone"
                placeholder="Phone (optional)"
                onChange={handleChange}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none sm:col-span-2"
              />

              <button
                type="submit"
                disabled={loading}
                className="sm:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition"
              >
                {loading ? "Sending OTP..." : "Sign Up"}
              </button>
            </form>
          )}

          {/* ================= OTP FORM ================= */}
          {step === "OTP" && (
            <form onSubmit={handleOTPSubmit} className="space-y-4">

              <p className="text-center text-gray-500 text-sm">
                OTP sent to <b>{form.email}</b>
              </p>

              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                className="w-full border rounded-lg px-4 py-3 text-center tracking-widest text-lg focus:ring-2 focus:ring-green-500 outline-none"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => setStep("FORM")}
                className="w-full text-sm text-gray-500 hover:underline"
              >
                Edit details
              </button>
            </form>
          )}

          {step === "FORM" && (
            <p className="text-sm text-center mt-4 text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Login
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

export default Signup;
