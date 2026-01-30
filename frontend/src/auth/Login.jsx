import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("LOGIN"); // LOGIN | OTP
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ================= STEP 1: EMAIL + PASSWORD ================= */

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await API.post("/auth/login", { email, password });
      setStep("OTP"); // move to OTP screen
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 2: OTP VERIFY ================= */

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await API.post("/auth/verify-login-otp", {
        email,
        otp
      });

      login(res.data); // store token + user
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SECTION */}
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

      {/* RIGHT SECTION */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-100 px-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">

          <h2 className="text-3xl font-bold text-center mb-2">
            {step === "LOGIN" ? "Welcome Back 👋" : "Verify OTP 🔐"}
          </h2>

          <p className="text-gray-500 text-center mb-8">
            {step === "LOGIN"
              ? "Login to continue bidding smarter"
              : `OTP sent to ${email}`}
          </p>

          {error && (
            <p className="bg-red-100 text-red-600 p-2 rounded mb-4 text-sm">
              {error}
            </p>
          )}

          {/* ================= LOGIN FORM ================= */}
          {step === "LOGIN" && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="rollno@nitkkr.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl"
              >
                {loading ? "Sending OTP..." : "Login"}
              </button>
            </form>
          )}

          {/* ================= OTP FORM ================= */}
          {step === "OTP" && (
            <form onSubmit={handleOTPSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => setStep("LOGIN")}
                className="w-full text-sm text-gray-500 hover:underline"
              >
                Change email or password
              </button>
            </form>
          )}

          {step === "LOGIN" && (
            <p className="text-sm text-center mt-6 text-gray-600">
              New here?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                Create an account
              </Link>
            </p>
          )}

        </div>
      </div>
    </div>
  );
}

export default Login;
