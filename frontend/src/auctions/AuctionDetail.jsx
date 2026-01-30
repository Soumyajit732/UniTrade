import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import socket from "../api/socket";
import { AuthContext } from "../context/AuthContext";

/* ================= BID INCREMENT LOGIC ================= */
function getBidIncrement(price) {
  if (price < 1000) return 50;
  if (price < 5000) return 100;
  if (price < 10000) return 200;
  return 500;
}

function AuctionDetail() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [myOffer, setMyOffer] = useState(null);
  const [offerAmount, setOfferAmount] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const a = await API.get(`/auctions/${id}`);
        setAuction(a.data.auction);
        setSelectedImage(a.data.auction.images?.[0]);

        const b = await API.get(`/bids/${id}`);
        setBids(b.data.bids || []);

        const o = await API.get(`/offers/${id}/my`);
        setMyOffer(o.data.offer || null);
      } catch {
        setError("Failed to load auction");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    socket.connect();
    socket.emit("joinAuction", id);

    socket.on("newBid", (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => ({
          ...prev,
          current_price: data.bid_amount
        }));

        setBids((prev) => [
          {
            _id: Date.now(),
            bidder_id: { name: data.bidder.name },
            bid_amount: data.bid_amount
          },
          ...prev
        ]);
      }
    });

    socket.on("auctionEnded", (data) => {
      if (data.auctionId === id) {
        setAuction((prev) => ({
          ...prev,
          status: "CLOSED",
          winner_id: {
            _id: data.winner_id,
            name: data.winner_name
          },
          final_price: data.final_price,
          final_method: data.method
        }));
      }
    });

    return () => {
      socket.off("newBid");
      socket.off("auctionEnded");
    };
  }, [id]);
  // useEffect(() => {
  //   if (!id) return;
  
  //   socket.emit("joinAuction", id);
  //   console.log("📢 joinAuction:", id);
  
  //   const onNewBid = (data) => {
  //     if (data.auctionId !== id) return;
  
  //     setAuction((prev) => ({
  //       ...prev,
  //       current_price: data.bid_amount
  //     }));
  
  //     setBids((prev) => [
  //       {
  //         _id: Date.now(),
  //         bidder_id: data.bidder.id,
  //         bid_amount: data.bid_amount
  //       },
  //       ...prev
  //     ]);
  //   };
  
  //   socket.on("newBid", onNewBid);
  
  //   return () => {
  //     socket.emit("leaveAuction", id);
  //     socket.off("newBid", onNewBid);
  //     console.log("🚪 leaveAuction:", id);
  //   };
  // }, [id]);
  
  
  

  /* ================= BID LOGIC ================= */

  // ✅ Correct first-bid detection
 /* ================= BID LOGIC ================= */

const isFirstBid = bids.length === 0;

const lastBid = bids[0];

const isMyLastBid =
  !isFirstBid &&
  lastBid?.bidder_id === user?._id;

const increment = getBidIncrement(auction?.current_price || 0);

const nextBid = isFirstBid
  ? auction?.base_price
  : auction?.current_price + increment;


  const handleBid = async () => {
    try {
      await API.post("/bids/place", {
        auctionId: id,
        bid_amount: nextBid
      });

      // ✅ Optimistic UI update
      setAuction((prev) => ({
        ...prev,
        current_price: nextBid
      }));

      setBids((prev) => [
        {
          _id: Date.now(),
          bidder_id: user._id,
          bid_amount: nextBid
        },
        ...prev
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place bid");
    }
  };

  /* ================= OFFER LOGIC ================= */
  const canPlaceOffer = !myOffer || myOffer.status === "REJECTED";

  const handleOffer = async (e) => {
    e.preventDefault();
    await API.post("/offers", {
      auctionId: id,
      offer_price: Number(offerAmount)
    });
    setMyOffer({ status: "PENDING", offer_price: offerAmount });
    setOfferAmount("");
  };

  /* ================= UI STATES ================= */
  if (loading) return <p className="text-center mt-20">Loading…</p>;
  if (error) return <p className="text-center text-red-600">{error}</p>;
  if (!auction) return <p className="text-center">Auction not found</p>;

  const hasBids = auction.current_price > auction.base_price;

  return (
    <div className="bg-slate-100 min-h-screen py-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
          <img
            src={selectedImage}
            alt=""
            className="w-full h-[420px] object-contain rounded-xl bg-slate-50"
          />
          <h1 className="text-3xl font-bold mt-6">{auction.title}</h1>
          <p className="text-gray-600 mt-2">{auction.description}</p>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* PRICE */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">Base Price</p>
            <p className="text-xl font-semibold">₹{auction.base_price}</p>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {hasBids ? "Highest Bid" : "Current Status"}
              </p>
              <p className="text-4xl font-bold text-blue-600">
                {hasBids ? `₹${auction.current_price}` : "No bids yet"}
              </p>
            </div>
          </div>

          {/* BID */}
          {auction.status === "ACTIVE" && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Place a Bid</h3>

              <button
                disabled={isMyLastBid}
                onClick={handleBid}
                className={`w-full py-4 rounded-xl text-lg font-bold ${
                  isMyLastBid
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isMyLastBid
                  ? "You placed the last bid"
                  : `Bid ₹${nextBid}`}
              </button>

              {!isFirstBid && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Increment ₹{increment}
                </p>
              )}
            </div>
          )}

          {/* OFFER */}
          {auction.status === "ACTIVE" && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold mb-3">Make an Offer</h3>

              {myOffer && (
                <p className="text-sm mb-3">
                  Your offer ₹{myOffer.offer_price} —{" "}
                  <span className="font-semibold">{myOffer.status}</span>
                </p>
              )}

              <form onSubmit={handleOffer} className="flex gap-3">
                <input
                  type="number"
                  disabled={!canPlaceOffer}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="Below base price"
                  className="flex-1 border rounded-lg px-4 py-3"
                />
                <button
                  disabled={!canPlaceOffer}
                  className={`px-6 rounded-lg font-semibold ${
                    canPlaceOffer
                      ? "bg-green-600 text-white"
                      : "bg-gray-300"
                  }`}
                >
                  Send
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default AuctionDetail;
