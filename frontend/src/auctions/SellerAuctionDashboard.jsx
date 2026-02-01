import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import { toast } from "react-toastify";

function SellerAuctionDashboard() {
  const { id } = useParams();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  /* ================= FETCH SELLER DATA ================= */
  const fetchSellerData = async () => {
    try {
      const [auctionRes, bidsRes, offersRes] = await Promise.all([
        API.get(`/auctions/${id}`),
        API.get(`/bids/${id}`),
        API.get(`/offers/${id}`)
      ]);

      setAuction(auctionRes.data.auction);
      setBids(bidsRes.data.bids || []);
      setOffers(offersRes.data.offers || []);
    } catch {
      toast.error("Failed to load seller dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, [id]);

  /* ================= OFFER ACTIONS ================= */
  const handleAcceptOffer = async (offerId) => {
    setActionLoading(offerId);
    const toastId = toast.loading("Accepting offer...");

    try {
      await API.post(`/offers/${offerId}/accept`);
      await fetchSellerData();

      toast.update(toastId, {
        render: "Offer accepted 🎉",
        type: "success",
        isLoading: false,
        autoClose: 2000
      });
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to accept offer",
        type: "error",
        isLoading: false
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOffer = async (offerId) => {
    setActionLoading(offerId);
    const toastId = toast.loading("Rejecting offer...");

    try {
      await API.post(`/offers/${offerId}/reject`);
      await fetchSellerData();

      toast.update(toastId, {
        render: "Offer rejected",
        type: "info",
        isLoading: false,
        autoClose: 2000
      });
    } catch (err) {
      toast.update(toastId, {
        render: err.response?.data?.message || "Failed to reject offer",
        type: "error",
        isLoading: false
      });
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= UI STATES ================= */
  if (loading) {
    return (
      <p className="text-center mt-16 text-gray-500">
        Loading seller dashboard…
      </p>
    );
  }

  if (!auction) {
    return (
      <p className="text-center mt-16">
        Auction not found
      </p>
    );
  }

  const highestBid = bids.length > 0 ? bids[0] : null;
  const auctionClosed = auction.status === "CLOSED";

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 sm:py-10 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold">
            {auction.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Seller Dashboard
          </p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
            <p className="text-xs text-gray-400">Status</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-semibold ${
                auction.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {auction.status}
            </span>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
            <p className="text-xs text-gray-400">Current Price</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              ₹{auction.current_price}
            </p>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow">
            <p className="text-xs text-gray-400">Highest Bidder</p>
            <p className="text-base sm:text-xl font-semibold">
              {highestBid?.bidder_id?.name || "No bids yet"}
            </p>
          </div>
        </div>

        {/* BID HISTORY */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-semibold mb-4">
            📈 Bid History
          </h2>

          {bids.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No bids yet.
            </p>
          ) : (
            <div className="space-y-2">
              {bids.map((bid, index) => (
                <div
                  key={bid._id || index}
                  className={`flex justify-between items-center px-4 py-3 rounded-lg ${
                    index === 0
                      ? "bg-blue-50 border border-blue-300"
                      : "bg-slate-50"
                  }`}
                >
                  <span className="text-sm sm:text-base">
                    {bid.bidder_id?.name}
                  </span>
                  <span className="font-bold text-sm sm:text-base">
                    ₹{bid.bid_amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* BUYER OFFERS */}
        <div className="bg-white rounded-xl shadow p-4 sm:p-6">
          <h2 className="text-lg sm:text-2xl font-semibold mb-4">
            🤝 Buyer Offers
          </h2>

          {offers.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No offers yet.
            </p>
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div
                  key={offer._id}
                  className={`p-4 rounded-xl ${
                    offer.status === "ACCEPTED"
                      ? "bg-green-50 border border-green-300"
                      : "bg-slate-50"
                  }`}
                >
                  <div className="mb-3">
                    <p className="font-semibold">
                      {offer.buyer_id?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      Offered ₹{offer.offer_price}
                    </p>
                    <p className="text-xs text-gray-400">
                      Status: {offer.status}
                    </p>
                  </div>

                  {offer.status === "PENDING" && !auctionClosed ? (
                    <div className="flex gap-3">
                      <button
                        disabled={actionLoading === offer._id}
                        onClick={() => handleAcceptOffer(offer._id)}
                        className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        disabled={actionLoading === offer._id}
                        onClick={() => handleRejectOffer(offer._id)}
                        className="flex-1 h-10 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        offer.status === "ACCEPTED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {offer.status}
                    </span>
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
