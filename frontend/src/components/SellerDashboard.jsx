import React from "react";
import SellerOffersMini from "./SellerOffersMini";

function SellerDashboard({ auction, bids }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-6">

      <h3 className="text-2xl font-bold">Seller Dashboard</h3>

      {/* Leading Bid */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-600">Leading Bid</p>
        {bids.length > 0 ? (
          <>
            <p className="text-lg font-semibold">
              ₹{bids[0].bid_amount}
            </p>
            <p className="text-sm text-gray-600">
              By: {bids[0].bidder_id?.name}
            </p>
          </>
        ) : (
          <p className="text-gray-500">No bids yet</p>
        )}
      </div>

      {/* Bid Leaderboard */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Bid Leaderboard</h4>
        {bids.length === 0 ? (
          <p className="text-gray-500">No bids placed.</p>
        ) : (
          <div className="space-y-3">
            {bids.map((bid, index) => (
              <div
                key={index}
                className="flex justify-between bg-slate-50 p-3 rounded-lg border"
              >
                <span>{bid.bidder_id?.name}</span>
                <span className="font-semibold">₹{bid.bid_amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Offers Section */}
      <div>
        <h4 className="text-lg font-semibold mb-3">Buyer Offers</h4>
        <SellerOffersMini auctionId={auction._id} />
      </div>
    </div>
  );
}

export default SellerDashboard;
