import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";

function SellerAuctionDashboard() {
  const { id } = useParams();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

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
    } catch (err) {
      console.error(err);
      setError("Failed to load seller dashboard");
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
    try {
      await API.post(`/offers/${offerId}/accept`);
      await fetchSellerData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept offer");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectOffer = async (offerId) => {
    setActionLoading(offerId);
    try {
      await API.post(`/offers/${offerId}/reject`);
      await fetchSellerData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject offer");
    } finally {
      setActionLoading(null);
    }
  };

  /* ================= UI STATES ================= */

  if (loading)
    return <p className="text-center mt-10">Loading seller dashboard...</p>;

  if (error)
    return <p className="text-red-600 text-center mt-10">{error}</p>;

  if (!auction)
    return <p className="text-center mt-10">Auction not found</p>;

  const highestBid = bids.length > 0 ? bids[0] : null;
  const auctionClosed = auction.status === "CLOSED";

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-6 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">

        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold">{auction.title}</h1>
          <p className="text-gray-500 mt-1">Seller Dashboard</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-400 text-sm">Status</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold ${
                auction.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {auction.status}
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-400 text-sm">Current Price</p>
            <p className="text-xl font-bold text-blue-600">
              ₹{auction.current_price}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <p className="text-gray-400 text-sm">Highest Bidder</p>
            <p className="text-xl font-bold">
              {highestBid?.bidder_id?.name || "No bids yet"}
            </p>
          </div>
        </div>

        {/* Bid History */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">📈 Bid History</h2>

          {bids.length === 0 ? (
            <p className="text-gray-500">No bids yet.</p>
          ) : (
            bids.map((bid, index) => (
              <div
                key={bid._id || index}
                className={`flex justify-between p-3 rounded-lg mb-2 ${
                  index === 0
                    ? "bg-blue-50 border border-blue-300"
                    : "bg-slate-50"
                }`}
              >
                <span>{bid.bidder_id?.name}</span>
                <span className="font-bold">₹{bid.bid_amount}</span>
              </div>
            ))
          )}
        </div>

        {/* Buyer Offers */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">🤝 Buyer Offers</h2>

          {offers.length === 0 ? (
            <p className="text-gray-500">No offers yet.</p>
          ) : (
            offers.map((offer) => (
              <div
                key={offer._id}
                className={`flex justify-between items-center p-4 rounded-lg mb-3 ${
                  offer.status === "ACCEPTED"
                    ? "bg-green-50 border border-green-400"
                    : "bg-slate-50"
                }`}
              >
                <div>
                  <p className="font-semibold">{offer.buyer_id?.name}</p>
                  <p className="text-sm text-gray-500">
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
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-1 rounded"
                    >
                      Accept
                    </button>
                    <button
                      disabled={actionLoading === offer._id}
                      onClick={() => handleRejectOffer(offer._id)}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-1 rounded"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      offer.status === "ACCEPTED"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {offer.status}
                  </span>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default SellerAuctionDashboard;
