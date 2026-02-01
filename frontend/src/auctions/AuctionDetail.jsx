import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import socket from "../api/socket";
import { AuthContext } from "../context/AuthContext";
import { toast } from "react-toastify";

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
        toast.error("Failed to load auction");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!id) return;

    if (!socket.connected) socket.connect();
    socket.emit("joinAuction", id);

    const onNewBid = (data) => {
      if (data.auctionId !== id) return;

      setAuction((prev) => ({
        ...prev,
        current_price: data.bid_amount
      }));

      setBids((prev) => [
        {
          _id: Date.now(),
          bidder_id: {
            _id: data.bidder.id,
            name: data.bidder.name
          },
          bid_amount: data.bid_amount
        },
        ...prev
      ]);

      if (data.bidder.id !== user?._id) {
        toast.info(`🔔 ${data.bidder.name} bid ₹${data.bid_amount}`, {
          autoClose: 2500
        });
      }
    };

    socket.on("newBid", onNewBid);

    return () => {
      socket.emit("leaveAuction", id);
      socket.off("newBid", onNewBid);
    };
  }, [id, user?._id]);

  /* ================= BID LOGIC ================= */
  const isFirstBid = bids.length === 0;
  const lastBid = bids[0];
  const isMyLastBid =
    !isFirstBid && lastBid?.bidder_id?._id === user?._id;

  const increment = getBidIncrement(auction?.current_price || 0);
  const nextBid = isFirstBid
    ? auction?.base_price
    : auction?.current_price + increment;

  const handleBid = async () => {
    const toastId = toast.loading("Placing bid...");

    try {
      await API.post("/bids/place", {
        auctionId: id,
        bid_amount: nextBid
      });

      toast.update(toastId, {
        render: `Bid placed at ₹${nextBid}`,
        type: "success",
        isLoading: false,
        autoClose: 2000
      });
    } catch (err) {
      toast.update(toastId, {
        render: "Failed to place bid",
        type: "error",
        isLoading: false
      });
    }
  };

  /* ================= OFFER ================= */
  const canPlaceOffer = !myOffer || myOffer.status === "REJECTED";

  const handleOffer = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending offer...");

    try {
      await API.post("/offers", {
        auctionId: id,
        offer_price: Number(offerAmount)
      });

      toast.update(toastId, {
        render: "Offer sent",
        type: "success",
        isLoading: false
      });

      setMyOffer({ status: "PENDING", offer_price: offerAmount });
      setOfferAmount("");
    } catch {
      toast.update(toastId, {
        render: "Offer failed",
        type: "error",
        isLoading: false
      });
    }
  };

  /* ================= UI STATES ================= */
  if (loading) return <p className="text-center mt-20">Loading…</p>;
  if (!auction) return <p className="text-center">Auction not found</p>;

  const hasBids = auction.current_price > auction.base_price;

  return (
    <div className="bg-slate-100 min-h-screen pb-28 sm:pb-10 px-4 sm:px-6 pt-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10">

        {/* LEFT */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-8">

          {/* IMAGE */}
          <div className="bg-slate-100 rounded-xl p-4">
            <img
              src={selectedImage}
              alt="Auction Item"
              className="w-full h-[260px] sm:h-[420px] object-contain rounded-lg"
            />
          </div>

          {/* STATUS */}
          <div className="flex items-center gap-3 mt-4">
            {auction.status === "ACTIVE" && (
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white animate-pulse">
                LIVE
              </span>
            )}
            <span className="text-sm text-gray-500">
              {bids.length} bids placed
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-bold mt-4">
            {auction.title}
          </h1>

          <p className="text-gray-600 mt-3 leading-relaxed">
            {auction.description}
          </p>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {/* PRICE */}
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500">Base Price</p>
            <p className="text-lg font-semibold">₹{auction.base_price}</p>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                {hasBids ? "Highest Bid" : "Status"}
              </p>
              <p className="text-4xl font-extrabold text-blue-600">
                {hasBids ? `₹${auction.current_price}` : "No bids yet"}
              </p>
            </div>
          </div>

          {/* OFFER (DESKTOP) */}
          {auction.status === "ACTIVE" && (
            <div className="hidden sm:block bg-white rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Make an Offer</h3>

              <form onSubmit={handleOffer} className="flex gap-3">
                <input
                  type="number"
                  disabled={!canPlaceOffer}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-3"
                  placeholder="Below base price"
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

      {/* ================= MOBILE STICKY BID CTA ================= */}
      {auction.status === "ACTIVE" && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t shadow-lg p-4 sm:hidden">
          <button
            disabled={isMyLastBid}
            onClick={handleBid}
            className={`w-full h-12 rounded-xl font-bold text-lg ${
              isMyLastBid
                ? "bg-gray-300"
                : "bg-blue-600 text-white"
            }`}
          >
            {isMyLastBid
              ? "You placed last bid"
              : `Bid ₹${nextBid}`}
          </button>
        </div>
      )}
    </div>
  );
}

export default AuctionDetail;
