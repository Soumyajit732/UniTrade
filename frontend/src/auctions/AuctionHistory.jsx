import React, { useEffect, useState, useCallback } from "react";
import API from "../api/api";
import socket from "../api/socket";
import { Link } from "react-router-dom";
import { Tag, Trophy, Clock, ChevronRight } from "lucide-react";

const TABS = [
  { key: "created",     label: "Created",      icon: <Tag     size={15} />, color: "blue"   },
  { key: "won",         label: "Won",           icon: <Trophy  size={15} />, color: "emerald"},
  { key: "participated",label: "Participated",  icon: <Clock   size={15} />, color: "violet" },
];

function AuctionHistory() {
  const [created, setCreated] = useState([]);
  const [won, setWon] = useState([]);
  const [participated, setParticipated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("created");

  const fetchHistory = useCallback(async () => {
    try {
      const [c, w, p] = await Promise.all([
        API.get("/auctions/my-created"),
        API.get("/auctions/my-won"),
        API.get("/auctions/my-participated"),
      ]);
      setCreated(c.data.auctions || []);
      setWon(w.data.auctions || []);
      setParticipated(p.data.auctions || []);
    } catch {
      setError("Failed to load auction history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  useEffect(() => {
    socket.on("auctionEnded", fetchHistory);
    return () => socket.off("auctionEnded", fetchHistory);
  }, [fetchHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading history…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  const data = { created, won, participated };
  const linkPrefix = { created: "/seller/auction", won: "/auction", participated: "/auction" };

  const currentData = data[activeTab];
  const currentTab = TABS.find((t) => t.key === activeTab);

  const counts = { created: created.length, won: won.length, participated: participated.length };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Auction History</h1>
          <p className="text-slate-500 text-sm mt-1">Track your selling and bidding activity</p>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.key
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`px-1.5 py-0.5 text-xs rounded-full font-bold ${
                  activeTab === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {currentData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-2xl mb-4">
              {currentTab?.icon}
            </div>
            <p className="text-slate-700 font-semibold text-lg">No auctions here yet</p>
            <p className="text-slate-400 text-sm mt-1">
              {activeTab === "created" && "List your first item to get started"}
              {activeTab === "won" && "Win an auction to see it here"}
              {activeTab === "participated" && "Place a bid on any auction to see it here"}
            </p>
            {activeTab === "created" && (
              <Link to="/create-auction" className="mt-4 btn-primary">Create Auction</Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentData.map((auction) => (
              <Link key={auction._id} to={`${linkPrefix[activeTab]}/${auction._id}`} className="block group">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-slate-200 transition-all duration-200">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-base font-semibold text-slate-900 line-clamp-2 leading-snug">
                      {auction.title}
                    </h4>
                    <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold border ${
                      auction.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {auction.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Final / Current</span>
                    <span className="font-bold text-slate-900">
                      ₹{auction.final_price || auction.current_price || auction.base_price}
                    </span>
                  </div>

                  <div className="flex items-center text-xs text-blue-600 font-semibold group-hover:gap-2 transition-all">
                    View Details <ChevronRight size={13} className="ml-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AuctionHistory;
