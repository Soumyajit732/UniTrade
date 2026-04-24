import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import socket from "../api/socket";
import { AuthContext } from "../context/auth-context";
import { toast } from "react-toastify";
import { Clock, TrendingUp, ChevronRight, Users } from "lucide-react";
import ChatPanel from "../components/ChatPanel";

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
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  /* ── FETCH ──────────────────────────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const a = await API.get(`/auctions/${id}`);
        setAuction(a.data.auction);
        setSelectedImage(a.data.auction.images?.[0] || null);

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

  /* ── COUNTDOWN ──────────────────────────────────── */
  useEffect(() => {
    if (!auction?.end_time || auction.status !== "ACTIVE") return;
    const endTime = new Date(auction.end_time).getTime();
    if (endTime <= Date.now()) { setIsExpired(true); setTimeLeft("00:00:00"); return; }

    const timer = setInterval(() => {
      const diff = endTime - Date.now();
      if (diff <= 0) { setIsExpired(true); setTimeLeft("00:00:00"); clearInterval(timer); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [auction?.end_time, auction?.status]);

  /* ── SOCKET ─────────────────────────────────────── */
  useEffect(() => {
    if (!id) return;
    if (!socket.connected) socket.connect();
    socket.emit("joinAuction", id);

    const onNewBid = (data) => {
      if (data.auctionId !== id) return;
      setAuction((prev) => ({ ...prev, current_price: data.bid_amount }));
      setBids((prev) => [
        { _id: Date.now(), bidder_id: { _id: data.bidder.id, name: data.bidder.name }, bid_amount: data.bid_amount },
        ...prev
      ]);
      if (data.bidder.id !== user?._id) {
        toast.info(`🔔 ${data.bidder.name} bid ₹${data.bid_amount}`, { autoClose: 2500 });
      }
    };

    const onAuctionEnded = (data) => {
      if (data.auctionId !== id) return;
      setIsExpired(true);
      setTimeLeft("00:00:00");
      setAuction((prev) => ({ ...prev, status: "CLOSED", winner_id: data.winner_id, final_price: data.final_price, final_method: data.method }));
      if (data.winner_id === user?._id) toast.success("🎉 You won this auction!", { autoClose: 4000 });
      else toast.info("🏁 Auction ended");
    };

    socket.on("newBid", onNewBid);
    socket.on("auctionEnded", onAuctionEnded);

    return () => {
      socket.emit("leaveAuction", id);
      socket.off("newBid", onNewBid);
      socket.off("auctionEnded", onAuctionEnded);
    };
  }, [id, user?._id]);

  /* ── BID LOGIC ──────────────────────────────────── */
  const hasBids = bids.length > 0;

  // winner_id can be a populated object or a raw id string depending on whether
  // the state came from the initial fetch or a socket update
  const winnerId = auction?.winner_id?._id?.toString() ?? auction?.winner_id?.toString();
  const isWinner = !!winnerId && winnerId === user?._id?.toString();
  const sellerName = auction?.seller_id?.name || "Seller";
  const increment = getBidIncrement(auction?.current_price ?? auction?.base_price ?? 0);
  const nextBid = auction ? (hasBids ? auction.current_price + increment : auction.base_price) : 0;
  const lastBid = bids[0];
  const isMyLastBid = hasBids && lastBid?.bidder_id?._id === user?._id;
  const isEndingSoon = timeLeft && timeLeft <= "00:00:10";
  const isDealChatOpen =
    auction?.status === "CLOSED" &&
    !!auction?.winner_id &&
    auction?.transaction_status === "PENDING_CONTACT";

  const handleBid = async () => {
    const toastId = toast.loading("Placing bid…");
    try {
      await API.post("/bids/place", { auctionId: id, bid_amount: nextBid });
      toast.update(toastId, { render: `Bid placed at ₹${nextBid}`, type: "success", isLoading: false, autoClose: 2000 });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place bid";
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 4000 });
    }
  };

  /* ── OFFER ──────────────────────────────────────── */
  const handleOffer = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Sending offer…");
    try {
      await API.post("/offers", { auctionId: id, offer_price: Number(offerAmount) });
      toast.update(toastId, { render: "Offer sent successfully", type: "success", isLoading: false });
      setMyOffer({ status: "PENDING", offer_price: offerAmount });
      setOfferAmount("");
    } catch (err) {
      const msg = err.response?.data?.message || "Offer failed";
      toast.update(toastId, { render: msg, type: "error", isLoading: false, autoClose: 4000 });
    }
  };

  /* ── LOADING / ERROR ────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading auction…</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Auction not found.</p>
      </div>
    );
  }

  const images = auction.images?.length ? auction.images : [];

  return (
    <div className="min-h-screen bg-slate-50 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Image gallery */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {selectedImage ? (
              <img src={selectedImage} alt="Auction" className="w-full h-[360px] object-contain bg-slate-50 p-4" />
            ) : (
              <div className="w-full h-[360px] bg-slate-100 flex items-center justify-center text-slate-400">
                No image available
              </div>
            )}
            {images.length > 1 && (
              <div className="flex gap-2 p-3 border-t border-slate-100 overflow-x-auto scrollbar-hide">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(src)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === src ? "border-blue-500 shadow-md" : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img src={src} alt={`img-${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title + description */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{auction.title}</h1>
              <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold border ${
                auction.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}>
                {auction.status === "ACTIVE" ? "● Live" : auction.status}
              </span>
            </div>
            {auction.category && (
              <span className="inline-block mb-3 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                {auction.category}
              </span>
            )}
            <p className="text-slate-600 leading-relaxed text-sm">{auction.description}</p>
          </div>

          {/* Bid history */}
          {bids.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">Bid History</h2>
                <span className="ml-auto flex items-center gap-1 text-xs text-slate-400">
                  <Users size={13} /> {bids.length} bid{bids.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-2">
                {bids.map((bid, idx) => (
                  <div
                    key={bid._id || idx}
                    className={`flex justify-between items-center px-4 py-3 rounded-xl text-sm ${
                      idx === 0
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-slate-50 border border-slate-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {idx === 0 && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Highest</span>}
                      <span className="font-medium text-slate-700">{bid.bidder_id?.name || "Anonymous"}</span>
                      {bid.bidder_id?.branch && <span className="text-slate-400 text-xs">{bid.bidder_id.branch} {bid.bidder_id.year && `Y${bid.bidder_id.year}`}</span>}
                    </div>
                    <span className={`font-bold ${idx === 0 ? "text-blue-700" : "text-slate-700"}`}>₹{bid.bid_amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closed — winner */}
          {auction.status === "CLOSED" && auction.winner_id && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="font-bold text-emerald-800">Auction Closed</p>
                <p className="text-sm text-emerald-700">Final price: <span className="font-semibold">₹{auction.final_price}</span></p>
                {isWinner && (
                  <p className="text-xs text-emerald-600 mt-0.5 font-medium">You won this auction!</p>
                )}
              </div>
            </div>
          )}

          {/* Chat — only visible to the winner */}
          {isDealChatOpen && isWinner && (
            <ChatPanel
              auctionId={id}
              currentUser={user}
              partnerName={sellerName}
            />
          )}
        </div>

        {/* ── RIGHT ───────────────────────────────────── */}
        <div className="space-y-4">

          {/* Price card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Base Price</p>
            <p className="text-base font-semibold text-slate-700 mb-4">₹{auction.base_price}</p>

            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">{hasBids ? "Highest Bid" : "No bids yet"}</p>
            {hasBids ? (
              <p className="text-4xl font-extrabold text-blue-600">₹{auction.current_price}</p>
            ) : (
              <p className="text-2xl font-bold text-slate-400">—</p>
            )}

            {hasBids && <p className="text-xs text-slate-400 mt-1">Increment: ₹{increment}</p>}
          </div>

          {/* Countdown */}
          {auction.status === "ACTIVE" && (
            <div className={`rounded-2xl border shadow-sm p-5 text-center ${isExpired ? "bg-red-50 border-red-200" : "bg-white border-slate-100"}`}>
              <div className="flex items-center justify-center gap-2 mb-1.5">
                <Clock size={14} className={isExpired ? "text-red-500" : "text-slate-400"} />
                <p className="text-xs uppercase font-semibold tracking-wide text-slate-500">Ends in</p>
              </div>
              <p className={`text-4xl font-extrabold tracking-tight tabular-nums ${
                isExpired ? "text-red-600" : isEndingSoon ? "text-orange-500 animate-pulse" : "text-slate-900"
              }`}>
                {timeLeft || "--:--:--"}
              </p>
            </div>
          )}

          {/* Bid button */}
          {auction.status === "ACTIVE" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <button
                disabled={isMyLastBid || isExpired}
                onClick={handleBid}
                className={`w-full h-12 rounded-xl font-bold text-base transition-all duration-200 ${
                  isMyLastBid || isExpired
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg active:scale-[0.98]"
                }`}
              >
                {isExpired ? "Auction Ended" : isMyLastBid ? "You have the highest bid" : `Bid ₹${nextBid}`}
              </button>
              <p className="text-xs text-center text-slate-400 mt-2.5">Minimum increment: ₹{increment}</p>
            </div>
          )}

          {/* Offer */}
          {auction.status === "ACTIVE" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm font-semibold text-slate-700 mb-1">Make a Direct Offer</p>
              <p className="text-xs text-slate-400 mb-3">Below base price — seller can accept or reject</p>

              {myOffer && myOffer.status === "PENDING" ? (
                <div className="text-center py-2 text-sm text-amber-600 font-medium">
                  Offer pending: ₹{myOffer.offer_price}
                </div>
              ) : (
                <form onSubmit={handleOffer} className="flex gap-2">
                  <input
                    type="number"
                    value={offerAmount}
                    onChange={(e) => setOfferAmount(e.target.value)}
                    className="flex-1 h-10 border border-slate-200 rounded-xl px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    placeholder="₹ Amount"
                  />
                  <button className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.98]">
                    Send
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuctionDetail;
