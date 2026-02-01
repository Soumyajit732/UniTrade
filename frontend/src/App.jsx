import { useEffect, useContext } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation
} from "react-router-dom";

import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";

import AuctionList from "./auctions/AuctionList";
import AuctionDetail from "./auctions/AuctionDetail";
import CreateAuction from "./auctions/CreateAuction";
import AuctionHistory from "./auctions/AuctionHistory";
import SellerAuctionDashboard from "./auctions/SellerAuctionDashboard";

import Login from "./auth/Login";
import Signup from "./auth/Signup";
import ProtectedRoute from "./auth/ProtectedRoute";

import socket from "./api/socket";
import { AuthContext } from "./context/AuthContext";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ================= LAYOUT WRAPPER ================= */
function AppLayout({ children }) {
  const location = useLocation();

  // Routes where navbar should be hidden
  const hideNavbarRoutes = ["/", "/login", "/signup"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  const { user } = useContext(AuthContext);

  /* ================= SOCKET INIT ================= */
  useEffect(() => {
    if (!user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const onConnect = () => {
      console.log("🟢 Socket connected:", socket.id);
      socket.emit("joinUser", user._id);
      toast.success("Connected to live auctions 🔔");
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
    };
  }, [user?._id]);

  return (
    <BrowserRouter>
      <AppLayout>

        {/* 🔥 GLOBAL TOAST CONTAINER */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="light"
        />

        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* PROTECTED */}
          <Route
            path="/auctions"
            element={
              <ProtectedRoute>
                <AuctionList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/auction/:id"
            element={
              <ProtectedRoute>
                <AuctionDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-auction"
            element={
              <ProtectedRoute>
                <CreateAuction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-auctions"
            element={
              <ProtectedRoute>
                <AuctionHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/seller/auction/:id"
            element={
              <ProtectedRoute>
                <SellerAuctionDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
