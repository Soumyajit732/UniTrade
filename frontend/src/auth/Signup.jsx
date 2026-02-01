import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

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
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  /* ================= STEP 1: SIGNUP ================= */
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Creating account... 📩");

    try {
      await API.post("/auth/signup", form);

      toast.update(toastId, {
        render: "OTP sent to your email 🔐",
        type: "success",
        isLoading: false,
        autoClose: 2500
      });

      setStep("OTP");
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Signup failed",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 2: VERIFY OTP ================= */
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Verifying OTP... 🔍");

    try {
      await API.post("/auth/verify-signup-otp", {
        email: form.email,
        otp
      });

      toast.update(toastId, {
        render: "Account verified! Please login 🎉",
        type: "success",
        isLoading: false,
        autoClose: 2500
      });

      navigate("/login");
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Invalid OTP",
        type: "error",
        isLoading: false,
        autoClose: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT – DESKTOP ONLY */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-16 py-20 flex-col justify-center">

{/* Brand */}
<h1 className="text-5xl font-extrabold mb-4 tracking-tight">
  UniTrade
</h1>

<p className="text-lg text-slate-300 max-w-md mb-12">
  A campus-exclusive marketplace designed for secure trading
  and real-time auctions between verified students.
</p>

{/* FEATURES */}
<div className="space-y-8 max-w-md">

  {/* Feature 1 */}
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
      1
    </div>
    <div>
      <h3 className="font-semibold text-lg">
        Live Auctions
      </h3>
      <p className="text-slate-400 text-sm">
        Participate in real-time bidding with instant updates
        and transparent competition across campus.
      </p>
    </div>
  </div>

  {/* Feature 2 */}
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
      2
    </div>
    <div>
      <h3 className="font-semibold text-lg">
        Verified Student Network
      </h3>
      <p className="text-slate-400 text-sm">
        Access is restricted to verified college users,
        ensuring a trusted and safe trading environment.
      </p>
    </div>
  </div>

  {/* Feature 3 */}
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
      3
    </div>
    <div>
      <h3 className="font-semibold text-lg">
        Instant Notifications
      </h3>
      <p className="text-slate-400 text-sm">
        Stay informed with real-time alerts for bids,
        offers, and auction activity.
      </p>
    </div>
  </div>

  {/* Feature 4 */}
  <div className="flex gap-4 items-start">
    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
      4
    </div>
    <div>
      <h3 className="font-semibold text-lg">
        Secure OTP-Based Login
      </h3>
      <p className="text-slate-400 text-sm">
        Added OTP verification enhances account security
        and protects against unauthorized access.
      </p>
    </div>
  </div>

</div>

</div>



      {/* RIGHT */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-100 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8">
        <Link
          to="/"
          className="absolute top-6 left-6 text-sm text-slate-600 hover:text-blue-600 font-medium"
        >
          ← Home
        </Link>

          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            {step === "FORM" ? "Create Your Account" : "Verify OTP 🔐"}
          </h2>

          {/* ================= FORM ================= */}
          {step === "FORM" && (
            <form
              onSubmit={handleSignupSubmit}
              className="space-y-4"
            >
              <input
                name="name"
                placeholder="Full Name"
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                name="email"
                type="email"
                inputMode="email"
                placeholder="College Email"
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3"
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
                className="w-full border rounded-xl px-4 py-3"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="roll_no"
                  placeholder="Roll Number"
                  onChange={handleChange}
                  required
                  className="border rounded-xl px-4 py-3"
                />
                <input
                  name="branch"
                  placeholder="Branch"
                  onChange={handleChange}
                  required
                  className="border rounded-xl px-4 py-3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  name="year"
                  inputMode="numeric"
                  placeholder="Year (e.g. 3)"
                  onChange={handleChange}
                  required
                  className="border rounded-xl px-4 py-3"
                />
                <input
                  name="phone"
                  inputMode="tel"
                  placeholder="Phone (optional)"
                  onChange={handleChange}
                  className="border rounded-xl px-4 py-3"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
              >
                {loading ? "Sending OTP..." : "Sign Up"}
              </button>
            </form>
          )}

          {/* ================= OTP ================= */}
          {step === "OTP" && (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <p className="text-center text-gray-500 text-sm">
                OTP sent to <b>{form.email}</b>
              </p>

              <input
                type="text"
                inputMode="numeric"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
                className="w-full border rounded-xl px-4 py-3 text-center tracking-widest text-lg"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
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
            <p className="text-sm text-center mt-6 text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:underline font-medium"
              >
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
