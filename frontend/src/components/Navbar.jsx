import React, { useContext, useState, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { Menu, X, Gavel, Plus, History, User, LogOut } from "lucide-react";

function DesktopNavLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-blue-50 text-blue-600"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const profilePicUrl = useMemo(
    () => (user?.profilePic?.url ? `${user.profilePic.url}?t=${user.updatedAt || ""}` : null),
    [user?.profilePic?.url, user?.updatedAt]
  );

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center gap-4">

        {/* Logo */}
        <Link
          to={user ? "/auctions" : "/"}
          className="text-xl font-extrabold gradient-text tracking-tight shrink-0"
        >
          UniTrade
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1 ml-auto">
          {user ? (
            <>
              <DesktopNavLink to="/auctions" active={isActive("/auctions")} icon={<Gavel size={15} />} label="Auctions" />
              <DesktopNavLink to="/create-auction" active={isActive("/create-auction")} icon={<Plus size={15} />} label="Create" />
              <DesktopNavLink to="/my-auctions" active={isActive("/my-auctions")} icon={<History size={15} />} label="My Auctions" />

              <div className="w-px h-5 bg-slate-200 mx-2" />

              <Link
                to="/profile"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                  isActive("/profile") ? "bg-blue-50" : "hover:bg-slate-100"
                }`}
              >
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt="profile"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-medium text-slate-700">
                  {user.name?.split(" ")[0]}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="ml-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg transition-all shadow-sm"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-1">
          {user ? (
            <>
              <Link to="/auctions"       onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"><Gavel   size={16} /> Auctions</Link>
              <Link to="/create-auction" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"><Plus    size={16} /> Create Auction</Link>
              <Link to="/my-auctions"    onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"><History size={16} /> My Auctions</Link>
              <Link to="/profile"        onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"><User    size={16} /> Profile</Link>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  {profilePicUrl ? (
                    <img src={profilePicUrl} alt="profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login"  onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100">Login</Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="block text-center px-3 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">Sign Up</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
