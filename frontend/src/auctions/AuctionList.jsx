import React, { useEffect, useState } from "react";
import API from "../api/api";
import AuctionCard from "../components/AuctionCard";

const CATEGORIES = [
  "All",
  "Transport & Mobility",
  "Sports & Fitness",
  "Hostel Essentials",
  "Clothing & Accessories",
  "Electronics & Gadgets",
  "Books & Study",
  "Miscellaneous",
];

function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await API.get("/auctions");
        setAuctions(res.data.auctions || []);
      } catch (err) {
        console.error("Failed to fetch auctions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  if (loading) {
    return (
      <p className="p-6 text-center text-gray-500">
        Loading auctions...
      </p>
    );
  }

  /* ================= FILTER LOGIC ================= */
  const filteredAuctions =
    selectedCategory === "All"
      ? auctions
      : auctions.filter(
          (auction) => auction.category === selectedCategory
        );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">

      {/* ================= HERO ================= */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900">
            Live Campus Listings
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-2xl">
            Discover trending items, place bids in real-time, and grab the best
            campus deals.
          </p>
        </div>

        {/* ================= CATEGORY FILTER ================= */}
        <div className="border-t sticky top-[64px] bg-white z-20">
          <div className="max-w-7xl mx-auto px-4 py-3 flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition
                  ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= AUCTION GRID ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {filteredAuctions.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6 sm:p-10 text-center">
            <p className="text-gray-500 text-base sm:text-lg">
              No auctions found in this category 😕
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Try switching categories or check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredAuctions.map((auction) => (
              <div
                key={auction._id}
                className="transition-transform sm:hover:-translate-y-1"
              >
                <AuctionCard auction={auction} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionList;
