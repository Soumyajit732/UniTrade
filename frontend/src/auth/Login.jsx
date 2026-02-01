import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("LOGIN"); // LOGIN | OTP
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ================= STEP 1: EMAIL + PASSWORD ================= */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Sending OTP... ");

    try {
      await API.post("/auth/login", { email, password });

      toast.update(toastId, {
        render: "OTP sent successfully ",
        type: "success",
        isLoading: false,
        autoClose: 2500,
      });

      setStep("OTP");
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Login failed",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= STEP 2: OTP VERIFY ================= */
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const toastId = toast.loading("Verifying OTP... ");

    try {
      const res = await API.post("/auth/verify-login-otp", {
        email,
        otp,
      });

      login(res.data);

      toast.update(toastId, {
        render: "Login successful ",
        type: "success",
        isLoading: false,
        autoClose: 2000,
      });

      navigate("/auctions");
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Invalid OTP",
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT – DESKTOP ONLY */}
{/* LEFT – DESKTOP ONLY */}
<div className="hidden md:flex w-1/2 bg-slate-900 text-white px-20 py-20 flex-col justify-center">

  {/* Branding */}
  <h1 className="text-5xl font-extrabold mb-4 tracking-tight">
    UniTrade
  </h1>

  <p className="text-lg text-slate-300 mb-12 max-w-md">
    A campus-exclusive marketplace where students buy, sell, and bid
    securely — all in real time.
  </p>

  {/* HOW IT WORKS */}
  <div className="space-y-8 max-w-md">

    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
        1
      </div>
      <div>
        <h3 className="font-semibold text-lg">Login securely</h3>
        <p className="text-slate-400 text-sm">
          Sign in using your college email and password.
          We verify access with OTP for extra security.
        </p>
      </div>
    </div>

    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
        2
      </div>
      <div>
        <h3 className="font-semibold text-lg">Bid or list items</h3>
        <p className="text-slate-400 text-sm">
          Participate in live auctions or list your own items
          in seconds — books, gadgets, cycles, and more.
        </p>
      </div>
    </div>

    <div className="flex gap-4 items-start">
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
        3
      </div>
      <div>
        <h3 className="font-semibold text-lg">Close deals on campus</h3>
        <p className="text-slate-400 text-sm">
          The highest bid wins. Meet safely on campus
          and complete the exchange.
        </p>
      </div>
    </div>

  </div>

</div>


      {/* RIGHT */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-slate-100 px-4">
      
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-10">
        <Link
          to="/"
          className="absolute top-6 left-6 text-sm text-slate-600 hover:text-blue-600 font-medium"
        >
          ← Home
        </Link>

          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-1">
            {step === "LOGIN" ? "Welcome Back " : "Verify OTP "}
          </h2>

          <p className="text-gray-500 text-sm sm:text-base text-center mb-6">
            {step === "LOGIN"
              ? "Login to continue bidding smarter"
              : `OTP sent to ${email}`}
          </p>

          {/* LOGIN FORM */}
          {step === "LOGIN" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <input
                type="email"
                inputMode="email"
                placeholder="rollno@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded-xl px-4 py-3 text-base"
              />

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded-xl px-4 py-3 text-base"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition"
              >
                {loading ? "Sending OTP..." : "Login"}
              </button>
            </form>
          )}

          {/* OTP FORM */}
          {step === "OTP" && (
            <form onSubmit={handleOTPSubmit} className="space-y-4">
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
              <Link
                to="/signup"
                className="text-blue-600 hover:underline font-medium"
              >
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
