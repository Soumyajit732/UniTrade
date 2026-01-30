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
  "Miscellaneous"
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

  if (loading) return <p className="p-6">Loading auctions...</p>;

  /* ================= FILTER LOGIC ================= */
  const filteredAuctions =
    selectedCategory === "All"
      ? auctions
      : auctions.filter(
          (auction) => auction.category === selectedCategory
        );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Active Auctions
          </h2>
          <p className="text-gray-600 mt-1">
            Browse through the latest items up for auction on campus
          </p>
        </div>

        {/* ===== CATEGORY FILTER BAR ===== */}
        <div className="border-t">
          <div className="max-w-7xl mx-auto px-6 py-4 flex gap-3 overflow-x-auto">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition
                  ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Auction Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        {filteredAuctions.length === 0 ? (
          <p className="text-gray-500">
            No auctions found for this category.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionList;
