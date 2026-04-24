import React, { useEffect, useState, useContext } from "react";
import API from "../api/api";
import socket from "../api/socket";
import AuctionCard from "../components/AuctionCard";
import { AuthContext } from "../context/auth-context";
import { Search, X } from "lucide-react";

const CATEGORIES = [
  "All",
  "Electronics & Gadgets",
  "Transport & Mobility",
  "Sports & Fitness",
  "Hostel Essentials",
  "Clothing & Accessories",
  "Books & Study",
  "Kitchen & Food Items",
  "Personal Care",
  "Miscellaneous",
];

const PAGE_SIZE = 12;

function AuctionList() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showWinBanner, setShowWinBanner] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const res = await API.get(`/auctions?page=1&limit=${PAGE_SIZE}`);
        setAuctions(res.data.auctions || []);
        setHasMore(res.data.hasMore || false);
        setPage(1);
      } catch (err) {
        console.error("Failed to fetch auctions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const loadMore = async () => {
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await API.get(`/auctions?page=${nextPage}&limit=${PAGE_SIZE}`);
      setAuctions((prev) => [...prev, ...(res.data.auctions || [])]);
      setHasMore(res.data.hasMore || false);
      setPage(nextPage);
    } catch (err) {
      console.error("Failed to load more auctions", err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ── SOCKET — live updates ───────────────────── */
  useEffect(() => {
    const onBidPlaced = ({ auctionId, bid_amount }) => {
      setAuctions((prev) =>
        prev.map((a) => a._id === auctionId ? { ...a, current_price: bid_amount } : a)
      );
    };

    const onAuctionEnded = ({ auctionId }) => {
      setAuctions((prev) => prev.filter((a) => a._id !== auctionId));
    };

    const onNewAuction = (auction) => {
      if (auction.seller_id === user?._id) return; // already shown to seller
      setAuctions((prev) => [auction, ...prev]);
    };

    socket.on("bidPlaced", onBidPlaced);
    socket.on("auctionEnded", onAuctionEnded);
    socket.on("newAuction", onNewAuction);

    return () => {
      socket.off("bidPlaced", onBidPlaced);
      socket.off("auctionEnded", onAuctionEnded);
      socket.off("newAuction", onNewAuction);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id || auctions.length === 0) return;
    const alreadyShown = localStorage.getItem("auctionWinShown");
    if (alreadyShown) return;
    const wonAuction = auctions.find(
      (a) => a.status === "CLOSED" && a.winner_id?.toString() === user._id
    );
    if (wonAuction) {
      setShowWinBanner(true);
      localStorage.setItem("auctionWinShown", "true");
    }
  }, [auctions, user]);

  const filtered = auctions.filter((a) => {
    const matchesCategory = selectedCategory === "All" || a.category === selectedCategory;
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading auctions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Win banner */}
      {showWinBanner && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-3 text-center font-semibold text-sm shadow-md">
          🎉 Congratulations! You won your last auction. Check your dashboard for details.
        </div>
      )}

      {/* Hero */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Live Campus Listings
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1 max-w-xl">
            Discover trending items, place bids in real time, and grab the best campus deals.
          </p>

          {/* Search */}
          <div className="relative mt-4 max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search auctions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-9 border border-slate-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder-slate-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category filter */}
        <div className="border-t border-slate-100 sticky top-16 bg-white z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm scale-105"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">🔍</div>
            <p className="text-slate-700 font-semibold text-lg">No auctions found</p>
            <p className="text-slate-400 text-sm mt-1">
              {search ? `No results for "${search}"` : "Try switching categories or check back later."}
            </p>
            {(search || selectedCategory !== "All") && (
              <button
                onClick={() => { setSearch(""); setSelectedCategory("All"); }}
                className="mt-4 text-sm text-blue-600 hover:underline font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-400 mb-4">{filtered.length} listing{filtered.length !== 1 ? "s" : ""}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((auction) => (
                <AuctionCard key={auction._id} auction={auction} />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm disabled:opacity-50"
                >
                  {loadingMore ? "Loading…" : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AuctionList;
