// import { useEffect, useContext } from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import TestSocket from "./TestSocket";
// import Navbar from "./components/Navbar";
// import AuctionList from "./auctions/AuctionList";
// import AuctionDetail from "./auctions/AuctionDetail";
// import CreateAuction from "./auctions/CreateAuction";
// import AuctionHistory from "./auctions/AuctionHistory";
// import SellerAuctionDashboard from "./auctions/SellerAuctionDashboard";
// import Login from "./auth/Login";
// import Signup from "./auth/Signup";
// import ProtectedRoute from "./auth/ProtectedRoute";

// import socket from "./api/socket";
// import { AuthContext } from "./context/AuthContext";

// function App() {
//   const { user } = useContext(AuthContext);

//   /* ================= SOCKET INIT (ONCE) ================= */
//   // useEffect(() => {
//   //   if (!user?._id) return;
  
//   //   socket.connect();
  
//   //   socket.on("connect", () => {
//   //     console.log("🟢 Socket connected (App):", socket.id);
//   //     socket.emit("joinUser", user._id);
//   //   });
  
//   //   return () => {
//   //     socket.off("connect");
//   //   };
//   // }, [user]);
//   useEffect(() => {
//     if (!user?._id) return;
  
//     // connect only once
//     if (!socket.connected) {
//       socket.connect();
//     }
  
//     // emit AFTER connect (no listener needed)
//     socket.emit("joinUser", user._id);
//     console.log("📡 joinUser emitted:", user._id);
  
//   }, [user?._id]);
  
//   // useEffect(() => {
//   //   if (!user?._id) return;
  
//   //   // connect only once
//   //   if (!socket.connected) {
//   //     socket.connect();
//   //   }
  
//   //   // emit AFTER connect (no listener needed)
//   //   socket.emit("joinUser", user._id);
//   //   console.log("📡 joinUser emitted:", user._id);
  
//   // }, [user?._id]);
  
//   // useEffect(() => {
//   //   if (!user?._id) return;
  
//   //   // 🔥 connect ONLY when user exists
//   //   socket.auth = { userId: user._id };
//   //   socket.connect();
  
//   //   console.log("🧠 Connecting socket for user:", user._id);
  
//   //   socket.emit("joinUser", user._id);
//   //   console.log("📡 joinUser emitted:", user._id);
  
//   //   return () => {
//   //     socket.disconnect();
//   //   };
//   // }, [user]);
  
  
  

//   return (
//     <BrowserRouter>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={<AuctionList />} />
//         <Route path="/auction/:id" element={<AuctionDetail />} />

//         <Route
//           path="/create-auction"
//           element={
//             <ProtectedRoute>
//               <CreateAuction />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/my-auctions"
//           element={
//             <ProtectedRoute>
//               <AuctionHistory />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/socket-test" element={<TestSocket />} />
//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         {/* Seller Dashboard */}
//         <Route
//           path="/seller/auction/:id"
//           element={
//             <ProtectedRoute>
//               <SellerAuctionDashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;


// import { useEffect, useContext } from "react";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import Navbar from "./components/Navbar";
// import AuctionList from "./auctions/AuctionList";
// import AuctionDetail from "./auctions/AuctionDetail";
// import CreateAuction from "./auctions/CreateAuction";
// import AuctionHistory from "./auctions/AuctionHistory";
// import SellerAuctionDashboard from "./auctions/SellerAuctionDashboard";
// import Login from "./auth/Login";
// import Signup from "./auth/Signup";
// import ProtectedRoute from "./auth/ProtectedRoute";

// import socket from "./api/socket";
// import { AuthContext } from "./context/AuthContext";

// function App() {
//   const { user } = useContext(AuthContext);

//   /* ================= SOCKET INIT (ONCE PER LOGIN) ================= */
//   useEffect(() => {
//     if (!user?._id) return;

//     if (!socket.connected) {
//       socket.connect();
//     }

//     socket.emit("joinUser", user._id);
//     console.log("🔔 joinUser emitted for:", user._id);

//     // ❌ DO NOT DISCONNECT HERE
//   }, [user?._id]);

//   return (
//     <BrowserRouter>
//       <Navbar />

//       <Routes>
//         <Route path="/" element={<AuctionList />} />
//         <Route path="/auction/:id" element={<AuctionDetail />} />

//         <Route
//           path="/create-auction"
//           element={
//             <ProtectedRoute>
//               <CreateAuction />
//             </ProtectedRoute>
//           }
//         />

//         <Route
//           path="/my-auctions"
//           element={
//             <ProtectedRoute>
//               <AuctionHistory />
//             </ProtectedRoute>
//           }
//         />

//         <Route path="/login" element={<Login />} />
//         <Route path="/signup" element={<Signup />} />

//         <Route
//           path="/seller/auction/:id"
//           element={
//             <ProtectedRoute>
//               <SellerAuctionDashboard />
//             </ProtectedRoute>
//           }
//         />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
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

function App() {
  const { user } = useContext(AuthContext);

  useEffect(() => {
    console.log("🧠 AUTH USER OBJECT:", user);
    console.log("🧠 AUTH USER ID:", user?._id);
  }, [user]);
  
  useEffect(() => {
    if (!user?._id) return;

    // 🔥 CONNECT FIRST
    if (!socket.connected) {
      socket.connect();
    }

    // 🔥 EMIT ONLY AFTER CONNECT
    socket.once("connect", () => {
      console.log("🟢 Socket connected:", socket.id);
      socket.emit("joinUser", user._id);
      console.log("📡 joinUser emitted:", user._id);
    });

    return () => {
      socket.off("connect");
    };
  }, [user?._id]);

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<AuctionList />} />
        <Route path="/auction/:id" element={<AuctionDetail />} />

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

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/seller/auction/:id"
          element={
            <ProtectedRoute>
              <SellerAuctionDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
