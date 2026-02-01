import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu, X } from "lucide-react";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">

        {/* Logo */}
        <h2 className="text-xl font-bold tracking-wide">
          UniTrade
        </h2>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          {user ? (
            <>
              <Link to="/" className="hover:text-blue-400 font-medium">
                Auctions
              </Link>
              <Link to="/create-auction" className="hover:text-blue-400 font-medium">
                Create
              </Link>
              <Link to="/my-auctions" className="hover:text-blue-400 font-medium">
                My Auctions
              </Link>

              <div className="flex items-center gap-2 ml-4">
                <div className="bg-blue-600 w-9 h-9 flex items-center justify-center rounded-full font-semibold">
                  {user.name?.[0]}
                </div>
                <span className="text-sm">{user.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="ml-4 bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-400 font-medium">
                Login
              </Link>
              <Link to="/signup" className="hover:text-blue-400 font-medium">
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-slate-900 px-4 py-4 space-y-4 border-t border-slate-700">
          {user ? (
            <>
              <Link to="/" onClick={() => setOpen(false)} className="block">
                Auctions
              </Link>
              <Link to="/create-auction" onClick={() => setOpen(false)} className="block">
                Create Auction
              </Link>
              <Link to="/my-auctions" onClick={() => setOpen(false)} className="block">
                My Auctions
              </Link>

              <div className="flex items-center gap-3 pt-2 border-t border-slate-700">
                <div className="bg-blue-600 w-9 h-9 flex items-center justify-center rounded-full font-semibold">
                  {user.name?.[0]}
                </div>
                <span>{user.name}</span>
              </div>

              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setOpen(false)} className="block">
                Login
              </Link>
              <Link to="/signup" onClick={() => setOpen(false)} className="block">
                Signup
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
