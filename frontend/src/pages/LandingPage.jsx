import { Link, Navigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/auth-context";
import {
  Menu, X, Gavel, ShieldCheck, Zap, Bell, ArrowRight,
  Star, TrendingUp, Users, Clock, ChevronDown, CheckCircle, Award,
} from "lucide-react";

const FAQ_ITEMS = [
  { q: "Who can join UniTrade?", a: "Any student with a valid college email address can sign up. We verify your email during registration to keep the community campus-exclusive." },
  { q: "How does bidding work?", a: "Sellers list items with a starting price and auction window. Buyers place bids in real time — the highest bid when the timer ends wins the item." },
  { q: "Is it safe to meet and exchange items?", a: "Yes. We recommend meeting in public campus areas like libraries, cafeterias, or student centers. Always bring a friend if you're unsure." },
  { q: "What is AI Pricing?", a: "Our ML model analyzes past campus auction data to suggest a fair starting price for your item, so you don't undervalue or overprice it." },
  { q: "What if I win but the seller doesn't show up?", a: "You can report no-shows through the platform. Repeated violations lead to account suspension. Our support team mediates disputes." },
];

const CATEGORIES = ["📚 Textbooks", "💻 Electronics", "🪑 Furniture", "🎮 Gaming", "👕 Clothing", "🎸 Instruments", "📷 Camera Gear", "🏋️ Fitness", "🎒 Bags", "🔬 Lab Equipment"];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200 ${open ? "bg-blue-50/40 border-blue-200" : "bg-white border-slate-200"}`}>
      <button className="w-full flex justify-between items-center px-6 py-5 text-left" onClick={() => setOpen(!open)}>
        <span className="font-semibold text-slate-900 pr-4">{q}</span>
        <ChevronDown size={18} className={`flex-shrink-0 text-blue-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-slate-500 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

function LandingPage() {
  const { user } = useContext(AuthContext);
  const [open, setOpen] = useState(false);

  if (user) return <Navigate to="/auctions" />;

  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* ── NAV ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <span className="text-xl font-extrabold gradient-text tracking-tight">UniTrade</span>

          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">How it works</a>
            <a href="#features"     className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Features</a>
            <a href="#faq"          className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">FAQ</a>
            <div className="w-px h-5 bg-slate-200" />
            <Link to="/login"  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all">Login</Link>
            <Link to="/signup" className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-sm">Create Account</Link>
          </div>

          <button className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1">
            <a href="#how-it-works" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">How it works</a>
            <a href="#features"     onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Features</a>
            <a href="#faq"          onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">FAQ</a>
            <Link to="/login"  onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Login</Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="block text-center px-3 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">Create Account</Link>
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-blob" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none animate-blob animation-delay-4000" />

        <div className="relative max-w-7xl mx-auto px-6 py-28 lg:py-36">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <div className="fade-in-up">
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 text-xs font-semibold rounded-full mb-6">
                <Zap size={12} /> Campus-Exclusive Marketplace
              </span>

              <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight">
                Your Campus.<br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent animate-gradient-x">
                  Your Marketplace.
                </span>
              </h1>

              <p className="mt-6 text-lg text-slate-300 max-w-lg leading-relaxed">
                UniTrade is where verified students buy, sell, and bid on campus goods — safely, in real time. No middlemen, no strangers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/signup" className="h-12 px-8 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/30 hover:scale-105 active:scale-100">
                  Get Started Free <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="h-12 px-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-semibold flex items-center gap-2 transition-all backdrop-blur-sm">
                  Login
                </Link>
              </div>

              <div className="mt-12 flex gap-10">
                {[
                  { v: "2k+", t: "Students",  icon: <Users size={13} /> },
                  { v: "5k+", t: "Auctions",  icon: <Gavel size={13} /> },
                  { v: "24h", t: "Avg Deal",   icon: <Clock size={13} /> },
                ].map((s) => (
                  <div key={s.t}>
                    <p className="text-3xl font-extrabold">{s.v}</p>
                    <p className="text-slate-400 text-sm mt-0.5 flex items-center gap-1.5">{s.icon} {s.t}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – live auction mock preview */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl" />

              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    LIVE AUCTION
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={11} /> 2h 14m left</span>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 mb-4 flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">💻</div>
                  <div>
                    <p className="font-semibold text-white">MacBook Air M1</p>
                    <p className="text-slate-400 text-xs mt-0.5">Excellent condition · 2021</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => <Star key={i} size={10} className="text-yellow-400 fill-yellow-400" />)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Current Bid</p>
                    <p className="text-white font-bold text-xl mt-0.5">₹52,000</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-slate-400 text-xs">Total Bids</p>
                    <p className="text-white font-bold text-xl mt-0.5">14</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {[
                    { name: "Rahul K.", amount: "₹52,000", time: "2 min ago", top: true },
                    { name: "Priya M.", amount: "₹50,500", time: "8 min ago", top: false },
                    { name: "Arjun S.", amount: "₹49,000", time: "15 min ago", top: false },
                  ].map((bid) => (
                    <div key={bid.name} className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${bid.top ? "bg-blue-500/20 border border-blue-500/30" : "bg-white/5"}`}>
                      <span className={bid.top ? "text-blue-300 font-medium" : "text-slate-400"}>{bid.name}</span>
                      <span className={bid.top ? "text-white font-bold" : "text-slate-300"}>{bid.amount}</span>
                      <span className="text-slate-500">{bid.time}</span>
                    </div>
                  ))}
                </div>

                <button className="w-full h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2">
                  <Gavel size={14} /> Place a Bid
                </button>
              </div>

              {/* Floating badge – verified seller */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2.5">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Verified Seller</p>
                  <p className="text-xs text-slate-400">NIT Kurukshetra · CS dept</p>
                </div>
              </div>

              {/* Floating badge – AI price */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-2.5 shadow-xl flex items-center gap-2.5">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">AI Price: ₹53k</p>
                  <p className="text-xs text-slate-400">Suggested by model</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES MARQUEE ───────────────────────────── */}
      <div className="bg-white border-y border-slate-100 py-4 overflow-hidden">
        <div className="flex gap-4 animate-marquee whitespace-nowrap">
          {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200 flex-shrink-0">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">SIMPLE PROCESS</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">How It Works</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">Three simple steps to buy or sell on campus</p>
          </div>

          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Connector line (desktop only) */}
            <div className="hidden sm:block absolute top-[52px] left-[calc(16.66%+28px)] right-[calc(16.66%+28px)] h-0.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 z-0" />

            {[
              { step: "01", color: "from-blue-600 to-blue-700",     emoji: "📦", title: "List an Item",   desc: "Post in seconds — add photos, set a price, and pick your auction window." },
              { step: "02", color: "from-indigo-600 to-indigo-700", emoji: "⚡", title: "Students Bid",   desc: "Live bidding with real-time updates. Watch offers roll in from your peers." },
              { step: "03", color: "from-violet-600 to-violet-700", emoji: "🤝", title: "Close the Deal", desc: "Highest bid wins. Meet safely on campus and complete the exchange." },
            ].map((s) => (
              <div key={s.step} className="relative z-10 flex flex-col items-center text-center bg-white rounded-2xl p-7 shadow-sm border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all duration-300">
                <div className={`w-14 h-14 bg-gradient-to-br ${s.color} text-white rounded-2xl flex items-center justify-center font-extrabold text-xl mb-4 shadow-md`}>
                  {s.step}
                </div>
                <div className="text-2xl mb-3">{s.emoji}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full mb-3">BUILT FOR STUDENTS</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Everything you need to trade</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">From secure logins to real-time bids — UniTrade has you covered</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Live Auctions",  desc: "Real-time bidding with instant WebSocket updates across all devices",          icon: <Gavel       size={24} />, grad: "from-blue-600 to-blue-700",       bg: "bg-blue-50",    border: "border-blue-100"    },
              { title: "Verified Only",  desc: "Restricted to college students with verified institutional email addresses",    icon: <ShieldCheck size={24} />, grad: "from-emerald-600 to-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100" },
              { title: "Instant Alerts", desc: "Push notifications so you never miss a bid, counter-offer, or auction win",    icon: <Bell        size={24} />, grad: "from-amber-500 to-amber-600",     bg: "bg-amber-50",   border: "border-amber-100"   },
              { title: "AI Pricing",     desc: "ML model trained on campus data suggests fair market prices for your items",   icon: <Zap         size={24} />, grad: "from-violet-600 to-violet-700",  bg: "bg-violet-50",  border: "border-violet-100"  },
            ].map((f) => (
              <div key={f.title} className={`${f.bg} ${f.border} border rounded-2xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
                <div className={`w-12 h-12 bg-gradient-to-br ${f.grad} text-white rounded-xl flex items-center justify-center mb-4 shadow-sm`}>
                  {f.icon}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-white/10 text-blue-300 text-xs font-semibold rounded-full mb-3 border border-white/10">STUDENT VOICES</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Loved by students</h2>
            <p className="mt-3 text-slate-400">What your peers are saying about UniTrade</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: "Ananya Sharma", branch: "CSE · 3rd Year", review: "I sold my old laptop for way more than I expected — the live bidding feature is insane! Got 8 bids in under 2 hours.", stars: 5 },
              { name: "Rohan Mehta",   branch: "ECE · 2nd Year", review: "Bought textbooks for 40% less than MRP. The AI pricing helped me spot a fair deal instantly. Brilliant idea.", stars: 5 },
              { name: "Priya Nair",    branch: "MBA · 1st Year", review: "Super safe and easy to use. Loved that everyone is verified — no random strangers, just fellow students.", stars: 5 },
            ].map((t) => (
              <div key={t.name} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.stars)].map((_, i) => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">"{t.review}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.branch}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY UNITRADE ─────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">TRUST & SAFETY</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Why UniTrade?</h2>
            <p className="mt-3 text-slate-500">Built for trust, speed, and student safety</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "🔐", title: "Verified College Emails", desc: "Only students with valid college emails can register and participate." },
              { icon: "🛡️", title: "OTP-Secured Login",       desc: "Every login requires email OTP verification for maximum security."    },
              { icon: "⚡", title: "Real-Time Auctions",      desc: "Bids update instantly using WebSocket technology across all devices." },
              { icon: "🤝", title: "Direct Student Deals",    desc: "No middlemen — connect directly with peers on your campus."           },
            ].map((f) => (
              <div key={f.title} className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200">
                <span className="text-2xl flex-shrink-0 mt-0.5">{f.icon}</span>
                <div>
                  <h4 className="font-semibold text-slate-900">{f.title}</h4>
                  <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-semibold rounded-full mb-3">QUESTIONS</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">Frequently asked</h2>
            <p className="mt-3 text-slate-500">Everything you need to know about UniTrade</p>
          </div>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item) => <FAQItem key={item.q} {...item} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative overflow-hidden">
        {/* subtle dot grid overlay */}
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 text-blue-200 text-xs font-semibold rounded-full mb-6">
            <Award size={12} /> Join 2,000+ verified students
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">Ready to trade smarter?</h2>
          <p className="text-blue-100 mb-8 text-lg">Sell your old stuff. Score great deals. All on campus.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/signup" className="inline-flex items-center gap-2 h-12 px-8 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold transition-all shadow-xl hover:scale-105 active:scale-100">
              Create Free Account <ArrowRight size={16} />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 h-12 px-8 bg-white/10 border border-white/20 text-white hover:bg-white/20 rounded-xl font-semibold transition-all">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-4 gap-8">
          <div className="sm:col-span-2">
            <span className="text-xl font-extrabold gradient-text block mb-3">UniTrade</span>
            <p className="text-sm leading-relaxed max-w-xs">The campus-exclusive marketplace for students to buy, bid, and sell — safely and in real time.</p>
            <p className="text-xs mt-4 text-slate-600">📧 support@unitrade.in</p>
          </div>
          <div>
            <h4 className="text-slate-200 font-semibold text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#how-it-works" className="hover:text-slate-200 transition-colors">How it works</a></li>
              <li><a href="#features"     className="hover:text-slate-200 transition-colors">Features</a></li>
              <li><a href="#faq"          className="hover:text-slate-200 transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-200 font-semibold text-sm mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login"  className="hover:text-slate-200 transition-colors">Login</Link></li>
              <li><Link to="/signup" className="hover:text-slate-200 transition-colors">Create Account</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 px-6 py-5 max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-600">
          <p>Built for students, by students 🎓</p>
          <p>© 2025 UniTrade. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;
