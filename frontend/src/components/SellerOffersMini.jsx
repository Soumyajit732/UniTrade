import React, { useEffect, useState } from "react";
import API from "../api/api";

function SellerOffersMini({ auctionId }) {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetchOffers();
  }, [auctionId]);

  const fetchOffers = async () => {
    try {
      const res = await API.get(`/offers/${auctionId}`);
      setOffers(res.data.offers || []);
    } catch {
      console.error("Failed to load offers");
    }
  };

  const handleAccept = async (id) => {
    await API.post(`/offers/${id}/accept`);
    fetchOffers();
  };

  const handleReject = async (id) => {
    await API.post(`/offers/${id}/reject`);
    fetchOffers();
  };

  if (offers.length === 0) {
    return <p className="text-gray-500">No offers yet.</p>;
  }

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <div
          key={offer._id}
          className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border"
        >
          <div>
            <p className="font-semibold">₹{offer.offer_price}</p>
            <p className="text-sm text-gray-500">
              By {offer.buyer_id?.name}
            </p>
          </div>

          {offer.status === "PENDING" && (
            <div className="flex gap-2">
              <button
                onClick={() => handleAccept(offer._id)}
                className="px-3 py-1 bg-green-600 text-white rounded"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(offer._id)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default SellerOffersMini;
