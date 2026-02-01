import { Link, Navigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

function LandingPage() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  // Redirect logged-in users
  if (user) {
    return <Navigate to="/auctions" />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= NAV ================= */}
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

          <h2 className="text-xl font-bold tracking-wide">
            UniTrade
          </h2>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/login" className="hover:text-blue-400 font-medium">
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-1.5 rounded-md text-sm font-semibold"
            >
              Create Account
            </Link>
          </div>

          {/* Mobile */}
          <button className="md:hidden" onClick={() => setOpen(!open)}>
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-slate-900 px-4 py-4 space-y-4 border-t border-slate-700">
            <Link to="/login" onClick={() => setOpen(false)} className="block">
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="block bg-blue-600 text-center py-2 rounded-md font-semibold"
            >
              Create Account
            </Link>
          </div>
        )}
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />

        <div className="relative max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Your Campus. <br />
              <span className="text-blue-600">Your Marketplace.</span>
            </h1>

            <p className="mt-6 text-lg text-slate-600 max-w-xl">
              UniTrade is a campus-exclusive marketplace where verified students
              buy, sell, and bid safely in real time.
            </p>

            <div className="mt-8 flex gap-4">
              <Link
                to="/login"
                className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="h-12 px-6 bg-white border border-slate-300 hover:border-blue-600 rounded-xl font-semibold flex items-center justify-center"
              >
                Create Account
              </Link>
            </div>

            <div className="mt-10 flex gap-10 text-sm">
              {[
                { v: "2k+", t: "Students" },
                { v: "5k+", t: "Auctions" },
                { v: "24h", t: "Avg Deal Time" }
              ].map((s) => (
                <div key={s.t}>
                  <p className="font-bold text-2xl">{s.v}</p>
                  <p className="text-slate-500">{s.t}</p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-300/20 blur-3xl rounded-full" />

            <div className="relative grid grid-cols-2 gap-6">
              {[
                { title: "Live Auctions", desc: "Real-time bidding", icon: "⚡", highlight: true },
                { title: "Verified Profiles", desc: "Only real students", icon: "🎓" },
                { title: "Instant Alerts", desc: "Never miss a bid", icon: "🔔" },
                { title: "Quick Listings", desc: "Post in under a minute", icon: "🚀" }
              ].map((f) => (
                <div
                  key={f.title}
                  className={`rounded-2xl p-6 transition hover:-translate-y-1 ${
                    f.highlight
                      ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl"
                      : "bg-white/90 backdrop-blur shadow-sm"
                  }`}
                >
                  <div className="text-2xl mb-4">{f.icon}</div>
                  <p className="font-semibold text-lg">{f.title}</p>
                  <p className={`text-sm mt-1 ${f.highlight ? "text-blue-100" : "text-slate-500"}`}>
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="py-20 bg-slate-900 text-white">
  <div className="max-w-7xl mx-auto px-6">
    <h2 className="text-3xl font-bold text-center mb-12">
      How It Works
    </h2>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
      {[
        { step: "01", title: "List an Item", desc: "Post items easily" },
        { step: "02", title: "Live Bidding", desc: "Students bid in real time" },
        { step: "03", title: "Close the Deal", desc: "Best offer wins" }
      ].map((s, index) => (
        <div
          key={s.step}
          style={{ transitionDelay: `${index * 80}ms` }}
          className="group bg-white rounded-2xl p-6 text-center shadow-sm
                     transition-all duration-300
                     hover:-translate-y-1 hover:shadow-lg"
        >
          <p className="text-blue-600 font-bold mb-2 transition-transform duration-300 group-hover:scale-110">
            {s.step}
          </p>

          <h3 className="font-semibold text-slate-900">
            {s.title}
          </h3>

          <p className="text-slate-500 text-sm mt-2">
            {s.desc}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* ================= WHY ================= */}
      <section className="py-20 bg-slate-900">
  <div className="max-w-5xl mx-auto px-6">
    <h2 className="text-3xl font-bold text-center mb-10 text-white">
      Why UniTrade?
    </h2>

    <div className="bg-white rounded-2xl shadow-sm p-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
      {[
        "Only verified college emails",
        "Secure OTP-based login",
        "Real-time auction system",
        "Direct student-to-student deals"
      ].map((t) => (
        <div
          key={t}
          className="flex gap-3 items-start
                     transition-transform duration-300
                     hover:translate-x-1"
        >
          <span className="text-blue-600 font-semibold transition-transform duration-300 hover:scale-125">
            ✔
          </span>
          <p className="text-slate-700">
            {t}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* ================= CONTACT ================= */}
{/* ================= CONTACT US (CONTRAST SECTION) ================= */}
<section className="py-24 bg-slate-100">
  <div className="max-w-7xl mx-auto px-6 text-center">

    <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 text-slate-900">
      Need Help? Let’s Talk.
    </h2>

    <p className="text-slate-600 max-w-2xl mx-auto mb-14">
      Questions, feedback, or campus support?  
      Reach out to the UniTrade team anytime.
    </p>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

      {/* EMAIL */}
      <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
        <div className="text-3xl mb-4">📧</div>
        <h3 className="font-semibold text-lg mb-1 text-slate-900">
          Email
        </h3>
        <p className="text-slate-600 text-sm">
          support@unitrade.in
        </p>
      </div>

      {/* PHONE */}
      <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
        <div className="text-3xl mb-4">📞</div>
        <h3 className="font-semibold text-lg mb-1 text-slate-900">
          Phone
        </h3>
        <p className="text-slate-600 text-sm">
          +91 9XXXXXXXXX
        </p>
      </div>

      {/* CAMPUS */}
      <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition">
        <div className="text-3xl mb-4">🎓</div>
        <h3 className="font-semibold text-lg mb-1 text-slate-900">
          Campus Support
        </h3>
        <p className="text-slate-600 text-sm">
          Available inside your college
        </p>
      </div>

    </div>
  </div>
</section>



      {/* ================= FOOTER ================= */}
      <footer className="py-6 text-center text-sm text-slate-500">
        Built for students, by students 🎓
      </footer>
    </div>
  );
}

export default LandingPage;
