import React from "react";
import { Link } from "react-router-dom";

function AuctionCard({ auction }) {
  const hasBids = auction.current_price > auction.base_price;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition flex flex-col overflow-hidden">

      {/* Image */}
      <div className="relative h-48 bg-gray-50 flex items-center justify-center">
        <img
          src={auction.images?.[0] || "https://via.placeholder.com/300"}
          alt={auction.title}
          className="h-full w-full object-contain p-4"
        />

        {/* Status Badge */}
        <span
          className={`absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1 rounded-full ${
            auction.status === "ACTIVE"
              ? "bg-green-500"
              : "bg-gray-500"
          }`}
        >
          {auction.status}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">

        {/* Category */}
        <span className="inline-block w-fit mb-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {auction.category}
        </span>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
          {auction.title}
        </h3>

        {/* Prices */}
        <div className="mt-3 space-y-1">

          {/* Base Price */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>Base Price</span>
            <span className="font-medium text-gray-700">
              ₹{auction.base_price}
            </span>
          </div>

          {/* Current Bid (ONLY if bids exist) */}
          {hasBids && (
            <div className="flex justify-between items-end">
              <span className="text-sm text-gray-500">Current Bid</span>
              <span className="text-xl font-bold text-gray-900">
                ₹{auction.current_price}
              </span>
            </div>
          )}

          {/* No bids indicator */}
          {!hasBids && (
            <p className="text-xs text-gray-400 italic">
              No bids yet
            </p>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action */}
        <Link to={`/auction/${auction._id}`}>
          <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition">
            View
          </button>
        </Link>
      </div>
    </div>
  );
}

export default AuctionCard;
