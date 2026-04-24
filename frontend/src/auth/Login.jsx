import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/auth-context";
import { toast } from "react-toastify";
import { Gavel, ShieldCheck, Bell } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("LOGIN");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Sending OTP…");
    try {
      await API.post("/auth/login", { email, password });
      toast.update(toastId, { render: "OTP sent to your email", type: "success", isLoading: false, autoClose: 2500 });
      setStep("OTP");
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Login failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Verifying OTP…");
    try {
      const res = await API.post("/auth/verify-login-otp", { email, otp });
      login(res.data);
      toast.update(toastId, { render: "Welcome back!", type: "success", isLoading: false, autoClose: 2000 });
      navigate("/auctions");
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Invalid OTP", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT PANEL ───────────────────────────────────── */}
      <div className="hidden md:flex w-1/2 relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white px-16 py-20 flex-col justify-center overflow-hidden">
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link to="/" className="text-2xl font-extrabold gradient-text tracking-tight mb-10 block">UniTrade</Link>

          <h2 className="text-4xl font-extrabold leading-tight mb-4 tracking-tight">
            Welcome<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">back.</span>
          </h2>
          <p className="text-slate-300 mb-12 max-w-sm leading-relaxed">
            Login to browse live auctions, place bids, and close deals with your campus community.
          </p>

          <div className="space-y-7">
            {[
              { icon: <Gavel       size={18} />, title: "Live Bidding",        desc: "Bid on items in real time with instant updates" },
              { icon: <ShieldCheck size={18} />, title: "Verified Community",  desc: "Every user is a verified student on your campus" },
              { icon: <Bell        size={18} />, title: "Instant Alerts",      desc: "Get notified the moment you're outbid" },
            ].map((f) => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-slate-400 text-sm mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ──────────────────────────────────── */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-50 px-4 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="md:hidden block text-center text-2xl font-extrabold gradient-text mb-8">UniTrade</Link>

          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">
                {step === "LOGIN" ? "Sign in to your account" : "Check your email"}
              </h2>
              <p className="text-slate-500 text-sm mt-1.5">
                {step === "LOGIN" ? "Enter your credentials to continue" : `We sent a 6-digit code to ${email}`}
              </p>
            </div>

            {step === "LOGIN" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="label">College Email</label>
                  <input
                    type="email"
                    inputMode="email"
                    placeholder="rollno@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? "Sending OTP…" : "Continue"}
                </button>
              </form>
            )}

            {step === "OTP" && (
              <form onSubmit={handleOTPSubmit} className="space-y-4">
                <div>
                  <label className="label">One-Time Password</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="• • • • • •"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    className="input text-center tracking-[0.4em] text-lg font-semibold"
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? "Verifying…" : "Verify & Login"}
                </button>
                <button type="button" onClick={() => setStep("LOGIN")} className="w-full text-sm text-slate-500 hover:text-slate-700 hover:underline transition-colors">
                  Use a different email or password
                </button>
              </form>
            )}

            {step === "LOGIN" && (
              <p className="text-sm text-center mt-6 text-slate-500">
                Don't have an account?{" "}
                <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Create one
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
