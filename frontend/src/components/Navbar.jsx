import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <h2 className="text-2xl font-bold tracking-wide">
          UniBid 
        </h2>

        {/* Links */}
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/"
                className="hover:text-blue-400 transition font-medium"
              >
                Auctions
              </Link>

              <Link
                to="/create-auction"
                className="hover:text-blue-400 transition font-medium"
              >
                Create Auction
              </Link>

              <Link
                to="/my-auctions"
                className="hover:text-blue-400 transition font-medium"
              >
                My Auctions
              </Link>

              {/* User Info */}
              <div className="flex items-center gap-2 ml-4">
                <div className="bg-blue-600 w-9 h-9 flex items-center justify-center rounded-full font-semibold">
                  {user.name?.[0]}
                </div>
                <span className="hidden sm:block text-sm">{user.name}</span>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="ml-4 bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md text-sm font-medium transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-blue-400 transition font-medium"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="hover:text-blue-400 transition font-medium"
              >
                Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
