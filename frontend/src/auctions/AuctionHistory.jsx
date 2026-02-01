import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Link } from "react-router-dom";

function AuctionHistory() {
  const [created, setCreated] = useState([]);
  const [won, setWon] = useState([]);
  const [participated, setParticipated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [createdRes, wonRes, participatedRes] = await Promise.all([
          API.get("/auctions/my-created"),
          API.get("/auctions/my-won"),
          API.get("/auctions/my-participated"),
        ]);

        setCreated(createdRes.data.auctions || []);
        setWon(wonRes.data.auctions || []);
        setParticipated(participatedRes.data.auctions || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load auction history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <p className="text-center mt-16 text-gray-500">
        Loading history…
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-red-600 text-center mt-16">
        {error}
      </p>
    );
  }

  /* ================= SECTION COMPONENT ================= */
  const Section = ({ title, subtitle, auctions, badgeColor, linkPrefix }) => (
    <div className="mb-12">

      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}
        >
          {title.split(" ")[0]}
        </span>
        <div>
          <h3 className="text-lg sm:text-xl font-bold leading-tight">
            {title.substring(2)}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      {auctions.length === 0 ? (
        <div className="bg-white rounded-xl border p-5 text-gray-500 text-sm">
          No auctions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {auctions.map((auction) => (
            <Link
              key={auction._id}
              to={`${linkPrefix}/${auction._id}`}
              className="block"
            >
              <div className="bg-white rounded-xl border shadow-sm p-4 h-full flex flex-col justify-between transition sm:hover:shadow-md sm:hover:border-blue-400">

                {/* Title */}
                <h4 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2">
                  {auction.title}
                </h4>

                {/* Meta */}
                <div className="space-y-1 text-sm">
                  <p className="text-gray-500">
                    Status:{" "}
                    <span
                      className={`font-semibold ${
                        auction.status === "CLOSED"
                          ? "text-gray-600"
                          : "text-green-600"
                      }`}
                    >
                      {auction.status}
                    </span>
                  </p>

                  <p className="text-gray-700">
                    Price:{" "}
                    <span className="font-semibold">
                      ₹{auction.final_price || auction.current_price}
                    </span>
                  </p>
                </div>

                {/* CTA */}
                <div className="mt-4 text-sm font-medium text-blue-600">
                  View Details →
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 sm:py-12 flex justify-center">
      <div className="w-full max-w-7xl">

        {/* Page Header */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold">
            My Auction History
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Track your selling and bidding activity
          </p>
        </div>

        {/* Sections */}
        <Section
          title="🏷️ Auctions I Created"
          subtitle="Manage your listings and buyer offers"
          auctions={created}
          badgeColor="bg-blue-100 text-blue-700"
          linkPrefix="/seller/auction"
        />

        <Section
          title="🏆 Auctions I Won"
          subtitle="Auctions where you emerged as the highest bidder"
          auctions={won}
          badgeColor="bg-green-100 text-green-700"
          linkPrefix="/auction"
        />

        <Section
          title="🕒 Auctions I Participated In"
          subtitle="Auctions you placed bids or offers on"
          auctions={participated}
          badgeColor="bg-purple-100 text-purple-700"
          linkPrefix="/auction"
        />
      </div>
    </div>
  );
}

export default AuctionHistory;
