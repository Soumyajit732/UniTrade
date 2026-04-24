import React, { useEffect, useState, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import socket from "../api/socket";
import { toast } from "react-toastify";
import { AuthContext } from "../context/auth-context";
import { TrendingUp, Users, DollarSign, CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";
import ChatPanel from "../components/ChatPanel";

function SellerAuctionDashboard() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchSellerData = useCallback(async () => {
    try {
      const [aRes, bRes, oRes] = await Promise.all([
        API.get(`/auctions/${id}`),
        API.get(`/bids/${id}`),
        API.get(`/offers/${id}`)
      ]);
      setAuction(aRes.data.auction);
      setBids(bRes.data.bids || []);
      setOffers(oRes.data.offers || []);
    } catch {
      toast.error("Failed to load seller dashboard");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchSellerData(); }, [fetchSellerData]);

  /* ── SOCKET ─────────────────────────────────── */
  useEffect(() => {
    if (!socket.connected) socket.connect();
    socket.emit("joinAuction", id);

    const onNewBid = (data) => {
      if (data.auctionId !== id) return;
      setBids((prev) => [
        { _id: Date.now(), bidder_id: { name: data.bidder.name }, bid_amount: data.bid_amount },
        ...prev,
      ]);
      setAuction((prev) => prev ? { ...prev, current_price: data.bid_amount } : prev);
    };

    const onAuctionEnded = (data) => {
      if (data.auctionId !== id) return;
      setAuction((prev) =>
        prev ? {
          ...prev,
          status: "CLOSED",
          winner_id: { _id: data.winner_id, name: data.winner_name },
          final_price: data.final_price,
          transaction_status: "PENDING_CONTACT"
        } : prev
      );
      toast.info("Auction has ended");
    };

    socket.on("newBid", onNewBid);
    socket.on("auctionEnded", onAuctionEnded);

    return () => {
      socket.emit("leaveAuction", id);
      socket.off("newBid", onNewBid);
      socket.off("auctionEnded", onAuctionEnded);
    };
  }, [id]);

  const handleAcceptOffer = async (offerId) => {
    setActionLoading(offerId);
    const toastId = toast.loading("Accepting offer…");
    try {
      await API.post(`/offers/${offerId}/accept`);
      await fetchSellerData();
      toast.update(toastId, { render: "Offer accepted!", type: "success", isLoading: false, autoClose: 2000 });
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Failed to accept", type: "error", isLoading: false });
    } finally { setActionLoading(null); }
  };

  const handleRejectOffer = async (offerId) => {
    setActionLoading(offerId);
    const toastId = toast.loading("Rejecting offer…");
    try {
      await API.post(`/offers/${offerId}/reject`);
      await fetchSellerData();
      toast.update(toastId, { render: "Offer rejected", type: "info", isLoading: false, autoClose: 2000 });
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Failed to reject", type: "error", isLoading: false });
    } finally { setActionLoading(null); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500">Auction not found</p>
      </div>
    );
  }

  const highestBid = bids[0] || null;
  const auctionClosed = auction.status === "CLOSED";
  const txStatus = auction.transaction_status;
  const isDealChatOpen =
    auctionClosed &&
    !!auction.winner_id &&
    txStatus === "PENDING_CONTACT";

  const handleMarkComplete = async () => {
    setActionLoading("complete");
    const toastId = toast.loading("Marking as complete…");
    try {
      await API.put(`/auctions/${id}/complete`);
      await fetchSellerData();
      toast.update(toastId, { render: "Transaction marked as complete!", type: "success", isLoading: false, autoClose: 3000 });
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally { setActionLoading(null); }
  };

  const handleReportNoShow = async () => {
    if (!window.confirm("Report this winner as a no-show? They will receive a strike.")) return;
    setActionLoading("noshow");
    const toastId = toast.loading("Reporting no-show…");
    try {
      await API.put(`/auctions/${id}/no-show`);
      await fetchSellerData();
      toast.update(toastId, { render: "No-show reported. Next bidder has been notified.", type: "info", isLoading: false, autoClose: 3000 });
    } catch (err) {
      toast.update(toastId, { render: err.response?.data?.message || "Failed", type: "error", isLoading: false, autoClose: 3000 });
    } finally { setActionLoading(null); }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Seller Dashboard</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight line-clamp-2">{auction.title}</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <DollarSign size={20} className="text-blue-600" />,
              label: "Current Price",
              value: `₹${auction.current_price}`,
              bg: "bg-blue-50"
            },
            {
              icon: <TrendingUp size={20} className="text-emerald-600" />,
              label: "Total Bids",
              value: bids.length,
              bg: "bg-emerald-50"
            },
            {
              icon: <Users size={20} className="text-violet-600" />,
              label: "Top Bidder",
              value: highestBid?.bidder_id?.name || "—",
              bg: "bg-violet-50"
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className={`w-12 h-12 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{s.label}</p>
                <p className="text-lg font-bold text-slate-900 truncate max-w-[120px]">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Status banner */}
        <div className={`rounded-2xl border px-5 py-3 flex items-center gap-3 ${
          auction.status === "ACTIVE"
            ? "bg-emerald-50 border-emerald-200"
            : "bg-slate-100 border-slate-200"
        }`}>
          <span className={`w-2.5 h-2.5 rounded-full ${auction.status === "ACTIVE" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
          <span className={`text-sm font-semibold ${auction.status === "ACTIVE" ? "text-emerald-700" : "text-slate-600"}`}>
            {auction.status === "ACTIVE" ? "Auction is live" : `Auction ${auction.status.toLowerCase()}`}
          </span>
          {auctionClosed && auction.final_price && (
            <span className="ml-auto text-sm font-semibold text-slate-700">Final: ₹{auction.final_price}</span>
          )}
        </div>

        {/* Transaction Status Panel — only when closed with a winner */}
        {auctionClosed && auction.winner_id && (
          <div className={`rounded-2xl border p-6 space-y-4 ${
            txStatus === "COMPLETED" ? "bg-emerald-50 border-emerald-200" :
            txStatus === "FAILED"    ? "bg-red-50 border-red-200" :
                                       "bg-amber-50 border-amber-200"
          }`}>
            <div className="flex items-center gap-3">
              {txStatus === "COMPLETED" && <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />}
              {txStatus === "FAILED"    && <XCircle     size={20} className="text-red-600 flex-shrink-0" />}
              {txStatus === "PENDING_CONTACT" && <Clock size={20} className="text-amber-600 flex-shrink-0" />}
              <div>
                <p className="font-semibold text-slate-900">
                  {txStatus === "COMPLETED" && "Transaction Complete"}
                  {txStatus === "FAILED"    && "Transaction Failed — No-show Reported"}
                  {txStatus === "PENDING_CONTACT" && "Awaiting Contact from Winner"}
                </p>
                <p className="text-sm text-slate-500 mt-0.5">
                  {txStatus === "COMPLETED" && "The deal has been confirmed as done."}
                  {txStatus === "FAILED"    && "The winner received a strike. The next-highest bidder was notified."}
                  {txStatus === "PENDING_CONTACT" && `Winner: ${auction.winner_id?.name || "—"} · Final price: ₹${auction.final_price}`}
                </p>
              </div>
            </div>

            {txStatus === "PENDING_CONTACT" && (
              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={handleMarkComplete}
                  disabled={actionLoading === "complete"}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  {actionLoading === "complete" ? "Saving…" : "Mark as Complete"}
                </button>
                <button
                  onClick={handleReportNoShow}
                  disabled={actionLoading === "noshow"}
                  className="flex-1 h-11 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <AlertTriangle size={16} />
                  {actionLoading === "noshow" ? "Reporting…" : "Report No-Show"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Chat — visible to seller once auction is closed with a winner */}
        {isDealChatOpen && user && (
          <ChatPanel
            auctionId={id}
            currentUser={user}
            partnerName={auction.winner_id?.name || "Winner"}
          />
        )}

        {/* Bid History */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">Bid History</h2>
          </div>

          {bids.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No bids yet</div>
          ) : (
            <div className="space-y-2">
              {bids.map((bid, i) => (
                <div key={bid._id || i} className={`flex justify-between items-center px-4 py-3 rounded-xl text-sm border ${
                  i === 0 ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-100"
                }`}>
                  <div className="flex items-center gap-2">
                    {i === 0 && <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Highest</span>}
                    <span className="font-medium text-slate-700">{bid.bidder_id?.name || "—"}</span>
                  </div>
                  <span className={`font-bold ${i === 0 ? "text-blue-700" : "text-slate-700"}`}>₹{bid.bid_amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offers */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users size={18} className="text-violet-600" />
            <h2 className="text-lg font-semibold text-slate-900">Buyer Offers</h2>
          </div>

          {offers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">No offers yet</div>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div key={offer._id} className={`p-5 rounded-2xl border ${
                  offer.status === "ACCEPTED" ? "bg-emerald-50 border-emerald-200" :
                  offer.status === "REJECTED" ? "bg-slate-50 border-slate-200" :
                  "bg-amber-50 border-amber-200"
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{offer.buyer_id?.name}</p>
                      <p className="text-lg font-bold text-slate-900 mt-0.5">₹{offer.offer_price}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${
                      offer.status === "ACCEPTED" ? "bg-emerald-100 text-emerald-700 border-emerald-300" :
                      offer.status === "REJECTED" ? "bg-red-100 text-red-700 border-red-200" :
                      "bg-amber-100 text-amber-700 border-amber-300"
                    }`}>
                      {offer.status}
                    </span>
                  </div>

                  {offer.status === "PENDING" && !auctionClosed && (
                    <div className="flex gap-2">
                      <button
                        disabled={actionLoading === offer._id}
                        onClick={() => handleAcceptOffer(offer._id)}
                        className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <CheckCircle size={15} /> Accept
                      </button>
                      <button
                        disabled={actionLoading === offer._id}
                        onClick={() => handleRejectOffer(offer._id)}
                        className="flex-1 h-10 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <XCircle size={15} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SellerAuctionDashboard;
