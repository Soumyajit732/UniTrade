import React from "react";
import { Link } from "react-router-dom";
import { Clock, TrendingUp } from "lucide-react";

function timeUntil(endTime) {
  const diff = new Date(endTime) - Date.now();
  if (diff <= 0) return "Ended";
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 48) return `${Math.floor(hours / 24)}d left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

const CATEGORY_COLORS = {
  "Electronics & Gadgets":   "bg-blue-50 text-blue-700 border-blue-200",
  "Transport & Mobility":    "bg-amber-50 text-amber-700 border-amber-200",
  "Sports & Fitness":        "bg-green-50 text-green-700 border-green-200",
  "Hostel Essentials":       "bg-rose-50 text-rose-700 border-rose-200",
  "Clothing & Accessories":  "bg-purple-50 text-purple-700 border-purple-200",
  "Books & Study":           "bg-teal-50 text-teal-700 border-teal-200",
  "Kitchen & Food Items":    "bg-orange-50 text-orange-700 border-orange-200",
  "Personal Care":           "bg-pink-50 text-pink-700 border-pink-200",
  "Miscellaneous":           "bg-slate-50 text-slate-600 border-slate-200",
};

function AuctionCard({ auction }) {
  const hasBids = auction.current_price > auction.base_price;
  const isActive = auction.status === "ACTIVE";
  const categoryClass = CATEGORY_COLORS[auction.category] || CATEGORY_COLORS["Miscellaneous"];
  const timeLeft = isActive ? timeUntil(auction.end_time) : null;

  return (
    <Link to={`/auction/${auction._id}`} className="block group">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300 overflow-hidden flex flex-col">

        {/* Image */}
        <div className="relative h-48 bg-slate-50 overflow-hidden">
          <img
            src={auction.images?.[0] || "https://placehold.co/400x300?text=No+Image"}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />

          {/* Status badge */}
          <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isActive
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}>
            {isActive ? "● Live" : auction.status}
          </span>

          {/* Time remaining */}
          {isActive && timeLeft && (
            <span className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-full backdrop-blur-sm">
              <Clock size={10} />
              {timeLeft}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-4">

          {/* Category */}
          <span className={`inline-block w-fit mb-2.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryClass}`}>
            {auction.category}
          </span>

          {/* Title */}
          <h3 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug mb-3">
            {auction.title}
          </h3>

          <div className="flex-1" />

          {/* Price */}
          <div className="border-t border-slate-100 pt-3 mt-1">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Base Price</p>
                <p className="text-sm font-medium text-slate-600">₹{auction.base_price}</p>
              </div>

              {hasBids ? (
                <div className="text-right">
                  <p className="flex items-center gap-1 text-xs text-blue-500 mb-0.5">
                    <TrendingUp size={11} /> Highest Bid
                  </p>
                  <p className="text-xl font-bold text-blue-600">₹{auction.current_price}</p>
                </div>
              ) : (
                <span className="text-xs text-slate-400 italic">No bids yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default AuctionCard;
