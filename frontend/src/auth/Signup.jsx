import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";
import { Gavel, ShieldCheck, Bell, Zap } from "lucide-react";

function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "", roll_no: "", branch: "", year: "", phone: "" });
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("FORM");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Creating account…");
    try {
      await API.post("/auth/signup", form);
      toast.update(toastId, { render: "OTP sent to your email", type: "success", isLoading: false, autoClose: 2500 });
      setStep("OTP");
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Signup failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading("Verifying OTP…");
    try {
      await API.post("/auth/verify-signup-otp", { email: form.email, otp });
      toast.update(toastId, { render: "Account verified! Please login", type: "success", isLoading: false, autoClose: 2500 });
      navigate("/login");
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
            Join your campus<br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">marketplace.</span>
          </h2>
          <p className="text-slate-300 mb-12 max-w-sm leading-relaxed">
            A secure, student-exclusive platform for buying, selling, and bidding on campus goods.
          </p>

          <div className="space-y-7">
            {[
              { icon: <Gavel       size={18} />, title: "Live Auctions",         desc: "Participate in real-time bidding across campus" },
              { icon: <ShieldCheck size={18} />, title: "Verified Students Only", desc: "A trusted network of verified college peers"      },
              { icon: <Bell        size={18} />, title: "Instant Notifications",  desc: "Stay updated on every bid and offer"              },
              { icon: <Zap         size={18} />, title: "AI Price Suggestions",   desc: "Smart pricing powered by machine learning"         },
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
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <Link to="/" className="md:hidden block text-center text-2xl font-extrabold gradient-text mb-8">UniTrade</Link>

          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-900">
                {step === "FORM" ? "Create your account" : "Verify your email"}
              </h2>
              <p className="text-slate-500 text-sm mt-1.5">
                {step === "FORM" ? "Fill in your details to get started" : `We sent a 6-digit code to ${form.email}`}
              </p>
            </div>

            {step === "FORM" && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <input name="name" placeholder="Your full name" onChange={handleChange} required className="input" />
                </div>

                <div>
                  <label className="label">College Email</label>
                  <input name="email" type="email" inputMode="email" placeholder="rollno@college.edu" onChange={handleChange} required className="input" />
                </div>

                <div>
                  <label className="label">Password</label>
                  <input name="password" type="password" placeholder="Create a password" onChange={handleChange} required className="input" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Roll Number</label>
                    <input name="roll_no" placeholder="e.g. 2021CS001" onChange={handleChange} required className="input" />
                  </div>
                  <div>
                    <label className="label">Branch</label>
                    <input name="branch" placeholder="e.g. CSE" onChange={handleChange} required className="input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Year</label>
                    <input name="year" inputMode="numeric" placeholder="e.g. 3" onChange={handleChange} required className="input" />
                  </div>
                  <div>
                    <label className="label">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input name="phone" inputMode="tel" placeholder="+91 XXXXXXXXXX" onChange={handleChange} className="input" />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                  {loading ? "Sending OTP…" : "Create Account"}
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
                  {loading ? "Verifying…" : "Verify & Continue"}
                </button>
                <button type="button" onClick={() => setStep("FORM")} className="w-full text-sm text-slate-500 hover:text-slate-700 hover:underline transition-colors">
                  Edit your details
                </button>
              </form>
            )}

            {step === "FORM" && (
              <p className="text-sm text-center mt-6 text-slate-500">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Login
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
